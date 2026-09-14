import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Globe2, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  Hand, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Target, 
  Play, 
  Volume2,
  X,
  Activity,
  Layers
} from 'lucide-react';
import { apiService } from '../../services/api';
import { jarvisVoice } from '../../services/jarvisVoice';

interface PlanetData {
  id: string;
  name: string;
  bengaliName: string;
  classification: string;
  color: string;
  distanceAU: string;
  diameterKm: string;
  temperature: string;
  orbitalPeriod: string;
  gravity: string;
  descriptionEng: string;
  bengaliSummary: string;
}

const CELESTIAL_BODIES: PlanetData[] = [
  {
    id: 'sun',
    name: 'SOL (THE SUN)',
    bengaliName: 'সূর্য',
    classification: 'Yellow Dwarf Star (G2V)',
    color: '#FBBF24',
    distanceAU: '0.00 AU',
    diameterKm: '1,392,700 km',
    temperature: '5,500°C (Surface) / 15,000,000°C (Core)',
    orbitalPeriod: '230 Million Yrs',
    gravity: '274.0 m/s² (28G)',
    descriptionEng: 'The central gravitational anchor of our solar system. A massive sphere of incandescent plasma powered by thermonuclear fusion, containing 99.86% of the solar system total mass.',
    bengaliSummary: 'স্যার, এটি আমাদের সৌরজগতের কেন্দ্রবিন্দু সূর্য। এটি একটি উজ্জ্বল নক্ষত্র, যার শক্তিশালী মাধ্যাকর্ষণে সমস্ত গ্রহ ঘুরছে।'
  },
  {
    id: 'mercury',
    name: 'MERCURY',
    bengaliName: 'বুধ গ্রহ',
    classification: 'Terrestrial Planet',
    color: '#94A3B8',
    distanceAU: '0.39 AU',
    diameterKm: '4,879 km',
    temperature: '-180°C to 430°C',
    orbitalPeriod: '87.97 Days',
    gravity: '3.7 m/s² (0.38G)',
    descriptionEng: 'The smallest and innermost planet in the Solar System. Heavily cratered with extreme thermal fluctuations and no substantial atmosphere.',
    bengaliSummary: 'স্যার, এটি বুধ গ্রহ। সৌরজগতের সবচেয়ে ছোট ও সূর্যের সবচেয়ে কাছের গ্রহ, যেখানে কোনো স্থায়ী বায়ুমণ্ডল নেই।'
  },
  {
    id: 'venus',
    name: 'VENUS',
    bengaliName: 'শুক্র গ্রহ',
    classification: 'Super-Greenhouse Planet',
    color: '#F59E0B',
    distanceAU: '0.72 AU',
    diameterKm: '12,104 km',
    temperature: '464°C Surface Mean',
    orbitalPeriod: '224.7 Days',
    gravity: '8.87 m/s² (0.90G)',
    descriptionEng: 'Possesses a dense carbon dioxide atmosphere with sulfuric acid clouds, generating a runaway greenhouse effect making it the hottest planet.',
    bengaliSummary: 'স্যার, এটি শুক্র গ্রহ। এর অতিঘন বিষাক্ত বায়ুমণ্ডলের কারণে এটি সৌরজগতের সবচেয়ে উত্তপ্ত গ্রহ।'
  },
  {
    id: 'earth',
    name: 'EARTH',
    bengaliName: 'পৃথিবী',
    classification: 'Terrestrial Biosphere Harbor',
    color: '#00F0FF',
    distanceAU: '1.00 AU',
    diameterKm: '12,742 km',
    temperature: '15°C Mean Global',
    orbitalPeriod: '365.25 Days',
    gravity: '9.807 m/s² (1G)',
    descriptionEng: 'The cradle of humanity and the only known planetary body harboring life. Shielded by a strong magnetosphere, dynamic nitrogen-oxygen atmosphere, and liquid oceans covering 71% of its surface.',
    bengaliSummary: 'স্যার, এটি আমাদের মাতৃগ্রহ পৃথিবী। সৌরজগতের একমাত্র মহাজাগতিক আশ্রয়স্থল যেখানে জীবনের অস্তিত্ব ও সুবিশাল তরল মহাসমুদ্র রয়েছে।'
  },
  {
    id: 'mars',
    name: 'MARS',
    bengaliName: 'মঙ্গল গ্রহ',
    classification: 'Red Terrestrial Planet',
    color: '#EF4444',
    distanceAU: '1.52 AU',
    diameterKm: '6,779 km',
    temperature: '-63°C Mean Global',
    orbitalPeriod: '687 Days',
    gravity: '3.721 m/s² (0.38G)',
    descriptionEng: 'Iron oxide rich surface giving it a distinct red coloration. Home to Olympus Mons, the largest volcano in the solar system, and Valles Marineris canyon.',
    bengaliSummary: 'স্যার, এটি লাল গ্রহ মঙ্গল। আয়রন অক্সাইডের কারণে এর মাটি লালচে। এখানে রয়েছে সৌরজগতের বৃহত্তম আগ্নেয়গিরি অলিম্পাস মন্স।'
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    bengaliName: 'বৃহস্পতি গ্রহ',
    classification: 'Colossal Gas Giant',
    color: '#F97316',
    distanceAU: '5.20 AU',
    diameterKm: '139,820 km',
    temperature: '-110°C Cloud Tops',
    orbitalPeriod: '11.86 Yrs',
    gravity: '24.79 m/s² (2.53G)',
    descriptionEng: 'The largest planet in the solar system, composed predominantly of hydrogen and helium. Featuring the Great Red Spot storm and over 90 confirmed moons.',
    bengaliSummary: 'স্যার, এটি বৃহস্পতি গ্রহ। সৌরজগতের সর্ববৃহৎ গ্যাসীয় গ্রহ, যার বিখ্যাত গ্রেট রেড স্পট শত শত বছর ধরে চলা এক সুবিশাল ঝড়।'
  },
  {
    id: 'saturn',
    name: 'SATURN',
    bengaliName: 'শনি গ্রহ',
    classification: 'Ringed Gas Giant',
    color: '#EAB308',
    distanceAU: '9.58 AU',
    diameterKm: '116,460 km',
    temperature: '-140°C Cloud Tops',
    orbitalPeriod: '29.45 Yrs',
    gravity: '10.44 m/s² (1.07G)',
    descriptionEng: 'Renowned for its expansive and intricate planetary ring system composed primarily of water ice particles with traces of rock and dust.',
    bengaliSummary: 'স্যার, এটি শনি গ্রহ। বরফ ও পাথরের তৈরি অপরূপ বলয়ের জন্য এটি বিশেষভাবে পরিচিত।'
  },
  {
    id: 'uranus',
    name: 'URANUS',
    bengaliName: 'ইউরেনাস গ্রহ',
    classification: 'Ice Giant',
    color: '#06B6D4',
    distanceAU: '19.22 AU',
    diameterKm: '50,724 km',
    temperature: '-195°C Cloud Tops',
    orbitalPeriod: '84.02 Yrs',
    gravity: '8.69 m/s² (0.89G)',
    descriptionEng: 'Unique axial tilt of 97.77 degrees, rotating virtually on its side. Atmosphere enriched with methane giving it a cyan-blue tint.',
    bengaliSummary: 'স্যার, এটি বরফ দানব ইউরেনাস। এটি নিজের অক্ষের উপর প্রায় ৯৮ ডিগ্রি হেলে ঘোরে এবং এর রঙ সুন্দর নীলচে।'
  },
  {
    id: 'neptune',
    name: 'NEPTUNE',
    bengaliName: 'নেপচুন গ্রহ',
    classification: 'Dynamic Ice Giant',
    color: '#3B82F6',
    distanceAU: '30.05 AU',
    diameterKm: '49,244 km',
    temperature: '-201°C Cloud Tops',
    orbitalPeriod: '164.8 Yrs',
    gravity: '11.15 m/s² (1.14G)',
    descriptionEng: 'The outermost major planet, harboring supersonic planetary winds reaching up to 2,100 km/h with deep azure methane clouds.',
    bengaliSummary: 'স্যার, এটি নেপচুন গ্রহ। সৌরজগতের সর্বদূরবর্তী গ্রহ, যেখানে প্রচণ্ড গতিতে শীতল ঝড় বয়ে চলে।'
  },
  {
    id: 'pluto',
    name: 'PLUTO',
    bengaliName: 'প্লুটো',
    classification: 'Kuiper Belt Dwarf Planet',
    color: '#C084FC',
    distanceAU: '39.48 AU',
    diameterKm: '2,376 km',
    temperature: '-229°C Mean',
    orbitalPeriod: '248 Yrs',
    gravity: '0.62 m/s² (0.06G)',
    descriptionEng: 'Dwarf planet situated in the Kuiper Belt with a complex surface featuring nitrogen-ice plains and the heart-shaped Tombaugh Regio.',
    bengaliSummary: 'স্যার, এটি বামন গ্রহ প্লুটো। এর বুকে রয়েছে বরফের সুবিশাল সমভূমি এবং বিখ্যাত হৃদয় আকৃতির অঞ্চল।'
  }
];

interface SolarSystemViewProps {
  isAirControlActive: boolean;
  onToggleAirControl: () => void;
  onSpeak?: (text: string) => void;
}

export const SolarSystemView: React.FC<SolarSystemViewProps> = ({
  isAirControlActive,
  onToggleAirControl,
  onSpeak
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const isReadyForGestures = useRef<boolean>(false);

  const selectedPlanet = CELESTIAL_BODIES.find(p => p.id === selectedPlanetId) || CELESTIAL_BODIES[3];

  // Lock gesture triggers during initial 3D load
  useEffect(() => {
    isReadyForGestures.current = false;
    const unlockTimer = setTimeout(() => {
      isReadyForGestures.current = true;
      console.log('[SolarSystem] 3D simulation loaded. Air gestures ready.');
    }, 5500);

    return () => clearTimeout(unlockTimer);
  }, [iframeKey]);

  // Reliable Auto-Start: Trigger click sequence to start 3D simulation automatically as soon as ready
  useEffect(() => {
    // Attempt 1: Early auto-click when WebGL container renders
    const timer1 = setTimeout(() => {
      console.log('[SolarSystem] Auto-clicking START button at 2.5s...');
      apiService.sendGestureAction('start_solar', { x: 0.50, y: 0.620 });
    }, 2500);

    // Attempt 2: Primary auto-click (typical button display time)
    const timer2 = setTimeout(() => {
      console.log('[SolarSystem] Auto-clicking START button at 4.0s...');
      apiService.sendGestureAction('start_solar', { x: 0.50, y: 0.620 });
    }, 4000);

    // Attempt 3: Verification auto-click for slower network loads
    const timer3 = setTimeout(() => {
      console.log('[SolarSystem] Auto-clicking START button verification at 5.5s...');
      apiService.sendGestureAction('start_solar', { x: 0.50, y: 0.620 });
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [iframeKey]);

  // Voice narration in Bengali with JARVIS voice - strictly cancels any prior voice so no overlap occurs
  const speakPlanetBengali = useCallback((planet: PlanetData) => {
    // 1. Instantly stop any previous speech
    jarvisVoice.stop();
    if (!onSpeak) return;
    onSpeak(planet.bengaliSummary);
  }, [onSpeak]);

  // Selecting a planet NEVER speaks automatically.
  // Speech is strictly reserved for when the user deliberately executes the 5-finger gesture or clicks REPLAY.
  const handleSelectPlanet = useCallback((planetId: string) => {
    setSelectedPlanetId(planetId);
  }, []);

  const handleCycleNextPlanet = useCallback(() => {
    const currentIndex = selectedPlanetId ? CELESTIAL_BODIES.findIndex(p => p.id === selectedPlanetId) : 3;
    const nextIndex = (currentIndex + 1) % CELESTIAL_BODIES.length;
    const nextPlanet = CELESTIAL_BODIES[nextIndex];
    setSelectedPlanetId(nextPlanet.id);
  }, [selectedPlanetId]);

  // Listen to gestures:
  // 5-fingers (Open details of selected planet AND speak audio)
  // 1-finger (STOP all speech, close details, exit to full solar system)
  // 4-fingers (Cycle to next planet silently)
  useEffect(() => {
    const handleOpenActivePlanet = () => {
      if (!isReadyForGestures.current) {
        console.log('[SolarSystem] 3D scene still loading; ignoring gesture.');
        return;
      }
      // 1. Immediately stop any active speech
      jarvisVoice.stop();

      const targetId = selectedPlanetId || 'earth';
      setSelectedPlanetId(targetId);
      setIsInfoModalOpen(true);
      const targetPlanet = CELESTIAL_BODIES.find(p => p.id === targetId) || CELESTIAL_BODIES[3];
      if (targetPlanet) {
        console.log(`[SolarSystem] 5 fingers detected: Opening ${targetPlanet.name} details & playing audio`);
        speakPlanetBengali(targetPlanet);
      }
    };

    const handleExitToSolarSystem = () => {
      console.log('[SolarSystem] 1 finger detected: Stopping all speech and exiting to full Solar System...');
      // 1. Immediately stop all voice / audio
      jarvisVoice.stop();
      // 2. Close info modal
      setIsInfoModalOpen(false);
      // 3. Send exit click to Solar System Scope
      apiService.sendGestureAction('exit_to_solar', { x: 0.23, y: 0.62 });
      // Strictly NO speech!
    };

    const handleExternalSelectPlanet = (e: any) => {
      if (e.detail?.planet) {
        console.log(`[SolarSystem] External select planet: ${e.detail.planet}`);
        setSelectedPlanetId(e.detail.planet);
        if (e.detail.openModal) {
          setIsInfoModalOpen(true);
        }
      }
    };

    window.addEventListener('arvix:gesture_open_planet', handleOpenActivePlanet);
    window.addEventListener('arvix:gesture_exit_to_solar_system', handleExitToSolarSystem);
    window.addEventListener('arvix:gesture_cycle_planet', handleCycleNextPlanet);
    window.addEventListener('arvix:select_planet', handleExternalSelectPlanet);

    return () => {
      window.removeEventListener('arvix:gesture_open_planet', handleOpenActivePlanet);
      window.removeEventListener('arvix:gesture_exit_to_solar_system', handleExitToSolarSystem);
      window.removeEventListener('arvix:gesture_cycle_planet', handleCycleNextPlanet);
      window.removeEventListener('arvix:select_planet', handleExternalSelectPlanet);
    };
  }, [selectedPlanetId, speakPlanetBengali, handleCycleNextPlanet]);

  const handleReload = () => {
    jarvisVoice.stop();
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleManualAutoStart = () => {
    console.log('[SolarSystem] Manual AUTO START 3D clicked');
    apiService.sendGestureAction('start_solar', { x: 0.50, y: 0.620 });
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#010306',
        color: '#E2E8F0',
        fontFamily: 'JetBrains Mono, monospace',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top Cybernetic Command Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 20px',
        background: 'rgba(5, 10, 20, 0.95)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        zIndex: 20
      }}>
        {/* Left: Engine Identifier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid #00F0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00F0FF',
            boxShadow: '0 0 14px rgba(0, 240, 255, 0.3)'
          }}>
            <Globe2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', color: '#FFFFFF' }}>
              ARVIX <span style={{ color: '#00F0FF' }}>// 3D COSMOS ORBITAL SIMULATION</span>
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
              HELIOCENTRIC REAL-TIME ASTROPHYSICS ENGINE
            </div>
          </div>
        </div>

        {/* Center: Live Status Badges */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            padding: '4px 10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10B981',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#10B981',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            WEBGL 3D ONLINE
          </div>

          <div style={{
            padding: '4px 10px',
            background: isAirControlActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: isAirControlActive ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            fontSize: '11px',
            color: isAirControlActive ? '#00F0FF' : 'rgba(255, 255, 255, 0.5)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Hand size={12} />
            {isAirControlActive ? 'AIR GESTURE: LINKED' : 'AIR GESTURE: STANDBY'}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleManualAutoStart}
            title="Click START button to enter 3D simulation"
            style={{
              padding: '6px 12px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={12} fill="#00F0FF" />
            AUTO START 3D
          </button>

          <button
            onClick={onToggleAirControl}
            style={{
              padding: '6px 12px',
              background: isAirControlActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: isAirControlActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)',
              color: isAirControlActive ? '#10B981' : '#E2E8F0',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Hand size={13} />
            {isAirControlActive ? 'AIR CONTROL [ACTIVE]' : 'START AIR CONTROL'}
          </button>

          <button
            onClick={handleReload}
            title="Reload 3D Cosmos Engine"
            style={{
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCw size={13} />
          </button>

          <button
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            style={{
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Main 3D Cosmos Canvas */}
      <div style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#000000',
        overflow: 'hidden'
      }}>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src="https://www.solarsystemscope.com/iframe"
          title="ARVIX 3D Solar System Scope"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          allow="fullscreen; accelerometer; gyroscope"
        />

        {/* Holographic Cybernetic Celestial Intel Card (Opens ONLY on 5 Fingers) */}
        {isInfoModalOpen && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            width: '370px',
            maxWidth: 'calc(100% - 40px)',
            background: 'rgba(5, 12, 26, 0.95)',
            border: `1.5px solid ${selectedPlanet.color}`,
            borderRadius: '12px',
            boxShadow: `0 0 35px ${selectedPlanet.color}35, 0 10px 40px rgba(0,0,0,0.8)`,
            backdropFilter: 'blur(16px)',
            padding: '16px 18px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Header: Identity & Dismiss */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${selectedPlanet.color}20`,
                  border: `1.5px solid ${selectedPlanet.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedPlanet.color,
                  boxShadow: `0 0 12px ${selectedPlanet.color}50`
                }}>
                  <Globe2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                    {selectedPlanet.name}
                  </div>
                  <div style={{ fontSize: '10px', color: selectedPlanet.color, fontWeight: 700, letterSpacing: '0.5px' }}>
                    {selectedPlanet.classification.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  jarvisVoice.stop();
                  setIsInfoModalOpen(false);
                }}
                title="Dismiss Intel Card"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '4px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Switch Planet Strip Inside Modal */}
            <div style={{
              display: 'flex',
              gap: '5px',
              overflowX: 'auto',
              padding: '4px 0',
              scrollbarWidth: 'none'
            }}>
              {CELESTIAL_BODIES.map((p) => {
                const isP = p.id === selectedPlanetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlanet(p.id)}
                    style={{
                      padding: '3px 8px',
                      background: isP ? `${p.color}35` : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isP ? p.color : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '4px',
                      color: isP ? '#FFF' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: '9.5px',
                      fontWeight: isP ? 800 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isP ? `0 0 8px ${p.color}40` : 'none'
                    }}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Live Audio Intel Status Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#00F0FF',
              fontWeight: 700
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} />
                <span>ARVIX AUDIO INTEL TRANSMITTING</span>
              </div>
              <span style={{ color: selectedPlanet.color }}>{selectedPlanet.bengaliName}</span>
            </div>

            {/* Astrophysical Telemetry Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>DIAMETER</div>
                <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
                  {selectedPlanet.diameterKm}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>TEMPERATURE</div>
                <div style={{ fontSize: '11px', color: selectedPlanet.color, fontWeight: 800, marginTop: '2px' }}>
                  {selectedPlanet.temperature}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>ORBITAL DISTANCE</div>
                <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
                  {selectedPlanet.distanceAU}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>SURFACE GRAVITY</div>
                <div style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 800, marginTop: '2px' }}>
                  {selectedPlanet.gravity}
                </div>
              </div>
            </div>

            {/* Scientific Mission Dossier */}
            <div style={{
              fontSize: '11px',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.82)',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px 12px',
              borderRadius: '6px',
              borderLeft: `3px solid ${selectedPlanet.color}`
            }}>
              {selectedPlanet.descriptionEng}
            </div>

            {/* Bottom Controls */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button
                onClick={() => speakPlanetBengali(selectedPlanet)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  background: `${selectedPlanet.color}22`,
                  border: `1px solid ${selectedPlanet.color}`,
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Volume2 size={13} color={selectedPlanet.color} />
                <span>REPLAY BENGALI BRIEFING</span>
              </button>

              <button
                onClick={() => {
                  jarvisVoice.stop();
                  setIsInfoModalOpen(false);
                }}
                style={{
                  padding: '7px 12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* Floating Holographic Cybernetic Gesture Instruction Dock */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '20px',
          padding: '8px 18px',
          background: 'rgba(5, 10, 22, 0.92)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '8px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.85)',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF', fontWeight: 800 }}>
            <Hand size={13} />
            <span>AIR 3D CONTROLS:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
            <Target size={12} color="#00F0FF" />
            <span style={{ fontWeight: 700 }}>1 FINGER: STOP & EXIT TO SOLAR SYSTEM</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
            <Compass size={12} />
            <span style={{ fontWeight: 600 }}>PINCH & DRAG: 360° ORBIT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
            <ZoomIn size={12} />
            <span style={{ fontWeight: 700 }}>2 FINGERS: ZOOM IN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C084FC' }}>
            <ZoomOut size={12} />
            <span style={{ fontWeight: 700 }}>3 FINGERS: ZOOM OUT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8' }}>
            <Layers size={12} />
            <span style={{ fontWeight: 700 }}>4 FINGERS: CYCLE PLANET</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24' }}>
            <Hand size={12} />
            <span style={{ fontWeight: 800 }}>5 FINGERS: HEAR PLANET BRIEFING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
