import React, { useEffect, useRef } from "react";

interface AtmosphericParticlesProps {
  weatherCode?: number;
  isDarkMode: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  angle?: number;
  speed?: number;
  spin?: number;
  pulseSpeed?: number;
  pulsePhase?: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  weatherCode,
  isDarkMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let splashes: Splash[] = [];
    
    // Lightning specific states
    let lightningFlashOpacity = 0;
    let lightningBolts: { x: number; y: number; segments: { x: number; y: number }[] }[] = [];
    let ticksSinceLastStrike = 0;
    let strikeTargetDelay = Math.random() * 300 + 400; // strike every 7-12 seconds on average (60fps)

    // Set canvas dimensions
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Parse weather type based on WMO codes
    // 0: Sunny/Clear
    // 1-3: Cloudy/Partly Cloudy
    // 45, 48: Foggy
    // 51-57: Drizzle
    // 61-67: Rain
    // 71-77: Snow
    // 80-86: Showers
    // 95-99: Thunderstorm
    const getWeatherType = (code?: number) => {
      if (code === undefined) return "clear";
      if (code === 0) return "clear";
      if (code >= 1 && code <= 3) return "cloudy";
      if (code === 45 || code === 48) return "fog";
      if (code >= 51 && code <= 57) return "drizzle";
      if (code >= 61 && code <= 67) return "rain";
      if (code >= 71 && code <= 77) return "snow";
      if (code >= 80 && code <= 86) return "showers";
      if (code >= 95 && code <= 99) return "thunderstorm";
      return "cloudy";
    };

    const weatherType = getWeatherType(weatherCode);

    // Initialize particles based on weather type
    const initParticles = () => {
      particles = [];
      splashes = [];
      lightningBolts = [];
      lightningFlashOpacity = 0;
      ticksSinceLastStrike = 0;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      if (weatherType === "clear") {
        // Floating solar rays/warm orbs
        const count = 15;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 30 + 35, // Large blurry shapes
            opacity: Math.random() * 0.08 + 0.04,
            color: isDarkMode
              ? `rgba(245, 158, 11, ${isDarkMode ? 0.06 : 0.12})` // Amber
              : `rgba(251, 146, 60, 0.15)`, // Orange-yellow
            pulseSpeed: Math.random() * 0.01 + 0.005,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      } else if (weatherType === "cloudy" || weatherType === "fog") {
        // Broad rolling cloud/fog banks
        const count = weatherType === "fog" ? 25 : 12;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() * 0.15 + 0.05) * (weatherType === "fog" ? 0.3 : 0.8), // slow drift
            vy: (Math.random() - 0.5) * 0.04,
            size: Math.random() * 80 + 120, // Huge wisps
            opacity: Math.random() * (weatherType === "fog" ? 0.12 : 0.08) + 0.03,
            color: isDarkMode ? "203, 213, 225" : "241, 245, 249", // Slate/white
          });
        }
      } else if (weatherType === "drizzle") {
        const count = 45;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: -0.5 - Math.random() * 0.5,
            vy: 4 + Math.random() * 2,
            size: Math.random() * 1.5 + 0.8,
            opacity: Math.random() * 0.25 + 0.15,
            color: isDarkMode ? "14, 165, 233" : "56, 189, 248", // Sky blueish
          });
        }
      } else if (weatherType === "rain" || weatherType === "showers") {
        const count = weatherType === "showers" ? 110 : 85;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h - h, // start high
            vx: -1.5 - Math.random() * 1.5,
            vy: 9 + Math.random() * 5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.4 + 0.15,
            color: isDarkMode ? "59, 130, 246" : "37, 99, 235", // Royal blue
          });
        }
      } else if (weatherType === "snow") {
        const count = 65;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.8 + Math.random() * 1.2,
            size: Math.random() * 3 + 1.2,
            opacity: Math.random() * 0.6 + 0.25,
            color: "255, 255, 255",
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.02,
            speed: Math.random() * 0.6 + 0.3,
          });
        }
      } else if (weatherType === "thunderstorm") {
        const count = 120;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h - h,
            vx: -2.5 - Math.random() * 2,
            vy: 12 + Math.random() * 6,
            size: Math.random() * 2.5 + 1,
            opacity: Math.random() * 0.55 + 0.15,
            color: isDarkMode ? "139, 92, 246" : "99, 102, 241", // Violet / purple-indigo theme rain
          });
        }
      }
    };

    initParticles();

    // Generate lightning bolt path geometry
    const createLightningBolt = (w: number, h: number) => {
      const boltsCount = Math.floor(Math.random() * 2) + 1;
      const bolts = [];

      for (let b = 0; b < boltsCount; b++) {
        const startX = Math.random() * (w * 0.7) + w * 0.15;
        const startY = 0;
        const segments = [{ x: startX, y: startY }];
        
        let currX = startX;
        let currY = startY;
        const numSegments = Math.floor(Math.random() * 8) + 12;
        const segHeight = h / numSegments;

        for (let s = 1; s <= numSegments; s++) {
          const deviation = (Math.random() - 0.5) * 65;
          currX += deviation;
          currY += segHeight;
          segments.push({ x: currX, y: currY });

          // Fork occasionally
          if (Math.random() < 0.15 && s < numSegments - 2) {
            let forkX = currX;
            let forkY = currY;
            const forkSegments = [{ x: forkX, y: forkY }];
            for (let f = s + 1; f <= numSegments; f++) {
              forkX += (Math.random() - 0.4) * 45;
              forkY += segHeight * 0.8;
              forkSegments.push({ x: forkX, y: forkY });
            }
            bolts.push({ x: currX, y: currY, segments: forkSegments });
          }
        }
        bolts.push({ x: startX, y: startY, segments });
      }

      return bolts;
    };

    // Main animation tick
    const animate = () => {
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Handle lightning fade
      if (weatherType === "thunderstorm") {
        ticksSinceLastStrike++;
        if (lightningFlashOpacity > 0) {
          lightningFlashOpacity *= 0.88; // fade out fast
          if (lightningFlashOpacity < 0.05) {
            lightningFlashOpacity = 0;
            lightningBolts = [];
          }
        } else if (ticksSinceLastStrike > strikeTargetDelay) {
          // Trigger a beautiful lightning strike!
          lightningFlashOpacity = Math.random() * 0.4 + 0.55;
          lightningBolts = createLightningBolt(w, h);
          ticksSinceLastStrike = 0;
          strikeTargetDelay = Math.random() * 320 + 200; // Reset next strike timer
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Render lightning background flash
      if (lightningFlashOpacity > 0) {
        ctx.fillStyle = isDarkMode 
          ? `rgba(139, 92, 246, ${lightningFlashOpacity * 0.18})` 
          : `rgba(224, 231, 255, ${lightningFlashOpacity * 0.25})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Render Canvas Particles
      particles.forEach((p) => {
        if (weatherType === "clear") {
          // Pulse the solar ray glow
          p.pulsePhase! += p.pulseSpeed!;
          const scale = Math.sin(p.pulsePhase!) * 0.35 + 0.75;
          const currentSize = p.size * scale;
          const currentOpacity = p.opacity * (Math.sin(p.pulsePhase!) * 0.2 + 0.8);

          // Render blur glow radial gradient
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.5, p.color.replace(/[\d.]+\)$/, `${currentOpacity * 0.5})`));
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();

          // Float motion
          p.x += p.vx;
          p.y += p.vy;

          // Wrap boundaries
          if (p.x < -currentSize) p.x = w + currentSize;
          if (p.x > w + currentSize) p.x = -currentSize;
          if (p.y < -currentSize) p.y = h + currentSize;
          if (p.y > h + currentSize) p.y = -currentSize;

        } else if (weatherType === "cloudy" || weatherType === "fog") {
          // Render soft cloud wisps
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          const colorStr = `rgba(${p.color}, ${p.opacity})`;
          grad.addColorStop(0, colorStr);
          grad.addColorStop(0.6, `rgba(${p.color}, ${p.opacity * 0.35})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Horizontal cloud wind movement
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -p.size) p.x = w + p.size;
          if (p.x > w + p.size) p.x = -p.size;
          if (p.y < -p.size) p.y = h + p.size;
          if (p.y > h + p.size) p.y = -p.size;

        } else if (weatherType === "snow") {
          // Drifting soft snow flakes
          p.angle! += p.spin!;
          p.x += Math.sin(p.angle!) * p.speed! + p.vx;
          p.y += p.vy;

          ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (p.y > h + 10) {
            p.y = -10;
            p.x = Math.random() * w;
          }
          if (p.x > w + 10) p.x = -10;
          if (p.x < -10) p.x = w + 10;

        } else {
          // Rain / Showers / Thunderstorms / Drizzle (Line-drawn vertical rain particles)
          p.x += p.vx;
          p.y += p.vy;

          ctx.strokeStyle = p.color.startsWith("rgba") ? p.color : `rgba(${p.color}, ${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          // length scales with velocity
          ctx.lineTo(p.x + p.vx * 0.8, p.y + p.vy * 0.8);
          ctx.stroke();

          // Create a splash circle on landing
          if (p.y > h - 10) {
            if (Math.random() < 0.25) {
              splashes.push({
                x: p.x,
                y: h - Math.random() * 15,
                radius: 1,
                maxRadius: Math.random() * 6 + 4,
                opacity: 0.5,
                speed: Math.random() * 0.25 + 0.15,
              });
            }
            p.y = -20;
            p.x = Math.random() * w;
          }
        }
      });

      // Render rain bottom splashes (ripples)
      splashes.forEach((s, idx) => {
        ctx.strokeStyle = isDarkMode 
          ? `rgba(186, 230, 253, ${s.opacity})` 
          : `rgba(14, 165, 233, ${s.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        // Draw ellipse ripple
        ctx.ellipse(s.x, s.y, s.radius * 1.5, s.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        s.radius += s.speed;
        s.opacity -= 0.02;

        if (s.opacity <= 0) {
          splashes.splice(idx, 1);
        }
      });

      // Render actual lightning bolts onto canvas when flash triggers
      if (lightningFlashOpacity > 0 && lightningBolts.length > 0) {
        lightningBolts.forEach((bolt) => {
          ctx.strokeStyle = "rgba(255, 255, 255, 1)";
          ctx.lineWidth = Math.random() * 2 + 1.5;
          ctx.shadowColor = isDarkMode ? "rgba(139, 92, 246, 0.9)" : "rgba(165, 180, 252, 0.9)";
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
          for (let k = 1; k < bolt.segments.length; k++) {
            ctx.lineTo(bolt.segments[k].x, bolt.segments[k].y);
          }
          ctx.stroke();

          // reset drop shadow settings so standard particles won't blur
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [weatherCode, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none opacity-80"
    />
  );
};
