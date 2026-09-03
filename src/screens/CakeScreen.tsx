import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Mic, Flame, Cake, Sparkles, Flower, Flower2 } from 'lucide-react';

interface Props {
  onContinue: () => void;
}

interface Confetti { id: number; x: number; r: number; c: string; d: number; }

export default function CakeScreen({ onContinue }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [candleLit, setCandleLit] = useState(true);
  const [cakeSliced, setCakeSliced] = useState(false);
  const [toppings, setToppings] = useState<string[]>([]);
  const [micStatus, setMicStatus] = useState<'idle' | 'listening' | 'denied' | 'unsupported'>('idle');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTap = useRef(0);

  const triggerConfetti = useCallback(() => {
    const colors = ['#f85c8e', '#ffa6c4', '#ffd6e6', '#fff5f8', '#ffc9dd', '#ff7da6'];
    const pieces: Confetti[] = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      r: Math.random() * 360,
      c: colors[Math.floor(Math.random() * colors.length)],
      d: 2 + Math.random() * 2,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4000);
  }, []);

  const handleHeartDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      setRevealed(true);
      triggerConfetti();
    }
    lastTap.current = now;
  };

  // Mic blow detection
  const startMic = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = audioCtxRef.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicStatus('listening');

      const data = new Uint8Array(analyser.frequencyBinCount);
      const check = () => {
        if (!candleLit || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        if (avg > 35) {
          blowOutCandle();
          return;
        }
        rafRef.current = requestAnimationFrame(check);
      };
      check();
    } catch {
      setMicStatus('denied');
    }
  };

  const blowOutCandle = () => {
    setCandleLit(false);
    setMicStatus('idle');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setTimeout(() => setCakeSliced(true), 600);
  };

  const addTopping = (emoji: string) => {
    setToppings((t) => [...t, emoji]);
  };

  useEffect(() => {
    return () => {
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 w-3 h-3 rounded-sm pointer-events-none"
          style={{
            left: `${c.x}%`,
            backgroundColor: c.c,
            animation: `confetti-fall ${c.d}s linear forwards`,
            transform: `rotate(${c.r}deg)`,
          }}
        />
      ))}

      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-pink-200/40 blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-pink-300/30 blur-3xl animate-float" />

      {!revealed ? (
        /* Pre-reveal: giant heart */
        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          <p className="text-pink-400/70 text-sm font-medium">Double-tap the heart to begin</p>
          <button
            onClick={handleHeartDoubleTap}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center animate-pulse-glow transition-transform hover:scale-105"
            style={{ boxShadow: '0 0 80px rgba(248, 92, 142, 0.4)' }}
          >
            <Heart className="w-24 h-24 text-white" fill="white" strokeWidth={0.5} />
          </button>
          <p className="font-hand text-2xl text-pink-500">Tap, tap... and let the magic unfold</p>
        </div>
      ) : (
        /* Post-reveal: greeting + cake */
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl animate-fade-in-scale">
          {/* Greeting */}
          <div className="text-center">
            <h1 className="font-script text-3xl md:text-5xl text-pink-500 text-glow leading-tight">
              Happy Birthday, Tayyaba Maryam!
            </h1>
            <p className="font-hand text-xl text-pink-400 mt-2">Crafted with infinite love by Aleezy</p>
          </div>

          {/* Cake */}
          <div className="glass p-8 rounded-3xl flex flex-col items-center gap-4 w-full">
            <div className="relative flex flex-col items-center">
              {/* Candle flame */}
              <div className="relative mb-1 h-12 flex items-end justify-center">
                {candleLit ? (
                  <div className="animate-flame" style={{ fontSize: '2rem' }}>🔥</div>
                ) : (
                  <div className="text-gray-300" style={{ fontSize: '2rem' }}>🕯️</div>
                )}
                {candleLit && (
                  <div
                    className="absolute -bottom-1 w-1 h-6 rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #f5e6c8, #d4a96a)' }}
                  />
                )}
              </div>

              {/* Cake body */}
              <div className="relative">
                <div
                  className={`w-48 h-32 rounded-b-2xl rounded-t-lg relative overflow-hidden transition-all duration-500 ${cakeSliced ? 'scale-95' : ''}`}
                  style={{
                    background: 'linear-gradient(180deg, #ffd6e6 0%, #ffc9dd 30%, #ffa6c4 100%)',
                    boxShadow: '0 8px 30px rgba(248, 92, 142, 0.3)',
                  }}
                >
                  {/* Frosting drips */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white/80 rounded-b-full" style={{ filter: 'blur(0.5px)' }} />
                  <div className="absolute top-4 left-0 right-0 flex justify-around">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-3 h-4 bg-white/70 rounded-full" style={{ marginTop: `${(i % 2) * 4}px` }} />
                    ))}
                  </div>
                  {/* Toppings */}
                  <div className="absolute top-8 left-0 right-0 flex flex-wrap justify-center gap-1 px-4">
                    {toppings.map((t, i) => (
                      <span key={i} className="text-lg animate-fade-in-scale" style={{ animationDuration: '0.3s' }}>{t}</span>
                    ))}
                  </div>
                  {/* Slice line */}
                  {cakeSliced && (
                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-pink-300/60" style={{ transform: 'translateX(-50%) rotate(5deg)' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Cake controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button onClick={startMic} disabled={!candleLit || micStatus === 'listening'} className="btn-ghost flex items-center gap-1.5 text-sm">
                <Mic className="w-4 h-4" /> {micStatus === 'listening' ? 'Listening...' : micStatus === 'denied' ? 'Mic Blocked' : micStatus === 'unsupported' ? 'No Mic' : 'Blow to Extinguish'}
              </button>
              <button onClick={blowOutCandle} disabled={!candleLit} className="btn-ghost flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4" /> Tap to Extinguish
              </button>
            </div>
            {micStatus === 'listening' && <p className="text-pink-500 text-xs animate-fade-in">Blow hard into your phone mic!</p>}
            {micStatus === 'denied' && <p className="text-pink-500 text-xs">Mic blocked — use the tap button above</p>}
            {cakeSliced && <p className="font-hand text-lg text-pink-500 animate-fade-in">The cake is sliced! Make a wish, Tayyaba</p>}

            {/* Topping panel */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-pink-400/60 text-xs font-medium">Add toppings:</span>
              <button onClick={() => addTopping('🌹')} className="w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors text-lg flex items-center justify-center">🌹</button>
              <button onClick={() => addTopping('✨')} className="w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors text-lg flex items-center justify-center">✨</button>
              <button onClick={() => addTopping('🍓')} className="w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors text-lg flex items-center justify-center">🍓</button>
            </div>
          </div>

          {/* Continue */}
          <div className="flex items-center gap-3">
            <button onClick={onContinue} className="btn-pink">Continue to Letters</button>
          </div>
        </div>
      )}
    </div>
  );
}

