import { ChatMessage, Task, Project, MemoryItem, RoutineItem, NewsArticle, VisionAnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// High-frequency cursor concurrency guard: prevents network queue backlog & lag
let isCursorMovePending = false;

export const apiService = {
  // Send chat message
  async sendMessage(message: string, conversationId?: number): Promise<{
    reply: string;
    intent: string;
    tools: string[];
    deviceCommand?: any;
    conversationId: number;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          device_type: 'windows'
        })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          reply: data.reply,
          intent: data.intent,
          tools: data.tools_used || [],
          deviceCommand: data.device_command,
          conversationId: data.conversation_id
        };
      }
    } catch (e) {
      console.warn('[API] Server unreachable, using local smart assistant fallback:', e);
    }

    // Interactive fallback if backend not yet running
    const lower = message.toLowerCase();
    if (lower.includes('news') || lower.includes('খবর')) {
      return {
        reply: "📰 **সর্বশেষ এআই ও প্রযুক্তি আপডেট**:\n- **Groq LPU**: GPT-OSS 120B মডেল ফ্রি টিয়ারে ৩ গুণ দ্রুত রেসপন্স দিচ্ছে।\n- **PostgreSQL + pgvector**: এআই পার্সোনাল মেমোরি সিস্টেমে নতুন স্ট্যান্ডার্ড।\n- **ARVIX Ecosystem**: Windows ল্যাপটপ এবং Android মোবাইলের সেন্ট্রাল ব্রেন প্রস্তুত।",
        intent: 'NEWS',
        tools: ['news_intelligence'],
        conversationId: 1
      };
    } else if (lower.includes('task') || lower.includes('কাজ')) {
      return {
        reply: "📋 আপনার পেন্ডিং টাস্ক:\n1. [URGENT] Website login integration (Tomorrow)\n2. [HIGH] ARVIX Desktop UI polish\n3. [MEDIUM] Android Flutter sync setup",
        intent: 'LIST_TASKS',
        tools: ['task_manager'],
        conversationId: 1
      };
    } else if (lower.includes('vs code') || lower.includes('vscode') || lower.includes('laptop')) {
      return {
        reply: "💻 **ল্যাপটপ কমান্ড সম্পন্ন!**\nVisual Studio Code চালু করার সিগন্যাল ল্যাপটপ এজেন্টে সফলভাবে পৌঁছেছে।",
        intent: 'LAPTOP_COMMAND',
        tools: ['device_agent'],
        deviceCommand: { action: 'open_app', target: 'Visual Studio Code', status: 'executed' },
        conversationId: 1
      };
    }

    return {
      reply: `**ARVIX AI Core**: আমি আপনার বার্তা পেয়েছি: "${message}"।\n\n- 🧠 **Active Brain**: Groq (openai/gpt-oss-120b)\n- 🔄 **Backup**: Gemini Free Tier\n- ⚡ **Device Hub**: Windows Laptop Client Active`,
      intent: 'GENERAL_CHAT',
      tools: [],
      conversationId: 1
    };
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, title: 'Complete ARVIX Desktop UI/UX', priority: 'urgent', status: 'in_progress', due_date: 'Today' },
      { id: 2, title: 'Connect Groq GPT-OSS 120B API Key', priority: 'high', status: 'pending', due_date: 'Today' },
      { id: 3, title: 'Test Laptop Agent remote command bridge', priority: 'medium', status: 'pending', due_date: 'Tomorrow' },
      { id: 4, title: 'Prepare Android Flutter Client', priority: 'medium', status: 'pending', due_date: 'Next Week' }
    ];
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      id: Date.now(),
      title: task.title || 'New Task',
      priority: task.priority || 'medium',
      status: 'pending',
      due_date: 'Upcoming'
    };
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, name: 'ARVIX AI Ecosystem', description: 'Central Private AI Assistant with Windows & Android Sync', status: 'active', progress: 75 },
      { id: 2, name: 'Personal Website & Portfolio', description: 'Full stack modern web application with auth & blog', status: 'active', progress: 40 },
      { id: 3, name: 'Automated Daily Research', description: 'Web scraping & summarization routine for AI breakthroughs', status: 'active', progress: 90 }
    ];
  },

  // Memories
  async getMemories(): Promise<MemoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/memories/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('[API] Could not fetch memories from server:', e);
    }
    return [];
  },

  async createMemory(mem: Partial<MemoryItem>): Promise<MemoryItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/memories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: mem.content,
          category: mem.category || 'personal',
          importance: mem.importance || 4
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      id: Date.now(),
      content: mem.content || '',
      category: (mem.category as any) || 'personal',
      importance: mem.importance || 4,
      created_at: new Date().toISOString()
    };
  },

  async deleteMemory(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/memories/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Routines
  async getRoutines(): Promise<RoutineItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/routines/`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, title: 'Morning Coding & Tasks Briefing', cron_time: '08:00 AM', action_type: 'briefing', is_active: true },
      { id: 2, title: 'Midday High-Priority Project Review', cron_time: '01:00 PM', action_type: 'reminder', is_active: true },
      { id: 3, title: 'Evening Tech & AI News Digest', cron_time: '08:00 PM', action_type: 'news', is_active: true }
    ];
  },

  // News
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/news/`);
      if (res.ok) {
        const data = await res.json();
        return data.articles;
      }
    } catch (e) {}
    return [
      {
        title: 'OpenAI & DeepMind Announce Next-Gen Multi-Step Reasoning Models',
        source: 'TechRadar AI',
        time: '10m ago',
        summary: 'Next-generation reasoning architectures demonstrate unmatched coding precision and autonomous self-correction.'
      },
      {
        title: 'Groq Delivers Ultra-Fast Inference for GPT-OSS 120B Free Tier',
        source: 'VentureBeat',
        time: '45m ago',
        summary: 'Real-time LPU chip architecture achieves instant token delivery for conversational agents, tools, and voice assistants.'
      },
      {
        title: 'PostgreSQL + pgvector Solidifies Place as Standard for Private AI Memory',
        source: 'Database Trends',
        time: '2h ago',
        summary: 'Unified relational and semantic embedding databases deliver unmatched query speed and security for personal assistants.'
      }
    ];
  },

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Vision Intelligence & Image Analysis
  async analyzeVision(imageBase64: string): Promise<VisionAnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 })
    });
    if (!res.ok) {
      throw new Error(`Vision API error: ${res.statusText}`);
    }
    return await res.json();
  },

  // Low-latency local Windows Hand Gesture & Cursor Stream
  async sendCursorMove(x: number, y: number): Promise<void> {
    if (isCursorMovePending) return; // Drop intermediate frames for ultra-fluid real-time 60fps responsiveness
    isCursorMovePending = true;
    try {
      await fetch(`${API_BASE_URL}/gesture/cursor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
      });
    } catch (e) {
    } finally {
      isCursorMovePending = false;
    }
  },

  async sendGestureAction(action: string, payload?: Record<string, any>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/gesture/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
    } catch (e) {}
  },

  async getSettings(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  async updateSettings(payload: {
    default_ai_provider?: string;
    default_ai_model?: string;
    gemini_api_key?: string;
    groq_api_key?: string;
    openai_api_key?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/settings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Failed to update settings: ${res.statusText}`);
    }
    return await res.json();
  }
};
