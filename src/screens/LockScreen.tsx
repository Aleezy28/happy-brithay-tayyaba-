import { useState, useEffect, useRef } from 'react';
import { Heart, Lock, AlertCircle, Flower2 } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

interface Petal {
  id: number;
  x: number;
  delay: number;
  drift: number;
  emoji: string;
}

export default function LockScreen({ onUnlock }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 });
  const [shake, setShake] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const year = now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() >= 4)
        ? now.getFullYear() + 1 : now.getFullYear();
      const target = new Date(year, 8, 4, 0, 0, 0, 0);
      const diff = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const ms = Math.floor((diff % 1000) / 10);
      setCountdown({ days, hours, minutes, seconds, ms });
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  const triggerPetalRain = () => {
    const p: Petal[] = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      drift: (Math.random() - 0.5) * 120,
      emoji: ['🌸', '🌹', '🌷', '💐'][Math.floor(Math.random() * 4)],
    }));
    setPetals(p);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '0409') {
      setUnlocking(true);
      triggerPetalRain();
      onUnlock();
    } else {
      setError('Access Denied — The flowers whisper: "That is not our secret code, dear friend."');
      setAttempts((a) => a + 1);
      setShake(true);
      setCode('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Petal rain on unlock */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none text-2xl z-50"
          style={{
            left: `${p.x}%`, top: '-5%',
            ['--drift' as string]: `${p.drift}px`,
            animation: `petal-fall ${3 + p.delay}s linear forwards`,
            animationDelay: `${p.delay * 0.3}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Floating background orbs */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-pink-200/40 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-16 w-56 h-56 rounded-full bg-pink-300/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-pink-100/50 blur-2xl animate-float-slow" />

      <div className={`relative z-10 flex flex-col items-center gap-8 ${shake ? 'animate-shake' : ''} ${unlocking ? 'transition-opacity duration-1000 opacity-0' : ''}`}>
        {/* Flowers instead of moon */}
        <div className="relative flex items-center justify-center gap-4 mb-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 flex items-center justify-center shadow-2xl animate-float" style={{ boxShadow: '0 0 60px rgba(255, 200, 230, 0.6)' }}>
            <Flower2 className="w-12 h-12 text-pink-500" strokeWidth={1.5} />
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center animate-pulse-glow">
            <Heart className="w-10 h-10 text-white" fill="white" strokeWidth={1} />
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-pink-300 flex items-center justify-center animate-float-slow" style={{ animationDelay: '1s' }}>
            <Flower2 className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center animate-fade-in">
          <h1 className="font-script text-4xl md:text-5xl text-pink-500 text-glow mb-1">For Tayyaba Maryam</h1>
          <p className="text-pink-400/70 text-sm font-medium tracking-wide">A gateway guarded by flowers and a heart</p>
        </div>

        {/* Lock card */}
        <form onSubmit={handleSubmit} className="glass p-8 w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in-scale">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <p className="text-pink-600 font-semibold text-center text-sm">Enter the secret passcode to unlock the celebration</p>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            placeholder="• • • •"
            className="code-input w-44 h-14 rounded-2xl bg-white/70 border-2 border-pink-200 focus:border-pink-400 outline-none text-pink-600 transition-colors"
          />
          <button type="submit" className="btn-pink w-full">Unlock the Magic</button>
          {error && (
            <div className="flex items-center gap-2 text-pink-600 text-xs text-center animate-fade-in px-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {attempts >= 2 && (
            <p className="text-pink-400/60 text-xs text-center italic">Hint: it is a date that changed my life — DDMM</p>
          )}
        </form>

        {/* Countdown */}
        <div className="glass px-6 py-4 w-full max-w-sm animate-fade-in">
          <p className="text-pink-500 font-semibold text-center text-xs uppercase tracking-widest mb-3">Next Celebration Countdown</p>
          <div className="flex justify-center gap-2 md:gap-3 text-center">
            {[
              { label: 'Days', val: countdown.days },
              { label: 'Hrs', val: countdown.hours },
              { label: 'Min', val: countdown.minutes },
              { label: 'Sec', val: countdown.seconds },
              { label: 'ms', val: countdown.ms },
            ].map((u) => (
              <div key={u.label} className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold text-pink-500 tabular-nums">{pad(u.val)}</span>
                <span className="text-[10px] text-pink-400/60 uppercase tracking-wide">{u.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-pink-400/50 text-xs text-center font-hand text-lg">Crafted with love by Aleezy</p>
      </div>

      {unlocking && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <p className="font-script text-3xl text-pink-500 text-glow animate-fade-in">Welcome, Tayyaba... 🌸</p>
        </div>
      )}
    </div>
  );
}

