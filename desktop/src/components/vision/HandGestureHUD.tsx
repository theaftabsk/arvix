import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Hand, 
  MousePointer, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Target, 
  Activity, 
  CheckCircle2, 
  CameraOff,
  Maximize2,
  X,
  Compass,
  ZoomIn,
  ZoomOut,
  Orbit,
  Shield,
  Layers
} from 'lucide-react';
import { apiService } from '../../services/api';
import { jarvisVoice } from '../../services/jarvisVoice';

interface HandGestureHUDProps {
  onStop?: () => void;
  isFloating?: boolean;
  onMaximize?: () => void;
}

export const HandGestureHUD: React.FC<HandGestureHUDProps> = ({ onStop, isFloating = false, onMaximize }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [activeGesture, setActiveGesture] = useState<string>('SEARCHING_HAND');
  const [controlMode, setControlMode] = useState<'mouse' | 'media'>('mouse');
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);

  // Throttles and debounce timers
  const lastCursorSendTime = useRef<number>(0);
  const lastActionTime = useRef<number>(0);
  const pinchHoldStart = useRef<number>(0);
  const isPinching = useRef<boolean>(false);
  const lastPinchActionTime = useRef<number>(0);
  const palmHoldStart = useRef<number>(0);
  const fistHoldStart = useRef<number>(0);
  const oneFingerHoldStart = useRef<number>(0);
  const fourFingerHoldStart = useRef<number>(0);
  const lastGestureState = useRef<string>('');

  // Start Camera Stream
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('[Hand Gesture Camera Error]:', err);
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // MediaPipe Hands Script Loader & Tracking Loop
  useEffect(() => {
    let handsInstance: any = null;
    let cameraInstance: any = null;
    let isCancelled = false;

    const loadMediaPipe = async () => {
      // Load scripts dynamically if not present
      if (!(window as any).Hands) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
          script.crossOrigin = 'anonymous';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (isCancelled) return;

      const HandsClass = (window as any).Hands;
      if (!HandsClass) return;

      handsInstance = new HandsClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.6
      });

      handsInstance.onResults(onHandResults);

      // Start processing frames from video
      const processFrame = async () => {
        if (isCancelled) return;
        if (videoRef.current && videoRef.current.readyState >= 2 && handsInstance) {
          try {
            await handsInstance.send({ image: videoRef.current });
          } catch (e) {}
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    loadMediaPipe();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (handsInstance) handsInstance.close();
    };
  }, [controlMode, sensitivity]);

  // Biometric Landmark Processor & Gesture Classifier
  const onHandResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setIsHandDetected(false);
      setActiveGesture('SEARCHING_HAND');
      palmHoldStart.current = 0;
      fistHoldStart.current = 0;
      oneFingerHoldStart.current = 0;
      fourFingerHoldStart.current = 0;
      lastGestureState.current = '';
      return;
    }

    setIsHandDetected(true);
    const landmarks = results.multiHandLandmarks[0];

    // Draw Cyberpunk Hand Skeleton
    drawHandSkeleton(ctx, landmarks, canvas.width, canvas.height);

    // Key Landmarks:
    // 0: Wrist, 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // Mirror X coordinate for natural interaction
    const normX = 1.0 - indexTip.x;
    const normY = indexTip.y;

    // Euclidean distance helper
    const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // Calculate distance between Thumb Tip & Index Tip (Pinch Metric)
    const pinchDist = dist(thumbTip, indexTip);

    // Precise Finger Extension Metrics:
    const isIndexExtended = dist(indexTip, wrist) > dist(landmarks[6], wrist) * 1.15;
    const isMiddleExtended = dist(middleTip, wrist) > dist(landmarks[10], wrist) * 1.15;
    const isRingExtended = dist(ringTip, wrist) > dist(landmarks[14], wrist) * 1.15;
    const isPinkyExtended = dist(pinkyTip, wrist) > dist(landmarks[18], wrist) * 1.15;
    const isThumbExtended = dist(thumbTip, wrist) > dist(landmarks[2], wrist) * 1.15 && dist(thumbTip, landmarks[5]) > 0.08;

    // Mutually Exclusive Discrete Gestures
    const is5FingersOpen = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbExtended;
    const is4FingersCycle = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended;
    const is1FingerPointer = isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;
    const is2FingersZoomIn = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;
    const is3FingersZoomOut = isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended;

    const now = Date.now();

    // ----------------- GESTURE 1: PINCH (3D ROTATE / DRAG) -----------------
    if (pinchDist < 0.055) {
      palmHoldStart.current = 0;
      fistHoldStart.current = 0;
      oneFingerHoldStart.current = 0;
      fourFingerHoldStart.current = 0;
      setActiveGesture('PINCH-DRAG // 360° ORBIT');
      if (!isPinching.current) {
        pinchHoldStart.current = now;
        isPinching.current = true;
        apiService.sendGestureAction('mouse_down');
      }
      // High-frequency smooth 3D orbit rotation (24ms throttle ~42Hz)
      if (now - lastCursorSendTime.current > 24) {
        lastCursorSendTime.current = now;
        apiService.sendCursorMove(normX * sensitivity, normY * sensitivity);
        setCursorPos({ x: Math.round(normX * 1536), y: Math.round(normY * 960) });
      }
    } else {
      if (isPinching.current) {
        isPinching.current = false;
        apiService.sendGestureAction('mouse_up');
        if (now - pinchHoldStart.current < 260) {
          // Fast tap pinch selects planet
          setClickEffect({ x: normX * canvas.width, y: normY * canvas.height, active: true });
          setTimeout(() => setClickEffect(prev => ({ ...prev, active: false })), 250);
        }
      }

      // ----------------- GESTURE 2: OPEN PALM (5 FINGERS: OPEN SELECTED PLANET DETAILS) -----------------
      if (is5FingersOpen) {
        fistHoldStart.current = 0;
        oneFingerHoldStart.current = 0;
        fourFingerHoldStart.current = 0;
        if (lastGestureState.current !== 'palm') {
          if (!palmHoldStart.current) {
            palmHoldStart.current = now;
            setActiveGesture('5 FINGERS // HOLD (0%)');
          } else {
            const elapsed = now - palmHoldStart.current;
            if (elapsed > 600) {
              lastGestureState.current = 'palm';
              palmHoldStart.current = 0;
              setActiveGesture('5 FINGERS // OPEN PLANET DETAILS');
              console.log('[HandGestureHUD] 5 FINGERS DELIBERATE (600ms) -> Dispatching arvix:gesture_open_planet');
              window.dispatchEvent(new CustomEvent('arvix:gesture_open_planet'));
            } else {
              setActiveGesture(`5 FINGERS // HOLD (${Math.min(100, Math.round((elapsed / 600) * 100))}%)`);
            }
          }
        }
      } 
      // ----------------- GESTURE 2B: 4 FINGERS (CYCLE TARGET PLANET) -----------------
      else if (is4FingersCycle) {
        palmHoldStart.current = 0;
        fistHoldStart.current = 0;
        oneFingerHoldStart.current = 0;
        if (lastGestureState.current !== 'four_fingers') {
          if (!fourFingerHoldStart.current) {
            fourFingerHoldStart.current = now;
            setActiveGesture('4 FINGERS // HOLD (0%)');
          } else {
            const elapsed = now - fourFingerHoldStart.current;
            if (elapsed > 400) {
              lastGestureState.current = 'four_fingers';
              fourFingerHoldStart.current = 0;
              setActiveGesture('4 FINGERS // TARGET SWITCHED');
              console.log('[HandGestureHUD] 4 FINGERS -> Dispatching arvix:gesture_cycle_planet');
              window.dispatchEvent(new CustomEvent('arvix:gesture_cycle_planet'));
            } else {
              setActiveGesture(`4 FINGERS // CYCLE (${Math.min(100, Math.round((elapsed / 400) * 100))}%)`);
            }
          }
        }
      }
      // ----------------- GESTURE 3: 1 FINGER (EXIT TO ALL PLANETS / FULL SOLAR SYSTEM) -----------------
      else if (is1FingerPointer) {
        palmHoldStart.current = 0;
        fistHoldStart.current = 0;
        fourFingerHoldStart.current = 0;
        setActiveGesture('1 FINGER // EXIT TO ALL PLANETS');
        if (lastGestureState.current !== 'one_finger') {
          if (!oneFingerHoldStart.current) {
            oneFingerHoldStart.current = now;
          } else if (now - oneFingerHoldStart.current > 350) {
            lastGestureState.current = 'one_finger';
            oneFingerHoldStart.current = 0;
            console.log('[HandGestureHUD] 1 FINGER -> Dispatching arvix:gesture_exit_to_solar_system');
            window.dispatchEvent(new CustomEvent('arvix:gesture_exit_to_solar_system'));
          }
        }
        if (now - lastCursorSendTime.current > 24) {
          lastCursorSendTime.current = now;
          apiService.sendCursorMove(normX * sensitivity, normY * sensitivity);
          setCursorPos({ x: Math.round(normX * 1536), y: Math.round(normY * 960) });
        }
      }
      // ----------------- GESTURE 4: 2 FINGERS (ZOOM IN) -----------------
      else if (is2FingersZoomIn) {
        palmHoldStart.current = 0;
        fistHoldStart.current = 0;
        oneFingerHoldStart.current = 0;
        fourFingerHoldStart.current = 0;
        if (lastGestureState.current === 'palm' || lastGestureState.current === 'one_finger' || lastGestureState.current === 'four_fingers') {
          lastGestureState.current = '';
        }
        setActiveGesture('2 FINGERS // ZOOM IN');
        if (now - lastActionTime.current > 75) {
          lastActionTime.current = now;
          apiService.sendGestureAction('scroll_up');
        }
        if (now - lastCursorSendTime.current > 30) {
          lastCursorSendTime.current = now;
          apiService.sendCursorMove(normX * sensitivity, normY * sensitivity);
          setCursorPos({ x: Math.round(normX * 1536), y: Math.round(normY * 960) });
        }
      }
      // ----------------- GESTURE 5: 3 FINGERS (ZOOM OUT) -----------------
      else if (is3FingersZoomOut) {
        palmHoldStart.current = 0;
        fistHoldStart.current = 0;
        oneFingerHoldStart.current = 0;
        fourFingerHoldStart.current = 0;
        if (lastGestureState.current === 'palm' || lastGestureState.current === 'one_finger' || lastGestureState.current === 'four_fingers') {
          lastGestureState.current = '';
        }
        setActiveGesture('3 FINGERS // ZOOM OUT');
        if (now - lastActionTime.current > 75) {
          lastActionTime.current = now;
          apiService.sendGestureAction('scroll_down');
        }
        if (now - lastCursorSendTime.current > 30) {
          lastCursorSendTime.current = now;
          apiService.sendCursorMove(normX * sensitivity, normY * sensitivity);
          setCursorPos({ x: Math.round(normX * 1536), y: Math.round(normY * 960) });
        }
      }
      // ----------------- NEUTRAL / TRANSITION STATE -----------------
      else {
        palmHoldStart.current = 0;
        fistHoldStart.current = 0;
        oneFingerHoldStart.current = 0;
        fourFingerHoldStart.current = 0;
        if (lastGestureState.current === 'palm' || lastGestureState.current === 'one_finger' || lastGestureState.current === 'four_fingers') {
          lastGestureState.current = '';
        }
      }
    }
  };

  // Draw Glowing Cybernetic Skeleton
  const drawHandSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number) => {
    // Hand connection topology
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                               // Palm Base
    ];

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;

    // Draw Skeleton Lines
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo((1.0 - p1.x) * w, p1.y * h);
      ctx.lineTo((1.0 - p2.x) * w, p2.y * h);
      ctx.stroke();
    });

    // Draw Fingertip Biometric Glowing Dots
    [4, 8, 12, 16, 20].forEach((idx) => {
      const pt = landmarks[idx];
      const x = (1.0 - pt.x) * w;
      const y = pt.y * h;

      ctx.beginPath();
      ctx.arc(x, y, idx === 8 ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = idx === 8 ? '#10B981' : '#00F0FF';
      ctx.shadowColor = idx === 8 ? '#10B981' : '#00F0FF';
      ctx.shadowBlur = 14;
      ctx.fill();

      // Outer targeting ring around index fingertip
      if (idx === 8) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    ctx.restore();
  };

  if (isFloating) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '320px',
        background: 'rgba(5, 10, 20, 0.95)',
        border: '1.5px solid #00F0FF',
        borderRadius: '12px',
        boxShadow: '0 0 35px rgba(0, 240, 255, 0.35)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        {/* Floating Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'rgba(7, 14, 26, 0.9)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isHandDetected ? '#10B981' : '#EF4444',
              boxShadow: isHandDetected ? '0 0 8px #10B981' : '0 0 8px #EF4444'
            }} />
            <span style={{ color: '#00F0FF', fontWeight: 700, fontSize: '11px' }}>
              {isHandDetected ? '✋ AIR CONTROL ACTIVE' : 'SEARCHING HAND...'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onMaximize && (
              <button
                onClick={onMaximize}
                title="Open Full Vision HUD"
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00F0FF',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px'
                }}
              >
                <Maximize2 size={12} />
              </button>
            )}
            {onStop && (
              <button
                onClick={onStop}
                title="Stop Air Control"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '10px'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Video & Skeleton Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          background: '#020408',
          overflow: 'hidden'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)'
            }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />
          {clickEffect.active && (
            <div style={{
              position: 'absolute',
              left: `${clickEffect.x * (320 / 640)}px`,
              top: `${clickEffect.y * (200 / 480)}px`,
              width: '30px',
              height: '30px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '2px solid #10B981',
              boxShadow: '0 0 16px #10B981',
              pointerEvents: 'none'
            }} />
          )}
        </div>

        {/* Floating Status Footer */}
        <div style={{
          padding: '8px 12px',
          background: 'rgba(3, 7, 18, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px'
        }}>
          <div style={{ color: '#10B981', fontWeight: 800 }}>
            {activeGesture}
          </div>
          <div style={{ color: '#00F0FF', fontSize: '10.5px' }}>
            {cursorPos.x}, {cursorPos.y}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '24px',
      padding: '20px 28px',
      background: '#030712',
      color: '#E2E8F0',
      fontFamily: 'JetBrains Mono, monospace',
      overflowY: 'auto',
      position: 'relative'
    }}>
      {/* Background Matrix Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* ================= LEFT: CAMERA & BIOMETRIC MESH ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 1 }}>
        {/* Header HUD */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 18px',
          background: 'rgba(7, 14, 26, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isHandDetected ? '#10B981' : '#EF4444',
              boxShadow: isHandDetected ? '0 0 10px #10B981' : '0 0 10px #EF4444'
            }} />
            <span style={{ color: '#00F0FF', fontWeight: 700 }}>
              {isHandDetected ? 'BIOMETRIC HAND MESH [LOCKED]' : 'SEARCHING FOR HAND...'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
            <span>LATENCY: 4ms</span>
            <span style={{ color: '#10B981' }}>MODE: {controlMode.toUpperCase()}</span>
          </div>
        </div>

        {/* Video & Tracking Canvas */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          background: '#020408',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Real-time Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror preview
            }}
          />

          {/* Biometric Skeleton Overlay Canvas */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />

          {/* Click Spark Effect Overlay */}
          {clickEffect.active && (
            <div style={{
              position: 'absolute',
              left: `${clickEffect.x}px`,
              top: `${clickEffect.y}px`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '2px solid #10B981',
              boxShadow: '0 0 25px #10B981',
              pointerEvents: 'none',
              animation: 'ping 0.3s cubic-bezier(0, 0, 0.2, 1) forwards'
            }} />
          )}

          {/* Hand Targeting Reticle Center Indicator */}
          {!isHandDetected && (
            <div style={{
              position: 'absolute',
              padding: '12px 24px',
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '8px',
              color: '#00F0FF',
              fontSize: '13px',
              textAlign: 'center',
              backdropFilter: 'blur(6px)'
            }}>
              <Hand size={28} style={{ margin: '0 auto 8px auto', color: '#00F0FF' }} />
              ক্যামেরার সামনে আপনার হাত তুলুন
            </div>
          )}
        </div>

        {/* Live Active Gesture Status Card */}
        <div style={{
          padding: '14px 18px',
          background: 'rgba(7, 14, 26, 0.85)',
          borderLeft: '4px solid #10B981',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>ACTIVE GESTURE</div>
            <div style={{ fontSize: '15px', color: '#10B981', fontWeight: 800 }}>
              {activeGesture}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>CURSOR POS</div>
            <div style={{ fontSize: '13px', color: '#00F0FF', fontWeight: 600 }}>
              X: {cursorPos.x}px | Y: {cursorPos.y}px
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: GESTURE MATRIX & CONTROLS ================= */}
      <div style={{
        background: 'rgba(7, 14, 26, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 1,
        height: '100%',
        overflowY: 'auto'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#00F0FF', letterSpacing: '1px' }}>FINGERTIP TELEMETRY</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>AIR GESTURE GUIDE</div>
          </div>
          <div style={{
            padding: '3px 10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#10B981',
            fontWeight: 700
          }}>
            ● ZERO LATENCY LOCAL
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '8px'
        }}>
          <button
            onClick={() => setControlMode('mouse')}
            style={{
              flex: 1,
              padding: '8px',
              background: controlMode === 'mouse' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              border: controlMode === 'mouse' ? '1px solid #00F0FF' : 'none',
              color: controlMode === 'mouse' ? '#00F0FF' : 'rgba(255, 255, 255, 0.6)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <MousePointer size={14} />
            MOUSE CONTROL MODE
          </button>

          <button
            onClick={() => setControlMode('media')}
            style={{
              flex: 1,
              padding: '8px',
              background: controlMode === 'media' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              border: controlMode === 'media' ? '1px solid #00F0FF' : 'none',
              color: controlMode === 'media' ? '#00F0FF' : 'rgba(255, 255, 255, 0.6)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Volume2 size={14} />
            MEDIA GESTURE MODE
          </button>
        </div>

        {/* Gesture Cheat-Sheet Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>SUPPORTED GESTURES & ACTIONS</div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <Target size={15} color="#00F0FF" />
              <span>1 FINGER UP</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#00F0FF', fontWeight: 700 }}>EXIT TO FULL SOLAR SYSTEM</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <Compass size={15} color="#10B981" />
              <span>INDEX + THUMB PINCH</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 600 }}>360° ORBITAL DRAG & CLICK</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <ZoomIn size={15} color="#00F0FF" />
              <span>2 FINGERS UP</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#00F0FF', fontWeight: 700 }}>CONTINUOUS ZOOM IN</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <ZoomOut size={15} color="#A855F7" />
              <span>3 FINGERS UP</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#A855F7', fontWeight: 700 }}>CONTINUOUS ZOOM OUT</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <Layers size={15} color="#38BDF8" />
              <span>4 FINGERS UP</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#38BDF8', fontWeight: 700 }}>CYCLE TARGET PLANET</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <Hand size={15} color="#FBBF24" />
              <span>OPEN PALM (5 FINGERS)</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#FBBF24', fontWeight: 700 }}>OPEN PLANET DETAILS & INTEL</span>
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#FFFFFF' }}>
              <Shield size={15} color="#EF4444" />
              <span>CLOSED FIST</span>
            </div>
            <span style={{ fontSize: '11.5px', color: '#EF4444', fontWeight: 700 }}>MOTION BRAKE / HOLD</span>
          </div>
        </div>

        {/* Sensitivity Tuning Slider */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#00F0FF' }}>
            <span>CURSOR SENSITIVITY</span>
            <span>{sensitivity}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="2.2"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#00F0FF', cursor: 'pointer' }}
          />
        </div>

        {/* Stop Air Control Button */}
        <button
          onClick={onStop}
          style={{
            marginTop: 'auto',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#EF4444',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <CameraOff size={15} />
          STOP AIR CONTROL
        </button>

        {/* Fail-safe Protection Notice */}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.4)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={12} style={{ color: '#10B981' }} />
          <span>FAIL-SAFE ENGAGED: AUTO-PAUSES WHEN HAND LEAVES FRAME</span>
        </div>
      </div>
    </div>
  );
};
