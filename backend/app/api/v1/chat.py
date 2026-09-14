import re
import json
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import get_db
from app.models import Conversation, Message, Task, Memory, DeviceCommand
from app.schemas import ChatRequest, ChatResponse
from app.services import ai_router, intent_analyzer, websocket_manager, memory_service
from app.tools import (
    system_audio_tool,
    youtube_tool,
    system_app_tool,
    news_tool
)

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    # 1. Retrieve or initialize active conversation
    conversation = None
    if req.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
    if not conversation:
        conversation = db.query(Conversation).order_by(Conversation.updated_at.desc()).first()
    if not conversation:
        conversation = Conversation(title=req.message[:35] + "...")
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Retrieve memories for context
    memories = db.query(Memory).order_by(Memory.importance.desc(), Memory.created_at.desc()).limit(15).all()
    memory_context = "\n".join([f"- [{m.category}] {m.content}" for m in memories]) if memories else None

    # 3. Store user message in DB
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # 4. Intent Classification
    intent, intent_data = intent_analyzer.analyze(req.message)
    tools_used = []
    device_command_payload = None
    reply_text = ""

    # 5. Route to Specialized Modular Tools & Services

    # 5a. Master Hardware Audio Volume Control
    if intent == "VOLUME_CONTROL":
        tools_used.append("system_audio_tool")
        v_action = intent_data.get("action", "volume_up")
        steps = intent_data.get("steps", 8)
        
        reply_text = system_audio_tool.handle_volume_action(v_action, steps)

        await websocket_manager.send_to_device_type("windows", {
            "type": "device_command",
            "action": v_action,
            "target": "Master Audio",
            "payload": intent_data
        })

    # 5b. YouTube & Media Playback Control (Fullscreen, Pause, Resume, Next, Prev)
    elif intent == "YOUTUBE_CONTROL":
        tools_used.append("youtube_controller")
        action = intent_data.get("action", "play_pause")
        reply_text = youtube_tool.handle_control(action)

        await websocket_manager.send_to_device_type("windows", {
            "type": "device_command",
            "action": f"youtube_{action}",
            "target": "YouTube Player",
            "payload": {"action": action}
        })

    # 5b.2 Laptop Camera & Vision HUD Control
    elif intent == "CAMERA_COMMAND":
        tools_used.append("vision_controller")
        action = intent_data.get("action", "open_camera")
        
        if action == "open_camera":
            reply_text = "ল্যাপটপ ক্যামেরা ও ফেস স্ক্যানার চালু করেছি, বস।"
        elif action == "capture_photo":
            reply_text = "ছবি ক্যাপচার করে ভিশন এনালাইসিস করছি, বস।"
        elif action == "stop_camera":
            reply_text = "ল্যাপটপ ক্যামেরা বন্ধ করে দিয়েছি, বস।"
        else:
            reply_text = "ক্যামেরা কমান্ড সম্পন্ন করেছি, বস।"

        await websocket_manager.broadcast({
            "type": "camera_command",
            "action": action,
            "target": "Laptop Camera",
            "payload": {"action": action}
        })

    # 5b.3 Air Hand Gesture & Fingertip Laptop Control
    elif intent == "GESTURE_COMMAND":
        tools_used.append("hand_gesture_controller")
        action = intent_data.get("action", "start_gesture")

        if action == "start_gesture":
            reply_text = "হ্যাঁ বস! চলুন আজ পুরো সোলার সিস্টেমে একটু ঘুরে আসি! দেখি আজ মহাকাশে কোন গ্রহে কী কী কাণ্ড ঘটানো যায়! হ্যান্ড কন্ট্রোল একদম রেডি, আমি আপনার সাথেই আছি, চলুন শুরু করা যাক!"
            device_command_payload = {
                "action": "navigate_page",
                "tab": "cosmos",
                "label": "3D Cosmos",
                "enable_gesture": True
            }
            await websocket_manager.broadcast({
                "type": "navigate_page",
                "tab": "cosmos",
                "label": "3D Cosmos",
                "enable_gesture": True
            })
        else:
            reply_text = "হ্যান্ড জেসচার কন্ট্রোল বন্ধ করে দিয়েছি, বস।"
            device_command_payload = {
                "action": "stop_gesture"
            }

    # 5b.4 In-App Tab / Page Navigation
    elif intent == "NAVIGATE_PAGE":
        tools_used.append("tab_navigator")
        tab = intent_data.get("tab", "chat")
        label = intent_data.get("label", "Dashboard")
        if tab == "cosmos":
            reply_text = "হ্যাঁ বস! চলুন আজ পুরো সোলার সিস্টেমে একটু ঘুরে আসি! দেখি আজ মহাকাশে কোন গ্রহে কী কী কাণ্ড ঘটানো যায়! হ্যান্ড কন্ট্রোল একদম রেডি, আমি আপনার সাথেই আছি, চলুন শুরু করা যাক!"
        else:
            reply_text = f"'{label}' পেজ খুলে দিয়েছি, বস।"

        device_command_payload = {
            "action": "navigate_page",
            "tab": tab,
            "label": label,
            "enable_gesture": intent_data.get("enable_gesture", False)
        }

        await websocket_manager.broadcast({
            "type": "navigate_page",
            "tab": tab,
            "label": label,
            "reply": reply_text
        })

    # 5c. Play Master's Saved Favorite Song
    elif intent == "PLAY_FAVORITE_SONG":
        tools_used.append("memory_engine")
        tools_used.append("youtube_tool")

        fav_song = memory_service.get_favorite_song(db)
        if fav_song:
            asyncio.create_task(youtube_tool.play_song_in_browser(fav_song))
            reply_text = f"ইউটিউবে আপনার প্রিয় গান '{fav_song}' চালিয়ে দিয়েছি, বস।"
        else:
            reply_text = "বস, আপনার প্রিয় গান কোনটি তা এখনো আমাকে বলেননি। গানের নামটি বলুন, আমি মনে রাখব ও চালিয়ে দেব।"

    # 5d. Query Master's Saved Favorite Song
    elif intent == "SEARCH_FAVORITE_SONG":
        tools_used.append("memory_engine")
        fav_song = memory_service.get_favorite_song(db)
        if fav_song:
            reply_text = f"আপনার প্রিয় গান হলো '{fav_song}', বস।"
        else:
            reply_text = "আপনার কোনো প্রিয় গান এখনো সেভ করা নেই, বস।"

    # 5e. Save Memory / Preference
    elif intent == "SAVE_MEMORY":
        tools_used.append("memory_engine")
        m_type = intent_data.get("type", "general")

        if m_type == "favorite_song":
            fav_song = memory_service.extract_favorite_song(req.message)
            if fav_song:
                reply_text = memory_service.save_favorite_song(db, fav_song)
            else:
                reply_text = memory_service.save_general_memory(db, req.message)
        else:
            # Check if text mentions a favorite song despite being typed differently
            fav_song = memory_service.extract_favorite_song(req.message)
            if fav_song:
                reply_text = memory_service.save_favorite_song(db, fav_song)
            else:
                reply_text = memory_service.save_general_memory(db, req.message)

    # 5f. General Memory Search
    elif intent == "SEARCH_MEMORY":
        tools_used.append("memory_engine")
        mems = memory_service.search_memories(db, req.message)
        if mems:
            mem_text = "\n".join([f"- {m.content}" for m in mems[:3]])
            reply_text = f"মেমোরি থেকে পেলাম:\n{mem_text}"
        else:
            reply_text = "এই বিষয়ে কোনো মেমোরি সেভ করা নেই, বস।"

    # 5g. Regular YouTube Song Streaming
    elif intent == "PLAY_MUSIC":
        tools_used.append("youtube_tool")
        raw_query = intent_data.get("query", "")
        req_fullscreen = intent_data.get("fullscreen", False)
        clean_query = youtube_tool.clean_song_query(raw_query)

        asyncio.create_task(youtube_tool.play_song_in_browser(clean_query, fullscreen=req_fullscreen))
        if req_fullscreen:
            reply_text = f"ইউটিউবে ফুলস্ক্রিনে '{clean_query}' চালিয়ে দিয়েছি, বস।"
        else:
            reply_text = f"ইউটিউবে '{clean_query}' চালিয়ে দিয়েছি, বস।"

    # 5h. Laptop & Desktop App Launcher
    elif intent == "LAPTOP_COMMAND":
        tools_used.append("system_app_tool")
        action = intent_data.get("action", "general_device")
        target = intent_data.get("target", "")

        if action == "open_app":
            system_app_tool.open_application(target)
            if target in ["solarsystem", "solar system", "সোলার সিস্টেম", "solarsystemscope"]:
                reply_text = "সোলার সিস্টেম থ্রি-ডি খুলে দিয়েছি, বস। হাত নাড়িয়ে থ্রি-ডি স্পেস নিয়ন্ত্রণ করুন।"
            elif target in ["youtube", "ইউটিউব"]:
                reply_text = "ইউটিউব খুলে দিয়েছি, বস। হাত নাড়িয়ে ব্রাউজ করুন।"
            elif target in ["google", "গুগল"]:
                reply_text = "গুগল খুলে দিয়েছি, বস।"
            elif target in ["facebook", "ফেসবুক"]:
                reply_text = "ফেসবুক খুলে দিয়েছি, বস।"
            elif target in ["chrome", "browser", "ব্রাউজার"]:
                reply_text = "ব্রাউজার খুলে দিয়েছি, বস।"
            else:
                reply_text = f"ল্যাপটপে '{target}' চালু করেছি, বস।"
        elif action == "search_file":
            system_app_tool.open_application("downloads")
            reply_text = "ডাউনলোড ফোল্ডার খুলে দিয়েছি, বস।"
        else:
            reply_text = "ডিভাইস কমান্ড এক্সিকিউট করা হয়েছে, বস।"

        command = DeviceCommand(
            sender_device_type=req.device_type or "mobile",
            target_device_type="windows",
            command_type=action,
            payload_json=json.dumps(intent_data),
            status="executed"
        )
        db.add(command)
        db.commit()
        db.refresh(command)

        device_command_payload = {
            "command_id": command.id,
            "action": action,
            "target": target,
            "status": "executed"
        }

        await websocket_manager.send_to_device_type("windows", {
            "type": "device_command",
            "command_id": command.id,
            "action": action,
            "target": target,
            "payload": intent_data
        })

    # 5i. Curated News
    elif intent == "NEWS":
        tools_used.append("news_tool")
        category = intent_data.get("category", "ai")
        news_items = news_tool.get_latest_news(category)
        news_summary_context = "\n".join([f"- {n['title']}: {n['summary']}" for n in news_items[:3]])
        
        reply_text = await ai_router.generate_response(
            prompt=f"Here is the latest {category.upper()} news:\n{news_summary_context}\nSummarize this in 1-2 short sentences in Bengali for your boss.",
            system_instruction="You are ARVIX. Keep news summaries ultra-short and concise in Bengali.",
            provider=req.provider,
            model=req.model
        )

    # 5j. Tasks
    elif intent == "LIST_TASKS":
        tools_used.append("task_manager")
        tasks = db.query(Task).filter(Task.status != "completed").limit(5).all()
        if tasks:
            task_list_str = "\n".join([f"- {t.title}" for t in tasks])
            reply_text = f"📋 পেন্ডিং টাস্ক:\n{task_list_str}"
        else:
            reply_text = "কোনো পেন্ডিং কাজ নেই, বস! সব কমপ্লিট।"

    elif intent == "CREATE_TASK":
        tools_used.append("task_manager")
        clean_title = re.sub(r"(task|কাজ|তৈরি|যোগ|করো|add|create)", "", req.message, flags=re.IGNORECASE).strip()
        new_task = Task(title=clean_title or "New Task", status="pending", priority="medium")
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        reply_text = f"টাস্ক অ্যাড করে দিয়েছি: '{new_task.title}'"

    # 5k. General Conversation with AI
    else:
        recent_msgs = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(8).all()

        history = [
            {"role": m.role, "content": m.content}
            for m in reversed(recent_msgs)
        ]

        reply_text = await ai_router.generate_response(
            prompt=req.message,
            provider=req.provider,
            model=req.model,
            conversation_history=history,
            memory_context=memory_context
        )

        # Smart Auto-Detection for YouTube play in conversation
        if any(w in reply_text for w in ["ইউটিউবে", "গানটি চালু", "চালিয়ে দিচ্ছি", "চালু করে দিচ্ছি"]):
            try:
                song_match = re.search(r"['\"]([^'\"]+)['\"]", reply_text)
                search_term = song_match.group(1) if song_match else req.message
                clean_term = youtube_tool.clean_song_query(search_term)
                if clean_term:
                    asyncio.create_task(youtube_tool.play_song_in_browser(clean_term))
                    tools_used.append("youtube_tool")
            except Exception as yt_err:
                print(f"[Auto YouTube Trigger] Error: {yt_err}")

    # 6. Store Assistant Response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=reply_text,
        metadata_json=json.dumps({"tools": tools_used, "intent": intent})
    )
    db.add(assistant_msg)
    conversation.updated_at = datetime.utcnow()
    db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        reply=reply_text,
        intent=intent,
        tools_used=tools_used,
        device_command=device_command_payload
    )
