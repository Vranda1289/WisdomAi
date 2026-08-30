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

    const resizeCanvas = () => {
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
        this.radius = Math.random() * 25 + 20; // 20 to 45 radius
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = initial ? Math.random() * canvas.height : canvas.height + this.radius + Math.random() * 100;
        this.speedY = Math.random() * 0.8 + 0.4; // Slow float speed
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.wobbleAmount = Math.random() * 4 + 2;
        this.wobbleAngle = Math.random() * Math.PI * 2;
        this.colorAlpha = Math.random() * 0.15 + 0.1;
      }

      update() {
        this.y -= this.speedY;
        this.wobbleAngle += this.wobbleSpeed;
        this.currentX = this.x + Math.sin(this.wobbleAngle) * this.wobbleAmount;

        if (this.y < -this.radius) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        // Inner glassy gradient
        const grad = ctx.createRadialGradient(
          this.currentX - this.radius * 0.3,
          this.y - this.radius * 0.3,
          this.radius * 0.1,
          this.currentX,
          this.y,
          this.radius
        );

        if (isNight) {
          grad.addColorStop(0, 'rgba(173, 216, 230, 0.4)');
          grad.addColorStop(0.6, 'rgba(100, 149, 237, 0.1)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          grad.addColorStop(0.6, 'rgba(230, 201, 168, 0.2)');
          grad.addColorStop(1, 'rgba(79, 111, 82, 0.3)');
        }

        ctx.fillStyle = grad;
        ctx.arc(this.currentX, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Shiny reflection spot
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.arc(
          this.currentX - this.radius * 0.35,
          this.y - this.radius * 0.35,
          this.radius * 0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Border stroke
        ctx.beginPath();
        ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(79, 111, 82, 0.25)';
        ctx.lineWidth = 1;
        ctx.arc(this.currentX, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 2 + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 3 + 1;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.02;
        this.color = color;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize bubbles
    for (let i = 0; i < 15; i++) {
      bubbles.push(new Bubble());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Bubbles
      bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
      });

      // Update & Draw Pop Particles
      particles.forEach((part, index) => {
        part.update();
        if (part.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          part.draw();
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
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        const dx = clickX - bubble.currentX;
        const dy = clickY - bubble.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= bubble.radius) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        const popped = bubbles[hitIndex];
        
        // Spawn Pop Particles
        const particleColor = isNight ? 'rgba(173, 216, 230, 0.8)' : 'rgba(79, 111, 82, 0.6)';
        for (let p = 0; p < 12; p++) {
          particles.push(new Particle(popped.currentX, popped.y, particleColor));
        }

        // Reset bubble to start from bottom
        popped.reset();

        // Increment count & trigger random quiet validation messages
        setPoppedCount(prev => {
          const next = prev + 1;
          if (next % 8 === 0) {
            triggerMessage();
          }
          return next;
        });
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });

    const triggerMessage = () => {
      const msgs = [
        "A little lighter?",
        "Letting it float away...",
        "Taking a quiet breath.",
        "Nothing to rush.",
        "Just being here.",
        "Soft and light."
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setMessage(randomMsg);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 3000);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
      cancelAnimationFrame(animationId);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [isNight]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      <div className="text-center pt-4 z-10">
        <p className={`text-xs uppercase tracking-widest ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'} font-bold`}>
          Bubbles Popped: {poppedCount}
        </p>
      </div>

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
