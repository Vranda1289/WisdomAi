import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

const PUZZLE_IMAGES = [
  {
    name: 'Misty Mountains',
    color1: '#4A5568',
    color2: '#A0AEC0',
    svg: (
      <svg className="w-full h-full" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="grad-mountains" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#718096" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad-mountains)" />
        <path d="M 0,300 L 100,120 L 200,300 Z" fill="#2D3748" opacity="0.8" />
        <path d="M 100,300 L 220,150 L 300,300 Z" fill="#4A5568" opacity="0.6" />
        <circle cx="220" cy="80" r="25" fill="#E2E8F0" opacity="0.15" />
        <path d="M 0,250 Q 150,220 300,250 L 300,300 L 0,300 Z" fill="#1A202C" opacity="0.9" />
      </svg>
    )
  },
  {
    name: 'Forest Stream',
    color1: '#2E3B2E',
    color2: '#8EB58E',
    svg: (
      <svg className="w-full h-full" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="grad-forest" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="100%" stopColor="#2F855A" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad-forest)" />
        {/* Soft leaf shapes */}
        <path d="M 50,50 Q 100,20 150,50 Q 100,80 50,50 Z" fill="#48BB78" opacity="0.3" />
        <path d="M 150,150 Q 200,120 250,150 Q 200,180 150,150 Z" fill="#38A169" opacity="0.4" />
        <path d="M 20,200 Q 120,180 220,220 L 180,300 L 0,300 Z" fill="#276749" opacity="0.7" />
        {/* Stream curve */}
        <path d="M 120,300 C 140,250 160,240 180,210 Q 190,190 200,120" stroke="#63B3ED" strokeWidth="6" fill="none" opacity="0.4" />
      </svg>
    )
  },
  {
    name: 'Sunset Stillness',
    color1: '#5F375E',
    color2: '#E28F83',
    svg: (
      <svg className="w-full h-full" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="grad-sunset" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A154B" />
            <stop offset="60%" stopColor="#C13584" />
            <stop offset="100%" stopColor="#FCAF45" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad-sunset)" />
        <circle cx="150" cy="160" r="40" fill="#FFF" opacity="0.8" />
        <path d="M 0,220 Q 150,250 300,220 L 300,300 L 0,300 Z" fill="#2D0B2E" opacity="0.8" />
        <path d="M 0,260 Q 150,280 300,260 L 300,300 L 0,300 Z" fill="#1D031F" />
      </svg>
    )
  }
];

export default function PeacefulPuzzle() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [pieces, setPieces] = useState([]); // Array of { id: number, currentPos: number }
  const [selectedPieceIdx, setSelectedPieceIdx] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    startPuzzle();
  }, [selectedImageIdx]);

  const startPuzzle = () => {
    // Generate 3x3 puzzle pieces (indices 0..8)
    let initialPieces = Array.from({ length: 9 }, (_, idx) => ({
      id: idx,
      currentPos: idx
    }));

    // Shuffle pieces randomly (ensure they aren't solved initially)
    let shuffled = [...initialPieces];
    let isSolved = true;
    while (isSolved) {
      shuffled.sort(() => Math.random() - 0.5);
      // Double check if it is accidentally solved
      isSolved = shuffled.every((p, idx) => p.id === idx);
    }

    // Map shuffled elements back into positions
    const finalState = shuffled.map((p, idx) => ({
      ...p,
      currentPos: idx
    }));

    setPieces(finalState);
    setSelectedPieceIdx(null);
    setIsCompleted(false);
  };

  const handlePieceClick = (clickedIdx) => {
    if (isCompleted) return;

    if (selectedPieceIdx === null) {
      setSelectedPieceIdx(clickedIdx);
    } else {
      // Swap positions
      const updated = [...pieces];
      const tempId = updated[selectedPieceIdx].id;
      
      updated[selectedPieceIdx].id = updated[clickedIdx].id;
      updated[clickedIdx].id = tempId;

      setPieces(updated);
      setSelectedPieceIdx(null);

      // Check if solved
      const solved = updated.every((p, idx) => p.id === idx);
      if (solved) {
        setIsCompleted(true);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none p-4">
      
      {/* Selector and Play Controls top */}
      <div className="w-full max-w-md flex justify-between items-center gap-3 z-10 mb-2">
        <select
          value={selectedImageIdx}
          onChange={(e) => setSelectedImageIdx(Number(e.target.value))}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
            isNight
              ? 'bg-slate-900 border-white/10 text-white'
              : 'bg-white border-[#2E1C12]/10 text-[#3D2A1D]'
          }`}
        >
          {PUZZLE_IMAGES.map((img, idx) => (
            <option key={idx} value={idx}>
              🌅 {img.name}
            </option>
          ))}
        </select>

        <button
          onClick={startPuzzle}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isNight ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/70 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-[#F5F0E6]'
          }`}
        >
          🔄 Shuffle
        </button>
      </div>

      {/* Grid Canvas area */}
      <div className="w-full max-w-[320px] aspect-square relative z-0 flex items-center justify-center">
        {isCompleted ? (
          <div className="text-center p-6 flex flex-col items-center gap-4 animate-fade-in">
            {/* Fully completed graphic */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-lg">
              {PUZZLE_IMAGES[selectedImageIdx].svg}
            </div>
            <div>
              <h4 className={`text-md font-heading font-semibold mb-1 ${isNight ? 'text-white' : 'text-[#3D2A1D]'}`}>
                Quiet Accomplishment
              </h4>
              <p className={`text-[12.5px] leading-relaxed px-4 ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
                "You gave your mind somewhere quiet to rest."
              </p>
            </div>
            <button
              onClick={startPuzzle}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isNight
                  ? 'bg-white text-black hover:bg-slate-200'
                  : 'bg-[#4F6F52] hover:bg-[#4F6F52]/90 text-white'
              }`}
            >
              Play Again
            </button>
          </div>
        ) : (
          <div 
            className={`grid grid-cols-3 grid-rows-3 gap-1 p-1 w-full h-full rounded-2xl border transition-colors ${
              isNight ? 'bg-slate-900/50 border-white/5 shadow-glass' : 'bg-white/80 border-[#2E1C12]/10 shadow-soft'
            }`}
          >
            {pieces.map((piece, currentIdx) => {
              // Calculate original background position for coordinates
              const originalCol = piece.id % 3;
              const originalRow = Math.floor(piece.id / 3);
              const xOffset = -originalCol * 100 + 'px';
              const yOffset = -originalRow * 100 + 'px';

              return (
                <div
                  key={currentIdx}
                  onClick={() => handlePieceClick(currentIdx)}
                  className={`relative overflow-hidden rounded-lg cursor-pointer transition-all active:scale-98 ${
                    selectedPieceIdx === currentIdx
                      ? (isNight ? 'ring-2 ring-white border-transparent' : 'ring-2 ring-[#4F6F52] border-transparent')
                      : (isNight ? 'border border-white/5 hover:border-white/20' : 'border border-black/5 hover:border-black/10')
                  }`}
                >
                  {/* Inside SVG viewport clipping to replicate background position */}
                  <div
                    className="absolute inset-0 w-[300px] h-[300px]"
                    style={{
                      transform: `translate(${xOffset}, ${yOffset})`,
                      pointerEvents: 'none'
                    }}
                  >
                    {PUZZLE_IMAGES[selectedImageIdx].svg}
                  </div>

                  {/* Gentle grid marker helper */}
                  <span className="absolute bottom-1 right-1 text-[8px] opacity-15 text-white bg-black/40 px-1 rounded">
                    {piece.id + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-10 pb-4 text-center z-10 pointer-events-none">
        <p className={`text-[12px] italic ${isNight ? 'text-white/20' : 'text-[#3D2A1D]/45'}`}>
          {!isCompleted && 'Tap a piece, then another to swap their positions.'}
        </p>
      </div>
    </div>
  );
}
