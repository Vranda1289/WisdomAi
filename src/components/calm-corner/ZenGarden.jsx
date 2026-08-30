import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

export default function ZenGarden() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const canvasRef = useRef(null);
  const [rakeStyle, setRakeStyle] = useState('triple'); // 'single', 'triple', 'broad'
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const currentWidth = rect.width || window.innerWidth;
      const currentHeight = rect.height || 500;

      // Backup contents
      const backup = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = currentWidth;
      canvas.height = currentHeight;
      
      // Re-draw sand texture
      drawSandBackground(ctx, currentWidth, currentHeight);
      
      // Restore drawings if possible
      ctx.putImageData(backup, 0, 0);
    };

    const drawSandBackground = (context, w, h) => {
      // Paint primary sand tone
      context.fillStyle = isNight ? '#1E2330' : '#EFE7DB';
      context.fillRect(0, 0, w, h);

      // Add soft sand grains noise
      for (let i = 0; i < w * h * 0.05; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const alpha = Math.random() * 0.08;
        context.fillStyle = isNight ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
        context.fillRect(x, y, 1, 1);
      }
    };

    // First time setup
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = rect.height || 500;
    drawSandBackground(ctx, canvas.width, canvas.height);

    window.addEventListener('resize', resizeCanvas);

    // Save initial state to history for undo
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isNight]);

  const drawRakeTrail = (clientX, clientY, lastX, lastY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const currX = clientX - rect.left;
    const currY = clientY - rect.top;
    const prevX = lastX - rect.left;
    const prevY = lastY - rect.top;

    ctx.save();
    
    // Line style to look like raked sand groove (embossed/carved)
    // Dark side (shadow) and light side (highlight)
    const drawGroove = (dx, dy) => {
      // Shadow stroke
      ctx.strokeStyle = isNight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(92, 75, 59, 0.25)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prevX + dx, prevY + dy);
      ctx.lineTo(currX + dx, currY + dy);
      ctx.stroke();

      // Highlight stroke offsetting slightly
      ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(prevX + dx + 1, prevY + dy + 1);
      ctx.lineTo(currX + dx + 1, currY + dy + 1);
      ctx.stroke();
    };

    // Calculate offsets based on rake style
    if (rakeStyle === 'single') {
      drawGroove(0, 0);
    } else if (rakeStyle === 'triple') {
      drawGroove(-8, -8);
      drawGroove(0, 0);
      drawGroove(8, 8);
    } else if (rakeStyle === 'broad') {
      drawGroove(-16, -16);
      drawGroove(-8, -8);
      drawGroove(0, 0);
      drawGroove(8, 8);
      drawGroove(16, 16);
    }

    ctx.restore();
  };

  const lastCoords = useRef({ x: 0, y: 0 });

  const handleStart = (clientX, clientY) => {
    setIsDrawing(true);
    lastCoords.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDrawing) return;
    drawRakeTrail(clientX, clientY, lastCoords.current.x, lastCoords.current.y);
    lastCoords.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save state to history for undo
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => {
        const next = [...prev, state];
        // Limit history to 15 frames to prevent memory issues
        if (next.length > 15) next.shift();
        return next;
      });
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const prevState = newHistory[newHistory.length - 1];
    
    const canvas = canvasRef.current;
    if (canvas && prevState) {
      const ctx = canvas.getContext('2d');
      ctx.putImageData(prevState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Redraw empty garden
    ctx.fillStyle = isNight ? '#1E2330' : '#EFE7DB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.width * canvas.height * 0.05; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const alpha = Math.random() * 0.08;
      ctx.fillStyle = isNight ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([state]);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Control overlay top */}
      <div className="w-full max-w-md flex justify-between items-center px-4 py-3 z-10">
        {/* Rake mode buttons */}
        <div className="flex gap-1.5">
          {['single', 'triple', 'broad'].map((mode) => (
            <button
              key={mode}
              onClick={() => setRakeStyle(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                rakeStyle === mode
                  ? (isNight ? 'bg-white text-black border-white' : 'bg-[#4F6F52] text-white border-[#4F6F52]')
                  : (isNight ? 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10' : 'bg-white/70 text-[#3D2A1D] border-[#2E1C12]/10 hover:bg-[#F5F0E6]')
              }`}
            >
              {mode === 'single' && '📍 Single Rake'}
              {mode === 'triple' && '🔱 Triple Rake'}
              {mode === 'broad' && '🪮 Broad Rake'}
            </button>
          ))}
        </div>

        {/* Undo/Clear buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
              history.length <= 1
                ? 'opacity-40 cursor-not-allowed text-stone-400 border-stone-200'
                : (isNight ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/70 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-[#F5F0E6]')
            }`}
            title="Undo last path"
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleClear}
            className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
              isNight ? 'bg-white/5 border-white/10 text-red-300 hover:bg-red-500/10' : 'bg-white/70 border-red-200 text-red-700 hover:bg-red-50'
            }`}
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {/* Main Sandbox Canvas */}
      <div className="absolute inset-0 w-full h-full cursor-crosshair z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => {
            if (e.touches.length > 0) handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={handleEnd}
        />
      </div>

      <div className="h-10 pb-4 text-center z-10 pointer-events-none">
        <p className={`text-[12px] italic ${isNight ? 'text-white/20' : 'text-[#3D2A1D]/45'}`}>
          Draw slowly in the sand to trace your thoughts...
        </p>
      </div>
    </div>
  );
}
