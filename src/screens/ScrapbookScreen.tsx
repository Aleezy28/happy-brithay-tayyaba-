import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Shuffle, Brain, BarChart3,
  HelpCircle, Check, X, Heart, Sparkles, Dna,
} from 'lucide-react';
import { SCRAPBOOK_CAPTIONS, QUIZ_QUESTIONS, POLAROID_IMAGES } from '@/data';

interface Props {
  onContinue: () => void;
}

interface DragCard {
  id: number;
  x: number;
  y: number;
  z: number;
  colorful: boolean;
  angle: number;
  page: number;
}

export default function ScrapbookScreen({ onContinue }: Props) {
  const [page, setPage] = useState(0);
  const [pageTurning, setPageTurning] = useState(false);
  const [cards, setCards] = useState<DragCard[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [heartPops, setHeartPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const zCounter = useRef(1);
  const dragRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const lastTap = useRef<Record<number, number>>({});
  const sandboxRef = useRef<HTMLDivElement>(null);

  const TOTAL_PAGES = 15;

  // Initialize scattered cards
  useEffect(() => {
    const initial: DragCard[] = SCRAPBOOK_CAPTIONS.map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 50,
      z: i + 1,
      colorful: false,
      angle: (Math.random() - 0.5) * 20,
      page: i,
    }));
    setCards(initial);
    zCounter.current = TOTAL_PAGES;
  }, []);

  const flipPage = (dir: number) => {
    setPageTurning(true);
    setTimeout(() => {
      setPage((p) => Math.max(0, Math.min(TOTAL_PAGES - 1, p + dir)));
      setPageTurning(false);
    }, 300);
  };

  const currentImage = POLAROID_IMAGES[page % POLAROID_IMAGES.length];
  const currentImageSrc = currentImage.src;
  const currentImageFallback = currentImage.fallback;

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.target = '_blank';
    a.click();
  };

  // Drag and drop
  const startDrag = (e: React.PointerEvent, cardId: number) => {
    e.stopPropagation();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const rect = sandboxRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: cardId,
      offsetX: e.clientX - rect.left - (card.x / 100) * rect.width,
      offsetY: e.clientY - rect.top - (card.y / 100) * rect.height,
    };
    zCounter.current += 1;
    setCards((cs) => cs.map((c) => c.id === cardId ? { ...c, z: zCounter.current } : c));
  };

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !sandboxRef.current) return;
    const rect = sandboxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragRef.current.offsetX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragRef.current.offsetY) / rect.height) * 100;
    setCards((cs) => cs.map((c) =>
      c.id === dragRef.current!.id
        ? { ...c, x: Math.max(0, Math.min(85, x)), y: Math.max(0, Math.min(80, y)) }
        : c
    ));
  }, []);

  const endDrag = () => { dragRef.current = null; };

  const toggleColor = (cardId: number) => {
    setCards((cs) => cs.map((c) => c.id === cardId ? { ...c, colorful: !c.colorful } : c));
  };

  const handleCardTap = (e: React.PointerEvent, cardId: number) => {
    const now = Date.now();
    if (lastTap.current[cardId] && now - lastTap.current[cardId] < 350) {
      // Double tap → heart pop
      setHeartPops((h) => [...h, { id: Date.now(), x: e.clientX, y: e.clientY }]);
      setTimeout(() => setHeartPops((h) => h.filter((p) => p.id !== Date.now())), 800);
      lastTap.current[cardId] = now;
    } else {
      lastTap.current[cardId] = now;
    }
  };

  const scramble = () => {
    setCards((cs) => cs.map((c) => ({
      ...c,
      x: 5 + Math.random() * 75,
      y: 5 + Math.random() * 65,
      angle: (Math.random() - 0.5) * 25,
    })));
  };

  // Quiz
  const answerQuiz = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    const correct = idx === QUIZ_QUESTIONS[quizIdx].correct;
    setQuizFeedback(correct ? 'correct' : 'wrong');
    if (correct) setQuizScore((s) => s + 1);
    setTimeout(() => {
      setQuizIdx((i) => (i + 1) % QUIZ_QUESTIONS.length);
      setQuizAnswer(null);
      setQuizFeedback(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden px-4 py-8">
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-pink-200/30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-pink-300/20 blur-3xl animate-float" />

      {/* Heart pops */}
      {heartPops.map((h) => (
        <div
          key={h.id}
          className="fixed pointer-events-none z-[100] animate-heart-pop"
          style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}
        >
          <Heart className="w-16 h-16 text-pink-500" fill="#f85c8e" style={{ filter: 'drop-shadow(0 0 20px rgba(248,92,142,0.6))' }} />
        </div>
      ))}

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6">
        <div className="text-center animate-fade-in">
          <h2 className="font-script text-3xl md:text-4xl text-pink-500 text-glow">Chronicle Scrapbook</h2>
          <p className="text-pink-400/70 text-sm mt-1">15 pages of us — drag, flip, and color the memories</p>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-4">
          <button onClick={() => flipPage(-1)} disabled={page === 0} className="w-11 h-11 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-transform">
            <ChevronLeft className="w-5 h-5 text-pink-500" />
          </button>
          <div className="glass px-5 py-2 rounded-full">
            <span className="text-pink-500 font-bold tabular-nums">{page + 1}</span>
            <span className="text-pink-400/50 text-sm"> / {TOTAL_PAGES}</span>
          </div>
          <button onClick={() => flipPage(1)} disabled={page === TOTAL_PAGES - 1} className="w-11 h-11 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:scale-110 transition-transform">
            <ChevronRight className="w-5 h-5 text-pink-500" />
          </button>
        </div>

        {/* Page content */}
        <div className={`w-full glass rounded-3xl p-6 md:p-8 ${pageTurning ? 'animate-page-turn' : 'animate-fade-in'}`}>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Polaroid */}
            <div className="polaroid flex-shrink-0" style={{ transform: `rotate(${(page % 2 === 0 ? -3 : 3) + (page * 0.5)}deg)` }}>
              <img
                src={currentImageSrc}
                onError={(e) => { (e.target as HTMLImageElement).src = currentImageFallback; }}
                alt={`Memory ${page + 1}`}
                className="w-48 h-48 object-cover"
                style={{ filter: cards[page]?.colorful ? 'none' : 'grayscale(100%)', transition: 'filter 0.5s ease' }}
              />
              <p className="font-hand text-pink-500 text-center mt-2 text-sm">Memory #{page + 1}</p>
            </div>

            {/* Caption */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-pink-600 text-lg md:text-xl font-medium leading-relaxed">"{SCRAPBOOK_CAPTIONS[page]}"</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <button onClick={() => toggleColor(page)} className="btn-ghost text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {cards[page]?.colorful ? 'Grayscale' : 'Colorize'}
                </button>
                <button onClick={() => downloadImage(currentImageFallback, `memory-${page + 1}.jpg`)} className="btn-ghost text-xs flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download Memory
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sandbox */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-pink-500 text-sm flex items-center gap-2">
              <Shuffle className="w-4 h-4" /> Memory Sandbox
            </h3>
            <button onClick={scramble} className="btn-ghost text-xs flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5" /> Scramble Cards
            </button>
          </div>
          <div
            ref={sandboxRef}
            className="relative w-full h-72 glass rounded-2xl overflow-hidden"
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {cards.slice(0, 6).map((card) => (
              <div
                key={card.id}
                className="draggable-card polaroid absolute"
                style={{
                  left: `${card.x}%`,
                  top: `${card.y}%`,
                  zIndex: card.z,
                  transform: `rotate(${card.angle}deg)`,
                  transition: dragRef.current?.id === card.id ? 'none' : 'left 0.3s, top 0.3s',
                }}
                onPointerDown={(e) => { startDrag(e, card.id); handleCardTap(e, card.id); }}
              >
                <img
                  src={POLAROID_IMAGES[card.id % POLAROID_IMAGES.length].src}
                  onError={(e) => { (e.target as HTMLImageElement).src = POLAROID_IMAGES[card.id % POLAROID_IMAGES.length].fallback; }}
                  alt={`Card ${card.id + 1}`}
                  className="w-20 h-20 object-cover pointer-events-none"
                  style={{ filter: card.colorful ? 'none' : 'grayscale(100%)', transition: 'filter 0.4s' }}
                />
                <p className="font-hand text-pink-500 text-center text-xs mt-1 pointer-events-none">#{card.id + 1}</p>
              </div>
            ))}
          </div>
          <p className="text-pink-400/50 text-xs mt-2 text-center">Drag cards to rearrange · Double-tap for a heart · Tap to colorize</p>
        </div>

        {/* DNA Proximity + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-pink-500 text-sm flex items-center gap-2 mb-3">
              <Dna className="w-4 h-4" /> Friendship DNA Proximity
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Soul Resonance', val: 100 },
                { label: 'Telepathy Bandwidth', val: 98 },
                { label: 'Laughter Sync', val: 100 },
                { label: 'Chaos Compatibility', val: 99 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs text-pink-500 mb-1">
                    <span>{s.label}</span>
                    <span className="font-bold">{s.val}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-pink-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-300 to-pink-500" style={{ width: `${s.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-pink-600 font-bold text-sm text-center mt-3">Match Result: 100% Soul Best-Friends Connected Bound Eternally! 🧬</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-pink-500 text-sm flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4" /> Live Friendship Stats
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Total Shared Laughter', val: 'Infinite %' },
                { label: 'Screenshots Stored Safely', val: '999k+' },
                { label: 'Inside Jokes Catalogued', val: '2,047' },
                { label: 'Late Night Calls Logged', val: '∞ hours' },
                { label: 'Friendship Level', val: 'Legendary' },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center text-sm">
                  <span className="text-pink-400/70">{s.label}</span>
                  <span className="font-bold text-pink-500">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="glass rounded-2xl p-5 w-full">
          <h3 className="font-bold text-pink-500 text-sm flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4" /> Memory Verification Quiz
            <span className="ml-auto text-xs text-pink-400/60">Score: {quizScore}/{QUIZ_QUESTIONS.length}</span>
          </h3>
          <p className="text-pink-600 font-medium text-sm mb-3">{QUIZ_QUESTIONS[quizIdx].question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUIZ_QUESTIONS[quizIdx].options.map((opt, i) => {
              const isSelected = quizAnswer === i;
              const isCorrect = i === QUIZ_QUESTIONS[quizIdx].correct;
              let style = 'bg-white/50 hover:bg-white/70 text-pink-600 border-pink-200';
              if (quizAnswer !== null) {
                if (isCorrect) style = 'bg-green-100 text-green-700 border-green-300';
                else if (isSelected) style = 'bg-pink-100 text-pink-600 border-pink-300';
                else style = 'bg-white/30 text-pink-400/50 border-pink-100';
              }
              return (
                <button
                  key={i}
                  onClick={() => answerQuiz(i)}
                  disabled={quizAnswer !== null}
                  className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${style}`}
                >
                  <span>{opt}</span>
                  {quizAnswer !== null && isCorrect && <Check className="w-4 h-4" />}
                  {quizAnswer !== null && isSelected && !isCorrect && <X className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
          {quizFeedback === 'correct' && <p className="text-green-600 text-xs mt-2 font-semibold animate-fade-in">Correct! You know us well.</p>}
          {quizFeedback === 'wrong' && <p className="text-pink-600 text-xs mt-2 font-semibold animate-fade-in">Not quite — but that's okay, the bond is still 100%</p>}
        </div>

        <button onClick={onContinue} className="btn-pink">Enter the Cosmic Galaxy</button>
      </div>
    </div>
  );
}
