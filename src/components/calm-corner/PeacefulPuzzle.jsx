import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../constants/themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, RotateCcw } from 'lucide-react';

/* =========================================================================
   PUZZLE CATALOG
   ========================================================================= */

const PUZZLE_TYPES = [
  {
    id: 'numbers',
    name: '🔢 Number Sequence',
    category: 'Gentle Numbers',
    desc: 'Slide and arrange numbers in peaceful order',
    type: 'sliding',
    gridSize: 3,
    renderTile: (val, isNight) => (
      <div className={`w-full h-full flex items-center justify-center font-heading text-2xl font-bold ${
        isNight ? 'text-sky-200' : 'text-[#5A3C2E]'
      }`}>
        {val}
      </div>
    )
  },
  {
    id: 'mountains',
    name: '🌿 Misty Mountains',
    category: 'Nature Sanctuary',
    desc: 'Assemble rolling peaks veiled in morning mist',
    type: 'tile_swap',
    gridSize: 3,
    tiles: [
      { id: 0, label: '☁️ High Peak', color: '#334155' },
      { id: 1, label: '🏔️ Morning Mist', color: '#475569' },
      { id: 2, label: '🦅 Open Sky', color: '#64748B' },
      { id: 3, label: '🌲 Pine Slope', color: '#334D41' },
      { id: 4, label: '🌫️ Cloud Layer', color: '#4B5563' },
      { id: 5, label: '⛰️ Valley Edge', color: '#374151' },
      { id: 6, label: '🍃 Forest Base', color: '#273C2C' },
      { id: 7, label: '🌊 Mountain River', color: '#2A4365' },
      { id: 8, label: '🌾 Quiet Meadow', color: '#3D5A45' }
    ]
  },
  {
    id: 'faces',
    name: '😊 Sleepy Moon Spirit',
    category: 'Mindful Faces',
    desc: 'Assemble a serene sleeping celestial portrait',
    type: 'tile_swap',
    gridSize: 3,
    tiles: [
      { id: 0, label: '⭐ Starlight', color: '#2E1065' },
      { id: 1, label: '🌙 Moon Crown', color: '#3B0764' },
      { id: 2, label: '✨ Night Glow', color: '#4C1D95' },
      { id: 3, label: '😌 Closed Eye', color: '#581C87' },
      { id: 4, label: '💫 Peaceful Mind', color: '#6B21A8' },
      { id: 5, label: '🌸 Celestial Aura', color: '#7E22CE' },
      { id: 6, label: '✨ Soft Smile', color: '#581C87' },
      { id: 7, label: '☁️ Dream Cloud', color: '#3B0764' },
      { id: 8, label: '🌌 Deep Cosmos', color: '#1E1B4B' }
    ]
  },
  {
    id: 'mandala',
    name: '🌸 Sacred Mandala',
    category: 'Sacred Patterns',
    desc: 'Reconstruct a harmonious geometric floral mandala',
    type: 'tile_swap',
    gridSize: 3,
    tiles: [
      { id: 0, label: '💠 Top Petal', color: '#7C2D12' },
      { id: 1, label: '✨ Center Crown', color: '#9A3412' },
      { id: 2, label: '💠 Right Petal', color: '#C2410C' },
      { id: 3, label: '🌿 Inner Ring', color: '#991B1B' },
      { id: 4, label: '🪷 Sacred Lotus', color: '#B91C1C' },
      { id: 5, label: '🌿 Outer Ring', color: '#991B1B' },
      { id: 6, label: '💠 Lower Left', color: '#7C2D12' },
      { id: 7, label: '✨ Base Petal', color: '#9A3412' },
      { id: 8, label: '💠 Lower Right', color: '#C2410C' }
    ]
  },
  {
    id: 'fauna',
    name: '🦋 Forest Butterfly',
    category: 'Gentle Wildlife',
    desc: 'Pieces of wings and wild forest flora',
    type: 'tile_swap',
    gridSize: 3,
    tiles: [
      { id: 0, label: '🍃 Forest Canopy', color: '#064E3B' },
      { id: 1, label: '🦋 Wing Apex', color: '#065F46' },
      { id: 2, label: '🍃 Sunlit Branch', color: '#047857' },
      { id: 3, label: '🦋 Left Wing', color: '#0F766E' },
      { id: 4, label: '✨ Butterfly Heart', color: '#115E59' },
      { id: 5, label: '🦋 Right Wing', color: '#134E4A' },
      { id: 6, label: '🌸 Forest Moss', color: '#064E3B' },
      { id: 7, label: '🦋 Wing Trail', color: '#065F46' },
      { id: 8, label: '🌸 Wildflower', color: '#047857' }
    ]
  },
  {
    id: 'memory',
    name: '🧠 Sanctuary Pairs',
    category: 'Mindful Memory',
    desc: 'Turn and pair gentle sanctuary symbols at your own pace',
    type: 'memory',
    pairs: ['🌿', '🌙', '🪷', '⭐', '🌊', '🍃']
  }
];

export default function PeacefulPuzzle() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const [currentView, setCurrentView] = useState('gallery'); // 'gallery' | 'play'
  const [selectedPuzzle, setSelectedPuzzle] = useState(PUZZLE_TYPES[0]);
  const [difficulty, setDifficulty] = useState('gentle'); // 'gentle' | 'mindful' | 'challenge'
  
  // Game states
  const [tiles, setTiles] = useState([]);
  const [selectedTileIdx, setSelectedTileIdx] = useState(null);
  const [emptyIndex, setEmptyIndex] = useState(8); // for sliding
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Memory game state
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);

  // Initialize selected puzzle
  const startPuzzle = (puzzle) => {
    setSelectedPuzzle(puzzle);
    setIsCompleted(false);
    setSelectedTileIdx(null);
    setMoves(0);

    if (puzzle.type === 'sliding') {
      // 1 to 8 + empty (null)
      const initial = [1, 2, 3, 4, 5, 6, 7, 8, null];
      // Gentle shuffle
      const shuffleCount = difficulty === 'gentle' ? 12 : (difficulty === 'mindful' ? 24 : 40);
      let currEmpty = 8;
      let currTiles = [...initial];

      for (let s = 0; s < shuffleCount; s++) {
        const neighbors = getSlidingNeighbors(currEmpty);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // swap
        currTiles[currEmpty] = currTiles[randomNeighbor];
        currTiles[randomNeighbor] = null;
        currEmpty = randomNeighbor;
      }

      setTiles(currTiles);
      setEmptyIndex(currEmpty);
    } else if (puzzle.type === 'tile_swap') {
      const initial = puzzle.tiles.map((t, idx) => ({ ...t, correctIdx: idx }));
      // Shuffle tiles
      const shuffled = [...initial].sort(() => Math.random() - 0.5);
      setTiles(shuffled);
    } else if (puzzle.type === 'memory') {
      const symbols = puzzle.pairs;
      const deck = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((sym, idx) => ({ id: idx, sym, matched: false }));
      setMemoryCards(deck);
      setFlippedCards([]);
      setMatchedCards([]);
    }

    setCurrentView('play');
  };

  const getSlidingNeighbors = (idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const neighbors = [];
    if (row > 0) neighbors.push(idx - 3); // top
    if (row < 2) neighbors.push(idx + 3); // bottom
    if (col > 0) neighbors.push(idx - 1); // left
    if (col < 2) neighbors.push(idx + 1); // right
    return neighbors;
  };

  const handleSlidingClick = (idx) => {
    if (isCompleted) return;
    const neighbors = getSlidingNeighbors(emptyIndex);
    if (neighbors.includes(idx)) {
      const nextTiles = [...tiles];
      nextTiles[emptyIndex] = nextTiles[idx];
      nextTiles[idx] = null;
      setTiles(nextTiles);
      setEmptyIndex(idx);
      setMoves(prev => prev + 1);

      // Check win
      const win = nextTiles.slice(0, 8).every((v, i) => v === i + 1) && nextTiles[8] === null;
      if (win) setIsCompleted(true);
    }
  };

  const handleTileSwapClick = (idx) => {
    if (isCompleted) return;
    if (selectedTileIdx === null) {
      setSelectedTileIdx(idx);
    } else if (selectedTileIdx === idx) {
      setSelectedTileIdx(null);
    } else {
      // Swap tiles
      const nextTiles = [...tiles];
      const temp = nextTiles[selectedTileIdx];
      nextTiles[selectedTileIdx] = nextTiles[idx];
      nextTiles[idx] = temp;
      setTiles(nextTiles);
      setSelectedTileIdx(null);
      setMoves(prev => prev + 1);

      // Check win
      const win = nextTiles.every((t, i) => t.correctIdx === i);
      if (win) setIsCompleted(true);
    }
  };

  const handleMemoryCardClick = (idx) => {
    if (isCompleted || flippedCards.length === 2 || flippedCards.includes(idx) || matchedCards.includes(idx)) return;

    const nextFlipped = [...flippedCards, idx];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const card1 = memoryCards[nextFlipped[0]];
      const card2 = memoryCards[nextFlipped[1]];

      if (card1.sym === card2.sym) {
        const nextMatched = [...matchedCards, nextFlipped[0], nextFlipped[1]];
        setMatchedCards(nextMatched);
        setFlippedCards([]);
        if (nextMatched.length === memoryCards.length) {
          setIsCompleted(true);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* VIEW 1: PUZZLE LIBRARY GALLERY */}
      {currentView === 'gallery' && (
        <motion.div
          key="gallery"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-start p-6 space-y-6"
        >
          <div className="text-center max-w-lg space-y-2 mt-2">
            <h2 className="text-2xl md:text-3xl font-heading font-medium tracking-tight">
              Peaceful Puzzles
            </h2>
            <p className={`text-xs md:text-sm font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'}`}>
              What would you like to solve? Gentle, unhurried puzzles with no pressure or timers.
            </p>
          </div>

          {/* Difficulty Tiers */}
          <div className="flex items-center gap-2 p-1 rounded-2xl border backdrop-blur-md">
            {[
              { id: 'gentle', label: '🌱 Gentle' },
              { id: 'mindful', label: '🌿 Mindful' },
              { id: 'challenge', label: '✨ Focused' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  difficulty === d.id
                    ? (isNight ? 'bg-white text-slate-900 shadow-sm' : 'bg-[#4F6F52] text-white shadow-sm')
                    : (isNight ? 'text-white/60 hover:text-white' : 'text-[#3D2A1D]/60 hover:text-[#3D2A1D]')
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Puzzle Cards Grid */}
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-8">
            {PUZZLE_TYPES.map((pz) => (
              <motion.div
                key={pz.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startPuzzle(pz)}
                className={`cursor-pointer rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                  isNight
                    ? 'bg-[#151a26]/80 hover:bg-[#182133] border-white/10 hover:border-white/20 shadow-md'
                    : 'bg-white/90 hover:bg-white border-[#2E1C12]/10 hover:border-[#A65D40]/30 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <span className={`text-[10.5px] uppercase tracking-wider font-semibold ${
                    isNight ? 'text-sky-300/70' : 'text-[#8E4B31]'
                  }`}>
                    {pz.category}
                  </span>
                  <h3 className="font-heading text-lg font-semibold tracking-wide">
                    {pz.name}
                  </h3>
                  <p className={`text-xs font-light leading-relaxed ${
                    isNight ? 'text-white/55' : 'text-[#3D2A1D]/70'
                  }`}>
                    {pz.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                    3×3 Grid
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    isNight ? 'text-sky-300' : 'text-[#8E4B31]'
                  }`}>
                    Play →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* VIEW 2: ACTIVE PUZZLE SCREEN */}
      {currentView === 'play' && (
        <motion.div
          key="play"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex flex-col items-center justify-between"
        >
          {/* Top Puzzle Header Controls */}
          <div className="w-full max-w-xl flex items-center justify-between px-4 py-2.5 z-20 border-b border-black/5 dark:border-white/5">
            <button
              onClick={() => setCurrentView('gallery')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                isNight 
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10' 
                  : 'bg-white/80 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-white'
              }`}
            >
              <Grid size={13} />
              <span>Puzzles</span>
            </button>

            <span className="font-heading text-sm font-semibold tracking-wide truncate">
              {selectedPuzzle.name}
            </span>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                {moves} moves
              </span>
              <button
                onClick={() => startPuzzle(selectedPuzzle)}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  isNight ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/80 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-white'
                }`}
                title="Restart puzzle"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Center Puzzle Board */}
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4 z-10 relative">
            
            {/* Completion Modal Overlay */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-4 z-30 rounded-3xl backdrop-blur-xl border flex flex-col items-center justify-center text-center p-6 shadow-2xl bg-black/60 border-white/15 text-white space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl">
                    🌿
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-heading text-2xl font-medium tracking-tight">
                      You found your way through. 🌿
                    </h3>
                    <p className="text-xs text-white/70 font-light max-w-xs leading-relaxed">
                      A little focus can be a nice place to rest.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => startPuzzle(selectedPuzzle)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                      Play Another
                    </button>
                    <button
                      onClick={() => setCurrentView('gallery')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
                    >
                      Choose Puzzle
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. SLIDING PUZZLE RENDERER */}
            {selectedPuzzle.type === 'sliding' && (
              <div className={`w-72 h-72 rounded-3xl p-3 grid grid-cols-3 gap-2.5 border shadow-inner ${
                isNight ? 'bg-[#101522]/90 border-white/10' : 'bg-white/80 border-[#2E1C12]/10'
              }`}>
                {tiles.map((tileVal, idx) => {
                  if (tileVal === null) {
                    return (
                      <div 
                        key="empty" 
                        className={`rounded-2xl border-2 border-dashed ${
                          isNight ? 'border-white/10 bg-black/20' : 'border-[#2E1C12]/10 bg-[#2E1C12]/[0.02]'
                        }`} 
                      />
                    );
                  }
                  return (
                    <motion.button
                      key={tileVal}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSlidingClick(idx)}
                      className={`rounded-2xl border flex items-center justify-center font-heading text-2xl font-bold shadow-sm transition-colors ${
                        isNight 
                          ? 'bg-[#1e2738] border-white/15 text-sky-200 hover:bg-[#253248]' 
                          : 'bg-white border-[#2E1C12]/15 text-[#3D2A1D] hover:bg-[#F5F0E6]'
                      }`}
                    >
                      {tileVal}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* 2. TILE SWAP PUZZLE RENDERER */}
            {selectedPuzzle.type === 'tile_swap' && (
              <div className={`w-72 h-72 rounded-3xl p-3 grid grid-cols-3 gap-2.5 border shadow-inner ${
                isNight ? 'bg-[#101522]/90 border-white/10' : 'bg-white/80 border-[#2E1C12]/10'
              }`}>
                {tiles.map((tile, idx) => {
                  const isSelected = selectedTileIdx === idx;
                  const isCorrect = tile.correctIdx === idx;

                  return (
                    <motion.button
                      key={tile.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleTileSwapClick(idx)}
                      style={{ backgroundColor: isNight ? tile.color : tile.color + 'dd' }}
                      className={`rounded-2xl border p-2 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden shadow-sm ${
                        isSelected 
                          ? 'ring-2 ring-amber-400 scale-105 shadow-lg z-20' 
                          : 'border-white/20'
                      }`}
                    >
                      <span className="text-white text-[11px] font-medium leading-tight select-none drop-shadow-sm">
                        {tile.label}
                      </span>
                      {isCorrect && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-xs" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* 3. MEMORY MATCH PUZZLE RENDERER */}
            {selectedPuzzle.type === 'memory' && (
              <div className={`w-80 h-72 rounded-3xl p-3 grid grid-cols-4 gap-2.5 border shadow-inner ${
                isNight ? 'bg-[#101522]/90 border-white/10' : 'bg-white/80 border-[#2E1C12]/10'
              }`}>
                {memoryCards.map((card, idx) => {
                  const isFlipped = flippedCards.includes(idx) || matchedCards.includes(idx);
                  const isMatched = matchedCards.includes(idx);

                  return (
                    <motion.button
                      key={card.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleMemoryCardClick(idx)}
                      className={`rounded-2xl border flex items-center justify-center text-2xl transition-all shadow-sm ${
                        isMatched
                          ? 'bg-emerald-500/20 border-emerald-500/30 opacity-75'
                          : isFlipped
                            ? (isNight ? 'bg-[#1e2738] border-white/20 text-white' : 'bg-white border-[#2E1C12]/20 text-black')
                            : (isNight ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-[#FAF6ED] border-[#2E1C12]/10 hover:bg-white')
                      }`}
                    >
                      {isFlipped ? card.sym : '🌱'}
                    </motion.button>
                  );
                })}
              </div>
            )}

          </div>

          {/* Bottom Guidance Prompt */}
          <div className="w-full text-center pb-5 z-20 pointer-events-none">
            <p className={`text-[11.5px] italic ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
              {selectedPuzzle.type === 'sliding' && 'Slide tiles into the empty space to complete the sequence.'}
              {selectedPuzzle.type === 'tile_swap' && 'Tap a tile then tap another to swap their positions.'}
              {selectedPuzzle.type === 'memory' && 'Flip cards gently to match tranquil pairs.'}
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}
