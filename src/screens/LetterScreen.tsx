import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, X, Eraser } from 'lucide-react';
import { LETTERS, POLAROID_IMAGES } from '@/data';

interface Props {
  onContinue: () => void;
}

export default function LetterScreen({ onContinue }: Props) {
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const [typing, setTyping] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const openEnvelope = (letter: typeof LETTERS[0]) => {
    setOpenLetter(letter.id);
    setTypedText('');
    setTyping(true);
    setScratchProgress(0);
    setRevealed(false);

    // Typewriter effect
    if (typingTimer.current) clearInterval(typingTimer.current);
    let i = 0;
    const fullText = `Dear Tayyaba,\n\n${letter.body}`;
    typingTimer.current = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        if (typingTimer.current) clearInterval(typingTimer.current);
        setTyping(false);
      }
    }, 25);
  };

  const closeEnvelope = () => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    setTypedText('');
    setTyping(false);
    setOpenLetter(null);
    setScratchProgress(0);
    setRevealed(false);
  };

  // Scratch canvas setup
  useEffect(() => {
    if (openLetter === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fill with matte scratch coating
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#d4d4d4');
    gradient.addColorStop(0.5, '#e0e0e0');
    gradient.addColorStop(1, '#c8c8c8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Sparkle texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hint text
    ctx.fillStyle = '#999';
    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal a hidden memory', rect.width / 2, rect.height / 2);
  }, [openLetter]);

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Check progress
    const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    let cleared = 0;
    const total = imageData.data.length / 4;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    const pct = (cleared / total) * 100;
    setScratchProgress(pct);
    if (pct > 40) setRevealed(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDrawing.current) scratch(e.clientX, e.clientY);
  };
  const handlePointerUp = () => { isDrawing.current = false; };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-10">
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-pink-200/30 blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-pink-300/20 blur-3xl animate-float" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8">
        <div className="text-center animate-fade-in">
          <h2 className="font-script text-3xl md:text-4xl text-pink-500 text-glow">The Letter Vault</h2>
          <p className="text-pink-400/70 text-sm mt-1">Four letters from the 90s, sealed in parchment</p>
        </div>

        {/* Envelope grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {LETTERS.map((letter, i) => (
            <button
              key={letter.id}
              onClick={() => openEnvelope(letter)}
              className="parchment rounded-2xl p-6 text-left hover:scale-[1.02] transition-transform duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-200/60 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 text-lg">{letter.title}</h3>
                  <p className="font-hand text-amber-700 text-lg">{letter.subtitle}</p>
                  <p className="text-amber-600/60 text-xs mt-1">Tap to open and read</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onContinue} className="btn-pink">Continue to Scrapbook</button>
      </div>

      {/* Letter modal */}
      {openLetter !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="parchment rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto no-scrollbar relative animate-fade-in-scale">
            <button onClick={closeEnvelope} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pink-200/60 hover:bg-pink-300/60 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-amber-800" />
            </button>
            <h3 className="font-bold text-amber-800 text-xl mb-1">{LETTERS[openLetter - 1].title}</h3>
            <p className="font-hand text-amber-700 text-xl mb-4">{LETTERS[openLetter - 1].subtitle}</p>

            {/* Typewriter text */}
            <div className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px] font-medium">
              {typedText}
              {typing && <span className="inline-block w-0.5 h-4 bg-amber-700 ml-0.5" style={{ animation: 'typing-cursor 0.8s step-end infinite' }} />}
            </div>

            {/* Scratch-to-reveal */}
            <div className="mt-6">
              <p className="text-amber-700/70 text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5" /> Scratch the card below to reveal a hidden photo
              </p>
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-amber-700/30">
                {/* Hidden photo */}
                <img
                  src={POLAROID_IMAGES[openLetter % POLAROID_IMAGES.length].src}
                  onError={(e) => { (e.target as HTMLImageElement).src = POLAROID_IMAGES[openLetter % POLAROID_IMAGES.length].fallback; }}
                  alt="Hidden memory"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Scratch canvas */}
                {!revealed && (
                  <canvas
                    ref={canvasRef}
                    className="scratch-canvas absolute inset-0 w-full h-full"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                )}
                {revealed && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-pink-600 text-xs font-semibold bg-white/80 px-3 py-1 rounded-full animate-fade-in">
                    Memory revealed!
                  </div>
                )}
              </div>
              {scratchProgress > 0 && scratchProgress < 40 && (
                <p className="text-amber-600/60 text-xs mt-1 text-center">Keep scratching... {Math.floor(scratchProgress)}%</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

