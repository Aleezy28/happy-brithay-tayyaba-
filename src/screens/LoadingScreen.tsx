import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'loading' | 'odometer' | 'done'>('loading');
  const [progress, setProgress] = useState(0);
  const [age, setAge] = useState(0);
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number; fx: string; fy: string }[]>([]);
  const doneRef = useRef(false);

  // Loading bar
  useEffect(() => {
    if (phase !== 'loading') return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setTimeout(() => setPhase('odometer'), 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(id);
  }, [phase]);

  // Odometer count up
  useEffect(() => {
    if (phase !== 'odometer') return;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setAge(current);
      if (current >= 23) {
        clearInterval(id);
        // Launch fireworks
        const fw = Array.from({ length: 24 }, (_, i) => ({
          id: i,
          x: 50 + (Math.random() - 0.5) * 60,
          y: 50 + (Math.random() - 0.5) * 40,
          fx: `${(Math.random() - 0.5) * 200}px`,
          fy: `${(Math.random() - 0.5) * 200}px`,
        }));
        setFireworks(fw);
        setTimeout(() => setPhase('done'), 2200);
      }
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-fade to next screen
  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      setTimeout(onComplete, 1000);
    }
  }, [phase, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-pink-200/40 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-pink-300/30 blur-3xl animate-float" />

      {phase === 'loading' && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-script text-2xl text-pink-500 text-glow">Syncing Friendship Database...</h2>
          <div className="w-full h-4 rounded-full bg-pink-100 overflow-hidden border border-pink-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-pink-500 font-bold text-lg tabular-nums">{progress}%</p>
          <div className="text-pink-400/60 text-xs space-y-1 text-center">
            <p>Decrypting 23 years of memories...</p>
            <p>Calibrating soul-bond proximity...</p>
            <p>Loading infinite laughter modules...</p>
          </div>
        </div>
      )}

      {phase === 'odometer' && (
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Odometer */}
          <div className="relative">
            <div className="glass px-12 py-8 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-pink-100/30 to-transparent pointer-events-none" />
              <span
                className={`text-8xl md:text-9xl font-bold tabular-nums transition-all duration-100 ${
                  age >= 23 ? 'text-glow text-pink-500 scale-110' : 'text-pink-400'
                }`}
                style={{ transform: age >= 23 ? 'scale(1.1)' : 'scale(1)' }}
              >
                {age}
              </span>
            </div>
            {/* Neon ring */}
            {age >= 23 && (
              <div className="absolute inset-0 rounded-3xl pointer-events-none animate-pulse-glow"
                style={{ boxShadow: '0 0 60px rgba(248, 92, 142, 0.5), inset 0 0 40px rgba(248, 92, 142, 0.2)' }} />
            )}
          </div>

          {/* Fireworks */}
          {age >= 23 && (
            <>
              <div className="relative h-0">
                {fireworks.map((fw) => (
                  <div
                    key={fw.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${fw.x}%`,
                      top: `${fw.y}%`,
                      ['--fx' as string]: fw.fx,
                      ['--fy' as string]: fw.fy,
                    }}
                  >
                    {['#f85c8e', '#ffa6c4', '#ffd6e6', '#fff5f8'].map((c, i) => (
                      <span
                        key={i}
                        className="absolute block w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: c,
                          animation: `firework 0.8s ease-out ${i * 0.1}s forwards`,
                          ['--fx' as string]: fw.fx,
                          ['--fy' as string]: fw.fy,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {age >= 23 && (
            <h2 className="font-script text-2xl md:text-3xl text-pink-500 text-glow text-center animate-fade-in px-4">
              YEARS OF BEING ABSOLUTELY AWESOME! ✨
            </h2>
          )}
          {age < 23 && (
            <p className="text-pink-400/60 text-sm">Counting the years of awesome...</p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="relative z-10 opacity-0 transition-opacity duration-1000">
          <span className="text-8xl font-bold text-pink-500 text-glow">23</span>
        </div>
      )}
    </div>
  );
}

