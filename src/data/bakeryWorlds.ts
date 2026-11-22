import { BakeryItemId, BakeryWorld, LevelSpec, OrderSpec } from '../types/game';

function buildSingleItemOrders(
  worldId: BakeryItemId,
  levelNumber: number,
  specs: Array<{ target: number; hint: string; isTwist?: boolean; expression?: string }>
): OrderSpec[] {
  return specs.map((spec, idx) => ({
    id: `${worldId}-${levelNumber}-o${idx + 1}`,
    requirements: [
      {
        itemId: worldId,
        target: spec.target,
        expression: spec.expression,
      },
    ],
    hint: spec.hint,
    isTwist: Boolean(spec.isTwist),
    customerIndex: (levelNumber * 2 + idx) % 6,
  }));
}

function buildDualItemOrders(
  primaryId: BakeryItemId,
  partnerId: BakeryItemId,
  levelNumber: number,
  specs: Array<{
    a: number;
    b: number;
    exprA?: string;
    exprB?: string;
    hint: string;
    isTwist?: boolean;
  }>
): OrderSpec[] {
  return specs.map((spec, idx) => ({
    id: `${primaryId}-${levelNumber}-o${idx + 1}`,
    requirements: [
      { itemId: primaryId, target: spec.a, expression: spec.exprA },
      { itemId: partnerId, target: spec.b, expression: spec.exprB },
    ],
    hint: spec.hint,
    isTwist: Boolean(spec.isTwist),
    customerIndex: (levelNumber + idx * 3 + primaryId.length) % 6,
  }));
}

// ---------------------------------------------------------------------------
// WORLD 1: COOKIE KITCHEN (EASY - 1 Item: Cookie)
// ---------------------------------------------------------------------------
const COOKIE_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Warm-Up Pairs',
    timerSeconds: 40,
    baseRewardCoins: 10,
    allowSubtractTools: false,
    orders: buildSingleItemOrders('cookie', 1, [
      { target: 4, hint: 'Tap +2 twice to make 4!' },
      { target: 6, hint: 'Skip-count by 2s: 2, 4, 6!' },
    ]),
  },
  {
    levelNumber: 2,
    title: 'High Five Tray',
    timerSeconds: 40,
    baseRewardCoins: 12,
    allowSubtractTools: false,
    orders: buildSingleItemOrders('cookie', 2, [
      { target: 7, hint: 'Try 5 + 2!' },
      { target: 10, hint: 'One big 10 tray or two 5s!' },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Dozen Delight',
    timerSeconds: 38,
    baseRewardCoins: 12,
    allowSubtractTools: false,
    orders: buildSingleItemOrders('cookie', 3, [
      { target: 12, hint: 'Stack 10 + 2 for a dozen!' },
      { target: 15, hint: 'Try 10 + 5 or three 5s!' },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Skip-Count Sprint',
    timerSeconds: 38,
    baseRewardCoins: 14,
    allowSubtractTools: false,
    orders: buildSingleItemOrders('cookie', 4, [
      { target: 14, hint: 'Stack 10 + 2 + 2!' },
      { target: 17, hint: 'Try 10 + 5 + 2!' },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Twenty Treat Party',
    timerSeconds: 36,
    baseRewardCoins: 15,
    allowSubtractTools: false,
    orders: buildSingleItemOrders('cookie', 5, [
      { target: 20, hint: 'Two 10 trays make 20!' },
      { target: 19, hint: 'Stack 10 + 5 + 2 + 2!' },
    ]),
  },
  {
    levelNumber: 6,
    title: 'First Scoop Twist',
    timerSeconds: 36,
    baseRewardCoins: 16,
    allowSubtractTools: true,
    orders: buildSingleItemOrders('cookie', 6, [
      { target: 9, hint: 'Make 10, then Scoop -1!', isTwist: true },
      { target: 11, hint: 'Make 12, then Scoop -1!', isTwist: true },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Mouse Nibble Fun',
    timerSeconds: 36,
    baseRewardCoins: 16,
    allowSubtractTools: true,
    orders: buildSingleItemOrders('cookie', 7, [
      { target: 7, hint: 'Try 10, then Nibble -3!', isTwist: true, expression: '10 - 3' },
      { target: 13, hint: 'Stack 15, or 10 + 2 + 2 - 1!', isTwist: true },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Choco Chip Stack',
    timerSeconds: 35,
    baseRewardCoins: 18,
    allowSubtractTools: true,
    orders: buildSingleItemOrders('cookie', 8, [
      { target: 16, hint: 'Make 17, then Scoop -1!', isTwist: true },
      { target: 18, hint: 'Make 20 and take away 2, or 10 + 5 + 2 + 2 - 1!' },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Golden Oven Rush',
    timerSeconds: 34,
    baseRewardCoins: 18,
    allowSubtractTools: true,
    orders: buildSingleItemOrders('cookie', 9, [
      { target: 22, hint: 'Stack 10 + 10 + 2!' },
      { target: 19, hint: 'Make 20, then Scoop -1!', isTwist: true, expression: '20 - 1' },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Cookie Captain Finale',
    timerSeconds: 34,
    baseRewardCoins: 22,
    allowSubtractTools: true,
    orders: buildSingleItemOrders('cookie', 10, [
      { target: 23, hint: 'Try 20 + 5, then take away 2 (or 10+10+2+2-1)!', isTwist: true },
      { target: 25, hint: 'Two 10s plus a 5 makes 25!' },
    ]),
  },
];

// ---------------------------------------------------------------------------
// WORLD 2: MUFFIN MEADOW (MEDIUM-EASY - 2 Items: Muffin Cake + Cookie)
// ---------------------------------------------------------------------------
const MUFFIN_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Berry Combo Box',
    timerSeconds: 36,
    baseRewardCoins: 16,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 1, [
      { a: 4, b: 5, hint: 'Bake 4 Muffins and 5 Cookies!' },
      { a: 7, b: 6, hint: 'Try 5+2 Muffins and 2+2+2 Cookies!' },
    ]),
  },
  {
    levelNumber: 2,
    title: 'Sweet Pairings',
    timerSeconds: 36,
    baseRewardCoins: 18,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 2, [
      { a: 10, b: 4, hint: '10 Muffins + 4 Cookies = 14 treats!' },
      { a: 8, b: 10, hint: 'Stack 8 Muffins and a 10-tray of Cookies!' },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Minty Mix-Up',
    timerSeconds: 35,
    baseRewardCoins: 18,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 3, [
      { a: 12, b: 7, hint: '10+2 Muffins and 5+2 Cookies!' },
      { a: 9, b: 10, hint: 'Make 10 Muffins then Scoop -1!', isTwist: true },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Blueberry Basket',
    timerSeconds: 35,
    baseRewardCoins: 20,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 4, [
      { a: 15, b: 9, hint: '15 Muffins and (10 - 1) Cookies!', isTwist: true },
      { a: 11, b: 12, hint: 'Try 12 - 1 Muffins + 12 Cookies!', isTwist: true },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Picnic Platter',
    timerSeconds: 34,
    baseRewardCoins: 20,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 5, [
      { a: 14, b: 8, hint: '10+2+2 Muffins and 10-2 or 5+2+2-1 Cookies!' },
      { a: 17, b: 10, hint: '10+5+2 Muffins and 10 Cookies!' },
    ]),
  },
  {
    levelNumber: 6,
    title: 'Nibble Double',
    timerSeconds: 34,
    baseRewardCoins: 22,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 6, [
      { a: 13, b: 7, exprA: '15 - 2', exprB: '10 - 3', hint: 'Solve both subtractions!', isTwist: true },
      { a: 16, b: 11, hint: 'Try 17 - 1 Muffins and 12 - 1 Cookies!', isTwist: true },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Cupcake Liner Dash',
    timerSeconds: 33,
    baseRewardCoins: 22,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 7, [
      { a: 18, b: 12, hint: '20 - 2 Muffins and 10 + 2 Cookies!', isTwist: true },
      { a: 15, b: 14, exprA: '10 + 5', exprB: '15 - 1', hint: 'Match both trays carefully!' },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Sprinkle Twins',
    timerSeconds: 33,
    baseRewardCoins: 24,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 8, [
      { a: 19, b: 13, exprA: '20 - 1', hint: '20 - 1 Muffins and 13 Cookies!', isTwist: true },
      { a: 17, b: 15, exprA: '20 - 3', hint: 'Use the -3 Mouse Nibble on 20!', isTwist: true },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Meadow Feast',
    timerSeconds: 32,
    baseRewardCoins: 24,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 9, [
      { a: 21, b: 14, hint: '22 - 1 Muffins and 15 - 1 Cookies!', isTwist: true },
      { a: 22, b: 16, hint: 'Bake a grand combo of 38 treats!' },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Muffin Monarch Finale',
    timerSeconds: 32,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('muffin', 'cookie', 10, [
      { a: 23, b: 17, exprA: '25 - 2', exprB: '20 - 3', hint: 'Use +10, +5, and Nibble -3!', isTwist: true },
      { a: 24, b: 19, exprB: '20 - 1', hint: 'Last Muffin order to unlock Bread!' },
    ]),
  },
];

// ---------------------------------------------------------------------------
// WORLD 3: ARTISAN BREAD BARN (SLIGHTLY HARD - 2 Items: Bread + Muffin Cake)
// ---------------------------------------------------------------------------
const BREAD_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Crusty Loaves',
    timerSeconds: 33,
    baseRewardCoins: 20,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 1, [
      { a: 11, b: 9, exprA: '10 + 1', exprB: '10 - 1', hint: 'Bread + Muffin combo!' },
      { a: 13, b: 12, hint: 'Stack 13 Bread and 12 Muffins!' },
    ]),
  },
  {
    levelNumber: 2,
    title: 'Harvest Heat',
    timerSeconds: 33,
    baseRewardCoins: 22,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 2, [
      { a: 14, b: 11, exprA: '15 - 1', hint: 'Try 15 - 1 Bread and 12 - 1 Muffins!', isTwist: true },
      { a: 16, b: 13, exprB: '10 + 3', hint: 'Make 16 Bread + 13 Muffins!' },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Sourdough Sum',
    timerSeconds: 32,
    baseRewardCoins: 22,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 3, [
      { a: 17, b: 14, exprA: '20 - 3', hint: '20 - 3 Bread and 14 Muffins!', isTwist: true },
      { a: 19, b: 15, exprA: '20 - 1', exprB: '10 + 5', hint: 'Fast mental subtraction!' },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Golden Wheat Order',
    timerSeconds: 32,
    baseRewardCoins: 24,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 4, [
      { a: 18, b: 17, exprB: '20 - 3', hint: 'Use -3 Nibble for 17!', isTwist: true },
      { a: 21, b: 16, exprA: '20 + 1', hint: 'Make 22 - 1 Bread + 16 Muffins!' },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Baguette Balance',
    timerSeconds: 31,
    baseRewardCoins: 24,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 5, [
      { a: 23, b: 18, exprA: '20 + 3', exprB: '20 - 2', hint: 'Keep both counts sharp!', isTwist: true },
      { a: 24, b: 19, exprA: '25 - 1', exprB: '20 - 1', hint: 'Both need a -1 Scoop!', isTwist: true },
    ]),
  },
  {
    levelNumber: 6,
    title: 'Barn Brunch Rush',
    timerSeconds: 31,
    baseRewardCoins: 26,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 6, [
      { a: 22, b: 17, exprA: '25 - 3', exprB: '20 - 3', hint: 'Double -3 Nibble trick!', isTwist: true },
      { a: 26, b: 15, exprA: '20 + 6', hint: '20 + 5 + 2 - 1 makes 26!' },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Warm Rye Riddle',
    timerSeconds: 30,
    baseRewardCoins: 26,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 7, [
      { a: 27, b: 19, exprA: '30 - 3', exprB: '20 - 1', hint: 'Start with 30 and 20!', isTwist: true },
      { a: 25, b: 21, exprB: '22 - 1', hint: 'Two big stacks!' },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Baker Barn Blitz',
    timerSeconds: 30,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 8, [
      { a: 28, b: 22, exprA: '30 - 2', exprB: '25 - 3', hint: 'Use 30 - 1 - 1 and 25 - 3!', isTwist: true },
      { a: 29, b: 18, exprA: '30 - 1', hint: 'Just 1 less than 30!' },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Millstone Math',
    timerSeconds: 29,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 9, [
      { a: 26, b: 24, exprA: '20 + 6', exprB: '25 - 1', hint: 'Makes 50 treats altogether!' },
      { a: 27, b: 23, exprA: '30 - 3', exprB: '20 + 3', hint: '30 - 3 Bread and 23 Muffins!', isTwist: true },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Master Loaf Finale',
    timerSeconds: 29,
    baseRewardCoins: 32,
    allowSubtractTools: true,
    orders: buildDualItemOrders('bread', 'muffin', 10, [
      { a: 29, b: 24, exprA: '30 - 1', exprB: '25 - 1', hint: 'Final Bread test!', isTwist: true },
      { a: 31, b: 22, exprA: '30 + 1', exprB: '25 - 3', hint: 'Unlock Croissant Cloud Café!' },
    ]),
  },
];

// ---------------------------------------------------------------------------
// WORLD 4: CROISSANT CLOUD CAFÉ (HARDER - 2 Items: Croissant + Bread)
// ---------------------------------------------------------------------------
const CROISSANT_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Flaky Morning',
    timerSeconds: 30,
    baseRewardCoins: 24,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 1, [
      { a: 14, b: 13, exprA: '10 + 4', exprB: '15 - 2', hint: 'Croissant + Bread combo!' },
      { a: 17, b: 16, exprA: '20 - 3', exprB: '10 + 6', hint: 'Use Nibble -3 on 20!', isTwist: true },
    ]),
  },
  {
    levelNumber: 2,
    title: 'Butter Breeze',
    timerSeconds: 30,
    baseRewardCoins: 26,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 2, [
      { a: 19, b: 17, exprA: '20 - 1', exprB: '20 - 3', hint: 'Both start from 20!', isTwist: true },
      { a: 21, b: 18, exprA: '15 + 6', exprB: '20 - 2', hint: 'Mental addition + subtraction!' },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Skyline Café',
    timerSeconds: 29,
    baseRewardCoins: 26,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 3, [
      { a: 22, b: 19, exprA: '25 - 3', exprB: '20 - 1', hint: '25 - 3 and 20 - 1!', isTwist: true },
      { a: 24, b: 21, exprA: '20 + 4', exprB: '20 + 1', hint: 'Stack fast before the bell!' },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Lavender Layers',
    timerSeconds: 29,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 4, [
      { a: 26, b: 22, exprA: '30 - 4', exprB: '25 - 3', hint: '30 - 3 - 1 = 26!', isTwist: true },
      { a: 27, b: 23, exprA: '30 - 3', exprB: '20 + 3', hint: 'Together they equal 50!' },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Parisian Rush',
    timerSeconds: 28,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 5, [
      { a: 28, b: 24, exprA: '20 + 8', exprB: '25 - 1', hint: 'Build 30 - 2 and 25 - 1!' },
      { a: 29, b: 26, exprA: '30 - 1', exprB: '30 - 4', hint: 'Watch the -4 trick (-3 then -1)!', isTwist: true },
    ]),
  },
  {
    levelNumber: 6,
    title: 'Crescent Count',
    timerSeconds: 28,
    baseRewardCoins: 30,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 6, [
      { a: 31, b: 25, exprA: '30 + 1', exprB: '20 + 5', hint: 'Try 32 - 1 Croissants!' },
      { a: 32, b: 27, exprA: '35 - 3', exprB: '30 - 3', hint: 'Both subtract 3!', isTwist: true },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Cloud Nine Tray',
    timerSeconds: 28,
    baseRewardCoins: 30,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 7, [
      { a: 33, b: 28, exprA: '35 - 2', exprB: '30 - 2', hint: 'Subtract 2 using Scoop -1 twice!', isTwist: true },
      { a: 34, b: 29, exprA: '35 - 1', exprB: '30 - 1', hint: 'Quick -1 finish on both!' },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Golden Puff Challenge',
    timerSeconds: 27,
    baseRewardCoins: 32,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 8, [
      { a: 36, b: 27, exprA: '40 - 4', exprB: '30 - 3', hint: 'Start from 40 and 30!', isTwist: true },
      { a: 35, b: 31, exprA: '25 + 10', exprB: '30 + 1', hint: 'Speedy tens stacking!' },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Café Express',
    timerSeconds: 27,
    baseRewardCoins: 34,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 9, [
      { a: 37, b: 32, exprA: '40 - 3', exprB: '35 - 3', hint: '40 - 3 and 35 - 3!', isTwist: true },
      { a: 38, b: 29, exprA: '40 - 2', exprB: '30 - 1', hint: 'Almost to the Cake Studio!' },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Croissant Crown Finale',
    timerSeconds: 27,
    baseRewardCoins: 38,
    allowSubtractTools: true,
    orders: buildDualItemOrders('croissant', 'bread', 10, [
      { a: 39, b: 34, exprA: '40 - 1', exprB: '35 - 1', hint: 'Precision baking!', isTwist: true },
      { a: 37, b: 36, exprA: '40 - 3', exprB: '40 - 4', hint: 'Complete to unlock Cake Studio!', isTwist: true },
    ]),
  },
];

// ---------------------------------------------------------------------------
// WORLD 5: CELEBRATION CAKE STUDIO (HARD - 2 Items: Cake + Croissant)
// ---------------------------------------------------------------------------
const CAKE_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Frosting Fiesta',
    timerSeconds: 28,
    baseRewardCoins: 28,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 1, [
      { a: 18, b: 17, exprA: '20 - 2', exprB: '20 - 3', hint: 'Cake + Croissant combo!' },
      { a: 23, b: 19, exprA: '15 + 8', exprB: '20 - 1', hint: 'Add 15 + 8 in your head!' },
    ]),
  },
  {
    levelNumber: 2,
    title: 'Tiered Treats',
    timerSeconds: 28,
    baseRewardCoins: 30,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 2, [
      { a: 26, b: 22, exprA: '30 - 4', exprB: '25 - 3', hint: 'Subtract smartly!', isTwist: true },
      { a: 29, b: 24, exprA: '30 - 1', exprB: '19 + 5', hint: '19 + 5 = 24!' },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Party Platter',
    timerSeconds: 27,
    baseRewardCoins: 30,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 3, [
      { a: 31, b: 27, exprA: '25 + 6', exprB: '30 - 3', hint: '25 + 6 = 31!' },
      { a: 33, b: 28, exprA: '35 - 2', exprB: '30 - 2', hint: 'Both take away 2!', isTwist: true },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Candle Count',
    timerSeconds: 27,
    baseRewardCoins: 32,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 4, [
      { a: 34, b: 29, exprA: '40 - 6', exprB: '30 - 1', hint: '40 - 3 - 3 = 34!', isTwist: true },
      { a: 36, b: 31, exprA: '29 + 7', exprB: '35 - 4', hint: 'Sharp mental math!' },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Confetti Crunch',
    timerSeconds: 27,
    baseRewardCoins: 34,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 5, [
      { a: 37, b: 32, exprA: '40 - 3', exprB: '35 - 3', hint: 'Double -3 Nibble!', isTwist: true },
      { a: 38, b: 34, exprA: '30 + 8', exprB: '40 - 6', hint: 'Use 40 - 3 - 3 for 34!' },
    ]),
  },
  {
    levelNumber: 6,
    title: 'Ribbon Cake Rush',
    timerSeconds: 26,
    baseRewardCoins: 34,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 6, [
      { a: 39, b: 33, exprA: '40 - 1', exprB: '36 - 3', hint: 'Solve both equations!', isTwist: true },
      { a: 41, b: 35, exprA: '35 + 6', exprB: '40 - 5', hint: 'Big party order!' },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Sugar Star Sprint',
    timerSeconds: 26,
    baseRewardCoins: 36,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 7, [
      { a: 42, b: 36, exprA: '45 - 3', exprB: '40 - 4', hint: '45 - 3 Cakes and 40 - 4 Croissants!', isTwist: true },
      { a: 43, b: 37, exprA: '35 + 8', exprB: '40 - 3', hint: 'Stay cool under the timer!' },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Velvet Swirl Math',
    timerSeconds: 26,
    baseRewardCoins: 38,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 8, [
      { a: 44, b: 38, exprA: '45 - 1', exprB: '40 - 2', hint: 'Start with 45 and 40!', isTwist: true },
      { a: 46, b: 39, exprA: '50 - 4', exprB: '40 - 1', hint: '50 - 3 - 1 = 46!' },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Grand Gala Order',
    timerSeconds: 25,
    baseRewardCoins: 40,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 9, [
      { a: 47, b: 41, exprA: '50 - 3', exprB: '45 - 4', hint: 'High-speed party prep!', isTwist: true },
      { a: 48, b: 42, exprA: '40 + 8', exprB: '45 - 3', hint: 'One more level to Cinnamon Roll!' },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Royal Cake Finale',
    timerSeconds: 25,
    baseRewardCoins: 45,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cake', 'croissant', 10, [
      { a: 49, b: 43, exprA: '50 - 1', exprB: '46 - 3', hint: 'Royal precision!', isTwist: true },
      { a: 47, b: 44, exprA: '50 - 3', exprB: '50 - 6', hint: 'Complete to unlock Cinnamon Starlight!', isTwist: true },
    ]),
  },
];

// ---------------------------------------------------------------------------
// WORLD 6: CINNAMON STARLIGHT BAKERY (MASTER - 2 Items: Cinnamon Roll + Cake)
// ---------------------------------------------------------------------------
const CINNAMON_LEVELS: LevelSpec[] = [
  {
    levelNumber: 1,
    title: 'Starlight Swirls',
    timerSeconds: 26,
    baseRewardCoins: 34,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 1, [
      { a: 24, b: 22, exprA: '30 - 6', exprB: '25 - 3', hint: 'Cinnamon Roll + Cake finale world!', isTwist: true },
      { a: 27, b: 26, exprA: '19 + 8', exprB: '30 - 4', hint: '19 + 8 = 27!' },
    ]),
  },
  {
    levelNumber: 2,
    title: 'Neon Glaze Rush',
    timerSeconds: 26,
    baseRewardCoins: 36,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 2, [
      { a: 31, b: 28, exprA: '24 + 7', exprB: '35 - 7', hint: '24 + 7 = 31, 35 - 7 = 28!' },
      { a: 33, b: 29, exprA: '40 - 7', exprB: '35 - 6', hint: 'Use -3 twice plus -1!', isTwist: true },
    ]),
  },
  {
    levelNumber: 3,
    title: 'Midnight Spice',
    timerSeconds: 25,
    baseRewardCoins: 38,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 3, [
      { a: 34, b: 32, exprA: '26 + 8', exprB: '40 - 8', hint: 'Sharp mental sums!' },
      { a: 36, b: 33, exprA: '45 - 9', exprB: '39 - 6', hint: '45 - 9 = 36!', isTwist: true },
    ]),
  },
  {
    levelNumber: 4,
    title: 'Comet Spiral',
    timerSeconds: 25,
    baseRewardCoins: 40,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 4, [
      { a: 37, b: 34, exprA: '28 + 9', exprB: '40 - 6', hint: '28 + 9 = 37!' },
      { a: 39, b: 36, exprA: '45 - 6', exprB: '40 - 4', hint: 'Subtract cleanly from 40 & 45!', isTwist: true },
    ]),
  },
  {
    levelNumber: 5,
    title: 'Galaxy Glaze',
    timerSeconds: 25,
    baseRewardCoins: 42,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 5, [
      { a: 41, b: 37, exprA: '33 + 8', exprB: '45 - 8', hint: '33 + 8 = 41, 45 - 8 = 37!' },
      { a: 43, b: 38, exprA: '50 - 7', exprB: '44 - 6', hint: '50 - 3 - 3 - 1 = 43!', isTwist: true },
    ]),
  },
  {
    levelNumber: 6,
    title: 'Turbo Cinnamon',
    timerSeconds: 24,
    baseRewardCoins: 44,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 6, [
      { a: 44, b: 39, exprA: '50 - 6', exprB: '48 - 9', hint: 'Master subtraction!' , isTwist: true},
      { a: 46, b: 41, exprA: '37 + 9', exprB: '50 - 9', hint: '37 + 9 = 46, 50 - 9 = 41!' },
    ]),
  },
  {
    levelNumber: 7,
    title: 'Aurora Oven',
    timerSeconds: 24,
    baseRewardCoins: 46,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 7, [
      { a: 47, b: 42, exprA: '55 - 8', exprB: '50 - 8', hint: 'Both subtract 8!', isTwist: true },
      { a: 48, b: 44, exprA: '39 + 9', exprB: '50 - 6', hint: 'Stack fast for huge tips!' },
    ]),
  },
  {
    levelNumber: 8,
    title: 'Cosmic Swirl',
    timerSeconds: 24,
    baseRewardCoins: 48,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 8, [
      { a: 49, b: 46, exprA: '55 - 6', exprB: '50 - 4', hint: 'Almost 50 on each tray!', isTwist: true },
      { a: 51, b: 47, exprA: '42 + 9', exprB: '50 - 3', hint: '42 + 9 = 51!' },
    ]),
  },
  {
    levelNumber: 9,
    title: 'Supernova Bake-Off',
    timerSeconds: 24,
    baseRewardCoins: 50,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 9, [
      { a: 52, b: 48, exprA: '55 - 3', exprB: '54 - 6', hint: 'Combined total = 100!', isTwist: true },
      { a: 53, b: 49, exprA: '45 + 8', exprB: '55 - 6', hint: 'One final level ahead!' },
    ]),
  },
  {
    levelNumber: 10,
    title: 'Grand Starlight Baker',
    timerSeconds: 24,
    baseRewardCoins: 60,
    allowSubtractTools: true,
    orders: buildDualItemOrders('cinnamon', 'cake', 10, [
      { a: 54, b: 47, exprA: '60 - 6', exprB: '55 - 8', hint: 'Grand Master Math!', isTwist: true },
      { a: 56, b: 51, exprA: '48 + 8', exprB: '60 - 9', hint: 'Become the Number Bakery Legend!', isTwist: true },
    ]),
  },
];

// ---------------------------------------------------------------------------
// ALL 6 BAKERY WORLDS WITH DISTINCT PAPER-CUTOUT + NEON TOYBOX THEMES
// ---------------------------------------------------------------------------
export const BAKERY_WORLDS: BakeryWorld[] = [
  {
    id: 'cookie',
    orderIndex: 0,
    name: 'Cookie',
    pluralName: 'Cookies',
    worldTitle: 'Cookie Kitchen',
    ovenName: 'Sunny Coral Oven',
    difficultyLabel: 'Easy',
    description: 'Skip-count by 2s, 5s, and 10s with crispy chocolate-chip cookies!',
    partnerItemId: null,
    theme: {
      pageBg: 'linear-gradient(180deg, #FFF3E8 0%, #FFE4D6 100%)',
      panelBg: '#FFFFFF',
      counterBg: 'linear-gradient(180deg, #FFD8C2 0%, #FFF2E6 100%)',
      awningA: '#FF5E7E',
      awningB: '#FFF9F2',
      accentHex: '#FF5E7E',
      accentDarkHex: '#E11D48',
      secondaryHex: '#F59E0B',
      glowHex: '#FB7185',
      trayTop: '#FFE29F',
      trayBottom: '#FFA94D',
      textColor: '#1E293B',
      subTextColor: '#64748B',
      isDarkTheme: false,
      patternClass: 'craft-dot-bg',
    },
    levels: COOKIE_LEVELS,
  },
  {
    id: 'muffin',
    orderIndex: 1,
    name: 'Muffin Cake',
    pluralName: 'Muffin Cakes',
    worldTitle: 'Muffin Meadow',
    ovenName: 'Electric Mint Oven',
    difficultyLabel: 'Medium-Easy',
    description: 'Dual-item baking! Mix Muffin Cakes + Cookies on glowing mint trays.',
    partnerItemId: 'cookie',
    theme: {
      pageBg: 'linear-gradient(180deg, #E6FFFA 0%, #CCFBF1 100%)',
      panelBg: '#FFFFFF',
      counterBg: 'linear-gradient(180deg, #A7F3D0 0%, #ECFDF5 100%)',
      awningA: '#06B6D4',
      awningB: '#F0FDFA',
      accentHex: '#06B6D4',
      accentDarkHex: '#0E7490',
      secondaryHex: '#10B981',
      glowHex: '#22D3EE',
      trayTop: '#99F6E4',
      trayBottom: '#2DD4BF',
      textColor: '#0F172A',
      subTextColor: '#475569',
      isDarkTheme: false,
      patternClass: 'craft-dot-bg',
    },
    levels: MUFFIN_LEVELS,
  },
  {
    id: 'bread',
    orderIndex: 2,
    name: 'Bread',
    pluralName: 'Bread Loaves',
    worldTitle: 'Artisan Bread Barn',
    ovenName: 'Golden Honey Oven',
    difficultyLabel: 'Slightly Hard',
    description: 'Dual-item baking! Calculate warm Bread + Muffin Cakes with clever twists.',
    partnerItemId: 'muffin',
    theme: {
      pageBg: 'linear-gradient(180deg, #FEFCE8 0%, #FEF08A 100%)',
      panelBg: '#FFFDF5',
      counterBg: 'linear-gradient(180deg, #FDE68A 0%, #FFFBEB 100%)',
      awningA: '#F97316',
      awningB: '#FFFBEB',
      accentHex: '#F97316',
      accentDarkHex: '#C2410C',
      secondaryHex: '#EAB308',
      glowHex: '#FB923C',
      trayTop: '#FDE047',
      trayBottom: '#F59E0B',
      textColor: '#292524',
      subTextColor: '#78716C',
      isDarkTheme: false,
      patternClass: 'craft-dot-bg',
    },
    levels: BREAD_LEVELS,
  },
  {
    id: 'croissant',
    orderIndex: 3,
    name: 'Croissant',
    pluralName: 'Croissants',
    worldTitle: 'Croissant Cloud Café',
    ovenName: 'Sky Lavender Oven',
    difficultyLabel: 'Harder',
    description: 'Dual-item baking! Solve Croissant + Bread equations high in the clouds.',
    partnerItemId: 'bread',
    theme: {
      pageBg: 'linear-gradient(180deg, #F3E8FF 0%, #DBEAFE 100%)',
      panelBg: '#FFFFFF',
      counterBg: 'linear-gradient(180deg, #DDD6FE 0%, #F5F3FF 100%)',
      awningA: '#8B5CF6',
      awningB: '#FAF5FF',
      accentHex: '#8B5CF6',
      accentDarkHex: '#6D28D9',
      secondaryHex: '#3B82F6',
      glowHex: '#A78BFA',
      trayTop: '#C4B5FD',
      trayBottom: '#818CF8',
      textColor: '#1E1B4B',
      subTextColor: '#5B21B6',
      isDarkTheme: false,
      patternClass: 'craft-dot-bg',
    },
    levels: CROISSANT_LEVELS,
  },
  {
    id: 'cake',
    orderIndex: 4,
    name: 'Cake',
    pluralName: 'Cakes',
    worldTitle: 'Celebration Cake Studio',
    ovenName: 'Neon Berry Oven',
    difficultyLabel: 'Hard',
    description: 'Dual-item baking! Master festive Cake + Croissant party orders!',
    partnerItemId: 'croissant',
    theme: {
      pageBg: 'linear-gradient(180deg, #FDF2F8 0%, #FCE7F3 100%)',
      panelBg: '#FFFFFF',
      counterBg: 'linear-gradient(180deg, #FBCFE8 0%, #FFF1F2 100%)',
      awningA: '#EC4899',
      awningB: '#FFFDF7',
      accentHex: '#EC4899',
      accentDarkHex: '#BE185D',
      secondaryHex: '#F43F5E',
      glowHex: '#F472B6',
      trayTop: '#F9A8D4',
      trayBottom: '#EC4899',
      textColor: '#3B0764',
      subTextColor: '#831843',
      isDarkTheme: false,
      patternClass: 'craft-dot-bg',
    },
    levels: CAKE_LEVELS,
  },
  {
    id: 'cinnamon',
    orderIndex: 5,
    name: 'Cinnamon Roll',
    pluralName: 'Cinnamon Rolls',
    worldTitle: 'Cinnamon Starlight Bakery',
    ovenName: 'Starlight Neon Oven',
    difficultyLabel: 'Master',
    description: 'Neon Toybox Finale! Master Cinnamon Roll + Cake starlight challenges!',
    partnerItemId: 'cake',
    theme: {
      pageBg: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 55%, #1E293B 100%)',
      panelBg: '#27245E',
      counterBg: 'linear-gradient(180deg, #1E1B4B 0%, #2E1065 100%)',
      awningA: '#FACC15',
      awningB: '#22D3EE',
      accentHex: '#FACC15',
      accentDarkHex: '#CA8A04',
      secondaryHex: '#22D3EE',
      glowHex: '#22D3EE',
      trayTop: '#38BDF8',
      trayBottom: '#6366F1',
      textColor: '#F8FAFC',
      subTextColor: '#CBD5E1',
      isDarkTheme: true,
      patternClass: 'craft-star-bg',
    },
    levels: CINNAMON_LEVELS,
  },
];

export const WORLD_BY_ID: Record<BakeryItemId, BakeryWorld> = BAKERY_WORLDS.reduce(
  (acc, world) => {
    acc[world.id] = world;
    return acc;
  },
  {} as Record<BakeryItemId, BakeryWorld>
);

export function getNextWorldId(worldId: BakeryItemId): BakeryItemId | null {
  const idx = BAKERY_WORLDS.findIndex((w) => w.id === worldId);
  if (idx === -1 || idx >= BAKERY_WORLDS.length - 1) return null;
  return BAKERY_WORLDS[idx + 1].id;
}
