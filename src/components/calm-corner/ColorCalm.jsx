import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Undo2, RotateCcw, Check, Grid } from 'lucide-react';

/* =========================================================================
   PALETTES (Over 30 harmonious, curated tones)
   ========================================================================= */

const PALETTE_CATEGORIES = [
  {
    name: 'Earthy & Warm',
    colors: [
      { name: 'Terracotta', hex: '#C86D51' },
      { name: 'Warm Ochre', hex: '#D4A373' },
      { name: 'Clay', hex: '#A65D40' },
      { name: 'Sunset Amber', hex: '#E09F3E' },
      { name: 'Peach Sand', hex: '#F4A261' },
      { name: 'Golden Sand', hex: '#E9D8A6' },
      { name: 'Cinnamon', hex: '#8B5A2B' }
    ]
  },
  {
    name: 'Botanical & Sage',
    colors: [
      { name: 'Sage Green', hex: '#4F6F52' },
      { name: 'Soft Moss', hex: '#8A9A5B' },
      { name: 'Deep Forest', hex: '#2D5A27' },
      { name: 'Olive Leaf', hex: '#708238' },
      { name: 'Earthy Tea', hex: '#5B8266' },
      { name: 'Fresh Mint', hex: '#A7D7C5' },
      { name: 'Meadow', hex: '#B5C99A' }
    ]
  },
  {
    name: 'Serene Ocean & Sky',
    colors: [
      { name: 'Sky Breeze', hex: '#8ECAE6' },
      { name: 'Ocean Teal', hex: '#219EBC' },
      { name: 'Deep Indigo', hex: '#1D3557' },
      { name: 'Periwinkle', hex: '#90A4AE' },
      { name: 'Soft Lavender', hex: '#B39DDB' },
      { name: 'Slate Blue', hex: '#4A5568' },
      { name: 'Denim', hex: '#457B9D' }
    ]
  },
  {
    name: 'Pastels & Rose',
    colors: [
      { name: 'Blush Pink', hex: '#FAD2E1' },
      { name: 'Dusty Rose', hex: '#E8A7A1' },
      { name: 'Soft Lilac', hex: '#D0D1FF' },
      { name: 'Buttercup', hex: '#FFF1E6' },
      { name: 'Warm Cream', hex: '#FAF0CA' },
      { name: 'Muted Iris', hex: '#CDB4DB' },
      { name: 'Soft Coral', hex: '#FFB5A7' }
    ]
  },
  {
    name: 'Midnight & Neutrals',
    colors: [
      { name: 'Midnight Navy', hex: '#111827' },
      { name: 'Deep Charcoal', hex: '#374151' },
      { name: 'Warm Stone', hex: '#78716C' },
      { name: 'Pebble Gray', hex: '#9CA3AF' },
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Soft Gold', hex: '#D4AF37' },
      { name: 'Dark Plum', hex: '#4A154B' }
    ]
  }
];

/* =========================================================================
   TEMPLATES DEFINITIONS (8 Original Vector Handcrafted Templates)
   ========================================================================= */

const TEMPLATES = [
  {
    id: 'botanical',
    name: '🌿 Botanical Branch',
    desc: 'Graceful flowing leaves and sanctuary vines'
  },
  {
    id: 'mandala',
    name: '🌸 Sacred Mandala',
    desc: 'Radial flower petals for mindful centering'
  },
  {
    id: 'butterfly',
    name: '🦋 Peaceful Butterfly',
    desc: 'Symmetrical wings and gentle flutter'
  },
  {
    id: 'moon_stars',
    name: '🌙 Moon & Constellations',
    desc: 'Crescent moon floating in a starry sky'
  },
  {
    id: 'bear',
    name: '🐻 Forest Friend',
    desc: 'A gentle bear crowned with wildflowers'
  },
  {
    id: 'cottage',
    name: '🏡 Cozy Sanctuary Cottage',
    desc: 'A peaceful little house surrounded by gardens'
  },
  {
    id: 'tree_of_life',
    name: '🌳 Tree of Stillness',
    desc: 'Ancient rooted tree with spreading canopy'
  },
  {
    id: 'lotus',
    name: '🪷 Water Lotus',
    desc: 'Radiant lotus floating on tranquil water'
  }
];

export default function ColorCalm() {
  const { theme } = useTheme();
  const isNight = theme === themes.NIGHT_REFLECTION;

  const [currentView, setCurrentView] = useState('gallery'); // 'gallery' | 'canvas'
  const [selectedTemplateId, setSelectedTemplateId] = useState('botanical');
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [activeColor, setActiveColor] = useState(PALETTE_CATEGORIES[0].colors[0].hex);
  
  // Custom fills mapped by `templateId_pathId`
  const [fills, setFills] = useState({});
  const [history, setHistory] = useState([]);

  const strokeColor = isNight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(46, 28, 18, 0.45)';
  const getFill = (pathId) => fills[`${selectedTemplateId}_${pathId}`] || (isNight ? 'rgba(255,255,255,0.03)' : '#FFFFFF');

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setCurrentView('canvas');
  };

  const handlePathClick = (pathId) => {
    const key = `${selectedTemplateId}_${pathId}`;
    const prevColor = fills[key] || (isNight ? 'rgba(255,255,255,0.03)' : '#FFFFFF');
    const nextFills = { ...fills, [key]: activeColor };
    
    setHistory(prev => [...prev, { templateId: selectedTemplateId, pathId, prevColor }]);
    setFills(nextFills);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const nextHistory = [...history];
    const lastAction = nextHistory.pop();
    
    const key = `${lastAction.templateId}_${lastAction.pathId}`;
    setFills(prev => {
      const next = { ...prev };
      next[key] = lastAction.prevColor;
      return next;
    });
    setHistory(nextHistory);
  };

  const handleClearCurrentTemplate = () => {
    setFills(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${selectedTemplateId}_`)) {
          delete next[k];
        }
      });
      return next;
    });
    setHistory(prev => prev.filter(h => h.templateId !== selectedTemplateId));
  };

  /* =========================================================================
     TEMPLATE SVG RENDERERS
     ========================================================================= */

  const renderSVG = (templateId) => {
    const renderPath = (id, d, extraClass = "") => (
      <path
        key={id}
        id={id}
        d={d}
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={getFill(id)}
        onClick={() => handlePathClick(id)}
        className={`cursor-pointer hover:opacity-80 transition-all ${extraClass}`}
      />
    );

    const renderCircle = (id, cx, cy, r) => (
      <circle
        key={id}
        id={id}
        cx={cx}
        cy={cy}
        r={r}
        stroke={strokeColor}
        strokeWidth="1.2"
        fill={getFill(id)}
        onClick={() => handlePathClick(id)}
        className="cursor-pointer hover:opacity-80 transition-all"
      />
    );

    switch (templateId) {
      // 1. Botanical
      case 'botanical':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            <path d="M 50,95 Q 48,50 50,5" stroke={strokeColor} strokeWidth="2" fill="none" />
            {[
              { id: 'b_l1', d: 'M 49,85 C 32,80 26,90 15,84 C 28,95 42,92 49,85 Z' },
              { id: 'b_l2', d: 'M 49,68 C 30,58 20,68 10,60 C 22,76 38,72 49,68 Z' },
              { id: 'b_l3', d: 'M 49,50 C 30,38 24,50 14,42 C 26,56 40,54 49,50 Z' },
              { id: 'b_l4', d: 'M 49,32 C 34,22 28,32 18,26 C 30,38 42,36 49,32 Z' },
              { id: 'b_l5', d: 'M 50,15 C 38,8 35,16 26,12 C 36,22 46,20 50,15 Z' },
              { id: 'b_r1', d: 'M 51,78 C 68,72 74,82 85,76 C 72,88 58,84 51,78 Z' },
              { id: 'b_r2', d: 'M 51,60 C 70,52 76,62 88,54 C 76,70 60,66 51,60 Z' },
              { id: 'b_r3', d: 'M 51,42 C 70,32 76,44 86,36 C 74,50 60,46 51,42 Z' },
              { id: 'b_r4', d: 'M 51,24 C 66,16 70,26 80,20 C 70,32 58,28 51,24 Z' },
              { id: 'b_top', d: 'M 50,5 C 44,-2 56,-2 50,5 Z' }
            ].map(p => renderPath(p.id, p.d))}
            {renderCircle('b_c1', 35, 75, 3)}
            {renderCircle('b_c2', 65, 50, 3)}
            {renderCircle('b_c3', 35, 38, 3)}
          </svg>
        );

      // 2. Mandala
      case 'mandala':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {renderCircle('m_center', 50, 50, 8)}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <path
                key={`m_in_${i}`}
                id={`m_in_${i}`}
                d="M 50,50 C 42,34 58,34 50,50 Z"
                transform={`rotate(${angle} 50 50)`}
                stroke={strokeColor}
                strokeWidth="1"
                fill={getFill(`m_in_${i}`)}
                onClick={() => handlePathClick(`m_in_${i}`)}
                className="cursor-pointer hover:opacity-80 transition-all"
              />
            ))}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <path
                key={`m_out_${i}`}
                id={`m_out_${i}`}
                d="M 50,50 C 38,18 62,18 50,50 Z"
                transform={`rotate(${angle + 15} 50 50)`}
                stroke={strokeColor}
                strokeWidth="1"
                fill={getFill(`m_out_${i}`)}
                onClick={() => handlePathClick(`m_out_${i}`)}
                className="cursor-pointer hover:opacity-80 transition-all"
              />
            ))}
          </svg>
        );

      // 3. Butterfly
      case 'butterfly':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {renderPath('bf_body', 'M 50,20 C 47,35 47,65 50,80 C 53,65 53,35 50,20 Z')}
            {renderCircle('bf_head', 50, 16, 4)}
            {renderPath('bf_ant_l', 'M 49,14 Q 40,6 36,8', 'fill-none')}
            {renderPath('bf_ant_r', 'M 51,14 Q 60,6 64,8', 'fill-none')}
            {/* Left Top Wing */}
            {renderPath('bf_wtl1', 'M 48,26 C 28,10 10,25 20,48 C 32,46 42,38 48,26 Z')}
            {renderPath('bf_wtl2', 'M 22,28 C 30,22 38,32 32,42 C 24,42 18,34 22,28 Z')}
            {/* Right Top Wing */}
            {renderPath('bf_wtr1', 'M 52,26 C 72,10 90,25 80,48 C 68,46 58,38 52,26 Z')}
            {renderPath('bf_wtr2', 'M 78,28 C 70,22 62,32 68,42 C 76,42 82,34 78,28 Z')}
            {/* Left Bottom Wing */}
            {renderPath('bf_wbl1', 'M 48,50 C 25,52 20,78 40,82 C 46,74 48,60 48,50 Z')}
            {renderPath('bf_wbl2', 'M 32,60 C 38,58 42,68 38,74 C 30,74 28,66 32,60 Z')}
            {/* Right Bottom Wing */}
            {renderPath('bf_wbr1', 'M 52,50 C 75,52 80,78 60,82 C 54,74 52,60 52,50 Z')}
            {renderPath('bf_wbr2', 'M 68,60 C 62,58 58,68 62,74 C 70,74 72,66 68,60 Z')}
          </svg>
        );

      // 4. Moon & Stars
      case 'moon_stars':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {/* Crescent Moon */}
            {renderPath('ms_moon', 'M 45,10 A 38,38 0 1,0 80,68 A 32,32 0 1,1 45,10 Z')}
            {/* Sleeping Face contour */}
            {renderPath('ms_eye', 'M 44,42 Q 49,46 54,42', 'fill-none')}
            {renderPath('ms_smile', 'M 46,55 Q 50,59 54,55', 'fill-none')}
            {/* Clouds at bottom */}
            {renderPath('ms_c1', 'M 15,80 A 12,12 0 0,1 38,72 A 15,15 0 0,1 68,75 A 12,12 0 0,1 85,82 L 15,82 Z')}
            {renderPath('ms_c2', 'M 30,85 A 10,10 0 0,1 50,80 A 14,14 0 0,1 75,82 L 30,85 Z')}
            {/* Stars */}
            {renderPath('ms_s1', 'M 22,25 L 24,31 L 30,31 L 25,35 L 27,41 L 22,37 L 17,41 L 19,35 L 14,31 L 20,31 Z')}
            {renderPath('ms_s2', 'M 78,20 L 79,24 L 83,24 L 80,27 L 81,31 L 78,28 L 75,31 L 76,27 L 73,24 L 77,24 Z')}
            {renderPath('ms_s3', 'M 82,48 L 83,52 L 87,52 L 84,55 L 85,59 L 82,56 L 79,59 L 80,55 L 77,52 L 81,52 Z')}
          </svg>
        );

      // 5. Forest Bear
      case 'bear':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {/* Bear Head & Ears */}
            {renderCircle('bear_ear_l', 32, 28, 11)}
            {renderCircle('bear_ear_l_in', 32, 28, 6)}
            {renderCircle('bear_ear_r', 68, 28, 11)}
            {renderCircle('bear_ear_r_in', 68, 28, 6)}
            {renderCircle('bear_head', 50, 52, 28)}
            {/* Snout */}
            {renderCircle('bear_snout', 50, 60, 12)}
            {renderCircle('bear_nose', 50, 54, 4)}
            {renderPath('bear_mouth', 'M 50,58 L 50,65 M 46,63 Q 50,67 54,63', 'fill-none')}
            {/* Eyes & Cheeks */}
            {renderPath('bear_eye_l', 'M 38,46 Q 42,43 46,46', 'fill-none')}
            {renderPath('bear_eye_r', 'M 54,46 Q 58,43 62,46', 'fill-none')}
            {renderCircle('bear_cheek_l', 34, 56, 4)}
            {renderCircle('bear_cheek_r', 66, 56, 4)}
            {/* Flower Crown */}
            {renderCircle('bear_fl_1', 40, 26, 4)}
            {renderCircle('bear_fl_2', 50, 24, 5)}
            {renderCircle('bear_fl_3', 60, 26, 4)}
          </svg>
        );

      // 6. Sanctuary Cottage
      case 'cottage':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {/* Roof & Chimney */}
            {renderPath('cot_chim', 'M 65,22 L 65,12 L 72,12 L 72,28 Z')}
            {renderPath('cot_roof', 'M 50,15 L 20,40 L 80,40 Z')}
            {/* Walls & Door */}
            {renderPath('cot_wall', 'M 26,40 L 26,80 L 74,80 L 74,40 Z')}
            {renderPath('cot_door', 'M 44,56 A 6,6 0 0,1 56,56 L 56,80 L 44,80 Z')}
            {/* Windows */}
            {renderPath('cot_win_l', 'M 30,50 L 38,50 L 38,60 L 30,60 Z')}
            {renderPath('cot_win_r', 'M 62,50 L 70,50 L 70,60 L 62,60 Z')}
            {/* Garden shrubs */}
            {renderCircle('cot_shrub_l', 20, 80, 8)}
            {renderCircle('cot_shrub_r', 80, 80, 8)}
            {renderPath('cot_path', 'M 45,80 Q 40,92 35,96 L 65,96 Q 60,92 55,80 Z')}
          </svg>
        );

      // 7. Tree of Life
      case 'tree_of_life':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {/* Trunk & Roots */}
            {renderPath('tree_trunk', 'M 45,55 Q 40,75 30,90 L 70,90 Q 60,75 55,55 Z')}
            {/* Foliage Canopy Clusters */}
            {renderCircle('tree_can_mid', 50, 30, 16)}
            {renderCircle('tree_can_tl', 34, 32, 13)}
            {renderCircle('tree_can_tr', 66, 32, 13)}
            {renderCircle('tree_can_bl', 28, 46, 12)}
            {renderCircle('tree_can_br', 72, 46, 12)}
            {renderCircle('tree_can_top', 50, 16, 11)}
            {/* Heart in trunk */}
            {renderPath('tree_heart', 'M 50,68 C 47,64 42,66 45,71 L 50,76 L 55,71 C 58,66 53,64 50,68 Z')}
          </svg>
        );

      // 8. Lotus on Water
      case 'lotus':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full max-h-[380px] drop-shadow-sm">
            {/* Water waves */}
            {renderPath('lot_w1', 'M 10,82 Q 30,78 50,82 Q 70,86 90,82', 'fill-none')}
            {renderPath('lot_w2', 'M 20,88 Q 40,84 60,88 Q 80,92 100,88', 'fill-none')}
            {/* Lily Pad Base */}
            {renderPath('lot_pad', 'M 20,80 C 10,75 10,85 50,86 C 90,85 90,75 80,80 Z')}
            {/* Lotus Petals Center & Sides */}
            {renderPath('lot_p_mid', 'M 50,30 C 42,48 42,68 50,78 C 58,68 58,48 50,30 Z')}
            {renderPath('lot_p_l1', 'M 50,78 C 38,70 32,52 38,40 C 45,55 48,68 50,78 Z')}
            {renderPath('lot_p_r1', 'M 50,78 C 62,70 68,52 62,40 C 55,55 52,68 50,78 Z')}
            {renderPath('lot_p_l2', 'M 50,78 C 30,76 22,64 26,54 C 36,65 44,72 50,78 Z')}
            {renderPath('lot_p_r2', 'M 50,78 C 70,76 78,64 74,54 C 64,65 56,72 50,78 Z')}
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden select-none">
      
      {/* VIEW 1: TEMPLATE GALLERY */}
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
              Choose a Canvas
            </h2>
            <p className={`text-xs md:text-sm font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/75'}`}>
              Select an original template to begin filling with calming, peaceful tones.
            </p>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-8">
            {TEMPLATES.map((tmpl) => (
              <motion.div
                key={tmpl.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={`cursor-pointer rounded-2xl p-4 border flex flex-col justify-between items-center text-center transition-all ${
                  isNight
                    ? 'bg-[#151a26]/80 hover:bg-[#1c2436] border-white/10 hover:border-white/25 shadow-md'
                    : 'bg-white/90 hover:bg-white border-[#2E1C12]/10 hover:border-[#A65D40]/30 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="w-20 h-20 mb-3 flex items-center justify-center p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                  {renderSVG(tmpl.id)}
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold tracking-wide">
                    {tmpl.name}
                  </h3>
                  <p className={`text-[10.5px] leading-tight font-light line-clamp-2 ${
                    isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'
                  }`}>
                    {tmpl.desc}
                  </p>
                </div>

                <span className={`mt-3 text-[11px] font-semibold flex items-center gap-1 ${
                  isNight ? 'text-sky-300' : 'text-[#8E4B31]'
                }`}>
                  Color →
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* VIEW 2: ACTIVE COLORING CANVAS */}
      {currentView === 'canvas' && (
        <motion.div
          key="canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex flex-col items-center justify-between"
        >
          {/* Top Control Bar */}
          <div className="w-full max-w-2xl flex items-center justify-between px-4 py-2.5 z-20 border-b border-black/5 dark:border-white/5">
            <button
              onClick={() => setCurrentView('gallery')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                isNight 
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10' 
                  : 'bg-white/80 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-white'
              }`}
            >
              <Grid size={13} />
              <span>Templates</span>
            </button>

            <span className="font-heading text-sm font-semibold tracking-wide truncate">
              {TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndo}
                disabled={history.filter(h => h.templateId === selectedTemplateId).length === 0}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  history.filter(h => h.templateId === selectedTemplateId).length === 0
                    ? 'opacity-35 cursor-not-allowed border-transparent'
                    : (isNight ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/80 border-[#2E1C12]/10 text-[#3D2A1D] hover:bg-white')
                }`}
                title="Undo last fill"
              >
                <Undo2 size={14} />
              </button>

              <button
                onClick={handleClearCurrentTemplate}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  isNight ? 'bg-white/5 border-white/10 text-red-300 hover:bg-red-500/10' : 'bg-white/80 border-red-200 text-red-700 hover:bg-red-50'
                }`}
                title="Reset template colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="flex-1 w-full max-w-[420px] flex items-center justify-center p-4 z-10">
            {renderSVG(selectedTemplateId)}
          </div>

          {/* Bottom Palette System */}
          <div className={`w-full max-w-2xl px-4 py-3 border-t z-20 flex flex-col items-center gap-2.5 backdrop-blur-xl ${
            isNight ? 'bg-[#0B1120]/90 border-white/5' : 'bg-[#FCF8F2]/90 border-[#2E1C12]/5'
          }`}>
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1">
              {PALETTE_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategoryIdx(idx)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    activeCategoryIdx === idx
                      ? (isNight ? 'bg-white text-black font-semibold' : 'bg-[#4F6F52] text-white font-semibold')
                      : (isNight ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-[#3D2A1D]/65 hover:text-[#3D2A1D] hover:bg-black/5')
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Colors in Active Category */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {PALETTE_CATEGORIES[activeCategoryIdx].colors.map((c) => {
                const isSelected = activeColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => setActiveColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform duration-200 relative flex items-center justify-center shadow-xs ${
                      isSelected 
                        ? 'scale-125 ring-2 ring-offset-2 ring-primary ring-offset-background shadow-md' 
                        : 'hover:scale-110'
                    }`}
                    title={c.name}
                  >
                    {isSelected && (
                      <Check 
                        size={12} 
                        className={c.hex === '#FFFFFF' || c.hex === '#FAF0CA' || c.hex === '#FFF1E6' ? 'text-black' : 'text-white'} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
