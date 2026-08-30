import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export default function StarCatcher() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const canvasRef = useRef(null);
  const [starsCaught, setStarsCaught] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let caughtStars = []; // Caught stars saved to form constellations
    let sparkles = [];

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height * 0.7); // Top 70% of sky
        this.radius = Math.random() * 3.5 + 2.5; // Catchable star radius
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        this.pulseAngle = Math.random() * Math.PI;
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.5 + 0.4;
        this.state = 'fadein'; // 'fadein', 'active', 'caught'
      }

      update() {
        if (this.state === 'fadein') {
          this.alpha += 0.01;
          if (this.alpha >= this.targetAlpha) {
            this.alpha = this.targetAlpha;
            this.state = 'active';
          }
        }
        
        this.pulseAngle += this.pulseSpeed;
        this.pulseRadius = this.radius + Math.sin(this.pulseAngle) * 1.2;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Soft outer glow
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.pulseRadius * 4);
        glow.addColorStop(0, 'rgba(255, 250, 205, 0.7)');
        glow.addColorStop(0.3, 'rgba(255, 250, 205, 0.2)');
        glow.addColorStop(1, 'rgba(255, 250, 205, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.pulseRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = '#FFFDE8';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class Sparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#FFFDF0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Populate active catchable stars
    for (let i = 0; i < 8; i++) {
      stars.push(new Star());
    }

    // Background passive tiny stars
    const backgroundStars = [];
    for (let i = 0; i < 40; i++) {
      backgroundStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * 500,
        radius: Math.random() * 1 + 0.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isNight) {
        skyGrad.addColorStop(0, '#060913');
        skyGrad.addColorStop(0.5, '#0B1121');
        skyGrad.addColorStop(1, '#151A2E');
      } else {
        skyGrad.addColorStop(0, '#101F30');
        skyGrad.addColorStop(0.6, '#182C40');
        skyGrad.addColorStop(1, '#28415C');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw passive background stars
      backgroundStars.forEach(bs => {
        ctx.fillStyle = `rgba(255, 255, 255, ${bs.alpha})`;
        ctx.beginPath();
        ctx.arc(bs.x, bs.y, bs.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Constellation Lines between caught stars
      if (caughtStars.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 250, 205, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < caughtStars.length; i++) {
          const s1 = caughtStars[i];
          // Connect to nearby caught stars
          for (let j = i + 1; j < caughtStars.length; j++) {
            const s2 = caughtStars[j];
            const dist = Math.sqrt((s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2);
            if (dist < 180) {
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Caught Stars (dim static glow constellation hubs)
      caughtStars.forEach(cs => {
        ctx.fillStyle = 'rgba(255, 253, 220, 0.4)';
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & Draw Active Stars
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      // Particles
      sparkles.forEach((sp, idx) => {
        sp.update();
        if (sp.alpha <= 0) {
          sparkles.splice(idx, 1);
        } else {
          sp.draw();
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handlePointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined || clientY === undefined) return;

      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      let hitIndex = -1;
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Slightly larger hit box on touch screens
        if (dist <= star.radius * 2.5) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        const caught = stars[hitIndex];
        
        // Spawn Sparkles
        for (let s = 0; s < 12; s++) {
          sparkles.push(new Sparkle(caught.x, caught.y));
        }

        // Add to constellation hubs
        caughtStars.push({ x: caught.x, y: caught.y });
        // Keep constellation buffer clean (max 30 stars)
        if (caughtStars.length > 30) caughtStars.shift();

        // Reset the hit star to a new place
        caught.reset();

        setStarsCaught(prev => prev + 1);
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
      cancelAnimationFrame(animationId);
    };
  }, [isNight]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Caught Stars counter overlay */}
      <div className="text-center pt-4 z-10">
        <p className="text-xs uppercase tracking-widest text-amber-200/60 font-bold">
          Constellation Nodes: {starsCaught}
        </p>
      </div>

      <div className="absolute inset-0 w-full h-full cursor-pointer z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="h-14 pb-5 text-center z-10 pointer-events-none">
        <p className="text-[12px] italic text-amber-100/40">
          Gather falling stars to draw constellations across the night sky...
        </p>
      </div>
    </div>
  );
}
