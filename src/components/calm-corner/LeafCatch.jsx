import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export default function LeafCatch() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const canvasRef = useRef(null);
  const [leavesCaught, setLeavesCaught] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let leaves = [];
    let catchParticles = [];

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Leaf {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.size = Math.random() * 16 + 12; // Radius/size
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height * 0.8 - 50 : -50;
        this.speedY = Math.random() * 0.6 + 0.5; // Very slow drift down
        this.speedX = Math.random() * 0.4 - 0.2; // Horizontal sway
        this.swayRange = Math.random() * 1.5 + 0.5;
        this.swaySpeed = Math.random() * 0.02 + 0.005;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 0.01 + 0.002) * (Math.random() > 0.5 ? 1 : -1);

        // Warm, natural colors suited for both light and dark modes
        if (isNight) {
          // Ethereal glowing leaves
          const colors = [
            'rgba(141, 197, 255, 0.4)',
            'rgba(167, 243, 208, 0.4)',
            'rgba(253, 230, 138, 0.35)',
            'rgba(244, 114, 182, 0.3)'
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else {
          // Autumn/Nature leaves
          const colors = [
            'rgba(79, 111, 82, 0.55)', // Sage
            'rgba(176, 141, 87, 0.55)', // Ochre/Gold
            'rgba(216, 125, 86, 0.5)',  // Terracotta
            'rgba(141, 153, 117, 0.55)' // Moss
          ];
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      update() {
        this.y += this.speedY;
        this.swayAngle += this.swaySpeed;
        this.currentX = this.x + Math.sin(this.swayAngle) * this.swayRange * 15;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.currentX, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.beginPath();

        // Draw a leafy path
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.6, -this.size * 0.2, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.6, -this.size * 0.2, 0, -this.size);
        ctx.closePath();
        ctx.fill();

        // Leaf stem line
        ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size * 1.2);
        ctx.stroke();

        ctx.restore();
      }
    }

    class Sparkle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 1.5 + 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.5 + 0.5;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
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

    // Populate leaves
    for (let i = 0; i < 12; i++) {
      leaves.push(new Leaf());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Leaves
      leaves.forEach(leaf => {
        leaf.update();
        leaf.draw();
      });

      // Sparkles
      catchParticles.forEach((sp, idx) => {
        sp.update();
        if (sp.alpha <= 0) {
          catchParticles.splice(idx, 1);
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
      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        const dx = clickX - leaf.currentX;
        const dy = clickY - leaf.y;
        // Give slightly larger click target on mobile
        const range = leaf.size * 1.8;

        if (Math.sqrt(dx * dx + dy * dy) <= range) {
          hitIndex = i;
          break;
        }
      }

      if (hitIndex !== -1) {
        const caughtLeaf = leaves[hitIndex];

        // Sparkle explosion matching the leaf color
        for (let s = 0; s < 10; s++) {
          catchParticles.push(new Sparkle(caughtLeaf.currentX, caughtLeaf.y, caughtLeaf.color));
        }

        caughtLeaf.reset();
        setLeavesCaught(prev => prev + 1);
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
      <div className="text-center pt-4 z-10">
        <p className={`text-xs uppercase tracking-widest ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'} font-bold`}>
          Leaves Gathered: {leavesCaught}
        </p>
      </div>

      <div className="absolute inset-0 w-full h-full cursor-pointer z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="h-16 pb-6 text-center z-10 pointer-events-none">
        <p className={`text-[12px] italic ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/40'}`}>
          Catch the leaves as they float by...
        </p>
      </div>
    </div>
  );
}
