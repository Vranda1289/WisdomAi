import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';

const PALETTES = [
  { name: 'Sage', color: '#4F6F52' },
  { name: 'Gold', color: '#B08D57' },
  { name: 'Terracotta', color: '#D87D56' },
  { name: 'Indigo', color: '#3F51B5' },
  { name: 'Rose', color: '#E8A7A1' },
  { name: 'Sky', color: '#90CAF9' },
  { name: 'Mint', color: '#A5D6A7' },
  { name: 'Cream', color: '#FFF8E7' },
  { name: 'Slate', color: '#607D8B' },
  { name: 'Lavender', color: '#B39DDB' }
];

export default function ColorCalm() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;
  const [activeColor, setActiveColor] = useState(PALETTES[0].color);
  const [selectedPattern, setSelectedPattern] = useState('mandala'); // 'mandala', 'waves', 'leaves'
  
  // Custom fills mapped by path ID
  const [fills, setFills] = useState({});
  const [history, setHistory] = useState([]);

  const handlePathClick = (pathId) => {
    const prevColor = fills[pathId] || 'transparent';
    const nextFills = { ...fills, [pathId]: activeColor };
    
    // Save to history
    setHistory(prev => [...prev, { fills, pathId, prevColor }]);
    setFills(nextFills);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const nextHistory = [...history];
    const lastAction = nextHistory.pop();
    
    setFills(prev => {
      const next = { ...prev };
      if (lastAction.prevColor === 'transparent') {
        delete next[lastAction.pathId];
      } else {
        next[lastAction.pathId] = lastAction.prevColor;
      }
      return next;
    });
    setHistory(nextHistory);
  };

  const handleReset = () => {
    setFills({});
    setHistory([]);
  };

  // Renders the chosen SVG design
  const renderSVGPattern = () => {
    const strokeColor = isNight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(46, 28, 18, 0.4)';
    const getFill = (id) => fills[id] || 'transparent';

    if (selectedPattern === 'mandala') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px]">
          {/* Background circle */}
          <circle cx="50" cy="50" r="48" stroke={strokeColor} strokeWidth="0.8" fill="transparent" />
          
          {/* Inner ring */}
          <circle 
            id="m_inner_ring" 
            cx="50" 
            cy="50" 
            r="12" 
            stroke={strokeColor} 
            strokeWidth="0.8" 
            fill={getFill('m_inner_ring')} 
            onClick={() => handlePathClick('m_inner_ring')}
            className="cursor-pointer hover:opacity-80 transition-opacity" 
          />

          {/* Central Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
            const id = `m_petal_in_${index}`;
            return (
              <path
                key={id}
                id={id}
                d="M 50,50 C 45,35 55,35 50,50"
                transform={`rotate(${angle} 50 50)`}
                stroke={strokeColor}
                strokeWidth="0.8"
                fill={getFill(id)}
                onClick={() => handlePathClick(id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            );
          })}

          {/* Outer Petals Layer 1 */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, index) => {
            const id = `m_petal_mid_${index}`;
            return (
              <path
                key={id}
                id={id}
                d="M 50,50 C 40,20 60,20 50,50"
                transform={`rotate(${angle + 15} 50 50)`}
                stroke={strokeColor}
                strokeWidth="0.8"
                fill={getFill(id)}
                onClick={() => handlePathClick(id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            );
          })}

          {/* Outer corner segments */}
          {[0, 90, 180, 270].map((angle, index) => {
            const id = `m_corner_${index}`;
            return (
              <path
                key={id}
                id={id}
                d="M 50,2 C 60,15 75,15 85,25"
                transform={`rotate(${angle} 50 50)`}
                stroke={strokeColor}
                strokeWidth="0.8"
                fill={getFill(id)}
                onClick={() => handlePathClick(id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
      );
    }

    if (selectedPattern === 'waves') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px]">
          {/* Overlapping Waves */}
          {[0, 1, 2, 3, 4, 5, 6].map((row) => {
            return [0, 1, 2, 3].map((col) => {
              const id = `wave_${row}_${col}`;
              const startX = col * 30 - 10;
              const startY = row * 15 + 8;
              return (
                <path
                  key={id}
                  id={id}
                  d={`M ${startX},${startY} C ${startX + 10},${startY - 12} ${startX + 20},${startY + 12} ${startX + 30},${startY}`}
                  stroke={strokeColor}
                  strokeWidth="1.2"
                  fill={getFill(id)}
                  onClick={() => handlePathClick(id)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              );
            });
          })}
        </svg>
      );
    }

    // Leaves
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px]">
        {/* Main branch stems */}
        <path d="M 50,95 Q 48,50 50,5" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        <path d="M 50,70 Q 25,60 10,65" stroke={strokeColor} strokeWidth="1" fill="none" />
        <path d="M 50,50 Q 75,40 90,45" stroke={strokeColor} strokeWidth="1" fill="none" />

        {/* Leaves left side */}
        {[
          { id: 'leaf_l0', d: 'M 50,85 C 35,80 30,90 20,85 C 32,95 45,92 50,85' },
          { id: 'leaf_l1', d: 'M 40,65 C 25,55 15,62 8,55 C 18,70 32,68 40,65' },
          { id: 'leaf_l2', d: 'M 48,45 C 30,35 25,45 15,40 C 25,52 38,50 48,45' },
          { id: 'leaf_l3', d: 'M 49,25 C 35,15 30,25 20,20 C 30,32 42,30 49,25' }
        ].map((leaf) => (
          <path
            key={leaf.id}
            id={leaf.id}
            d={leaf.d}
            stroke={strokeColor}
            strokeWidth="0.8"
            fill={getFill(leaf.id)}
            onClick={() => handlePathClick(leaf.id)}
            className="cursor-pointer hover:opacity-85 transition-all"
          />
        ))}

        {/* Leaves right side */}
        {[
          { id: 'leaf_r0', d: 'M 50,75 C 65,70 70,80 80,75 C 70,85 58,82 50,75' },
          { id: 'leaf_r1', d: 'M 51,55 C 68,48 72,58 85,52 C 75,65 62,62 51,55' },
          { id: 'leaf_r2', d: 'M 50,35 C 68,28 72,38 85,32 C 75,45 62,42 50,35' },
          { id: 'leaf_r3', d: 'M 50,15 C 65,8 68,18 78,12 C 70,22 58,20 50,15' }
        ].map((leaf) => (
          <path
            key={leaf.id}
            id={leaf.id}
            d={leaf.d}
            stroke={strokeColor}
            strokeWidth="0.8"
            fill={getFill(leaf.id)}
            onClick={() => handlePathClick(leaf.id)}
            className="cursor-pointer hover:opacity-85 transition-all"
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* Pattern Selector and Toolbar */}
      <div className="w-full max-w-lg flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-3 z-10">
        {/* Choose pattern */}
        <div className="flex gap-1.5">
          {['mandala', 'waves', 'leaves'].map((pattern) => (
            <button
              key={pattern}
              onClick={() => { setSelectedPattern(pattern); handleReset(); }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border capitalize transition-all ${
                selectedPattern === pattern
                  ? (isNight ? 'bg-white text-black border-white' : 'bg-[#4F6F52] text-white border-[#4F6F52]')
                  : (isNight ? 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10' : 'bg-white/70 text-[#3D2A1D] border-[#2E1C12]/10 hover:bg-[#F5F0E6]')
              }`}
            >
              {pattern}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`px-3 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
              history.length === 0
                ? 'opacity-40 cursor-not-allowed text-stone-400 border-stone-200'
                : (isNight ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/70 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-[#F5F0E6]')
            }`}
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleReset}
            className={`px-3 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
              isNight ? 'bg-white/5 border-white/10 text-red-300 hover:bg-red-500/10' : 'bg-white/70 border-red-200 text-red-700 hover:bg-red-50'
            }`}
          >
            🧹 Reset
          </button>
        </div>
      </div>

      {/* SVG Canvas drawing panel */}
      <div className={`w-full flex-grow flex items-center justify-center p-4 z-0 ${
        isNight ? 'bg-slate-900/20' : 'bg-white/30'
      }`}>
        <div className="w-full max-w-[360px] h-full flex items-center justify-center">
          {renderSVGPattern()}
        </div>
      </div>

      {/* Color Palette Picker bottom */}
      <div className="w-full max-w-lg px-4 pb-6 z-10 flex flex-col items-center gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/55'}`}>
          Select brush color
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {PALETTES.map((color) => (
            <button
              key={color.name}
              onClick={() => setActiveColor(color.color)}
              className="w-7 h-7 rounded-full border-2 transition-all relative flex items-center justify-center"
              style={{
                backgroundColor: color.color,
                borderColor: activeColor === color.color
                  ? (isNight ? '#ffffff' : '#2E1C12')
                  : 'transparent',
                transform: activeColor === color.color ? 'scale(1.2)' : 'scale(1)'
              }}
              title={color.name}
            >
              {activeColor === color.color && (
                <span className={`text-[10px] ${
                  color.name === 'Cream' ? 'text-black' : 'text-white'
                }`}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
