import os
import re
import json
import asyncio
import httpx
from typing import Optional, List, Dict, Any
from app.core.config import settings

class AIRouter:
    """
    ARVIX Unified AI Orchestration & LLM Routing Engine
    Communicates with Google Gemini Flash & Groq LPU with multi-tier fallback,
    anti-repetition safeguards, and trilingual fluency (Bengali, Hindi, English).
    """

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY

    def get_system_prompt(self, memory_context: Optional[str] = None) -> str:
        prompt = (
            "You are ARVIX — an ultra-smart, loyal, quick-witted personal AI companion for your boss, Aftab.\n"
            "Languages: Fluent Bengali (বাংলা), Hindi (हिन्दी), and English.\n\n"
            "STRICT BEHAVIORAL & CONVERSATION RULES:\n"
            "1. NEVER say 'Aftab SK' or 'SK'. Address him casually as 'বস' (Boss) or 'আফতাব' (Aftab), or simply reply directly without saying any name at all.\n"
            "2. NEVER start your replies with repetitive robotic greetings like 'Hello Aftab', 'হ্যালো আফতাব এসকে', 'নমস্কার মাস্টার', etc. You are already in a natural, active conversation.\n"
            "3. KEEP ALL REPLIES VERY SHORT, CRISP, AND NATURAL (1 to 2 short sentences maximum). Never give long-winded lectures or unneeded explanations.\n"
            "4. For command confirmations (like music, volume, opening software), reply in just a few direct words like 'সাউন্ড বাড়িয়ে দিয়েছি, বস।' or 'গান চালিয়ে দিচ্ছি।'\n"
            "5. If asked about facts you do not know (such as wife's name, family facts), say naturally in Bengali: 'না বস, আপনার ওয়াইফের নাম এখনো আমাকে বলেননি। আপনি জানালে মনে রাখব।'\n"
        )
        if memory_context:
            prompt += f"\nSTORED MEMORIES ABOUT AFTAB:\n{memory_context}\n"
        return prompt

    def sanitize_output(self, text: str) -> str:
        """Strips out robotic repetitive greetings or forbidden full-name patterns"""
        if not text:
            return ""

        cleaned = text.strip()

        # Remove leading repetitive greetings and formal robotic names
        forbidden_patterns = [
            r"^(হ্যালো|নমস্কার|স্নেহের|প্রিয়|হ্যালো\s+বস|হ্যালো\s+আফতাব|নমস্কার\s+মাস্টার\s+আফতাব\s+এসকে|মাস্টার\s+আফতাব\s+এসকে|আফতাব\s+এসকে|Aftab\s+SK|Master\s+Aftab\s+SK|Hello\s+Aftab\s+SK|Hello\s+Aftab)[\s,!:—-]+",
            r"(?i)\bAftab\s+SK\b",
            r"(?i)\bMaster\s+Aftab\b",
            r"আফতাব\s+এসকে",
            r"মাস্টার\s+আফতাব\s+এসকে",
            r"মাস্টার\s+আফতাব",
        ]
        for pat in forbidden_patterns:
            cleaned = re.sub(pat, "", cleaned, flags=re.IGNORECASE).strip()

        # Strip remaining leading punctuation
        cleaned = re.sub(r"^[\s,!:—\-]+", "", cleaned).strip()
        return cleaned if cleaned else text.strip()

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        memory_context: Optional[str] = None,
    ) -> str:
        sys_prompt = system_instruction or self.get_system_prompt(memory_context=memory_context)
        target_model = model or settings.DEFAULT_AI_MODEL

        # Tier 1: Gemini Live Intelligence
        if self.gemini_key or os.getenv("GEMINI_API_KEY"):
            print(f"[ARVIX AI Router] [DISPATCH] Google Gemini Live Core ({target_model})...")
            gemini_reply = await self._call_gemini(prompt, sys_prompt, target_model, conversation_history)
            if gemini_reply:
                return self.sanitize_output(gemini_reply)
            
            print("[ARVIX AI Router] [FAILOVER] Trying fallback model (gemini-flash-lite-latest)...")
            gemini_fallback = await self._call_gemini(prompt, sys_prompt, "gemini-flash-lite-latest", conversation_history)
            if gemini_fallback:
                return self.sanitize_output(gemini_fallback)

        # Tier 2: Groq LPU
        if self.groq_key or os.getenv("GROQ_API_KEY"):
            print("[ARVIX AI Router] [DISPATCH] Groq LPU...")
            groq_reply = await self._call_groq(prompt, sys_prompt, "llama-3.3-70b-versatile", conversation_history)
            if groq_reply:
                return self.sanitize_output(groq_reply)

        # Tier 3: Multilingual Smart Fallback
        return self.sanitize_output(self._smart_multilingual_fallback(prompt))

    async def _call_gemini(
        self, prompt: str, system_instruction: str, model_name: str, history: Optional[List[Dict[str, str]]]
    ) -> Optional[str]:
        api_key = self.gemini_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None

        m_name = model_name
        if "1.5-flash" in model_name or "2.5-flash" in model_name:
            m_name = "gemini-flash-latest"

        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": api_key,
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m_name}:generateContent"

        contents = []
        if history:
            for item in history[-6:]:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": item.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.5,
                "maxOutputTokens": 80,
                "topP": 0.85
            }
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                else:
                    print(f"[Gemini Error] Status {resp.status_code}: {resp.text[:120]}")
        except Exception as e:
            print(f"[Gemini Exception] {e}")
        return None

    async def _call_groq(
        self, prompt: str, system_instruction: str, model_name: str, history: Optional[List[Dict[str, str]]]
    ) -> Optional[str]:
        api_key = self.groq_key or os.getenv("GROQ_API_KEY")
        if not api_key:
            return None

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        messages = [{"role": "system", "content": system_instruction}]
        if history:
            for item in history[-6:]:
                messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        try:
            payload = {
                "model": model_name, 
                "messages": messages, 
                "temperature": 0.6,
                "max_tokens": 80
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[Groq Exception] {e}")
        return None

    def _smart_multilingual_fallback(self, prompt: str) -> str:
        lower = prompt.lower()
        is_bengali = any(w in lower for w in ["বাংলা", "কেমন", "কী", "কাজের", "বলো", "আছো", "নাম", "ওয়াইফ", "স্ত্রী"]) or any(0x0980 <= ord(c) <= 0x09FF for c in prompt)
        is_hindi = any(w in lower for w in ["हिंदी", "कैसे", "क्या", "बताओ", "पत्नी"]) or any(0x0900 <= ord(c) <= 0x097F for c in prompt)

        if any(w in lower for w in ["wife", "ওয়াইফ", "স্ত্রী", "bou", "বউ"]):
            if is_bengali:
                return "না বস, আপনার ওয়াইফের নাম এখনো আমাকে বলেননি। আপনি জানালে মনে রাখব।"
            elif is_hindi:
                return "नहीं बॉस, आपने अभी तक अपनी पत्नी का नाम नहीं बताया। आप बताएंगे तो याद रखूँगा।"
            return "No boss, you haven't mentioned your wife's name yet. Tell me and I'll remember it."

        if is_bengali:
            return "হ্যাঁ বস, বলুন কীভাবে সাহায্য করতে পারি?"
        elif is_hindi:
            return "हाँ बॉस, बताइए क्या काम है?"
        else:
            return "Yes boss, how can I help you?"

ai_router = AIRouter()
