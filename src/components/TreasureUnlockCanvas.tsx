import React, { useEffect, useRef } from 'react';
import { BakeryItemId } from '../types/game';
import { WORLD_BY_ID } from '../data/bakeryWorlds';
import { drawCanvasTreatItem, drawRoundRect } from './BakeryArtwork';
import { soundEngine } from '../utils/soundEngine';

interface TreasureUnlockCanvasProps {
  unlockedWorldId: BakeryItemId;
  onContinueToWorld: () => void;
  onBackToLobby: () => void;
}

interface BubbleToy {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobble: number;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

function easeOutBounce(x: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * Adapted directly from the user's reference animation sheet (`renderTreasureChest`),
 * revealing the newly unlocked Bakery Item rising out of the glowing treasure chest
 * surrounded by interactive tappable water bubbles!
 */
export const TreasureUnlockCanvas: React.FC<TreasureUnlockCanvasProps> = ({
  unlockedWorldId,
  onContinueToWorld,
  onBackToLobby,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const world = WORLD_BY_ID[unlockedWorldId];
  const partnerWorld = world.partnerItemId ? WORLD_BY_ID[world.partnerItemId] : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let lidBurstDone = false;

    const bubbles: BubbleToy[] = [];
    for (let i = 0; i < 12; i++) {
      bubbles.push({
        x: 0.12 + Math.random() * 0.76,
        y: 0.55 + Math.random() * 0.38,
        r: 16 + Math.random() * 14,
        vy: -0.12 - Math.random() * 0.08,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    const sparks: SparkParticle[] = [];
    const spawnSparks = (nx: number, ny: number, count: number) => {
      const colors = ['#FEF08A', '#38BDF8', '#F472B6', '#FFFFFF', '#34D399'];
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const sp = 90 + Math.random() * 190;
        sparks.push({
          x: nx,
          y: ny,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 70,
          size: 4 + Math.random() * 5,
          color: colors[i % colors.length],
          life: 1,
        });
      }
    };

    soundEngine.playTreasureFanfare();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = (nx - b.x) * rect.width;
        const dy = (ny - b.y) * rect.height;
        if (Math.hypot(dx, dy) <= b.r + 18) {
          soundEngine.playBubblePop();
          spawnSparks(b.x, b.y, 14);
          b.y = 0.92;
          b.x = 0.12 + Math.random() * 0.76;
          return;
        }
      }

      soundEngine.playBubblePop();
      spawnSparks(nx, ny, 14);
    };

    canvas.addEventListener('click', handleCanvasClick);

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

      // Underwater Ocean Gradient (from reference Treasure Chest animation)
      const bg = ctx.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, '#22D3EE');
      bg.addColorStop(0.68, '#0284C7');
      bg.addColorStop(1, '#0F766E');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      // Sunbeams filtering through water
      ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(cw * (0.08 + i * 0.25), 0);
        ctx.lineTo(cw * (0.2 + i * 0.25), 0);
        ctx.lineTo(cw * (0.34 + i * 0.22), ch);
        ctx.lineTo(cw * (0.04 + i * 0.22), ch);
        ctx.closePath();
        ctx.fill();
      }

      // Sandy Seabed
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(0, ch * 0.72);
      ctx.quadraticCurveTo(cw * 0.5, ch * 0.66, cw, ch * 0.73);
      ctx.lineTo(cw, ch);
      ctx.lineTo(0, ch);
      ctx.closePath();
      ctx.fill();

      // Swaying Seaweed
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      [0.12, 0.88].forEach((sx, idx) => {
        ctx.beginPath();
        ctx.moveTo(cw * sx, ch * 0.76);
        ctx.quadraticCurveTo(
          cw * sx + Math.sin(elapsed * 3 + idx) * 16,
          ch * 0.62,
          cw * sx,
          ch * 0.52
        );
        ctx.stroke();
      });

      // Treasure Chest Drop, Rattle, & Lid Flip
      const drop = easeOutBounce(Math.min(1, elapsed / 0.5));
      const chestX = cw * 0.5;
      const chestY = ch * 0.28 + drop * (ch * 0.39);
      const rattle =
        elapsed > 0.45 && elapsed < 0.65 ? Math.sin(elapsed * 55) * 6 : 0;
      const lidOpen =
        elapsed > 0.65 ? easeOutBack(Math.min(1, (elapsed - 0.65) / 0.4)) : 0;

      if (lidOpen > 0.25 && !lidBurstDone) {
        lidBurstDone = true;
        soundEngine.playServeSuccess();
        spawnSparks(0.5, 0.5, 36);
      }

      ctx.save();
      ctx.translate(chestX + rattle, chestY);

      // Radiant Golden Beam inside chest when opened
      if (lidOpen > 0) {
        const glow = ctx.createRadialGradient(0, -34, 6, 0, -56, 130 * lidOpen);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.96)');
        glow.addColorStop(0.55, 'rgba(34, 211, 238, 0.42)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -50, 130 * lidOpen, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chest Base Box
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 5;
      drawRoundRect(ctx, -64, -28, 128, 56, 12);
      ctx.fill();
      ctx.stroke();

      // Chest Lid (hinged open)
      ctx.save();
      ctx.translate(0, -28 - lidOpen * 22);
      ctx.scale(1, 1 - lidOpen * 0.35);
      ctx.fillStyle = '#D97706';
      drawRoundRect(ctx, -68, -26, 136, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Gold Lock Clasp
      ctx.fillStyle = '#FEF08A';
      drawRoundRect(ctx, -12, -34 - lidOpen * 8, 24, 20, 6);
      ctx.fill();
      ctx.restore();

      // REVEALED BAKERY ITEM Rising Heroically Out of Treasure Chest!
      if (lidOpen > 0.05) {
        const riseProgress = easeOutBack(Math.min(1, (elapsed - 0.72) / 0.55));
        const itemY = chestY - 26 - riseProgress * (ch * 0.2) + Math.sin(elapsed * 3.4) * 7;
        const itemScale = Math.max(0.01, riseProgress);

        ctx.save();
        ctx.translate(chestX, itemY);
        ctx.scale(itemScale, itemScale);

        // Glowing Sticker Halo behind newly unlocked bakery item
        const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 72);
        halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        halo.addColorStop(0.55, 'rgba(250, 204, 21, 0.55)');
        halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 72, 0, Math.PI * 2);
        ctx.fill();

        drawCanvasTreatItem(ctx, unlockedWorldId, 52);
        ctx.restore();
      }

      // Interactive Tappable Bubbles rising across the underwater stage
      bubbles.forEach((b) => {
        b.wobble += dt * 3.2;
        b.y += b.vy * dt;
        if (b.y < -0.1) b.y = 0.92;
        const bx = (b.x + Math.sin(b.wobble) * 0.025) * cw;
        const by = b.y * ch;

        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-b.r * 0.34, -b.r * 0.34, b.r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Sparkle Pop Particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += (s.vx * dt) / cw;
        s.y += (s.vy * dt) / ch;
        s.vy += 200 * dt;
        s.life -= dt * 1.1;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x * cw, s.y * ch, s.size, 0, Math.PI * 2);
        ctx.fill();
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
  }, [unlockedWorldId]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

      {/* Top Unlock Reveal Header */}
      <div className="pointer-events-none absolute top-5 inset-x-4 z-20 flex flex-col items-center text-center">
        <div className="paper-card bg-white/95 px-6 py-3 rounded-3xl max-w-sm">
          <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-600">
            New Bakery Item Unlocked!
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            {world.name}
          </h2>
          {partnerWorld && (
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
              2-Item Math Combo: {world.name} + {partnerWorld.name}
            </p>
          )}
        </div>
        <p className="mt-2 text-xs font-bold text-white drop-shadow">
          Pop the rising bubbles with your finger!
        </p>
      </div>

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-6 inset-x-4 z-20 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackToLobby();
          }}
          className="sticker-btn px-5 h-14 rounded-2xl bg-white text-slate-800 font-display font-bold text-base"
        >
          Lobby
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playServeSuccess();
            onContinueToWorld();
          }}
          className="sticker-btn animate-serve-ready px-7 h-15 rounded-3xl font-display font-bold text-xl text-white flex items-center gap-2"
          style={{
            background: 'linear-gradient(180deg, #F59E0B 0%, #EA580C 100%)',
          }}
        >
          <span>PLAY {world.name.toUpperCase()}!</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
