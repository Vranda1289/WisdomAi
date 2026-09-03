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
    let isRunning = true;

    let stars = [];
    let caughtStars = []; // Caught stars forming persistent constellation hubs
    let sparkles = [];
    let shootingStar = null;
    let shootingStarTimer = 0;

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Star {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = initial 
          ? Math.random() * (canvas.height * 0.7) + 20 
          : -15;
        this.baseRadius = Math.random() * 3 + 2.5; // 2.5 to 5.5
        this.speedY = Math.random() * 0.35 + 0.15; // Gentle slow float down
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.pulseSpeed = Math.random() * 0.04 + 0.02;
        this.pulseAngle = Math.random() * Math.PI * 2;
        this.alpha = initial ? Math.random() * 0.5 + 0.4 : 0;
        this.targetAlpha = Math.random() * 0.4 + 0.6;
        this.trail = [];
      }

      update() {
        if (this.alpha < this.targetAlpha) {
          this.alpha += 0.015;
        }

        this.y += this.speedY;
        this.x += this.speedX;
        this.pulseAngle += this.pulseSpeed;
        this.currentRadius = this.baseRadius + Math.sin(this.pulseAngle) * 1;

        // Add to gentle trail
        if (Math.random() > 0.4) {
          this.trail.push({ x: this.x, y: this.y, alpha: 0.5, radius: this.currentRadius * 0.4 });
          if (this.trail.length > 6) this.trail.shift();
        }

        // Decay trail
        this.trail.forEach(t => { t.alpha *= 0.88; });

        if (this.y > canvas.height + 20) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();

        // Draw trail
        this.trail.forEach(t => {
          ctx.beginPath();
          ctx.globalAlpha = Math.max(0, t.alpha * this.alpha * 0.6);
          ctx.fillStyle = isNight ? '#E0F2FE' : '#FEF3C7';
          ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = this.alpha;

        // Outer ambient glow
        const glowRadius = this.currentRadius * 4;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        if (isNight) {
          glow.addColorStop(0, 'rgba(186, 230, 253, 0.7)');
          glow.addColorStop(0.4, 'rgba(125, 211, 252, 0.25)');
          glow.addColorStop(1, 'rgba(125, 211, 252, 0)');
        } else {
          glow.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
          glow.addColorStop(0.4, 'rgba(253, 224, 71, 0.25)');
          glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        }
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Soft sparkle cross
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - this.currentRadius * 2, this.y);
        ctx.lineTo(this.x + this.currentRadius * 2, this.y);
        ctx.moveTo(this.x, this.y - this.currentRadius * 2);
        ctx.lineTo(this.x, this.y + this.currentRadius * 2);
        ctx.stroke();

        ctx.restore();
      }
    }

    class Sparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = isNight ? '#BAE6FD' : '#FEF3C7';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Populate active catchable stars
    for (let i = 0; i < 9; i++) {
      stars.push(new Star());
    }

    // Populate background static stars
    const backgroundStars = Array.from({ length: 45 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 500),
      radius: Math.random() * 1.2 + 0.6,
      alpha: Math.random() * 0.4 + 0.15,
      twinkleSpeed: Math.random() * 0.03 + 0.01
    }));

    const animate = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isNight) {
        skyGrad.addColorStop(0, '#050814');
        skyGrad.addColorStop(0.5, '#0B1120');
        skyGrad.addColorStop(1, '#131A2E');
      } else {
        skyGrad.addColorStop(0, '#0F172A');
        skyGrad.addColorStop(0.5, '#1E293B');
        skyGrad.addColorStop(1, '#2E384D');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background twinkling stars
      backgroundStars.forEach(bs => {
        bs.alpha += Math.sin(Date.now() * 0.001 * bs.twinkleSpeed) * 0.01;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.6, bs.alpha))})`;
        ctx.beginPath();
        ctx.arc(bs.x, bs.y, bs.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Handle occasional shooting star
      shootingStarTimer++;
      if (!shootingStar && shootingStarTimer > 280 && Math.random() < 0.03) {
        shootingStar = {
          x: Math.random() * (canvas.width * 0.6),
          y: Math.random() * (canvas.height * 0.3),
          vx: Math.random() * 6 + 6,
          vy: Math.random() * 3 + 3,
          length: Math.random() * 50 + 40,
          alpha: 1
        };
        shootingStarTimer = 0;
      }

      if (shootingStar) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.alpha -= 0.025;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, shootingStar.alpha)})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.vx * 4, shootingStar.y - shootingStar.vy * 4);
        ctx.stroke();
        ctx.restore();

        if (shootingStar.alpha <= 0 || shootingStar.x > canvas.width) {
          shootingStar = null;
        }
      }

      // Draw Constellation Lines between persistent caught stars
      if (caughtStars.length > 1) {
        ctx.save();
        ctx.strokeStyle = isNight ? 'rgba(186, 230, 253, 0.22)' : 'rgba(254, 240, 138, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i < caughtStars.length; i++) {
          const s1 = caughtStars[i];
          for (let j = i + 1; j < caughtStars.length; j++) {
            const s2 = caughtStars[j];
            const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
            if (dist < 170) {
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Persistent Caught Constellation Nodes
      caughtStars.forEach(cs => {
        ctx.save();
        // Soft aura
        ctx.fillStyle = isNight ? 'rgba(186, 230, 253, 0.5)' : 'rgba(254, 240, 138, 0.55)';
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Update & Draw Active Stars
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      // Update & Draw Sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.update();
        if (sp.alpha <= 0) {
          sparkles.splice(i, 1);
        } else {
          sp.draw();
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handlePointerCatch = (clientX, clientY) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      let hitIndex = -1;
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        const dist = Math.hypot(clickX - star.x, clickY - star.y);
        // Generous touch hit detection
        if (dist <= star.currentRadius * 3.5 || dist <= 24) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        const caught = stars[hitIndex];

        // Burst sparkles
        for (let s = 0; s < 14; s++) {
          sparkles.push(new Sparkle(caught.x, caught.y));
        }

        // Add to constellation node history
        caughtStars.push({ x: caught.x, y: caught.y });
        if (caughtStars.length > 35) caughtStars.shift();

        // Reset star to top
        caught.reset(false);

        setStarsCaught(prev => prev + 1);
      }
    };

    const onMouseDown = (e) => {
      handlePointerCatch(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          handlePointerCatch(e.touches[i].clientX, e.touches[i].clientY);
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('touchstart', onTouchStart);
      }
      cancelAnimationFrame(animationId);
    };
  }, [isNight]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Top Luminous Counter Bar */}
      <div className="text-center pt-4 z-10">
        <span className="text-[11.5px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full border bg-white/[0.06] border-white/10 text-amber-200/90 backdrop-blur-md">
          ✨ Moments of Light: {starsCaught}
        </span>
      </div>

      {/* Deep Night Canvas */}
      <div className="absolute inset-0 w-full h-full cursor-pointer z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Quiet Prompt */}
      <div className="h-14 pb-5 text-center z-10 pointer-events-none">
        <p className="text-[12px] italic text-amber-100/50">
          Touch falling stars to weave constellations across the quiet sky...
        </p>
      </div>
    </div>
  );
}
