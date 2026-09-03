import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gift, Sparkles, Brain, Quote, Clipboard, Check, StickyNote,
  Zap, Star, MessageSquare, Send, Eye, EyeOff, X, Plus, Trash2,
  Film, FileText, CalendarX, Cat, Tv, Volume2, Milk, Send as SendIcon,
  Gamepad2, RefreshCw,
} from 'lucide-react';
import {
  ORACLE_PREDICTIONS, MOOD_QUOTES, FRIENDSHIP_TRAITS,
  TELEPATHY_THOUGHTS, PUZZLE_IMAGE, BIRTHDAY_WISHES, DUAS,
  SHYNESS_LEVELS, CHEAT_SCRIPTS, CANCELLATION_REASONS, SILENT_ADVICE,
  KDRAWMA_STATS, DECIBEL_READINGS, KITTEN_MESSAGES,
  LASSI_OVERTHINKING, WHATSAPP_TREAT_MSG,
} from '@/data';

interface Props {
  onRestart: () => void;
}

interface Star { id: number; x: number; y: number; size: number; delay: number; }
interface Petal { id: number; x: number; delay: number; drift: number; emoji: string; }
interface TrailDot { id: number; x: number; y: number; }
interface StickyNote { id: number; text: string; x: number; y: number; z: number; color: string; }
interface WallMsg { id: number; text: string; }
interface Balloon { id: number; emoji: string; }
interface Kitten { id: number; x: number; delay: number; emoji: string; }

export default function GalaxyScreen({ onRestart }: Props) {
  const [stars, setStars] = useState<Star[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [oracleText, setOracleText] = useState('');
  const [giftOpened, setGiftOpened] = useState(false);
  const [giftPoints, setGiftPoints] = useState(0);
  const [wallMsgs, setWallMsgs] = useState<WallMsg[]>([
    { id: 1, text: 'Happy birthday, Tayyaba! You are the best thing that ever happened to me. — Aleezy' },
    { id: 2, text: 'Allah tumhare naseeb aur muqaddar ko tumhari soch se bhi zyada buland banaye. Ameen! ✨' },
  ]);
  const [msgInput, setMsgInput] = useState('');
  const [toast, setToast] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelUp, setLevelUp] = useState('');
  const [vhsMode, setVhsMode] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [telepathyText, setTelepathyText] = useState('');
  const [telepathyLoading, setTelepathyLoading] = useState(false);
  const [moodTag, setMoodTag] = useState('');
  const [moodQuote, setMoodQuote] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [stickies, setStickies] = useState<StickyNote[]>([]);
  const [stickyInput, setStickyInput] = useState('');

  // 10 new feature states
  const [shynessLevel, setShynessLevel] = useState(50);
  const [cheatScript, setCheatScript] = useState('');
  const [cancellationCount, setCancellationCount] = useState(0);
  const [cancellationReason, setCancellationReason] = useState('');
  const [silentAdvice, setSilentAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [kdramaScanning, setKdramaScanning] = useState(false);
  const [kdramaScanned, setKdramaScanned] = useState(false);
  const [decibelReading, setDecibelReading] = useState('');
  const [kittens, setKittens] = useState<Kitten[]>([]);
  const [lassiOverthinking, setLassiOverthinking] = useState('');
  const [wishIdx, setWishIdx] = useState(0);

  // Memory Match game state
  const MEMO_EMOJIS = ['🌸', '🎂', '💖', '🐱', '🥛', '🎬', '🍟', '⭐'];
  const [memoCards, setMemoCards] = useState<{ emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [memoFlipped, setMemoFlipped] = useState<number[]>([]);
  const [memoMoves, setMemoMoves] = useState(0);
  const [memoWon, setMemoWon] = useState(false);

  const initMemoGame = () => {
    const pairs = [...MEMO_EMOJIS, ...MEMO_EMOJIS];
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji) => ({ emoji, flipped: false, matched: false }));
    setMemoCards(shuffled);
    setMemoFlipped([]);
    setMemoMoves(0);
    setMemoWon(false);
  };

  useEffect(() => { initMemoGame(); }, []);

  const flipMemoCard = (idx: number) => {
    if (memoCards[idx].flipped || memoCards[idx].matched || memoFlipped.length === 2) return;
    const newCards = [...memoCards];
    newCards[idx].flipped = true;
    const newFlipped = [...memoFlipped, idx];
    setMemoCards(newCards);
    setMemoFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          setMemoCards((cs) => {
            const updated = [...cs];
            updated[a].matched = true;
            updated[b].matched = true;
            if (updated.every((c) => c.matched)) setMemoWon(true);
            return updated;
          });
          setMemoFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setMemoCards((cs) => {
            const updated = [...cs];
            updated[a].flipped = false;
            updated[b].flipped = false;
            return updated;
          });
          setMemoFlipped([]);
        }, 800);
      }
    }
  };

  const stickyZ = useRef(1);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const clickCount = useRef(0);

  // Generate starfield
  useEffect(() => {
    const s = Array.from({ length: 120 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 3,
    }));
    setStars(s);
  }, []);

  // Falling petals
  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 100,
      emoji: Math.random() > 0.5 ? '🌸' : '🌹',
    }));
    setPetals(p);
  }, []);

  // Mouse trail sparkle
  useEffect(() => {
    let trailId = 0;
    const handler = (e: PointerEvent) => {
      const dot = { id: trailId++, x: e.clientX, y: e.clientY };
      setTrail((t) => [...t.slice(-15), dot]);
      setTimeout(() => setTrail((t) => t.filter((d) => d.id !== dot.id)), 600);
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  // XP tracking via clicks
  useEffect(() => {
    const handler = () => {
      clickCount.current += 1;
      setXp((x) => {
        const newXp = x + 1;
        const newLevel = Math.floor(newXp / 15) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          const titles = ['', 'Friend', 'Close Friend', 'Best Friend', 'Soul Companion', 'Legendary Companion'];
          const title = titles[Math.min(newLevel, titles.length - 1)] || 'Legendary Companion';
          setLevelUp(`Level Up! ${title} Status achieved`);
          setTimeout(() => setLevelUp(''), 3000);
        }
        return newXp;
      });
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [level]);

  // Init puzzle
  useEffect(() => {
    const arr = Array.from({ length: 9 }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPuzzle(arr);
  }, []);

  // Init scratch canvas
  useEffect(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#ccc';
    ctx.font = '16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal the final wish', rect.width / 2, rect.height / 2);
  }, [scratchRevealed]);

  const swapPuzzle = (i: number, j: number) => {
    if (i === j || puzzleSolved) return;
    setPuzzle((p) => {
      const arr = [...p];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      if (arr.every((v, idx) => v === idx)) setPuzzleSolved(true);
      return arr;
    });
  };

  const oraclePredict = () => {
    setOracleText(ORACLE_PREDICTIONS[Math.floor(Math.random() * ORACLE_PREDICTIONS.length)]);
  };

  const openGift = () => {
    if (giftOpened) return;
    setGiftOpened(true);
    setGiftPoints((p) => p + 100);
    setTimeout(() => setGiftOpened(false), 1500);
  };

  const postMsg = () => {
    if (!msgInput.trim()) return;
    setWallMsgs((m) => [...m, { id: Date.now(), text: msgInput.trim() }]);
    setMsgInput('');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast('Link copied! Share it on your WhatsApp status');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Could not copy — long-press the URL bar to copy');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const runTelepathy = () => {
    setTelepathyLoading(true);
    setTelepathyText('');
    setTimeout(() => {
      setTelepathyText(TELEPATHY_THOUGHTS[Math.floor(Math.random() * TELEPATHY_THOUGHTS.length)]);
      setTelepathyLoading(false);
    }, 2000);
  };

  const selectMood = (tag: string) => {
    setMoodTag(tag);
    const q = MOOD_QUOTES.find((m) => m.tag === tag);
    if (q) setMoodQuote(q.text);
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits((t) => {
      const next = t.includes(trait) ? t.filter((x) => x !== trait) : [...t, trait];
      setBalloons(next.map((_, i) => ({ id: i, emoji: '🎈' })));
      return next;
    });
  };

  const addSticky = () => {
    if (!stickyInput.trim()) return;
    const colors = ['#ffd6e6', '#ffc9dd', '#ffa6c4', '#fff5f8', '#ffe4ee'];
    stickyZ.current += 1;
    setStickies((s) => [...s, {
      id: Date.now(), text: stickyInput.trim(),
      x: 10 + Math.random() * 60, y: 10 + Math.random() * 50,
      z: stickyZ.current, color: colors[Math.floor(Math.random() * colors.length)],
    }]);
    setStickyInput('');
  };

  const startStickyDrag = (e: React.PointerEvent, id: number) => {
    e.stopPropagation();
    const note = stickies.find((s) => s.id === id);
    if (!note) return;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      id, offsetX: e.clientX - rect.left - (note.x / 100) * rect.width,
      offsetY: e.clientY - rect.top - (note.y / 100) * rect.height,
    };
    stickyZ.current += 1;
    setStickies((s) => s.map((st) => st.id === id ? { ...st, z: stickyZ.current } : st));
  };

  const onStickyMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragRef.current.offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragRef.current.offsetY) / rect.height) * 100;
    setStickies((s) => s.map((st) =>
      st.id === dragRef.current!.id
        ? { ...st, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(75, y)) }
        : st
    ));
  };

  const scratchFinal = (clientX: number, clientY: number) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 30, 0, Math.PI * 2);
    ctx.fill();
    const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    if (cleared / (imageData.data.length / 4) > 0.35) setScratchRevealed(true);
  };

  // ===== 10 NEW FEATURE HANDLERS =====

  // 1. Shyness meter
  const shynessData = SHYNESS_LEVELS.find((s) => shynessLevel <= s.pct) || SHYNESS_LEVELS[SHYNESS_LEVELS.length - 1];

  // 2. Cheat script
  const revealCheatScript = () => {
    setCheatScript(CHEAT_SCRIPTS[Math.floor(Math.random() * CHEAT_SCRIPTS.length)]);
  };

  // 3. Cancellation tracker
  const trackCancellation = () => {
    setCancellationCount((c) => c + 1);
    setCancellationReason(CANCELLATION_REASONS[Math.floor(Math.random() * CANCELLATION_REASONS.length)]);
  };

  // 4. Silent advisor
  const getSilentAdvice = () => {
    setAdviceLoading(true);
    setSilentAdvice('');
    setTimeout(() => {
      setSilentAdvice(SILENT_ADVICE[Math.floor(Math.random() * SILENT_ADVICE.length)]);
      setAdviceLoading(false);
    }, 2000);
  };

  // 5. K-Drama scanner
  const scanKdrama = () => {
    setKdramaScanning(true);
    setKdramaScanned(false);
    setTimeout(() => {
      setKdramaScanning(false);
      setKdramaScanned(true);
    }, 2500);
  };

  // 7. Decibel decryptor
  const readDecibels = () => {
    setDecibelReading(DECIBEL_READINGS[Math.floor(Math.random() * DECIBEL_READINGS.length)]);
  };

  // 8. Kitten cool-down
  const deployKittens = () => {
    const k: Kitten[] = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      emoji: ['🐱', '😺', '🐈', '😻'][Math.floor(Math.random() * 4)],
    }));
    setKittens(k);
    setTimeout(() => setKittens([]), 5000);
  };

  // 9. Lassi overthinking
  const runLassiSim = () => {
    setLassiOverthinking(LASSI_OVERTHINKING[Math.floor(Math.random() * LASSI_OVERTHINKING.length)]);
  };

  // 10. WhatsApp treat spammer
  const sendTreatMsg = async () => {
    try {
      await navigator.clipboard.writeText(WHATSAPP_TREAT_MSG);
      setToast('Treat message copied! Paste it in WhatsApp and send to Aleezy 😄');
      setTimeout(() => setToast(''), 4000);
    } catch {
      setToast('Could not copy — here is the message: ' + WHATSAPP_TREAT_MSG);
      setTimeout(() => setToast(''), 5000);
    }
  };

  const nextWish = () => {
    setWishIdx((i) => (i + 1) % BIRTHDAY_WISHES.length);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-1000"
      style={{ background: 'linear-gradient(180deg, #0a0a1f 0%, #1a0a2e 50%, #0a0a1f 100%)' }}
    >
      {/* Starfield */}
      {stars.map((s) => (
        <div key={s.id} className="absolute rounded-full bg-white animate-twinkle pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }} />
      ))}

      {/* Falling petals */}
      {petals.map((p) => (
        <div key={p.id} className="absolute pointer-events-none text-xl"
          style={{ left: `${p.x}%`, top: '-5%', ['--drift' as string]: `${p.drift}px`,
            animation: `petal-fall ${6 + p.delay}s linear infinite`, animationDelay: `${p.delay}s` }}>
          {p.emoji}
        </div>
      ))}

      {/* Mouse trail */}
      {trail.map((d) => (
        <div key={d.id} className="fixed pointer-events-none z-[90] rounded-full"
          style={{ left: d.x, top: d.y, width: '8px', height: '8px',
            background: 'rgba(255, 200, 230, 0.8)', boxShadow: '0 0 10px rgba(248, 92, 142, 0.6)',
            transform: 'translate(-50%, -50%)', transition: 'opacity 0.5s, transform 0.5s', opacity: 0 }} />
      ))}

      {/* VHS overlay */}
      {vhsMode && (
        <div className="fixed inset-0 z-[80] pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, transparent 2px, rgba(255,200,230,0.03) 4px)',
          mixBlendMode: 'overlay',
        }}>
          <div className="absolute inset-0 animate-glitch" style={{ background: 'rgba(255, 100, 200, 0.02)' }} />
        </div>
      )}

      {/* Kittens */}
      {kittens.map((k) => (
        <div key={k.id} className="fixed pointer-events-none z-[95] text-3xl"
          style={{ left: `${k.x}%`, top: '20%',
            animation: `float ${2 + k.delay}s ease-in-out infinite`, animationDelay: `${k.delay}s` }}>
          {k.emoji}
        </div>
      ))}

      {/* Level up banner */}
      {levelUp && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] glass-dark px-6 py-3 rounded-full animate-fade-in-scale">
          <p className="text-pink-300 font-bold text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> {levelUp}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] glass-dark px-6 py-3 rounded-full animate-fade-in-scale max-w-[90vw]">
          <p className="text-pink-200 text-sm flex items-center gap-2"><Check className="w-4 h-4 flex-shrink-0" /> {toast}</p>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 py-10 max-w-4xl mx-auto">
        <div className="text-center animate-fade-in">
          <h2 className="font-script text-3xl md:text-4xl text-pink-300 text-glow">Cosmic Glass Galaxy</h2>
          <p className="text-pink-200/60 text-sm mt-1">Welcome to the deep space of our friendship</p>
        </div>

        {/* XP bar */}
        <div className="glass-dark rounded-full px-5 py-2 w-full max-w-md">
          <div className="flex justify-between text-xs text-pink-200 mb-1">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Level {level}</span>
            <span>{xp % 15}/15 XP</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-300" style={{ width: `${(xp % 15) / 15 * 100}%` }} />
          </div>
        </div>

        {/* Settings: VHS toggle */}
        <div className="flex items-center gap-3">
          <button onClick={() => setVhsMode((v) => !v)} className="glass-dark px-4 py-2 rounded-full text-pink-200 text-xs flex items-center gap-2 hover:scale-105 transition-transform">
            {vhsMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} VHS Glitch: {vhsMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* ===== FEATURE 1: K-Drama Shyness Meter ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><Film className="w-4 h-4" /> K-Drama Female Lead Shyness Meter</h3>
          <input type="range" min="0" max="100" value={shynessLevel} onChange={(e) => setShynessLevel(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-pink-200/20 appearance-none cursor-pointer mb-3 accent-pink-400" />
          <div className="flex justify-between text-xs text-pink-200/60 mb-2">
            <span>0% (Social)</span><span>{shynessLevel}%</span><span>100% (Full Lead Role)</span>
          </div>
          <p className="text-pink-200 text-sm animate-fade-in italic">"{shynessData.text}"</p>
        </div>

        {/* ===== FEATURE 2: Exam Hall Cheat Engine ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> The Exam Hall Secret Cheat Engine</h3>
          <button onClick={revealCheatScript} className="btn-pink text-xs">Reveal Cheat Slip 🤫</button>
          {cheatScript && (
            <div className="bg-pink-500/10 rounded-xl px-4 py-3 text-pink-200 text-sm animate-fade-in-scale font-mono">
              {cheatScript}
            </div>
          )}
        </div>

        {/* ===== FEATURE 3: Plan Cancellation Tracker ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><CalendarX className="w-4 h-4" /> The Legendary Plan Cancellation Tracker</h3>
          <div className="text-center">
            <p className="text-pink-200 text-xs mb-2">"Main pakka aaungi" promises broken: <span className="font-bold text-pink-300 text-lg">{cancellationCount}</span></p>
            <button onClick={trackCancellation} className="btn-pink text-xs">Track Another Cancellation</button>
          </div>
          {cancellationReason && (
            <p className="text-pink-200 text-sm animate-fade-in italic text-center">"{cancellationReason}"</p>
          )}
        </div>

        {/* ===== FEATURE 4: Silent Advisor Telepathy Orb ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><Brain className="w-4 h-4" /> Silent Advisor Telepathy Orb</h3>
          <p className="text-pink-200/60 text-xs text-center">What mature life advice is Tayyaba silently thinking for Aleezy right now?</p>
          <button onClick={getSilentAdvice} disabled={adviceLoading} className="btn-pink text-xs">Consult the Silent Advisor</button>
          {adviceLoading && <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" /><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} /></div>}
          {silentAdvice && <p className="text-pink-200 text-sm text-center animate-fade-in italic">"{silentAdvice}"</p>}
        </div>

        {/* ===== FEATURE 5: K-Drama Binge Scanner ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><Tv className="w-4 h-4" /> Binge-Watch K-Drama Screen Scanner</h3>
          <button onClick={scanKdrama} className="btn-pink text-xs mb-3">Scan Addiction Level</button>
          {kdramaScanning && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-2 rounded-full bg-pink-200/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-pink-200 text-xs animate-pulse">Scanning K-Drama addiction... 📺</p>
            </div>
          )}
          {kdramaScanned && (
            <div className="space-y-2 animate-fade-in">
              {KDRAWMA_STATS.map((s) => (
                <div key={s.label} className="flex justify-between items-center text-sm">
                  <span className="text-pink-200/70">{s.label}</span>
                  <span className="font-bold text-pink-300">{s.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== FEATURE 7: Silent-Mode Decibel Decryptor ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><Volume2 className="w-4 h-4" /> Silent-Mode Decibel Decryptor</h3>
          <button onClick={readDecibels} className="btn-pink text-xs">Measure Conversation Volume</button>
          {decibelReading && <p className="text-pink-200 text-sm animate-fade-in italic text-center">"{decibelReading}"</p>}
        </div>

        {/* ===== FEATURE 8: Moody Anger Cool-Down Kittens ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><Cat className="w-4 h-4" /> Moody Anger Cool-Down Grid</h3>
          <p className="text-pink-200/60 text-xs text-center">Angry? Deploy fluffy kittens to cool down instantly!</p>
          <button onClick={deployKittens} className="btn-pink text-xs">Deploy Cute Kittens 🐱</button>
          {kittens.length > 0 && (
            <p className="text-pink-200 text-sm animate-fade-in italic text-center">
              {KITTEN_MESSAGES[Math.floor(Math.random() * KITTEN_MESSAGES.length)]}
            </p>
          )}
        </div>

        {/* ===== FEATURE 9: Lassi Brain Overthinking Simulator ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><Milk className="w-4 h-4" /> The Lassi Brain Overthinking Simulator</h3>
          <button onClick={runLassiSim} className="btn-pink text-xs">Simulate Overthinking</button>
          {lassiOverthinking && <p className="text-pink-200 text-sm animate-fade-in italic text-center">"{lassiOverthinking}"</p>}
        </div>

        {/* ===== FEATURE 10: WhatsApp Treat Spammer ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><SendIcon className="w-4 h-4" /> WhatsApp 'Treat Do Rahi' Spammer</h3>
          <p className="text-pink-200/60 text-xs text-center">Copy a treat-demand message and send it to Aleezy on WhatsApp!</p>
          <button onClick={sendTreatMsg} className="btn-pink text-xs">Copy Treat Message 📱</button>
        </div>

        {/* ===== NEW GAME: Friendship Memory Match ===== */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><Gamepad2 className="w-4 h-4" /> Friendship Memory Match Game</h3>
          <p className="text-pink-200/60 text-xs mb-3">Flip the cards and find all 8 matching pairs! Each pair is a piece of our friendship. 🎴</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-pink-200/50 text-xs">Moves: <span className="font-bold text-pink-300">{memoMoves}</span></span>
            <button onClick={initMemoGame} className="btn-ghost text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Restart</button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-w-[280px] mx-auto">
            {memoCards.map((card, i) => (
              <button key={i} onClick={() => flipMemoCard(i)}
                className="aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-300"
                style={{
                  background: card.matched ? 'rgba(248,92,142,0.3)' : card.flipped ? 'rgba(255,200,230,0.15)' : 'rgba(255,255,255,0.05)',
                  border: card.matched ? '2px solid rgba(248,92,142,0.5)' : '1px solid rgba(248,92,142,0.15)',
                  transform: card.flipped || card.matched ? 'scale(1)' : 'scale(1)',
                }}>
                {card.flipped || card.matched ? card.emoji : '❓'}
              </button>
            ))}
          </div>
          {memoWon && (
            <div className="text-center mt-4 animate-fade-in-scale">
              <p className="text-pink-300 font-bold text-sm">🎉 You won in {memoMoves} moves! 🎉</p>
              <p className="text-pink-200 text-xs mt-1 italic">Every match is a memory. Every memory is us. 💖</p>
            </div>
          )}
        </div>

        {/* Oracle + Gift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="glass-dark rounded-2xl p-5 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/20 flex items-center justify-center animate-spin-slow">
              <Sparkles className="w-7 h-7 text-pink-300" />
            </div>
            <h3 className="font-bold text-pink-300 text-sm">Destiny Oracle — 2031</h3>
            <button onClick={oraclePredict} className="btn-pink text-xs">Consult the Crystal Ball</button>
            {oracleText && <p className="text-pink-200 text-xs text-center animate-fade-in italic">"{oracleText}"</p>}
          </div>
          <div className="glass-dark rounded-2xl p-5 flex flex-col items-center gap-3">
            <button onClick={openGift} className="text-5xl transition-transform hover:scale-110" style={{ animation: giftOpened ? 'shake 0.5s' : 'none' }}>
              {giftOpened ? '✨' : '🎁'}
            </button>
            <h3 className="font-bold text-pink-300 text-sm">Virtual Gift Parcel</h3>
            <p className="text-pink-200 text-xs">Tap to unbox! Points: {giftPoints}</p>
            {giftOpened && <p className="text-pink-300 text-xs animate-fade-in">+100 points! Stars exploded!</p>}
          </div>
        </div>

        {/* Memory wall */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4" /> Permanent Memory Wall</h3>
          <div className="flex gap-2 mb-3">
            <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postMsg()}
              placeholder="Write a birthday message for Tayyaba..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-pink-300/20 text-pink-100 text-sm outline-none focus:border-pink-400/50 placeholder:text-pink-200/40" />
            <button onClick={postMsg} className="btn-pink text-xs flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Post</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {wallMsgs.map((m) => (
              <div key={m.id} className="bg-pink-500/10 rounded-xl px-4 py-2 text-pink-200 text-sm animate-fade-in">{m.text}</div>
            ))}
          </div>
        </div>

        {/* Birthday Wishes Carousel */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><Star className="w-4 h-4" /> Birthday Wishes Collection</h3>
          <div className="bg-pink-500/10 rounded-xl px-4 py-3 text-pink-200 text-sm animate-fade-in min-h-[60px]">
            {BIRTHDAY_WISHES[wishIdx]}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-pink-200/50 text-xs">Wish {wishIdx + 1} of {BIRTHDAY_WISHES.length}</span>
            <button onClick={nextWish} className="btn-ghost text-xs">Next Wish →</button>
          </div>
        </div>

        {/* Duas */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm mb-3">Duas for Tayyaba 🤲</h3>
          <div className="space-y-2">
            {DUAS.slice(0, 6).map((dua, i) => (
              <div key={i} className="bg-pink-500/10 rounded-xl px-4 py-2 text-pink-200 text-sm">{dua}</div>
            ))}
          </div>
        </div>

        {/* Share link */}
        <button onClick={copyLink} className="glass-dark px-5 py-2.5 rounded-full text-pink-200 text-sm flex items-center gap-2 hover:scale-105 transition-transform">
          <Clipboard className="w-4 h-4" /> Copy Share Link for WhatsApp Status
        </button>

        {/* Puzzle */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm mb-3">Memory Puzzle — Swap fragments to fix the picture</h3>
          <div className="grid grid-cols-3 gap-1 max-w-[240px] mx-auto">
            {puzzle.map((tile, i) => (
              <button key={i}
                onPointerDown={() => { const empty = puzzle.indexOf(8); if (Math.abs(i - empty) === 1 || Math.abs(i - empty) === 3) swapPuzzle(i, empty); }}
                className="aspect-square rounded-lg overflow-hidden border border-pink-300/20"
                style={{
                  backgroundImage: `url(${PUZZLE_IMAGE.src}), url(${PUZZLE_IMAGE.fallback})`,
                  backgroundSize: '300% 300%',
                  backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%`,
                  opacity: tile === 8 ? 0.2 : 1,
                }} />
            ))}
          </div>
          {puzzleSolved && <p className="text-pink-300 text-xs text-center mt-2 animate-fade-in font-semibold">Puzzle Solved! You found the memory!</p>}
        </div>

        {/* Telepathy */}
        <div className="glass-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2"><Brain className="w-4 h-4" /> Friendship Telepathy Mind-Reader</h3>
          <button onClick={runTelepathy} disabled={telepathyLoading} className="btn-pink text-xs">Read My Mind</button>
          {telepathyLoading && <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" /><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} /></div>}
          {telepathyText && <p className="text-pink-200 text-sm text-center animate-fade-in italic">"{telepathyText}"</p>}
        </div>

        {/* Mood Booster */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><Quote className="w-4 h-4" /> Mood Booster Quote Injector</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {MOOD_QUOTES.map((m) => (
              <button key={m.tag} onClick={() => selectMood(m.tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${moodTag === m.tag ? 'bg-pink-500 text-white' : 'bg-pink-500/20 text-pink-200 hover:bg-pink-500/30'}`}>
                {m.tag}
              </button>
            ))}
          </div>
          {moodQuote && <p className="text-pink-200 text-sm animate-fade-in italic">"{moodQuote}"</p>}
        </div>

        {/* Trait checklist wheel */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm mb-3">Friendship Trait Checklist Wheel</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {FRIENDSHIP_TRAITS.map((trait) => (
              <button key={trait} onClick={() => toggleTrait(trait)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${selectedTraits.includes(trait) ? 'bg-pink-500 text-white' : 'bg-pink-500/15 text-pink-200 hover:bg-pink-500/25'}`}>
                {selectedTraits.includes(trait) && <Check className="w-3 h-3" />} {trait}
              </button>
            ))}
          </div>
          {balloons.length > 0 && (
            <div className="flex flex-wrap gap-1 animate-fade-in">
              {balloons.map((b) => <span key={b.id} className="text-2xl animate-fade-in-scale">{b.emoji}</span>)}
            </div>
          )}
        </div>

        {/* Sticky notes pinboard */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm flex items-center gap-2 mb-3"><StickyNote className="w-4 h-4" /> Floating Sticky Notes Pinboard</h3>
          <div className="flex gap-2 mb-3">
            <input type="text" value={stickyInput} onChange={(e) => setStickyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSticky()}
              placeholder="Add a sticky note..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-pink-300/20 text-pink-100 text-sm outline-none focus:border-pink-400/50 placeholder:text-pink-200/40" />
            <button onClick={addSticky} className="btn-pink text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</button>
          </div>
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/5"
            onPointerMove={onStickyMove} onPointerUp={() => { dragRef.current = null; }} onPointerLeave={() => { dragRef.current = null; }}>
            {stickies.map((note) => (
              <div key={note.id} className="draggable-card absolute rounded-lg p-3 shadow-lg max-w-[140px]"
                style={{ left: `${note.x}%`, top: `${note.y}%`, zIndex: note.z,
                  background: note.color, color: '#4a2a38', transform: `rotate(${(note.id % 5) - 2}deg)` }}
                onPointerDown={(e) => startStickyDrag(e, note.id)}>
                <p className="text-xs font-medium break-words">{note.text}</p>
                <button onClick={(e) => { e.stopPropagation(); setStickies((s) => s.filter((x) => x.id !== note.id)); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {stickies.length === 0 && <p className="text-pink-200/40 text-xs text-center mt-4">Add notes above, then drag them around!</p>}
          </div>
        </div>

        {/* Final scratch-to-reveal */}
        <div className="glass-dark rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-300 text-sm mb-3">Scratch to Reveal the Final Wish</h3>
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-pink-300/20">
            <div className="absolute inset-0 flex items-center justify-center text-center p-6">
              <div>
                <p className="font-script text-2xl text-pink-300 text-glow mb-2">Happy 23rd Birthday, Tayyaba!</p>
                <p className="text-pink-200 text-sm">Allah tumhare daman ko hamesha sachay rishton, sachi dosti aur pakki khushiyon se bhara rakhe. You are my forever best friend.</p>
                <p className="font-hand text-xl text-pink-300 mt-2">— Always, Aleezy 🌸</p>
              </div>
            </div>
            {!scratchRevealed && (
              <canvas ref={scratchCanvasRef} className="scratch-canvas absolute inset-0 w-full h-full"
                onPointerDown={(e) => { isDrawing.current = true; scratchFinal(e.clientX, e.clientY); }}
                onPointerMove={(e) => { if (isDrawing.current) scratchFinal(e.clientX, e.clientY); }}
                onPointerUp={() => { isDrawing.current = false; }}
                onPointerLeave={() => { isDrawing.current = false; }} />
            )}
          </div>
        </div>

        {/* Restart */}
        <button onClick={onRestart} className="btn-pink">Replay the Journey</button>
        <p className="text-pink-200/40 text-xs text-center pb-4 font-hand text-lg">Crafted with infinite love by Aleezy for Tayyaba Maryam</p>
      </div>
    </div>
  );
}
