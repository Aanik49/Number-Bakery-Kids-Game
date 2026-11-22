import React, { useState } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface CakeDecorateModalProps {
  onComplete: (bonusCoins: number) => void;
  onClose: () => void;
  cakesDecorated: number;
}

const FROSTING_OPTIONS = [
  { name: 'Berry Pink', fill: '#FF5E7E' },
  { name: 'Electric Mint', fill: '#22D3EE' },
  { name: 'Lemon Glow', fill: '#FACC15' },
  { name: 'Lavender', fill: '#A855F7' },
  { name: 'Cream Cloud', fill: '#FFFBEB' },
];

const SPONGE_OPTIONS = [
  { name: 'Vanilla', fill: '#FDBA74' },
  { name: 'Chocolate', fill: '#92400E' },
  { name: 'Strawberry', fill: '#FDA4AF' },
  { name: 'Blueberry', fill: '#93C5FD' },
];

const TOPPER_NAMES = ['Strawberry', 'Golden Crown', 'Star Candle', 'Rainbow Heart'];

export const CakeDecorateModal: React.FC<CakeDecorateModalProps> = ({
  onComplete,
  onClose,
  cakesDecorated,
}) => {
  const [frostingIdx, setFrostingIdx] = useState(0);
  const [spongeIdx, setSpongeIdx] = useState(0);
  const [sprinklesOn, setSprinklesOn] = useState(true);
  const [topperIdx, setTopperIdx] = useState(0);

  const frosting = FROSTING_OPTIONS[frostingIdx];
  const sponge = SPONGE_OPTIONS[spongeIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
      <div className="paper-card bg-[#FFF8F2] rounded-3xl w-full max-w-md p-5 sm:p-6 text-center animate-paper-drop">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
            VIP Cake Studio · #{cakesDecorated + 1}
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close Cake Studio"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Decorate Your Cake!
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
          Mix frosting, sponge, sprinkles, and toppers to earn +15 Tip Coins.
        </p>

        {/* Paper-Craft Interactive Cake Canvas */}
        <div className="my-4 bg-gradient-to-b from-sky-50 to-pink-50 rounded-3xl border-[3px] border-white shadow-inner p-4 flex items-center justify-center">
          <svg viewBox="0 0 240 190" className="w-56 h-44 drop-shadow-md">
            {/* Glowing Toybox Plate */}
            <ellipse cx="120" cy="168" rx="96" ry="15" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="4" />
            <ellipse cx="120" cy="165" rx="76" ry="9" fill="#CBD5E1" />

            {/* White Die-Cut Paper Backing */}
            <rect x="40" y="74" width="160" height="90" rx="22" fill="#FFFFFF" />

            {/* Cake Sponge */}
            <rect x="48" y="96" width="144" height="62" rx="14" fill={sponge.fill} />
            <rect x="48" y="124" width="144" height="9" fill="#FFFFFF" opacity="0.7" />

            {/* Dripping Frosting */}
            <path
              d="M44 96 Q44 78 64 78 L176 78 Q196 78 196 96 L196 114 Q184 126 172 114 Q160 126 148 114 Q136 126 124 114 Q112 126 100 114 Q88 126 76 114 Q64 126 52 114 Q44 120 44 110 Z"
              fill={frosting.fill}
            />

            {/* Rainbow Craft Sprinkles */}
            {sprinklesOn && (
              <g>
                <rect x="66" y="88" width="11" height="4.5" rx="2.2" fill="#FACC15" transform="rotate(22 66 88)" />
                <rect x="96" y="92" width="11" height="4.5" rx="2.2" fill="#34D399" transform="rotate(-18 96 92)" />
                <rect x="128" y="86" width="11" height="4.5" rx="2.2" fill="#FFFFFF" transform="rotate(32 128 86)" />
                <rect x="160" y="91" width="11" height="4.5" rx="2.2" fill="#38BDF8" transform="rotate(-24 160 91)" />
                <rect x="82" y="104" width="11" height="4.5" rx="2.2" fill="#FFFFFF" transform="rotate(-12 82 104)" />
                <rect x="142" y="104" width="11" height="4.5" rx="2.2" fill="#FACC15" transform="rotate(18 142 104)" />
              </g>
            )}

            {/* Topper Options */}
            {topperIdx === 0 && (
              <g>
                <path
                  d="M105 56 Q120 38 135 56 Q138 76 120 82 Q102 76 105 56 Z"
                  fill="#E11D48"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                />
                <path
                  d="M108 52 L120 44 L132 52"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
            )}
            {topperIdx === 1 && (
              <polygon
                points="94,78 98,46 110,60 120,40 130,60 142,46 146,78"
                fill="#FACC15"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            )}
            {topperIdx === 2 && (
              <g>
                <rect x="112" y="46" width="16" height="34" rx="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="3.5" />
                <path d="M120 22 Q130 35 120 44 Q110 35 120 22 Z" fill="#FACC15" />
              </g>
            )}
            {topperIdx === 3 && (
              <path
                d="M120 78 C98 62 92 42 108 38 C115 36 120 44 120 44 C120 44 125 36 132 38 C148 42 142 62 120 78 Z"
                fill="#EC4899"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
            )}

            {/* Cute Happy Cake Eyes */}
            <circle cx="102" cy="142" r="4.5" fill="#1E293B" />
            <circle cx="138" cy="142" r="4.5" fill="#1E293B" />
            <path
              d="M112 147 Q120 155 128 147"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 4 Tactile Decorator Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playTrayPop(0.6);
              setFrostingIdx((i) => (i + 1) % FROSTING_OPTIONS.length);
            }}
            className="sticker-btn py-2.5 px-3 rounded-2xl bg-rose-500 text-white font-display font-bold text-sm"
          >
            Frosting: {frosting.name}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playTrayPop(0.8);
              setSpongeIdx((i) => (i + 1) % SPONGE_OPTIONS.length);
            }}
            className="sticker-btn py-2.5 px-3 rounded-2xl bg-amber-500 text-white font-display font-bold text-sm"
          >
            Cake: {sponge.name}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPop(1.2);
              setSprinklesOn((v) => !v);
            }}
            className="sticker-btn py-2.5 px-3 rounded-2xl bg-cyan-500 text-white font-display font-bold text-sm"
          >
            Sprinkles: {sprinklesOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playStarDing(topperIdx);
              setTopperIdx((i) => (i + 1) % TOPPER_NAMES.length);
            }}
            className="sticker-btn py-2.5 px-3 rounded-2xl bg-violet-500 text-white font-display font-bold text-sm"
          >
            Topper: {TOPPER_NAMES[topperIdx]}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playCoin();
            onComplete(15);
          }}
          className="sticker-btn animate-serve-ready w-full py-3.5 rounded-2xl font-display font-bold text-xl text-white"
          style={{
            background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
          }}
        >
          Finish & Collect +15 Coins!
        </button>
      </div>
    </div>
  );
};
