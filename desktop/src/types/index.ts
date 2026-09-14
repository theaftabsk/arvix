export type TabType = 
  | 'chat' 
  | 'vision'
  | 'cosmos'
  | 'tasks' 
  | 'projects' 
  | 'memory' 
  | 'news' 
  | 'routines' 
  | 'agent' 
  | 'settings';

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  tools?: string[];
  deviceCommand?: {
    action: string;
    target: string;
    status: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  project_id?: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  progress?: number;
  tasks?: Task[];
}

export interface MemoryItem {
  id: number;
  category: 'personal' | 'preference' | 'project' | 'fact' | 'favorite_song' | string;
  content: string;
  importance: number;
  created_at: string;
}

export interface RoutineItem {
  id: number;
  title: string;
  cron_time: string;
  action_type: string;
  is_active: boolean;
}

export interface NewsArticle {
  title: string;
  source: string;
  time: string;
  summary: string;
  category?: string;
}

export interface DeviceCommandLog {
  id: number;
  commandType: string;
  target: string;
  sender: string;
  status: 'dispatched' | 'executed' | 'pending' | 'failed';
  timestamp: string;
}

export interface SystemStatus {
  vpsOnline: boolean;
  vpsPingMs: number;
  activeModel: string;
  primaryProvider: string;
  backupModel: string;
  mobileConnected: boolean;
  laptopAgentActive: boolean;
}

export interface VisionAnalysisResult {
  face_detected: boolean;
  face_count: number;
  confidence: number;
  attributes?: {
    lighting?: string;
    expression?: string;
    head_pose?: string;
  };
  ocr_text: string[];
  objects_detected: string[];
  scene: string;
  summary_bengali: string;
  public_sources: {
    title: string;
    domain: string;
    url: string;
    match_type: string;
  }[];
  status: string;
  privacy_status?: string;
}
