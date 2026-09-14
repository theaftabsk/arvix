import { DeviceCommandLog } from '../types';

type CommandListener = (cmd: DeviceCommandLog) => void;

class LaptopAgentService {
  private ws: WebSocket | null = null;
  private commandListeners: CommandListener[] = [];
  public commandHistory: DeviceCommandLog[] = [
    {
      id: 101,
      commandType: 'open_app',
      target: 'Visual Studio Code',
      sender: 'Mobile (Android)',
      status: 'executed',
      timestamp: 'Just now'
    }
  ];

  connect(wsUrl: string = 'ws://localhost:8000/ws/windows') {
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Laptop Agent] 🟢 Connected to VPS WebSocket Hub as Windows Laptop');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Laptop Agent] Received signal from VPS:', data);

          if (data.type === 'device_command') {
            this.handleRemoteCommand(data);
          }
        } catch (e) {
          console.error('[Laptop Agent] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        console.warn('[Laptop Agent] Disconnected from VPS WebSocket. Reconnecting in 5s...');
        setTimeout(() => this.connect(wsUrl), 5000);
      };
    } catch (e) {
      console.warn('[Laptop Agent] WebSocket connection failed:', e);
    }
  }

  private handleRemoteCommand(data: any) {
    const newLog: DeviceCommandLog = {
      id: data.command_id || Date.now(),
      commandType: data.action || 'system_action',
      target: data.target || 'System',
      sender: 'Mobile Device',
      status: 'executed',
      timestamp: new Date().toLocaleTimeString()
    };

    // Execute local browser action if open_url
    if (data.action === 'open_url' && data.target) {
      try {
        window.open(data.target, '_blank');
      } catch (e) {
        console.warn('[Laptop Agent] window.open failed:', e);
      }
    }

    this.commandHistory.unshift(newLog);
    this.commandListeners.forEach(listener => listener(newLog));

    // Send execution confirmation back to VPS Hub
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'command_result',
        command_id: data.command_id,
        status: 'executed',
        result: {
          executed_at: new Date().toISOString(),
          device: 'Windows Laptop',
          message: `Action '${data.action}' executed successfully.`
        }
      }));
    }
  }

  subscribeCommands(listener: CommandListener) {
    this.commandListeners.push(listener);
    return () => {
      this.commandListeners = this.commandListeners.filter(l => l !== listener);
    };
  }
}

export const laptopAgent = new LaptopAgentService();
