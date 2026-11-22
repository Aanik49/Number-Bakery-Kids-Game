import React from 'react';
import { BakeryItemId } from '../types/game';

export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/**
 * Shared HTML5 Canvas renderer for all 6 bakery treats so Piñata Burst and
 * Treasure Chest Reveal draw crisp, unmistakable bakery elements at 60fps!
 */
export function drawCanvasTreatItem(
  ctx: CanvasRenderingContext2D,
  itemId: BakeryItemId,
  radius: number
) {
  ctx.save();
  // Crisp white paper-cutout sticker border glow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  switch (itemId) {
    case 'cookie': {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, '#FDE047');
      grad.addColorStop(0.65, '#F59E0B');
      grad.addColorStop(1, '#B45309');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Chocolate chips
      ctx.fillStyle = '#451A03';
      const chips = [
        [-0.42, -0.35, 0.16],
        [0.36, -0.32, 0.14],
        [-0.36, 0.35, 0.15],
        [0.42, 0.28, 0.16],
        [0.02, 0.05, 0.15],
      ];
      chips.forEach(([cx, cy, cr]) => {
        ctx.beginPath();
        ctx.arc(cx * radius, cy * radius, cr * radius, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'muffin': {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.08, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Striped liner base
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.moveTo(-radius * 0.72, radius * 0.06);
      ctx.lineTo(radius * 0.72, radius * 0.06);
      ctx.lineTo(radius * 0.54, radius * 0.92);
      ctx.lineTo(-radius * 0.54, radius * 0.92);
      ctx.closePath();
      ctx.fill();

      // Frosting puffs
      ctx.fillStyle = '#F472B6';
      ctx.beginPath();
      ctx.arc(-radius * 0.34, -radius * 0.05, radius * 0.45, 0, Math.PI * 2);
      ctx.arc(radius * 0.34, -radius * 0.05, radius * 0.45, 0, Math.PI * 2);
      ctx.arc(0, -radius * 0.32, radius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      // Berry on top
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.72, radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'bread': {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.28, radius * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      const bGrad = ctx.createLinearGradient(0, -radius * 0.75, 0, radius * 0.75);
      bGrad.addColorStop(0, '#FDBA74');
      bGrad.addColorStop(0.55, '#EA580C');
      bGrad.addColorStop(1, '#9A3412');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.12, radius * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crust score slashes
      ctx.strokeStyle = '#FEF3C7';
      ctx.lineWidth = Math.max(2, radius * 0.14);
      ctx.lineCap = 'round';
      [-0.45, 0, 0.45].forEach((offset) => {
        ctx.beginPath();
        ctx.moveTo((offset - 0.14) * radius, -0.35 * radius);
        ctx.lineTo((offset + 0.14) * radius, 0.22 * radius);
        ctx.stroke();
      });
      break;
    }

    case 'croissant': {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.24, radius * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Crescent curve
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, radius * 0.2, radius * 0.95, Math.PI * 1.1, Math.PI * 1.9);
      ctx.quadraticCurveTo(radius * 0.65, radius * 0.55, 0, radius * 0.18);
      ctx.quadraticCurveTo(-radius * 0.65, radius * 0.55, -radius * 0.9, -radius * 0.08);
      ctx.closePath();
      ctx.fill();

      // Golden flaky ridges
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.ellipse(0, -radius * 0.25, radius * 0.36, radius * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.52, -radius * 0.04, radius * 0.24, radius * 0.3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.52, -radius * 0.04, radius * 0.24, radius * 0.3, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cake': {
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, -radius * 1.05, -radius * 0.98, radius * 2.1, radius * 1.92, radius * 0.35);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Cake sponge body
      ctx.fillStyle = '#FDBA74';
      drawRoundRect(ctx, -radius * 0.88, -radius * 0.12, radius * 1.76, radius * 0.92, radius * 0.2);
      ctx.fill();

      // Pink frosting drip
      ctx.fillStyle = '#EC4899';
      drawRoundRect(ctx, -radius * 0.92, -radius * 0.48, radius * 1.84, radius * 0.52, radius * 0.22);
      ctx.fill();

      // Candle + Flame
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(-radius * 0.14, -radius * 0.86, radius * 0.28, radius * 0.42);
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(0, -radius * 0.96, radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cinnamon': {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Cinnamon swirl spiral
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = Math.max(2.2, radius * 0.17);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4.5; a += 0.25) {
        const sr = (a / (Math.PI * 4.5)) * radius * 0.78;
        const sx = Math.cos(a) * sr;
        const sy = Math.sin(a) * sr;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Luminous vanilla glaze highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = Math.max(2, radius * 0.14);
      ctx.beginPath();
      ctx.arc(-radius * 0.1, -radius * 0.1, radius * 0.46, Math.PI * 0.9, Math.PI * 1.85);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export const GameIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <img
    src="/icon.svg"
    alt="Number Bakery Game Icon"
    width={size}
    height={size}
    referrerPolicy="no-referrer"
    className={`select-none rounded-[24%] shadow-lg ${className}`}
    style={{ width: size, height: size }}
  />
);

export const BakeryTreatSVG: React.FC<{
  itemId: BakeryItemId;
  size?: number;
  className?: string;
}> = ({ itemId, size = 36, className = '' }) => {
  switch (itemId) {
    case 'cookie':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <circle cx="32" cy="34" r="27" fill="rgba(15,23,42,0.14)" />
          <circle cx="32" cy="31" r="27" fill="#FFFFFF" />
          <circle cx="32" cy="31" r="23" fill="#F59E0B" />
          <circle cx="29" cy="28" r="19" fill="#FBBF24" />
          <circle cx="21" cy="22" r="3.8" fill="#5C2D16" />
          <circle cx="42" cy="21" r="3.4" fill="#5C2D16" />
          <circle cx="20" cy="38" r="3.4" fill="#5C2D16" />
          <circle cx="44" cy="37" r="3.8" fill="#5C2D16" />
          <circle cx="33" cy="44" r="3.2" fill="#5C2D16" />
          <path d="M25 30 Q28 26 31 30" fill="none" stroke="#3B1D0E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M35 30 Q38 26 41 30" fill="none" stroke="#3B1D0E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M29 35 Q33 40 37 35" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'muffin':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <path
            d="M11 33 Q9 14 25 12 Q32 4 39 12 Q55 14 53 33 L47 57 Q32 61 17 57 Z"
            fill="rgba(15,23,42,0.14)"
            transform="translate(0,3)"
          />
          <path
            d="M11 33 Q9 14 25 12 Q32 4 39 12 Q55 14 53 33 L47 57 Q32 61 17 57 Z"
            fill="#FFFFFF"
          />
          <polygon points="16,33 48,33 43,53 21,53" fill="#22D3EE" />
          <polygon points="24,33 30,33 29,53 24,53" fill="#06B6D4" />
          <polygon points="36,33 42,33 40,53 35,53" fill="#06B6D4" />
          <ellipse cx="32" cy="27" rx="19" ry="10" fill="#F472B6" />
          <ellipse cx="32" cy="19" rx="13" ry="8" fill="#FB7185" />
          <circle cx="32" cy="12" r="5" fill="#E11D48" />
          <rect x="21" y="23" width="6" height="2.4" rx="1.2" fill="#FEF08A" transform="rotate(-18 21 23)" />
          <rect x="37" y="22" width="6" height="2.4" rx="1.2" fill="#FFFFFF" transform="rotate(20 37 22)" />
          <circle cx="27" cy="42" r="2.2" fill="#0F172A" />
          <circle cx="37" cy="42" r="2.2" fill="#0F172A" />
          <path d="M29 46 Q32 49 35 46" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'bread':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <rect x="5" y="18" width="54" height="34" rx="17" fill="rgba(15,23,42,0.14)" />
          <rect x="5" y="15" width="54" height="34" rx="17" fill="#FFFFFF" />
          <rect x="9" y="19" width="46" height="26" rx="13" fill="#EA580C" />
          <rect x="11" y="20" width="42" height="19" rx="10" fill="#FB923C" />
          <path d="M18 23 L23 32" stroke="#FEF3C7" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M30 22 L35 32" stroke="#FEF3C7" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M42 23 L47 32" stroke="#FEF3C7" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="27" cy="39" r="2" fill="#431407" />
          <circle cx="37" cy="39" r="2" fill="#431407" />
          <path d="M30 41 Q32 43.5 34 41" fill="none" stroke="#431407" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'croissant':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <ellipse cx="32" cy="36" rx="27" ry="19" fill="rgba(15,23,42,0.14)" />
          <path
            d="M8 42 Q8 16 32 14 Q56 16 56 42 Q49 52 39 45 Q32 41 25 45 Q15 52 8 42 Z"
            fill="#FFFFFF"
          />
          <path
            d="M12 40 Q13 20 32 18 Q51 20 52 40 Q47 47 39 41 Q32 37 25 41 Q17 47 12 40 Z"
            fill="#F59E0B"
          />
          <ellipse cx="32" cy="27" rx="10" ry="10" fill="#FDE047" />
          <path d="M22 22 Q20 32 23 38" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M42 22 Q44 32 41 38" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="28.5" cy="27" r="2" fill="#451A03" />
          <circle cx="35.5" cy="27" r="2" fill="#451A03" />
          <path d="M30 31 Q32 33.5 34 31" fill="none" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'cake':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <rect x="8" y="21" width="48" height="36" rx="12" fill="rgba(15,23,42,0.14)" />
          <path
            d="M27 7 Q32 2 37 7 L37 18 L48 18 Q56 18 56 26 L56 49 Q56 56 48 56 L16 56 Q8 56 8 49 L8 26 Q8 18 16 18 L27 18 Z"
            fill="#FFFFFF"
          />
          <rect x="12" y="29" width="40" height="23" rx="6" fill="#FDBA74" />
          <rect x="12" y="38" width="40" height="4" fill="#FFFBEB" />
          <path
            d="M11 26 Q11 21 17 21 L47 21 Q53 21 53 26 L53 33 Q48 37 43 33 Q38 37 32 33 Q26 37 21 33 Q16 37 11 33 Z"
            fill="#EC4899"
          />
          <rect x="29.5" y="12" width="5" height="10" rx="2" fill="#38BDF8" />
          <path d="M32 5 Q36 9 32 12 Q28 9 32 5 Z" fill="#FACC15" />
          <circle cx="26" cy="45" r="2" fill="#451A03" />
          <circle cx="38" cy="45" r="2" fill="#451A03" />
          <path d="M29 48 Q32 51 35 48" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'cinnamon':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`}>
          <circle cx="32" cy="34" r="27" fill="rgba(15,23,42,0.18)" />
          <circle cx="32" cy="31" r="27" fill="#FFFFFF" />
          <circle cx="32" cy="31" r="23" fill="#D97706" />
          <circle cx="32" cy="31" r="19" fill="#F59E0B" />
          <path
            d="M32 31 m0,-2 a3,3 0 1,1 0,6 a6,6 0 1,1 0,-12 a10,10 0 1,1 0,20 a14,14 0 1,1 0,-28"
            fill="none"
            stroke="#78350F"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M18 24 Q25 14 38 17 Q46 21 44 30"
            fill="none"
            stroke="#FFFBEB"
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.92"
          />
          <circle cx="24" cy="39" r="2.2" fill="#FEF08A" />
          <circle cx="42" cy="38" r="2.2" fill="#22D3EE" />
        </svg>
      );
  }
};

export const CUSTOMER_NAMES = [
  'Barnaby Bear',
  'Foxy Fiona',
  'Pippa Bunny',
  'Sparky Bot',
  'Chef Bao Panda',
  'Sunny Owl',
];

export const CustomerAvatarSVG: React.FC<{ index: number; size?: number }> = ({
  index,
  size = 64,
}) => {
  const safe = Math.abs(index) % 6;
  const bgColors = ['#FFEDD5', '#FCE7F3', '#E0F2FE', '#DCFCE7', '#EDE9FE', '#FEF3C7'];

  return (
    <div
      className="rounded-2xl border-[3px] border-white shadow-md flex items-center justify-center shrink-0 overflow-hidden"
      style={{ width: size, height: size, backgroundColor: bgColors[safe] }}
    >
      {safe === 0 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <circle cx="20" cy="24" r="11" fill="#D97706" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="60" cy="24" r="11" fill="#D97706" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="40" cy="44" r="26" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="3" />
          <ellipse cx="40" cy="52" rx="13" ry="10" fill="#FEF3C7" />
          <circle cx="30" cy="40" r="3.6" fill="#1E293B" />
          <circle cx="50" cy="40" r="3.6" fill="#1E293B" />
          <ellipse cx="40" cy="48" rx="4.5" ry="3.2" fill="#78350F" />
          <path d="M34 55 Q40 60 46 55" fill="none" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      )}
      {safe === 1 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <polygon points="15,36 22,12 37,27" fill="#FB7185" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="65,36 58,12 43,27" fill="#FB7185" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="40" cy="46" r="24" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M18 46 Q29 46 40 58 Q51 46 62 46 Q57 68 40 70 Q23 68 18 46 Z" fill="#FFF1F2" />
          <circle cx="31" cy="42" r="3.5" fill="#1E293B" />
          <circle cx="49" cy="42" r="3.5" fill="#1E293B" />
          <circle cx="40" cy="52" r="3.8" fill="#1E293B" />
          <path d="M35 58 Q40 62 45 58" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {safe === 2 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <rect x="24" y="6" width="11" height="28" rx="5.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2.5" />
          <rect x="45" y="6" width="11" height="28" rx="5.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="40" cy="48" r="23" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="31" cy="44" r="3.3" fill="#0F172A" />
          <circle cx="49" cy="44" r="3.3" fill="#0F172A" />
          <circle cx="25" cy="51" r="4" fill="#FDA4AF" />
          <circle cx="55" cy="51" r="4" fill="#FDA4AF" />
          <path d="M35 53 Q40 58 45 53" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {safe === 3 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <line x1="40" y1="10" x2="40" y2="22" stroke="#0F172A" strokeWidth="3.5" />
          <circle cx="40" cy="9" r="5" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="17" y="22" width="46" height="44" rx="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
          <rect x="24" y="32" width="32" height="16" rx="6" fill="#0F172A" />
          <circle cx="33" cy="40" r="3.6" fill="#FDE047" />
          <circle cx="47" cy="40" r="3.6" fill="#FDE047" />
          <path d="M32 55 Q40 60 48 55" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {safe === 4 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <circle cx="21" cy="24" r="10" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="59" cy="24" r="10" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="40" cy="46" r="24" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
          <ellipse cx="30" cy="42" rx="6" ry="7.5" fill="#1E293B" transform="rotate(-12 30 42)" />
          <ellipse cx="50" cy="42" rx="6" ry="7.5" fill="#1E293B" transform="rotate(12 50 42)" />
          <circle cx="31" cy="41" r="2.2" fill="#FFFFFF" />
          <circle cx="49" cy="41" r="2.2" fill="#FFFFFF" />
          <ellipse cx="40" cy="51" rx="4" ry="2.8" fill="#1E293B" />
          <path d="M35 56 Q40 60 45 56" fill="none" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )}
      {safe === 5 && (
        <svg viewBox="0 0 80 80" className="w-[88%] h-[88%]">
          <circle cx="40" cy="44" r="26" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="30" cy="41" r="9" fill="#FEF3C7" />
          <circle cx="50" cy="41" r="9" fill="#FEF3C7" />
          <circle cx="30" cy="41" r="4" fill="#1E293B" />
          <circle cx="50" cy="41" r="4" fill="#1E293B" />
          <polygon points="36,48 44,48 40,56" fill="#F59E0B" />
        </svg>
      )}
    </div>
  );
};
