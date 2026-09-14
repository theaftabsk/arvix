import React, { useState, useEffect, useCallback } from 'react';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardHUD } from './components/dashboard/DashboardHUD';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { MemoryView } from './components/memory/MemoryView';
import { NewsView } from './components/news/NewsView';
import { RoutinesView } from './components/routines/RoutinesView';
import { LaptopAgentView } from './components/agent/LaptopAgentView';
import { CommandCenterSettings } from './components/settings/CommandCenterSettings';
import { VisionView } from './components/vision/VisionView';
import { HandGestureHUD } from './components/vision/HandGestureHUD';
import { SolarSystemView } from './components/solarsystem/SolarSystemView';

import { 
  TabType, 
  ChatMessage, 
  Task, 
  Project, 
  MemoryItem, 
  RoutineItem, 
  NewsArticle, 
  DeviceCommandLog 
} from './types';
import { apiService } from './services/api';
import { laptopAgent } from './services/laptopAgent';
import { jarvisVoice } from './services/jarvisVoice';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [vpsOnline, setVpsOnline] = useState(true);
  const [vpsPing, setVpsPing] = useState(14);

  // JARVIS Voice & HUD Core States
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [coreState, setCoreState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'executing'>('idle');
  const [visionSubMode, setVisionSubMode] = useState<'face_scan' | 'hand_gesture'>('face_scan');
  const [isAirControlActive, setIsAirControlActive] = useState<boolean>(false);

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [commandLogs, setCommandLogs] = useState<DeviceCommandLog[]>(laptopAgent.commandHistory);

  // Initialize data and WebSocket bridge on mount
  useEffect(() => {
    laptopAgent.connect();
    const unsub = laptopAgent.subscribeCommands((cmd: any) => {
      setCommandLogs((prev) => [cmd, ...prev]);
      setCoreState('executing');
      setTimeout(() => setCoreState('idle'), 3000);

      if (cmd.type === 'gesture_command' || cmd.commandType === 'gesture_command') {
        if (cmd.action === 'start_gesture') {
          setIsAirControlActive(true);
          setVisionSubMode('hand_gesture');
        } else if (cmd.action === 'stop_gesture') {
          setIsAirControlActive(false);
          setVisionSubMode('face_scan');
        }
      }

      if (cmd.type === 'navigate_page' && cmd.tab) {
        setCurrentTab(cmd.tab as TabType);
        if (cmd.tab === 'cosmos' || cmd.enable_gesture) {
          setIsAirControlActive(true);
        }
      }
    });

    const loadInitialData = async () => {
      const [tList, pList, mList, rList, nList, isHealthy] = await Promise.all([
        apiService.getTasks(),
        apiService.getProjects(),
        apiService.getMemories(),
        apiService.getRoutines(),
        apiService.getNews(),
        apiService.checkHealth()
      ]);

      setTasks(tList);
      setProjects(pList);
      setMemories(mList);
      setRoutines(rList);
      setNewsArticles(nList);
      setVpsOnline(isHealthy);
      setVpsPing(Math.floor(Math.random() * 6) + 14);
    };

    loadInitialData();

    return () => unsub();
  }, []);

  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(undefined);

  // Send message handler with automatic JARVIS Voice output & Core State transitions
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Fast local dispatch for planet selection in 3D Cosmos
    const lower = text.toLowerCase();
    let targetPlanetId = '';
    if (/(earth|পৃথিবী)/i.test(lower)) targetPlanetId = 'earth';
    else if (/(mars|মঙ্গল)/i.test(lower)) targetPlanetId = 'mars';
    else if (/(jupiter|বৃহস্পতি)/i.test(lower)) targetPlanetId = 'jupiter';
    else if (/(saturn|শনি)/i.test(lower)) targetPlanetId = 'saturn';
    else if (/(venus|শুক্র)/i.test(lower)) targetPlanetId = 'venus';
    else if (/(mercury|বুধ)/i.test(lower)) targetPlanetId = 'mercury';
    else if (/(sun|সূর্য|sol)/i.test(lower)) targetPlanetId = 'sun';
    else if (/(uranus|ইউরেনাস)/i.test(lower)) targetPlanetId = 'uranus';
    else if (/(neptune|নেপচুন)/i.test(lower)) targetPlanetId = 'neptune';
    else if (/(pluto|প্লুটো)/i.test(lower)) targetPlanetId = 'pluto';

    if (targetPlanetId) {
      window.dispatchEvent(new CustomEvent('arvix:select_planet', {
        detail: { planet: targetPlanetId, openModal: false }
      }));
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setCoreState('thinking');

    try {
      const resp = await apiService.sendMessage(text, activeConversationId);
      if (resp.conversationId) {
        setActiveConversationId(resp.conversationId);
      }
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: resp.intent,
        tools: resp.tools,
        deviceCommand: resp.deviceCommand
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // 🔊 JARVIS speaks the response automatically and transitions core to 'speaking'
      setCoreState('speaking');
      jarvisVoice.speak(resp.reply, () => {
        setCoreState('idle');
      });

      if (resp.intent === 'CREATE_TASK' || resp.intent === 'LIST_TASKS') {
        apiService.getTasks().then(setTasks);
      }
      if (resp.intent === 'SAVE_MEMORY') {
        apiService.getMemories().then(setMemories);
      }
      if (resp.intent === 'GESTURE_COMMAND') {
        if (resp.reply.includes('চালু') || resp.reply.includes('শুরু') || resp.reply.includes('অন') || resp.reply.includes('ঘুরে আসি') || resp.reply.includes('রেডি')) {
          setIsAirControlActive(true);
          setVisionSubMode('hand_gesture');
          setCurrentTab('cosmos');
        } else if (resp.reply.includes('বন্ধ')) {
          setIsAirControlActive(false);
          setVisionSubMode('face_scan');
        }
      }
      if (resp.deviceCommand?.tab) {
        setCurrentTab(resp.deviceCommand.tab as TabType);
        if (resp.deviceCommand.tab === 'cosmos' || resp.deviceCommand.enable_gesture) {
          setIsAirControlActive(true);
        }
      }
      if (resp.intent === 'CAMERA_COMMAND') {
        if (resp.reply.includes('চালু') || resp.reply.includes('এনালাইসিস')) {
          setVisionSubMode('face_scan');
          setCurrentTab('vision');
        } else if (resp.reply.includes('বন্ধ')) {
          setCurrentTab('chat');
        }
      }
      if (resp.intent === 'LAPTOP_COMMAND' && resp.deviceCommand) {
        setCoreState('executing');
        setCommandLogs((prev) => [
          {
            id: Date.now(),
            commandType: resp.deviceCommand.action,
            target: resp.deviceCommand.target,
            sender: 'Voice / ARVIX',
            status: 'executed',
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        setTimeout(() => setCoreState('idle'), 2500);
      }
    } catch (e) {
      console.error(e);
      setCoreState('idle');
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle Continuous JARVIS Hands-Free Voice Mode
  const toggleVoiceMode = () => {
    if (!voiceModeActive) {
      setVoiceModeActive(true);
      setCoreState('listening');
      jarvisVoice.startContinuousListening(
        (spokenText) => {
          handleSendMessage(spokenText);
        },
        (listening) => {
          if (listening) setCoreState('listening');
          else if (coreState === 'listening') setCoreState('idle');
        }
      );
      jarvisVoice.speak("হ্যাঁ স্যার, আমি শুনছি", () => { setCoreState('listening');
      });
    } else {
      setVoiceModeActive(false);
      setCoreState('idle');
      jarvisVoice.stopContinuousListening();
    }
  };

  const stopSpeech = () => {
    jarvisVoice.stop();
    setCoreState('idle');
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const handleAddTask = async (task: Partial<Task>) => {
    const created = await apiService.createTask(task);
    setTasks((prev) => [created, ...prev]);
  };

  const handleAddMemory = (mem: Partial<MemoryItem>) => {
    const newMem: MemoryItem = {
      id: Date.now(),
      category: mem.category || 'personal',
      content: mem.content || '',
      importance: mem.importance || 4,
      created_at: 'Just now'
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleToggleRoutine = (id: number) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleTestCommand = (action: string, target: string) => {
    setCoreState('executing');
    const log: DeviceCommandLog = {
      id: Date.now(),
      commandType: action,
      target,
      sender: 'Manual Test Trigger',
      status: 'executed',
      timestamp: new Date().toLocaleTimeString()
    };
    setCommandLogs((prev) => [log, ...prev]);
    setTimeout(() => setCoreState('idle'), 2500);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#030507'
    }}>
      {/* 1. IRIS-Style Top Navbar with Clock, Battery, Status, and Segmented Tabs */}
      <TopNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        vpsOnline={vpsOnline}
      />

      {/* 2. Main View Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {currentTab === 'chat' && (
          <DashboardHUD
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
            onSpeak={(txt) => jarvisVoice.speak(txt)}
            vpsPing={vpsPing}
            vpsOnline={vpsOnline}
            voiceModeActive={voiceModeActive}
            onToggleVoiceMode={toggleVoiceMode}
            onStopSpeech={stopSpeech}
            coreState={coreState}
          />
        )}

        {currentTab === 'vision' && (
          <VisionView 
            onSpeak={(txt) => jarvisVoice.speak(txt)}
            autoStartCamera={true}
            subMode={visionSubMode}
            onSubModeChange={setVisionSubMode}
          />
        )}

        {currentTab === 'cosmos' && (
          <SolarSystemView 
            isAirControlActive={isAirControlActive}
            onToggleAirControl={() => setIsAirControlActive(!isAirControlActive)}
            onSpeak={(txt) => jarvisVoice.speak(txt)}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        )}

        {currentTab === 'projects' && <ProjectsView projects={projects} />}

        {currentTab === 'memory' && (
          <MemoryView
            memories={memories}
            onAddMemory={handleAddMemory}
          />
        )}

        {currentTab === 'news' && <NewsView articles={newsArticles} />}

        {currentTab === 'routines' && (
          <RoutinesView
            routines={routines}
            onToggleRoutine={handleToggleRoutine}
          />
        )}

        {currentTab === 'agent' && (
          <LaptopAgentView
            commandLogs={commandLogs}
            onTestCommand={handleTestCommand}
          />
        )}

        {currentTab === 'settings' && <CommandCenterSettings />}
      </div>

      {/* Persistent Floating Air Hand Gesture PiP Widget */}
      {isAirControlActive && (currentTab !== 'vision' || visionSubMode !== 'hand_gesture') && (
        <HandGestureHUD
          isFloating={true}
          onStop={() => setIsAirControlActive(false)}
          onMaximize={() => {
            setCurrentTab('vision');
            setVisionSubMode('hand_gesture');
          }}
        />
      )}
    </div>
  );
};
