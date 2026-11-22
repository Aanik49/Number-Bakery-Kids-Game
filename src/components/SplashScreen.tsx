import React, { useEffect, useState } from 'react';
import { BakeryItemId } from '../types/game';
import { BakeryTreatSVG, GameIcon } from './BakeryArtwork';
import { soundEngine } from '../utils/soundEngine';

interface FloatingTreat {
  id: number;
  itemId: BakeryItemId;
  xPct: number;
  yPct: number;
  delay: number;
  popped: boolean;
}

const INITIAL_TREATS: FloatingTreat[] = [
  { id: 1, itemId: 'cookie', xPct: 14, yPct: 22, delay: 0, popped: false },
  { id: 2, itemId: 'muffin', xPct: 84, yPct: 20, delay: 0.4, popped: false },
  { id: 3, itemId: 'bread', xPct: 12, yPct: 72, delay: 0.9, popped: false },
  { id: 4, itemId: 'croissant', xPct: 86, yPct: 68, delay: 1.3, popped: false },
  { id: 5, itemId: 'cake', xPct: 22, yPct: 46, delay: 0.6, popped: false },
  { id: 6, itemId: 'cinnamon', xPct: 79, yPct: 44, delay: 1.1, popped: false },
];

interface SplashScreenProps {
  onStart: () => void;
  streakDays: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, streakDays }) => {
  const [treats, setTreats] = useState<FloatingTreat[]>(INITIAL_TREATS);
  const [popCount, setPopCount] = useState(0);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; text: string }>>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundEngine.unlockAndStartMusic();
        soundEngine.playPinataFanfare();
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  const handleTreatTap = (treat: FloatingTreat) => {
    soundEngine.unlockAndStartMusic();
    soundEngine.playSplashNote(popCount);
    setPopCount((c) => c + 1);

    const labels = ['+2!', '+5!', '+10!', 'YUM!', 'DING!', 'POP!'];
    const spId = Date.now() + Math.random();
    setSparkles((prev) => [
      ...prev,
      { id: spId, x: treat.xPct, y: treat.yPct, text: labels[popCount % labels.length] },
    ]);

    setTreats((prev) =>
      prev.map((t) => (t.id === treat.id ? { ...t, popped: true } : t))
    );

    window.setTimeout(() => {
      setTreats((prev) =>
        prev.map((t) => (t.id === treat.id ? { ...t, popped: false } : t))
      );
    }, 340);

    window.setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== spId));
    }, 900);
  };

  const handleStartClick = () => {
    soundEngine.unlockAndStartMusic();
    soundEngine.playPinataFanfare();
    onStart();
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-6 py-8 craft-dot-bg"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, #FFF9E6 0%, #FFE4EC 52%, #BAE6FD 100%)',
      }}
    >
      {/* Layered Paper-Cutout Corner Bunting */}
      <div
        className="absolute top-0 inset-x-0 h-5 border-b-[3px] border-white shadow-sm"
        style={{
          background:
            'repeating-linear-gradient(90deg, #FF5E7E 0px, #FF5E7E 28px, #38BDF8 28px, #38BDF8 56px, #FACC15 56px, #FACC15 84px)',
        }}
      />

      {/* Interactive Floating Die-Cut Bakery Treats */}
      {treats.map((treat) => (
        <button
          key={treat.id}
          type="button"
          onClick={() => handleTreatTap(treat)}
          aria-label={`Tap ${treat.itemId}`}
          className="absolute z-10 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 rounded-full transition-transform duration-150"
          style={{
            left: `${treat.xPct}%`,
            top: `${treat.yPct}%`,
            transform: treat.popped
              ? 'translate(-50%, -50%) scale(1.38) rotate(14deg)'
              : 'translate(-50%, -50%)',
          }}
        >
          <div
            className="animate-float-gentle"
            style={{ animationDelay: `${treat.delay}s` }}
          >
            <BakeryTreatSVG itemId={treat.itemId} size={62} />
          </div>
        </button>
      ))}

      {/* Popped Floating Math Sparkles */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="absolute z-20 animate-score-float font-display font-bold text-xl text-rose-600 bg-white px-3 py-1 rounded-2xl border-2 border-white shadow-md"
          style={{ left: `${sp.x}%`, top: `${sp.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {sp.text}
        </div>
      ))}

      {/* Center Hero Stage */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-md w-full">
        {/* Radiant Glowing Toybox Ring behind Game Icon */}
        <div className="relative mb-5">
          <div
            className="absolute -inset-4 rounded-[36%] opacity-75 blur-xl animate-pulse"
            style={{
              background:
                'linear-gradient(135deg, #22D3EE 0%, #FACC15 50%, #FF5E7E 100%)',
            }}
          />
          <button
            type="button"
            onClick={() => {
              soundEngine.unlockAndStartMusic();
              soundEngine.playServeSuccess();
            }}
            className="relative block cursor-pointer active:scale-95 transition-transform"
            aria-label="Number Bakery Icon"
          >
            <GameIcon
              size={136}
              className="border-[5px] border-white shadow-2xl animate-float-gentle"
            />
          </button>
        </div>

        {/* Bespoke Paper-Cutout SVG Title Lockup */}
        <svg
          viewBox="0 0 420 96"
          className="w-full max-w-[360px] h-auto drop-shadow-md mb-2"
          aria-label="Number Bakery"
        >
          <text
            x="210"
            y="42"
            textAnchor="middle"
            fontFamily="Fredoka, sans-serif"
            fontWeight="700"
            fontSize="42"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinejoin="round"
          >
            NUMBER
          </text>
          <text
            x="210"
            y="42"
            textAnchor="middle"
            fontFamily="Fredoka, sans-serif"
            fontWeight="700"
            fontSize="42"
            fill="#FF4D73"
          >
            NUMBER
          </text>
          <text
            x="210"
            y="84"
            textAnchor="middle"
            fontFamily="Fredoka, sans-serif"
            fontWeight="700"
            fontSize="46"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinejoin="round"
          >
            BAKERY
          </text>
          <text
            x="210"
            y="84"
            textAnchor="middle"
            fontFamily="Fredoka, sans-serif"
            fontWeight="700"
            fontSize="46"
            fill="#0284C7"
          >
            BAKERY
          </text>
        </svg>

        <p className="text-sm sm:text-base font-bold text-slate-700 max-w-xs mb-6 leading-snug">
          Stack trays of 2, 5, and 10 to bake exact treat orders across 6 glowing worlds!
        </p>

        {/* Primary Play CTA */}
        <button
          type="button"
          onClick={handleStartClick}
          className="sticker-btn animate-serve-ready w-full max-w-[280px] py-4 px-8 rounded-3xl font-display font-bold text-2xl text-white tracking-wide flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
          }}
        >
          <span>OPEN BAKERY</span>
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {/* Single Flat Control-Hint Line */}
        <p className="mt-5 text-xs font-bold text-slate-600 tracking-wide">
          Tap floating treats to play chimes · Day {streakDays} Streak · Press Enter or Tap to Start
        </p>
      </div>
    </div>
  );
};
