import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export default function BubblePop() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const canvasRef = useRef(null);
  const [poppedCount, setPoppedCount] = useState(0);
  const [message, setMessage] = useState('');
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let bubbles = [];
    let particles = [];
    let isRunning = true;

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Bubble {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.radius = Math.random() * 26 + 18; // 18 to 44px
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = initial 
          ? Math.random() * canvas.height 
          : canvas.height + this.radius + Math.random() * 80;
        this.speedY = Math.random() * 0.75 + 0.35;
        this.wobbleSpeed = Math.random() * 0.025 + 0.012;
        this.wobbleAmount = Math.random() * 6 + 3;
        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.hueShift = Math.random() * 40 - 20;
      }

      update() {
        this.y -= this.speedY;
        this.wobbleAngle += this.wobbleSpeed;
        this.currentX = this.x + Math.sin(this.wobbleAngle) * this.wobbleAmount;

        if (this.y < -this.radius * 2) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();

        // Outer glow gradient
        const grad = ctx.createRadialGradient(
          this.currentX - this.radius * 0.35,
          this.y - this.radius * 0.35,
          this.radius * 0.05,
          this.currentX,
          this.y,
          this.radius
        );

        if (isNight) {
          grad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
          grad.addColorStop(0.5, 'rgba(125, 211, 252, 0.2)');
          grad.addColorStop(0.85, 'rgba(192, 132, 252, 0.15)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.35)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
          grad.addColorStop(0.45, 'rgba(254, 215, 170, 0.3)');
          grad.addColorStop(0.8, 'rgba(167, 243, 208, 0.2)');
          grad.addColorStop(1, 'rgba(166, 93, 64, 0.35)');
        }

        ctx.fillStyle = grad;
        ctx.arc(this.currentX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Primary glassy specular reflection
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.ellipse(
          this.currentX - this.radius * 0.35,
          this.y - this.radius * 0.35,
          this.radius * 0.22,
          this.radius * 0.12,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Secondary bottom soft rim light
        ctx.beginPath();
        ctx.strokeStyle = isNight ? 'rgba(186, 230, 253, 0.4)' : 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.arc(this.currentX, this.y, this.radius * 0.85, Math.PI * 0.3, Math.PI * 0.8);
        ctx.stroke();

        // Outer border stroke
        ctx.beginPath();
        ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(166, 93, 64, 0.25)';
        ctx.lineWidth = 1;
        ctx.arc(this.currentX, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2.5 + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 3.5 + 1.2;
        this.alpha = 1;
        this.decay = Math.random() * 0.035 + 0.02;
        this.color = color;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.speed *= 0.96;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize 16 bubbles fresh on mount
    for (let i = 0; i < 16; i++) {
      bubbles.push(new Bubble());
    }

    const animate = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw bubbles
      bubbles.forEach(b => {
        b.update();
        b.draw();
      });

      // Update & draw pop particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const triggerMessage = () => {
      const msgs = [
        "A little lighter...",
        "Letting it float away...",
        "Taking a quiet breath.",
        "Nothing to rush here.",
        "Just being present.",
        "Soft and peaceful.",
        "Your mind gets to rest."
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setMessage(randomMsg);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3200);
    };

    const handlePointerHit = (clientX, clientY) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      let hitIndex = -1;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = clickX - b.currentX;
        const dy = clickY - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Generous touch hit box for mobile
        if (dist <= b.radius * 1.3) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        const popped = bubbles[hitIndex];

        // Spawn pop particles
        const particleColor = isNight ? 'rgba(186, 230, 253, 0.85)' : 'rgba(166, 93, 64, 0.7)';
        for (let p = 0; p < 14; p++) {
          particles.push(new Particle(popped.currentX, popped.y, particleColor));
        }

        // Reset popped bubble to start fresh from bottom
        popped.reset(false);

        // Increment count
        setPoppedCount(prev => {
          const next = prev + 1;
          if (next % 6 === 0) {
            triggerMessage();
          }
          return next;
        });
      }
    };

    const onMouseDown = (e) => {
      handlePointerHit(e.clientX, e.clientY);
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          handlePointerHit(e.touches[i].clientX, e.touches[i].clientY);
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
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [isNight]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Top Counter Bar */}
      <div className="text-center pt-4 z-10">
        <span className={`text-[11.5px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full border backdrop-blur-md transition-colors ${
          isNight 
            ? 'bg-white/[0.04] border-white/10 text-sky-200/80' 
            : 'bg-white/80 border-[#2E1C12]/10 text-[#8E4B31]'
        }`}>
          Bubbles Popped: {poppedCount}
        </span>
      </div>

      {/* Interactive Canvas */}
      <div className="absolute inset-0 w-full h-full cursor-pointer z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Floating Gentle Message Overlay */}
      <div className="h-16 flex items-center justify-center pb-8 z-10 pointer-events-none">
        {message && (
          <div className={`px-6 py-2.5 rounded-full border text-[13px] font-medium tracking-wide shadow-md backdrop-blur-md transition-all duration-700 animate-pulse ${
            isNight 
              ? 'bg-[#151a26]/90 border-white/10 text-white/90 shadow-black/40' 
              : 'bg-white/90 border-[#2E1C12]/10 text-[#3D2A1D]/90 shadow-gray-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
