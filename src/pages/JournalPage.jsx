import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { themes as themeConstants } from '../constants/themes';
import api from '../services/api';
import { Sidebar } from '../components/chat/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trash2, Search, Check, Plus, ArrowLeft 
} from 'lucide-react';

const JOURNAL_PROMPTS = [
  { id: 'truth', label: '🌿 Quiet Truth', text: 'What is one quiet truth you noticed about yourself today?' },
  { id: 'heavy', label: '🕯️ Releasing Weight', text: 'What feels heavy right now, and what would it look like to gently release a fraction of it?' },
  { id: 'gratitude', label: '💫 Still Gratitude', text: 'A small, unhurried moment today that brought you peace or comfort.' },
  { id: 'growth', label: '🧭 Self Understanding', text: 'What is a lesson or shift you are currently navigating in your life?' },
  { id: 'free', label: '✨ Freewrite', text: '' },
];

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', icon: '🕊️', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20' },
  { id: 'reflective', label: 'Reflective', icon: '🌿', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/20' },
  { id: 'hopeful', label: 'Hopeful', icon: '🌅', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' },
  { id: 'grateful', label: 'Grateful', icon: '💫', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20' },
  { id: 'seeking-clarity', label: 'Seeking Clarity', icon: '🕯️', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20' },
  { id: 'heavy', label: 'Heavy', icon: '🌧️', color: 'bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20' },
];

export const JournalPage = () => {
  const { theme } = useTheme();
  const isNight = theme === themeConstants.NIGHT_REFLECTION;
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Journal state
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isWriting, setIsWriting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('reflective');
  const [selectedPrompt, setSelectedPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [withAiEcho, setWithAiEcho] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEchoing, setIsEchoing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');

  // Load conversations for Sidebar
  useEffect(() => {
    const loadConversations = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await api.get('/api/chat');
        setConversations(res.data.data);
      } catch (err) {
        console.error('Failed to load conversations for sidebar:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadConversations();
  }, []);

  // Load journal entries
  const fetchEntries = async () => {
    setLoadingEntries(true);
    try {
      const res = await api.get('/api/journal');
      setEntries(res.data.data || []);
      if (res.data.data && res.data.data.length > 0 && !selectedEntry && !isWriting) {
        setSelectedEntry(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSelectConversation = (conversationId) => {
    localStorage.setItem('wisdom_current_conversation_id', conversationId);
    navigate('/chat');
  };

  const handleNewConversation = () => {
    localStorage.removeItem('wisdom_current_conversation_id');
    navigate('/chat');
  };

  const handleStartWriting = (promptObj = null) => {
    const p = promptObj || JOURNAL_PROMPTS[0];
    setSelectedPrompt(p);
    setTitle(`Reflections — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`);
    setContent('');
    setSelectedMood('reflective');
    setIsWriting(true);
    setSelectedEntry(null);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.post('/api/journal', {
        title: title.trim() || `Reflections — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
        content: content.trim(),
        mood: selectedMood,
        prompt: selectedPrompt.text,
        withAiEcho: withAiEcho,
      });

      const newEntry = res.data.data;
      setEntries(prev => [newEntry, ...prev]);
      setSelectedEntry(newEntry);
      setIsWriting(false);
      setContent('');

      // If AI echo was requested, poll for it in background after 2.5s
      if (withAiEcho) {
        setIsEchoing(true);
        setTimeout(async () => {
          try {
            const entryRes = await api.get(`/api/journal/${newEntry._id}`);
            if (entryRes.data?.data) {
              const updated = entryRes.data.data;
              setSelectedEntry(updated);
              setEntries(prev => prev.map(item => item._id === updated._id ? updated : item));
            }
          } catch (err) {
            console.error('Failed to retrieve async echo:', err);
          } finally {
            setIsEchoing(false);
          }
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      await api.delete(`/api/journal/${id}`);
      const remaining = entries.filter(entry => entry._id !== id);
      setEntries(remaining);
      if (selectedEntry?._id === id) {
        setSelectedEntry(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
    }
  };

  const handleGenerateEchoForSelected = async () => {
    if (!selectedEntry) return;
    setIsEchoing(true);
    try {
      const res = await api.post(`/api/journal/${selectedEntry._id}/echo`);
      const updated = res.data.data;
      setSelectedEntry(updated);
      setEntries(prev => prev.map(item => item._id === updated._id ? updated : item));
    } catch (err) {
      console.error('Failed to generate wisdom echo:', err);
    } finally {
      setIsEchoing(false);
    }
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.prompt && entry.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMood = filterMood === 'all' || entry.mood === filterMood;
      return matchesSearch && matchesMood;
    });
  }, [entries, searchQuery, filterMood]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`h-screen w-full flex overflow-hidden transition-colors duration-700 ${isNight ? 'bg-[#0B1120] text-white' : 'bg-[#FCF8F2] text-[#2F2018]'}`}>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full flex-shrink-0 min-h-0">
        <Sidebar 
          conversations={conversations}
          currentConversationId={null}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isHistoryLoading={isHistoryLoading}
        />
      </div>

      {/* Sliding Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 h-full flex-shrink-0"
            >
              <Sidebar 
                conversations={conversations}
                currentConversationId={null}
                onSelectConversation={(id) => {
                  handleSelectConversation(id);
                  setIsSidebarOpen(false);
                }}
                onNewConversation={() => {
                  handleNewConversation();
                  setIsSidebarOpen(false);
                }}
                isHistoryLoading={isHistoryLoading}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Journal Workspace */}
      <main className="flex-1 min-w-0 h-full flex flex-col min-h-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#3D2A1D]'}`}
              aria-label="Open navigation sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-wide flex items-center gap-2">
                <span>📖</span> Personal Sanctuary Journal
              </h1>
              <p className={`text-xs ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                A private haven for honest thoughts, stillness, and growth.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isWriting && (
              <button
                onClick={() => handleStartWriting()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm ${
                  isNight
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                }`}
              >
                <Plus size={14} /> Write Entry
              </button>
            )}
          </div>
        </header>

        {/* Main Content Split: Left Entries List / Right Editor or Reader */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          
          {/* Entries Navigation Column (Left / Slide) */}
          <section className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-black/5 dark:border-white/5 h-full ${
            isWriting && 'hidden md:flex'
          }`}>
            {/* Search & Mood Filter */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search journal entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none border transition-colors ${
                    isNight
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent'
                      : 'bg-black/5 border-[#2E1C12]/10 text-[#3D2A1D] placeholder:text-[#3D2A1D]/40 focus:border-[#A65D40]'
                  }`}
                />
                <Search size={13} className={`absolute left-3 top-2.5 ${isNight ? 'text-white/30' : 'text-[#3D2A1D]/40'}`} />
              </div>

              {/* Quick Mood Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setFilterMood('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                    filterMood === 'all'
                      ? (isNight ? 'bg-white/20 text-white' : 'bg-[#A65D40] text-white')
                      : (isNight ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-[#3D2A1D]/60 hover:bg-black/10')
                  }`}
                >
                  All ({entries.length})
                </button>
                {MOODS.map(m => {
                  const count = entries.filter(e => e.mood === m.id).length;
                  if (count === 0 && filterMood !== m.id) return null;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setFilterMood(filterMood === m.id ? 'all' : m.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                        filterMood === m.id
                          ? (isNight ? 'bg-white/20 text-white' : 'bg-[#A65D40] text-white')
                          : (isNight ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-[#3D2A1D]/60 hover:bg-black/10')
                      }`}
                    >
                      <span>{m.icon}</span> {m.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entries List */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
              {loadingEntries ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="p-4 rounded-xl animate-pulse space-y-2 bg-black/5 dark:bg-white/5">
                      <div className="h-4 w-3/4 rounded bg-black/10 dark:bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-black/5 dark:bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <span className="text-3xl block">🌱</span>
                  <p className={`text-xs ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                    {searchQuery ? 'No entries match your search.' : 'No reflections written yet.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => handleStartWriting()}
                      className={`text-xs font-semibold underline underline-offset-4 ${isNight ? 'text-accent' : 'text-[#A65D40]'}`}
                    >
                      Write your first entry
                    </button>
                  )}
                </div>
              ) : (
                filteredEntries.map(entry => {
                  const isSelected = selectedEntry?._id === entry._id && !isWriting;
                  const moodObj = MOODS.find(m => m.id === entry.mood) || MOODS[1];
                  return (
                    <div
                      key={entry._id}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsWriting(false);
                      }}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border relative ${
                        isSelected
                          ? (isNight ? 'bg-white/10 border-white/20 shadow-md' : 'bg-white border-[#2E1C12]/15 shadow-sm')
                          : (isNight ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07]' : 'bg-white/40 border-black/5 hover:bg-white/70')
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-medium text-xs md:text-sm line-clamp-1 flex-1">
                          {entry.title}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${moodObj.color}`}>
                          <span>{moodObj.icon}</span> {moodObj.label}
                        </span>
                      </div>
                      
                      <p className={`text-[12px] line-clamp-2 leading-relaxed mb-2 font-light ${
                        isNight ? 'text-white/70' : 'text-[#3D2A1D]/75'
                      }`}>
                        {entry.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] opacity-60">
                        <span>{formatDate(entry.createdAt)}</span>
                        {entry.aiEcho && (
                          <span className="flex items-center gap-1 text-accent font-medium">
                            <Sparkles size={11} /> Echoed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Workspace: Entry Viewer OR Editor */}
          <section className="flex-1 min-w-0 h-full flex flex-col overflow-y-auto p-4 md:p-8" data-lenis-prevent>
            <AnimatePresence mode="wait">
              {isWriting ? (
                /* WRITING FORM */
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto w-full space-y-6 pb-20"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsWriting(false)}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                        isNight ? 'text-white/60 hover:text-white' : 'text-[#3D2A1D]/60 hover:text-[#3D2A1D]'
                      }`}
                    >
                      <ArrowLeft size={14} /> Back to Entries
                    </button>
                    <span className="text-xs font-light tracking-wide opacity-50">
                      {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Prompt selection pills */}
                  <div className="space-y-2">
                    <span className={`text-[11px] uppercase tracking-wider font-bold ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                      Choose a gentle prompt (optional)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {JOURNAL_PROMPTS.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPrompt(p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            selectedPrompt.id === p.id
                              ? (isNight ? 'bg-white/20 text-white border border-white/30' : 'bg-[#A65D40] text-white shadow-sm')
                              : (isNight ? 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10' : 'bg-black/5 text-[#3D2A1D]/80 border border-black/5 hover:bg-black/10')
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Prompt Box */}
                  {selectedPrompt.text && (
                    <div className={`p-4 rounded-2xl border font-body text-sm leading-relaxed ${
                      isNight ? 'bg-white/5 border-white/10 text-white/90' : 'bg-amber-50/60 border-amber-200/50 text-[#3D2A1D]'
                    }`}>
                      <span className="text-xs font-semibold block mb-1 opacity-70">Prompt:</span>
                      "{selectedPrompt.text}"
                    </div>
                  )}

                  {/* Mood Selector */}
                  <div className="space-y-2">
                    <span className={`text-[11px] uppercase tracking-wider font-bold ${isNight ? 'text-white/40' : 'text-[#3D2A1D]/50'}`}>
                      How does your heart feel right now?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMood(m.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                            selectedMood === m.id
                              ? `${m.color} ring-2 ring-current font-bold scale-[1.03]`
                              : (isNight ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-black/5 border-black/5 text-[#3D2A1D]/70 hover:bg-black/10')
                          }`}
                        >
                          <span>{m.icon}</span> {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Journal Input Form */}
                  <form onSubmit={handleSaveEntry} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Title for this reflection..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl text-base font-heading font-semibold outline-none border transition-colors ${
                          isNight
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent'
                            : 'bg-white border-[#2E1C12]/10 text-[#3D2A1D] placeholder:text-[#3D2A1D]/40 focus:border-[#A65D40]'
                        }`}
                      />
                    </div>

                    <div>
                      <textarea
                        rows={10}
                        placeholder="Pour your honest thoughts here. Nobody is grading you, nobody is judging you..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`w-full p-5 rounded-2xl text-sm md:text-base leading-relaxed outline-none border resize-none transition-colors ${
                          isNight
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-accent'
                            : 'bg-white border-[#2E1C12]/10 text-[#3D2A1D] placeholder:text-[#3D2A1D]/40 focus:border-[#A65D40]'
                        }`}
                        required
                      />
                    </div>

                    {/* AI Echo Toggle */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isNight ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/5'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">✨</span>
                        <div>
                          <span className="text-xs font-semibold block">Wisdom's Gentle Echo</span>
                          <span className={`text-[11px] block font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
                            Let Wisdom AI write a peaceful, compassionate reflection on your words.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWithAiEcho(!withAiEcho)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                          withAiEcho 
                            ? (isNight ? 'bg-accent' : 'bg-[#A65D40]') 
                            : (isNight ? 'bg-white/10' : 'bg-black/10')
                        }`}
                      >
                        <motion.div 
                          layout
                          className={`w-4 h-4 rounded-full bg-white shadow-sm ${withAiEcho ? 'ml-auto' : 'ml-0'}`} 
                        />
                      </button>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsWriting(false)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          isNight ? 'hover:bg-white/10 text-white/70' : 'hover:bg-black/5 text-[#3D2A1D]/70'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || !content.trim()}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md disabled:opacity-50 ${
                          isNight
                            ? 'bg-white text-black hover:bg-neutral-200'
                            : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <span className="animate-spin text-sm">✦</span> Saving reflection...
                          </>
                        ) : (
                          <>
                            <Check size={14} /> Save to Sanctuary
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : selectedEntry ? (
                /* SELECTED ENTRY VIEWER */
                <motion.div
                  key={selectedEntry._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto w-full space-y-8 pb-20"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const moodObj = MOODS.find(m => m.id === selectedEntry.mood) || MOODS[1];
                          return (
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1 font-medium ${moodObj.color}`}>
                              <span>{moodObj.icon}</span> {moodObj.label}
                            </span>
                          );
                        })()}
                        <span className={`text-xs font-light ${isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'}`}>
                          {formatDate(selectedEntry.createdAt)}
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">
                        {selectedEntry.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleDeleteEntry(selectedEntry._id, e)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isNight
                            ? 'border-white/10 hover:bg-red-500/10 text-red-400'
                            : 'border-black/10 hover:bg-red-50 text-red-600'
                        }`}
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Reference if exists */}
                  {selectedEntry.prompt && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-body ${
                      isNight ? 'bg-white/5 border-white/5 text-white/70' : 'bg-amber-50/40 border-[#2E1C12]/5 text-[#3D2A1D]/80'
                    }`}>
                      <span className="font-semibold block mb-1 opacity-60">Prompt contemplated:</span>
                      "{selectedEntry.prompt}"
                    </div>
                  )}

                  {/* Journal Body Content */}
                  <div className={`p-6 md:p-8 rounded-3xl border font-body text-[15px] md:text-[16px] leading-[1.8] whitespace-pre-wrap ${
                    isNight 
                      ? 'bg-[#1E2530]/40 border-white/10 shadow-glass text-white/90' 
                      : 'bg-white/80 border-[#2E1C12]/10 shadow-soft text-[#2F2018]'
                  }`}>
                    {selectedEntry.content}
                  </div>

                  {/* Wisdom's Gentle Echo Card */}
                  <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden font-body ${
                    isNight
                      ? 'bg-gradient-to-br from-[#1b2338] to-[#121624] border-accent/20 shadow-glass'
                      : 'bg-gradient-to-br from-[#FFF9F2] to-[#F5ECE1] border-[#A65D40]/20 shadow-soft'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className={isNight ? 'text-accent' : 'text-[#A65D40]'} />
                        <h3 className="font-heading text-base font-bold tracking-wide">
                          Wisdom's Gentle Echo
                        </h3>
                      </div>
                      {!selectedEntry.aiEcho && !isEchoing && (
                        <button
                          onClick={handleGenerateEchoForSelected}
                          disabled={isEchoing}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors flex items-center gap-1.5 ${
                            isNight 
                              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                              : 'bg-white hover:bg-stone-50 text-[#3D2A1D] border-stone-200'
                          }`}
                        >
                          Ask Wisdom to Reflect
                        </button>
                      )}
                    </div>

                    {selectedEntry.aiEcho ? (
                      <p className={`text-sm md:text-[14.5px] leading-relaxed italic ${
                        isNight ? 'text-white/90 font-light' : 'text-[#3D2A1D]/90'
                      }`}>
                        "{selectedEntry.aiEcho}"
                      </p>
                    ) : isEchoing ? (
                      <p className={`text-xs leading-relaxed italic animate-pulse flex items-center gap-2 ${
                        isNight ? 'text-accent' : 'text-[#A65D40]'
                      }`}>
                        <span>✨</span> Wisdom is quietly reflecting on your words...
                      </p>
                    ) : (
                      <p className={`text-xs leading-relaxed font-light ${
                        isNight ? 'text-white/50' : 'text-[#3D2A1D]/60'
                      }`}>
                        Wisdom AI has not echoed this entry yet. Tap above whenever you'd like a peaceful reflection.
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* EMPTY SELECTION STATE */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6"
                >
                  <span className="text-5xl select-none">🌿</span>
                  <div className="max-w-md space-y-2">
                    <h3 className="font-heading text-2xl font-medium">Your Sanctuary is Quiet</h3>
                    <p className={`text-sm leading-relaxed font-light ${isNight ? 'text-white/60' : 'text-[#3D2A1D]/70'}`}>
                      Whenever the world feels loud, take a seat here. A few sentences can bring profound clarity.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartWriting()}
                    className={`px-8 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-md ${
                      isNight
                        ? 'bg-white text-black hover:bg-neutral-200'
                        : 'bg-[#A65D40] text-white hover:bg-[#8E4B31]'
                    }`}
                  >
                    Begin Writing
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
};

export default JournalPage;
