import React, { useRef, useEffect } from 'react';

interface ParticleCoreProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
}

export const ParticleCore: React.FC<ParticleCoreProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const numParticles = 850;
    const radius = 135;
    const points: Point3D[] = [];

    // Initialize Fibonacci sphere distribution for uniform 3D sphere points
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseX: x * radius,
        baseY: y * radius,
        baseZ: z * radius
      });
    }

    let angleX = 0.002;
    let angleY = 0.004;
    let waveTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      waveTime += 0.05;

      // Dynamics based on AI state
      let speedMultiplier = 1;
      let expandFactor = 1;
      let coreColor = 'rgba(235, 240, 255, ';

      if (state === 'listening') {
        speedMultiplier = 1.6;
        expandFactor = 1.15 + Math.sin(waveTime * 3) * 0.08;
        coreColor = 'rgba(0, 242, 254, '; // Cyan pulse
      } else if (state === 'thinking') {
        speedMultiplier = 3.5;
        expandFactor = 0.95 + Math.cos(waveTime * 5) * 0.05;
        coreColor = 'rgba(184, 39, 252, '; // Purple acceleration
      } else if (state === 'speaking') {
        speedMultiplier = 2.0;
        expandFactor = 1.08 + Math.sin(waveTime * 4) * 0.12;
        coreColor = 'rgba(79, 172, 254, '; // Blue harmonic
      } else if (state === 'executing') {
        speedMultiplier = 4.0;
        expandFactor = 1.2;
        coreColor = 'rgba(16, 185, 129, '; // Emerald ring
      }

      angleY += 0.003 * speedMultiplier;
      angleX += 0.0015 * speedMultiplier;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Render outer glow ring if executing
      if (state === 'executing') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw particle points projected in 3D perspective
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // Apply pulse expansion
        const curBaseX = pt.baseX * expandFactor;
        const curBaseY = pt.baseY * expandFactor;
        const curBaseZ = pt.baseZ * expandFactor;

        // Rotate around Y
        let x1 = curBaseX * cosY - curBaseZ * sinY;
        let z1 = curBaseZ * cosY + curBaseX * sinY;

        // Rotate around X
        let y1 = curBaseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + curBaseY * sinX;

        // Perspective projection
        const fov = 340;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y1 * scale;

        // Alpha calculation based on depth (z-index)
        const alpha = Math.max(0.1, Math.min(1.0, (z2 + radius) / (2 * radius)));
        const pointSize = Math.max(0.6, scale * 1.3);

        ctx.fillStyle = coreColor + alpha.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  return (
    <div style={{
      position: 'relative',
      width: '380px',
      height: '380px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <canvas
        ref={canvasRef}
        width={380}
        height={380}
        style={{ display: 'block' }}
      />

      {/* Center Holographic Label */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        textTransform: 'uppercase',
        letterSpacing: '3px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.45)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          ARVIX CORE
        </span>
        <span style={{
          fontSize: '9px',
          fontWeight: 600,
          color: state === 'idle' ? 'rgba(255, 255, 255, 0.3)' : '#00f2fe',
          marginTop: '3px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          [{state}]
        </span>
      </div>
    </div>
  );
};
