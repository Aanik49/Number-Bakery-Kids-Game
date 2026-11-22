import React, { useEffect, useRef } from 'react';
import { BakeryItemId } from '../types/game';
import { WORLD_BY_ID } from '../data/bakeryWorlds';
import { drawCanvasTreatItem, drawRoundRect } from './BakeryArtwork';
import { soundEngine } from '../utils/soundEngine';

interface PinataCelebrationCanvasProps {
  worldId: BakeryItemId;
  levelNumber: number;
  starsEarned: number;
  coinsEarned: number;
  hasNextLevelInWorld: boolean;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  life: number;
  decay: number;
  isTreat: boolean;
  color: string;
}

interface InteractiveTreatToy {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobble: number;
}

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutElastic(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Adapted directly from the user's reference animation sheet (`renderPinataBurst`),
 * customized so the piñata explodes with the ACTIVE LEVEL'S BAKERY ITEM instead of candy!
 */
export const PinataCelebrationCanvas: React.FC<PinataCelebrationCanvasProps> = ({
  worldId,
  levelNumber,
  starsEarned,
  coinsEarned,
  hasNextLevelInWorld,
  onNext,
  onReplay,
  onHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const world = WORLD_BY_ID[worldId];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let poppedTriggered = false;
    let shakeTime = 0;
    const particles: BurstParticle[] = [];
    const toys: InteractiveTreatToy[] = [];

    for (let i = 0; i < 9; i++) {
      toys.push({
        x: 0.14 + Math.random() * 0.72,
        y: 0.52 + Math.random() * 0.28,
        r: 18 + Math.random() * 6,
        vy: -0.05 - Math.random() * 0.05,
        wobble: i * 0.85,
      });
    }

    const palette = ['#FACC15', '#34D399', '#38BDF8', '#FB7185', '#FFFFFF'];

    const spawnTreatBurst = (nx: number, ny: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
        const speed = 110 + Math.random() * 240;
        particles.push({
          x: nx,
          y: ny,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 120,
          size: i % 2 === 0 ? 15 + Math.random() * 7 : 6 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 7,
          life: 1.0,
          decay: 0.42 + Math.random() * 0.3,
          isTreat: i % 2 === 0,
          color: palette[i % palette.length],
        });
      }
    };

    soundEngine.playPinataFanfare();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      // Tap early to pop the piñata faster!
      if (!poppedTriggered) {
        elapsed = 0.76;
        return;
      }

      // Check interactive floating bakery items
      for (let i = toys.length - 1; i >= 0; i--) {
        const toy = toys[i];
        const dx = (nx - toy.x) * rect.width;
        const dy = (ny - toy.y) * rect.height;
        if (Math.hypot(dx, dy) <= toy.r + 18) {
          soundEngine.playPop(1.2);
          spawnTreatBurst(toy.x, toy.y, 12);
          toy.y = 0.84;
          toy.x = 0.14 + Math.random() * 0.72;
          return;
        }
      }

      soundEngine.playStarDing(Math.floor(Math.random() * 4));
      spawnTreatBurst(nx, ny, 16);
      shakeTime = 0.1;
    };

    canvas.addEventListener('click', handleCanvasClick);

    const drawCuteStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      scale: number,
      filled: boolean
    ) => {
      if (scale <= 0.01) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      drawStar(ctx, 0, 5, 5, r, r * 0.48);
      ctx.fill();

      const grad = ctx.createLinearGradient(0, -r, 0, r);
      if (filled) {
        grad.addColorStop(0, '#FEF08A');
        grad.addColorStop(0.5, '#FACC15');
        grad.addColorStop(1, '#EA580C');
      } else {
        grad.addColorStop(0, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1, 'rgba(255,255,255,0.15)');
      }
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      drawStar(ctx, 0, 0, 5, r, r * 0.48);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      const cw = rect.width;
      const ch = rect.height;

      if (shakeTime > 0) {
        shakeTime -= dt;
        const mag = shakeTime * 26;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      // Vibrant World-Matched Celebration Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, world.theme.accentHex);
      bg.addColorStop(1, world.theme.isDarkTheme ? '#0F172A' : '#6D28D9');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      // Rotating Sunburst Rays
      ctx.save();
      ctx.translate(cw * 0.5, ch * 0.36);
      ctx.rotate(-elapsed * 0.35);
      const rayRadius = Math.max(cw, ch) * 0.85;
      for (let i = 0; i < 14; i++) {
        ctx.rotate((Math.PI * 2) / 14);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.14)' : 'transparent';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-rayRadius * 0.14, -rayRadius);
        ctx.lineTo(rayRadius * 0.14, -rayRadius);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      const popTime = 0.75;
      const popped = elapsed >= popTime;

      if (popped && !poppedTriggered) {
        poppedTriggered = true;
        shakeTime = 0.28;
        soundEngine.playPop(0.85);
        soundEngine.playStarDing(2);
        spawnTreatBurst(0.5, 0.34, 42);
      }

      // Hanging String
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cw * 0.5, 0);
      ctx.lineTo(cw * 0.5, ch * 0.22);
      ctx.stroke();

      if (!popped) {
        // Swinging Rainbow Star Piñata (from reference animation)
        const wobble = Math.sin(elapsed * 22) * (0.18 + elapsed * 0.26);
        const swell = 1 + (elapsed / popTime) * 0.24;
        ctx.save();
        ctx.translate(cw * 0.5, ch * 0.34);
        ctx.rotate(wobble);
        ctx.scale(swell, swell);

        drawStar(ctx, 0, 0, 5, 68, 32);
        ctx.save();
        ctx.clip();
        const stripes = ['#F43F5E', '#FACC15', '#34D399', '#38BDF8', '#A855F7'];
        stripes.forEach((col, i) => {
          ctx.fillStyle = col;
          ctx.fillRect(-75, -75 + i * 30, 150, 30);
        });
        ctx.restore();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        drawStar(ctx, 0, 0, 5, 68, 32);
        ctx.stroke();

        // Excited face
        ctx.fillStyle = '#1E1B4B';
        ctx.beginPath();
        ctx.arc(-14, -4, 5, 0, Math.PI * 2);
        ctx.arc(14, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 7, 8, 0, Math.PI);
        ctx.fill();
        ctx.restore();
      } else {
        const dtPop = elapsed - popTime;

        // Flying Split Piñata Halves
        const split = Math.min(140, dtPop * 260);
        [-1, 1].forEach((dir) => {
          ctx.save();
          ctx.translate(cw * 0.5 + dir * split, ch * 0.34 + dtPop * 95);
          ctx.rotate(dir * dtPop * 3.8);
          ctx.globalAlpha = Math.max(0, 1 - dtPop * 1.1);
          ctx.fillStyle = dir === -1 ? '#FACC15' : '#34D399';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        // Interactive Floating Bakery Treats (instead of generic candy!)
        toys.forEach((toy) => {
          toy.wobble += dt * 3.2;
          toy.y += toy.vy * dt;
          if (toy.y < -0.1) toy.y = 0.88;
          const tx = (toy.x + Math.sin(toy.wobble) * 0.025) * cw;
          const ty = toy.y * ch;
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(Math.sin(toy.wobble) * 0.25);
          drawCanvasTreatItem(ctx, worldId, toy.r);
          ctx.restore();
        });

        // Victory Paper-Cutout Card
        const cardScale = easeOutBack(Math.min(1, dtPop / 0.36));
        const cardW = Math.min(340, cw * 0.86);
        const cardH = 232;
        const cardY = ch * 0.44;

        ctx.save();
        ctx.translate(cw * 0.5, cardY);
        ctx.scale(cardScale, cardScale);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        drawRoundRect(ctx, -cardW / 2, -cardH / 2 + 8, cardW, cardH, 30);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 5;
        drawRoundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 30);
        ctx.fill();
        ctx.stroke();

        // Hero Bakery Item Badge at top of card
        ctx.save();
        ctx.translate(0, -cardH / 2 - 4);
        drawCanvasTreatItem(ctx, worldId, 34);
        ctx.restore();

        // Ribbon Banner
        ctx.fillStyle = world.theme.accentHex;
        drawRoundRect(ctx, -cardW * 0.42, -52, cardW * 0.84, 44, 18);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 21px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`LEVEL ${levelNumber} CLEAR!`, 0, -30);

        // 3 Stars
        [0, 1, 2].forEach((i) => {
          const sc = easeOutElastic(Math.min(1, Math.max(0, (dtPop - 0.12 - i * 0.12) / 0.48)));
          drawCuteStar(ctx, (i - 1) * 62, 26, i === 1 ? 28 : 23, sc, i < starsEarned);
        });

        // Coins earned line
        ctx.fillStyle = '#0F172A';
        ctx.font = '700 18px Fredoka, sans-serif';
        ctx.fillText(`+${coinsEarned} Tip Coins · ${world.pluralName} Burst!`, 0, 82);

        ctx.restore();
      }

      // Update & Draw Bakery-Item Burst Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += (p.vx * dt) / cw;
        p.y += (p.vy * dt) / ch;
        p.vy += 320 * dt;
        p.vx *= 0.99;
        p.rot += p.vrot * dt;
        p.life -= p.decay * dt;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
        ctx.translate(p.x * cw, p.y * ch);
        ctx.rotate(p.rot);
        if (p.isTreat) {
          drawCanvasTreatItem(ctx, worldId, p.size);
        } else {
          ctx.fillStyle = p.color;
          drawStar(ctx, 0, 0, 5, p.size * 1.25, p.size * 0.55);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [worldId, levelNumber, starsEarned, coinsEarned, world]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

      {/* Top Tap Hint */}
      <div className="pointer-events-none absolute top-4 inset-x-0 flex justify-center px-4">
        <p className="text-xs sm:text-sm font-bold text-white/95 drop-shadow">
          Tap the floating {world.pluralName.toLowerCase()} for extra bursts!
        </p>
      </div>

      {/* Kid-Friendly Chunky Bottom Action Dock (matching reference UX) */}
      <div className="absolute bottom-6 inset-x-4 z-20 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onHome();
          }}
          aria-label="Lobby"
          className="sticker-btn w-15 h-15 rounded-2xl bg-white text-slate-800 flex items-center justify-center"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playServeSuccess();
            onNext();
          }}
          className="sticker-btn animate-serve-ready px-7 h-16 rounded-3xl font-display font-bold text-xl text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
          }}
        >
          <span>{hasNextLevelInWorld ? 'NEXT LEVEL' : 'WORLD COMPLETE!'}</span>
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onReplay();
          }}
          aria-label="Replay Level"
          className="sticker-btn w-15 h-15 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
