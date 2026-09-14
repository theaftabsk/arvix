import re
import unicodedata
from typing import Dict, Any, Tuple

class IntentAnalyzer:
    """
    ARVIX Fast Intent Detection Engine
    Accurately classifies audio/volume control, YouTube media control, 
    persistent personal memories, favorite music recall, and general reasoning.
    """

    def analyze(self, text: str) -> Tuple[str, Dict[str, Any]]:
        normalized = unicodedata.normalize("NFC", text).replace('\u09af\u09bc', '\u09df')
        lower = normalized.lower()

        # 0. Hardware Volume & Audio Control (Highest Priority)
        volume_keywords = ["sound", "সাউন্ড", "volume", "ভলিউম", "আওয়াজ", "আওয়াজ", "মিউট", "mute", "unmute"]
        if any(w in lower for w in volume_keywords):
            up_keywords = ["বাড়াও", "বাড়াও", "বাড়া", "বাড়া", "বাড়িয়ে", "বাড়িয়ে", "barao", "baraw", "up", "increase", "উঁচু", "ফুল", "full", "max", "ম্যাক্স", "বেশি"]
            down_keywords = ["কমাও", "কমা", "কমিয়ে", "কমিয়ে", "komao", "komaw", "down", "decrease", "নিচু", "ধীরে", "আস্তে", "কম"]
            mute_keywords = ["mute", "মিউট", "বন্ধ", "থামাও"]
            unmute_keywords = ["unmute", "আনমিউট", "খোলো"]

            if any(w in lower for w in up_keywords):
                steps = 25 if any(w in lower for w in ["full", "ফুল", "max", "ম্যাক্স", "অনেক"]) else 8
                return "VOLUME_CONTROL", {"action": "volume_up", "steps": steps}
            if any(w in lower for w in down_keywords):
                return "VOLUME_CONTROL", {"action": "volume_down", "steps": 8}
            if any(w in lower for w in mute_keywords):
                return "VOLUME_CONTROL", {"action": "volume_mute"}
            if any(w in lower for w in unmute_keywords):
                return "VOLUME_CONTROL", {"action": "volume_unmute"}

        # 1. YouTube & Media Playback Control (Fullscreen, Pause, Resume, Next, Prev)
        fullscreen_keywords = ["ফুলস্ক্রিন", "ফুল স্ক্রিন", "fullscreen", "ভিডিও বড় করো", "ভিডিও বড় করো", "বড় স্ক্রিন", "বড় স্ক্রিন", "full screen"]
        if any(w in lower for w in fullscreen_keywords):
            return "YOUTUBE_CONTROL", {"action": "fullscreen"}

        exit_fullscreen_keywords = ["ছোট স্ক্রিন", "নরমাল স্ক্রিন", "নরমাল করো", "এক্সিট ফুলস্ক্রিন", "exit fullscreen", "ছোট করো"]
        if any(w in lower for w in exit_fullscreen_keywords):
            return "YOUTUBE_CONTROL", {"action": "exit_fullscreen"}

        pause_keywords = ["গান থামাও", "ভিডিও থামাও", "পজ করো", "গান পজ", "ভিডিও পজ", "pause", "stop song", "গান বন্ধ করো"]
        if any(w in lower for w in pause_keywords):
            return "YOUTUBE_CONTROL", {"action": "pause"}

        resume_keywords = ["গান আবার চালাও", "রিজিউম", "resume", "ভিডিও আবার চালাও", "প্লে করো"]
        if any(w in lower for w in resume_keywords) and not any(w in lower for w in ["প্রিয়", "প্রিয়", "fav", "নতুন"]):
            return "YOUTUBE_CONTROL", {"action": "resume"}

        next_keywords = ["নেক্সট গান", "পরের গান", "next song", "পরবর্তী গান", "গান পাল্টাও", "গান বদলাও"]
        if any(w in lower for w in next_keywords):
            return "YOUTUBE_CONTROL", {"action": "next"}

        prev_keywords = ["আগের গান", "previous song", "আগেরটা"]
        if any(w in lower for w in prev_keywords):
            return "YOUTUBE_CONTROL", {"action": "prev"}

        # 1.5 Laptop Camera & Vision HUD Control
        if any(w in lower for w in ["ক্যামেরা বন্ধ", "camera বন্ধ", "camera off", "ক্যামেরা অফ", "stop camera", "ক্যামেরা ক্লোজ"]):
            return "CAMERA_COMMAND", {"action": "stop_camera"}

        if any(w in lower for w in ["ছবি তোলো", "ছবি নাও", "capture photo", "take picture", "টেক পিকচার", "স্ক্যান করো", "ছবি তোল"]):
            return "CAMERA_COMMAND", {"action": "capture_photo"}

        if any(w in lower for w in ["camera on", "ক্যামেরা অন", "ক্যামেরা চালু", "camera চালু", "open camera", "face scan", "ফেস স্ক্যান", "ক্যামেরা খোল"]):
            return "CAMERA_COMMAND", {"action": "open_camera"}

        # 1.55 Universal 3D Solar System & Hand Control Trigger (Immediate Zero-Latency)
        solar_triggers = ["solar", "soler", "সোলার", "সৌরজগৎ", "cosmos", "মহাকাশ", "ঘুরে আসি", "পড়ে আছি", "ট্যুর"]
        if any(s in lower for s in solar_triggers) and not any(p in lower for p in ["panel", "প্যানেল", "বিদ্যুৎ"]):
            return "NAVIGATE_PAGE", {"tab": "cosmos", "label": "3D Solar System", "enable_gesture": True}

        # 1.6 Air Hand Gesture & Fingertip Laptop Control
        hand_words = ["hand", "হ্যান্ড", "হাত", "জেসচার", "gesture", "finger", "আঙুল", "আঙ্গুল", "বায়ু", "air", "fingertip"]
        stop_words = ["বন্ধ", "off", "stop", "থামাও", "ক্লোজ", "close", "অফ"]
        start_words = ["কন্ট্রোল", "control", "চালু", "চালাব", "চালাও", "অন", "on", "শুরু", "start", "ল্যাপটপ", "মাউস", "mouse", "কার্সর", "cursor", "নাড়িয়ে", "দিয়ে", "দিয়া"]

        if any(h in lower for h in hand_words) and any(s in lower for s in stop_words):
            return "GESTURE_COMMAND", {"action": "stop_gesture"}

        if any(h in lower for h in hand_words) and any(s in lower for s in start_words):
            return "GESTURE_COMMAND", {"action": "start_gesture"}

        if any(w in lower for w in ["hand control", "হ্যান্ড কন্ট্রোল", "air hand", "gesture control", "fingertip", "air gesture"]):
            return "GESTURE_COMMAND", {"action": "start_gesture"}

        # 2. Favorite Song Play: "আমার প্রিয় গান চালাও" / "play my favorite song"
        fav_triggers = ["আমার প্রিয় গান", "আমার প্রিয় গান", "আমার ফেভারিট গান", "my favorite song", "amar fav song"]
        play_verbs = ["চালাও", "বাজাও", "প্লে", "play", "শুনব", "শোনাও", "চালিয়ে দাও", "চালিয়ে দাও"]
        if any(f in lower for f in fav_triggers) and any(p in lower for p in play_verbs):
            return "PLAY_FAVORITE_SONG", {"raw_text": normalized}

        # 3. Favorite Song Query: "আমার প্রিয় গান কি?" / "what is my favorite song?"
        query_words = ["কি", "কী", "কোনটা", "কোনটি", "বলো", "what", "মনে আছে", "জান কি", "জানিস"]
        if any(f in lower for f in fav_triggers) and any(q in lower for q in query_words):
            return "SEARCH_FAVORITE_SONG", {"raw_text": normalized}

        # 4. Favorite Song / Memory Save: User telling ARVIX their favorite song or facts
        # Examples: "আমার প্রিয় গান দিল", "আমার fav songs ache dil", "মনে রাখো আমার প্রিয় গান দিল", "সেভ করো..."
        if any(f in lower for f in fav_triggers) and not any(p in lower for p in play_verbs):
            return "SAVE_MEMORY", {"type": "favorite_song", "raw_text": normalized}

        if any(w in lower for w in ["মনে রাখো", "মনে রেখো", "remember that", "remember", "সেভ করে রাখো", "সেভ করো", "save this", "আমার প্রিয় খাবার", "আমার পছন্দ"]):
            return "SAVE_MEMORY", {"type": "general", "raw_text": normalized}

        if any(w in lower for w in ["আমি কি বলেছিলাম", "আমার প্রিয় কি", "আমার প্রিয় কি", "recall", "মনে আছে কি"]):
            return "SEARCH_MEMORY", {"query": normalized}

        # 4.5 Fast Check: Open YouTube App/Site directly if 'খোলো' / 'open' is requested
        if any(w in lower for w in ["youtube", "ইউটিউব"]) and any(w in lower for w in ["খোলো", "খোল", "open", "ওপেন"]):
            return "LAPTOP_COMMAND", {"action": "open_app", "target": "youtube"}

        # 5. Regular YouTube Music Streaming Intent
        music_keywords = ["গান", "বাজাও", "চালাও", "play", "song", "music", "youtube", "ইউটিউব", "ভিডিও", "video"]
        if any(w in lower for w in music_keywords):
            # Check if user specifically requested fullscreen play (e.g. "ফুলস্ক্রিনে গান চালাও")
            req_fullscreen = any(w in lower for w in ["ফুলস্ক্রিনে", "ফুলস্ক্রিন", "fullscreen", "বড় স্ক্রিনে"])
            clean = re.sub(
                r"(গানটা|গান|চালাও|বাজাও|প্লে|করো|play|song|music|on|in|youtube|ইউটিউবে|ইউটিউব|ভিডিও|video|ফুলস্ক্রিনে|fullscreen|বড়\s*স্ক্রিনে)", 
                "", 
                normalized, 
                flags=re.IGNORECASE
            ).strip()
            if not clean:
                clean = "trending music"
            return "PLAY_MUSIC", {"action": "play_music", "query": clean, "fullscreen": req_fullscreen}

        # 5.5 In-App Tab / Page Navigation (e.g. "টাস্ক পেজ খোলো", "dashboard খোলো", "memory খোলো", "solar system খোলো")
        nav_verbs = ["খোলো", "খোল", "খুলো", "open", "show", "দেখাও", "নিয়ে যাও", "যাও", "go to", "navigate", "চালু", "ওপেন", "বের", "বের করো", "বের কর", "বের করে দাও"]
        if any(v in lower for v in nav_verbs) or "solar system" in lower or "সোলার সিস্টেম" in lower:
            if any(w in lower for w in ["solar system", "সোলার সিস্টেম", "solarsystem", "solar", "cosmos"]):
                return "NAVIGATE_PAGE", {"tab": "cosmos", "label": "3D Solar System", "enable_gesture": True}
            if any(w in lower for w in ["dashboard", "ড্যাশবোর্ড", "মেইন পেজ", "হোম পেজ", "home"]):
                return "NAVIGATE_PAGE", {"tab": "chat", "label": "Dashboard"}
            if any(w in lower for w in ["task", "টাস্ক", "কাজের লিস্ট", "টু ডু", "todo"]):
                return "NAVIGATE_PAGE", {"tab": "tasks", "label": "Tasks"}
            if any(w in lower for w in ["memory", "মেমোরি", "স্মৃতি"]):
                return "NAVIGATE_PAGE", {"tab": "memory", "label": "Central Memory"}
            if any(w in lower for w in ["project", "প্রজেক্ট"]):
                return "NAVIGATE_PAGE", {"tab": "projects", "label": "Projects"}
            if any(w in lower for w in ["vision", "ভিশন", "ক্যামেরা পেজ", "camera page"]):
                return "NAVIGATE_PAGE", {"tab": "vision", "label": "Vision Subsystem"}
            if any(w in lower for w in ["intelligence", "ইন্টেলিজেন্স", "news", "নিউজ", "খবর"]):
                return "NAVIGATE_PAGE", {"tab": "news", "label": "Intelligence"}
            if any(w in lower for w in ["routine", "রুটিন"]):
                return "NAVIGATE_PAGE", {"tab": "routines", "label": "Routines"}
            if any(w in lower for w in ["agent", "এজেন্ট", "laptop agent"]):
                return "NAVIGATE_PAGE", {"tab": "agent", "label": "Laptop Agent"}
            if any(w in lower for w in ["setting", "সেটিং", "সেটিংস"]):
                return "NAVIGATE_PAGE", {"tab": "settings", "label": "Settings"}

        # 6. Laptop / Desktop Application Controller
        app_keywords = ["open", "খোল", "খুলো", "start", "laptop", "ল্যাপটপ", "vs code", "vscode", "notepad", "calculator", "chrome", "spotify", "youtube", "ইউটিউব", "google", "গুগল", "facebook", "ফেসবুক", "browser", "ব্রাউজার", "solar system", "সোলার সিস্টেম", "solarsystem"]
        if any(w in lower for w in app_keywords) or "solar system" in lower or "সোলার সিস্টেম" in lower:
            if "solar system" in lower or "সোলার সিস্টেম" in lower or "solarsystem" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "solarsystem"}
            if "youtube" in lower or "ইউটিউব" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "youtube"}
            if "google" in lower or "গুগল" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "google"}
            if "facebook" in lower or "ফেসবুক" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "facebook"}
            if "vs code" in lower or "vscode" in lower or "code" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "code"}
            if "notepad" in lower or "নোটপ্যাড" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "notepad"}
            if "calculator" in lower or "ক্যালকুলেটর" in lower or "calc" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "calc"}
            if "chrome" in lower or "ক্রোম" in lower or "browser" in lower or "ব্রাউজার" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "chrome"}
            if "spotify" in lower or "স্পটিফাই" in lower:
                return "LAPTOP_COMMAND", {"action": "open_app", "target": "spotify"}
            if "downloads" in lower or "ডাউনলোড" in lower or "ফাইল" in lower:
                return "LAPTOP_COMMAND", {"action": "search_file", "target": "Downloads"}
            return "LAPTOP_COMMAND", {"action": "general_device", "query": normalized}

        # 7. Curated Tech & AI News
        if any(w in lower for w in ["news", "খবর", "সংবাদ", "latest tech", "ai news", "আজকের নিউজ"]):
            category = "ai" if "ai" in lower else "tech"
            return "NEWS", {"category": category}

        # 8. Task Management
        if any(w in lower for w in ["task", "কাজ", "করতে হবে", "pending", "টু-ডু", "todo", "মনে করিয়ে দাও"]):
            if any(w in lower for w in ["তৈরি", "যোগ", "create", "add", "করো"]):
                return "CREATE_TASK", {"raw_text": normalized}
            return "LIST_TASKS", {}

        # 9. General Reasoning
        return "GENERAL_QUERY", {"query": normalized}

intent_analyzer = IntentAnalyzer()
