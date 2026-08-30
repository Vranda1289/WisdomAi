import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export default function RippleTouch() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let ripples = [];

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Ripple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = Math.max(canvas.width, canvas.height) * 0.35 + Math.random() * 100;
        this.speed = Math.random() * 2 + 1.8;
        this.alpha = 1;
        this.decay = Math.random() * 0.008 + 0.006;
        this.lineWidth = Math.random() * 4 + 2;
        
        // Pick a soft glow color
        if (isNight) {
          this.color = `rgba(135, 206, 250, 0.45)`; // Light sky blue
        } else {
          this.color = `rgba(176, 141, 87, 0.35)`; // Ochre gold
        }
      }

      update() {
        this.radius += this.speed;
        // Ease out speed as ripple gets wider
        this.speed *= 0.99;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Outer faint shadow ring for realistic depth
        ctx.beginPath();
        ctx.strokeStyle = isNight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = this.lineWidth * 1.5;
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing ring
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Concentric secondary soft ring
        if (this.radius > 40) {
          ctx.beginPath();
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.lineWidth * 0.5;
          ctx.arc(this.x, this.y, this.radius - 25, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Water background gradient base
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isNight) {
        bgGrad.addColorStop(0, '#0F131D');
        bgGrad.addColorStop(0.5, '#151A26');
        bgGrad.addColorStop(1, '#1E2535');
      } else {
        bgGrad.addColorStop(0, '#FDFBF7');
        bgGrad.addColorStop(0.5, '#FAF6ED');
        bgGrad.addColorStop(1, '#F2E8D7');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all active ripples
      ripples.forEach((ripple, index) => {
        ripple.update();
        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ripples.splice(index, 1);
        } else {
          ripple.draw();
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const addRipple = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ripples.push(new Ripple(x, y));
    };

    const handleMouseDown = (e) => {
      addRipple(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      // Add ripple for each touch point
      for (let i = 0; i < e.touches.length; i++) {
        addRipple(e.touches[i].clientX, e.touches[i].clientY);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationId);
    };
  }, [isNight]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      <div className="absolute inset-0 w-full h-full cursor-pointer z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="h-full w-full flex items-center justify-center pointer-events-none z-10">
        <p className={`text-xs md:text-sm font-medium transition-all ${isNight ? 'text-white/20' : 'text-[#3D2A1D]/25'} text-center px-6`}>
          Tap anywhere on the surface to send out ripples...
        </p>
      </div>
    </div>
  );
}
