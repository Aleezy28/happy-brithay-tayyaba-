import { useState, useEffect, useRef } from 'react';
import { Music, Music2 } from 'lucide-react';
import LockScreen from '@/screens/LockScreen';
import LoadingScreen from '@/screens/LoadingScreen';
import CakeScreen from '@/screens/CakeScreen';
import LetterScreen from '@/screens/LetterScreen';
import ScrapbookScreen from '@/screens/ScrapbookScreen';
import GalaxyScreen from '@/screens/GalaxyScreen';
import { YOUTUBE_MUSIC_ID } from '@/data';

type Stage = 'lock' | 'loading' | 'cake' | 'letters' | 'scrapbook' | 'galaxy';

interface Petal {
  id: number;
  x: number;
  delay: number;
  drift: number;
  emoji: string;
}

export default function App() {
  const [stage, setStage] = useState<Stage>('lock');
  const [petals, setPetals] = useState<Petal[]>([]);
  const [musicOn, setMusicOn] = useState(true);
  const prevStage = useRef<Stage>('lock');
  const playerRef = useRef<HTMLIFrameElement | null>(null);

  // Create the YouTube music iframe immediately during the unlock click
  // so the browser treats it as a user-initiated autoplay gesture
  const startMusic = () => {
    if (playerRef.current) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${YOUTUBE_MUSIC_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_MUSIC_ID}&controls=0&modestbranding=1&rel=0&playsinline=1`;
    iframe.allow = 'autoplay; encrypted-media';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-1';
    document.body.appendChild(iframe);
    playerRef.current = iframe;
  };

  // Toggle music visibility
  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.style.display = musicOn ? 'block' : 'none';
  }, [musicOn]);

  const transitionTo = (next: Stage) => {
    if (next === prevStage.current) return;
    prevStage.current = next;
    // Trigger petal rain on every transition
    const p: Petal[] = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      drift: (Math.random() - 0.5) * 100,
      emoji: ['🌸', '🌹', '🌷', '💐'][Math.floor(Math.random() * 4)],
    }));
    setPetals(p);
    setTimeout(() => setPetals([]), 4000);
    setStage(next);
  };

  // Unlock handler — starts music AND transitions, both in the same click
  const handleUnlock = () => {
    startMusic();
    transitionTo('loading');
  };

  useEffect(() => {
    // Clean up petals after animation
    if (petals.length > 0) {
      const timer = setTimeout(() => setPetals([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [petals]);

  return (
    <div className="min-h-screen transition-all duration-1000 relative overflow-hidden">
      {/* Global petal rain on screen transitions */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none text-xl z-[200]"
          style={{
            left: `${p.x}%`, top: '-5%',
            ['--drift' as string]: `${p.drift}px`,
            animation: `petal-fall ${3 + p.delay}s linear forwards`,
            animationDelay: `${p.delay * 0.2}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {stage === 'lock' && <LockScreen onUnlock={handleUnlock} />}
      {stage === 'loading' && <LoadingScreen onComplete={() => transitionTo('cake')} />}
      {stage === 'cake' && <CakeScreen onContinue={() => transitionTo('letters')} />}
      {stage === 'letters' && <LetterScreen onContinue={() => transitionTo('scrapbook')} />}
      {stage === 'scrapbook' && <ScrapbookScreen onContinue={() => transitionTo('galaxy')} />}
      {stage === 'galaxy' && <GalaxyScreen onRestart={() => transitionTo('lock')} />}

      {/* Floating music toggle — visible on all screens after unlock */}
      {stage !== 'lock' && (
        <button
          onClick={() => setMusicOn((m) => !m)}
          className="fixed top-4 right-4 z-[300] w-11 h-11 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          title={musicOn ? 'Mute music' : 'Play music'}
        >
          {musicOn ? <Music className="w-5 h-5 text-pink-500" /> : <Music2 className="w-5 h-5 text-pink-400" />}
        </button>
      )}
    </div>
  );
}
