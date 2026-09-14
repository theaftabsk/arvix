// ARVIX JARVIS Bulletproof Multilingual Voice Engine (Bengali, Hindi, English)

class JarvisVoiceService {
  private synth: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private isListeningContinuous: boolean = false;
  private recognition: any = null;
  private onSpeechCapturedCallback: ((text: string) => void) | null = null;
  private onListeningStateChange: ((listening: boolean) => void) | null = null;
  private isCurrentlySpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
    this.initSpeechRecognition();
  }

  // Pre-unlock audio element on user gesture so speech plays without delay
  public unlockAudio() {
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().catch(() => {});
    } catch (e) {}
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private currentAudio: HTMLAudioElement | null = null;
  private lastSpokenTimestamp: number = 0;

  private stopListeningImmediately() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }

  private resumeListeningIfContinuous() {
    if (this.isListeningContinuous && this.recognition && !this.isCurrentlySpeaking) {
      setTimeout(() => {
        if (this.isListeningContinuous && !this.isCurrentlySpeaking && (Date.now() - this.lastSpokenTimestamp >= 1200)) {
          try {
            this.recognition.start();
          } catch (e) {}
        }
      }, 1200); // 1.2s acoustic silence buffer
    }
  }

  // Primary Neural Speak via ARVIX Voice Engine with fallback to browser SpeechSynthesis
  speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.stopListeningImmediately();

    // Clean markdown, symbols, emojis, and special chars for crystal clear pronunciation
    const cleanText = text
      .replace(/\*\*|__/g, '')
      .replace(/[*#`_~>\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.isCurrentlySpeaking = true;
    this.lastSpokenTimestamp = Date.now();

    // Try high-definition Neural Voice stream from ARVIX Backend
    try {
      const voiceUrl = `http://localhost:8000/api/v1/voice/speak?text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(voiceUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.isCurrentlySpeaking = false;
        this.lastSpokenTimestamp = Date.now();
        this.currentAudio = null;
        if (onEnd) onEnd();
        this.resumeListeningIfContinuous();
      };

      audio.onerror = (err) => {
        console.warn('[JARVIS Voice] Neural audio playback notice, switching to browser TTS:', err);
        this.fallbackBrowserSpeak(cleanText, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[JARVIS Voice] Audio play error:', err);
          this.fallbackBrowserSpeak(cleanText, onEnd);
        });
      }
    } catch (e) {
      this.fallbackBrowserSpeak(cleanText, onEnd);
    }
  }

  private fallbackBrowserSpeak(cleanText: string, onEnd?: () => void) {
    if (!this.synth || this.isMuted) {
      this.isCurrentlySpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    this.synth.resume();
    this.synth.cancel();

    const isBengali = /[\u0980-\u09FF]/.test(cleanText);
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }

    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (isBengali) {
      selectedVoice = this.voices.find(v => 
        (v.lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')) &&
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('bashkar') || !v.name.toLowerCase().includes('female'))
      ) || this.voices.find(v => v.lang.startsWith('bn')) || null;
    } else if (isHindi) {
      selectedVoice = this.voices.find(v => 
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('madhur') || 
        v.name.toLowerCase().includes('hemant')
      ) || null;
    }

    // Default to clean Jarvis Male Voice
    if (!selectedVoice) {
      selectedVoice = this.voices.find(v => 
        v.name.includes('David') || 
        v.name.includes('Daniel') || 
        v.name.includes('George') || 
        v.name.includes('Ryan') ||
        v.name.includes('UK English Male')
      ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0] || null;
    }

    const sentences = cleanText.match(/[^.!?।]+[.!?।]+|[^.!?।]+/g) || [cleanText];
    let currentIndex = 0;
    this.isCurrentlySpeaking = true;

    const speakNextChunk = () => {
      if (!this.synth || currentIndex >= sentences.length || !this.isCurrentlySpeaking) {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd();
        this.resumeListeningIfContinuous();
        return;
      }

      const chunk = sentences[currentIndex].trim();
      currentIndex++;

      if (!chunk) {
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = isBengali ? 'bn-IN' : isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.98;
      utterance.pitch = 0.82; // Deep, authoritative male pitch

      utterance.onend = () => speakNextChunk();
      utterance.onerror = () => speakNextChunk();

      this.synth.resume();
      this.synth.speak(utterance);
    };

    speakNextChunk();
  }

  stop() {
    this.isCurrentlySpeaking = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  private speechTimeout: any = null;
  private accumulatedSpeech: string = '';

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'bn-IN'; // Natural Bengali & mixed English recognition

    this.recognition.onstart = () => {
      this.accumulatedSpeech = '';
      if (this.onListeningStateChange) this.onListeningStateChange(true);
    };

    this.recognition.onresult = (event: any) => {
      // Acoustic echo cancellation: completely ignore mic input if ARVIX is speaking or just finished
      if (this.isCurrentlySpeaking || (Date.now() - this.lastSpokenTimestamp < 600)) {
        return;
      }

      let newFinal = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (newFinal) {
        this.accumulatedSpeech = (this.accumulatedSpeech + ' ' + newFinal).trim();
      }

      const currentSpokenText = (this.accumulatedSpeech + ' ' + interim).trim();
      if (!currentSpokenText) return;

      if (this.speechTimeout) clearTimeout(this.speechTimeout);

      // Super-fast dynamic speech recognition: 650ms if action commands detected, otherwise ample pause
      const lower = currentSpokenText.toLowerCase();
      const isActionCmd = /(solar|soler|cosmos|সোলার|কন্ট্রোল|control|hand|হাত|ক্যামেরা|camera|খোলো|open|play|গান|stop|বন্ধ|আঙুল|finger)/.test(lower);
      const debounceDelay = isActionCmd ? 650 : (currentSpokenText.length < 15 ? 1600 : 1200);

      this.speechTimeout = setTimeout(() => {
        const toSend = (this.accumulatedSpeech.trim() || currentSpokenText).trim();
        if (toSend && this.onSpeechCapturedCallback && !this.isCurrentlySpeaking) {
          console.log('[JARVIS Voice] Final complete sentence dispatched:', toSend);
          this.onSpeechCapturedCallback(toSend);
          this.accumulatedSpeech = '';
        }
      }, debounceDelay);
    };

    this.recognition.onerror = () => {
      if (this.onListeningStateChange) this.onListeningStateChange(false);
    };

    this.recognition.onend = () => {
      if (this.onListeningStateChange) this.onListeningStateChange(false);
      // Restart listening smoothly if in continuous mode and ARVIX is not currently speaking
      if (this.isListeningContinuous && !this.isCurrentlySpeaking && (Date.now() - this.lastSpokenTimestamp >= 600)) {
        setTimeout(() => {
          if (this.isListeningContinuous && !this.isCurrentlySpeaking) {
            try {
              this.recognition.start();
            } catch (e) {}
          }
        }, 300);
      }
    };
  }

  startContinuousListening(onCaptured: (text: string) => void, onStateChange?: (listening: boolean) => void) {
    this.onSpeechCapturedCallback = onCaptured;
    this.onListeningStateChange = onStateChange || null;
    this.isListeningContinuous = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  stopContinuousListening() {
    this.isListeningContinuous = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.onListeningStateChange) this.onListeningStateChange(false);
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }
}

export const jarvisVoice = new JarvisVoiceService();
