'use client';

import { useId, useMemo } from 'react';
import { drawGrowth, GROUND_Y, VIEW_W } from '@/lib/growth-draw';
import type { GrowthModel } from '@/lib/growth';

/**
 * あなたの森。テーマ1つ＝木1本、段＝小枝、全段クリア＝実、
 * 「今回はここでよかった」＝落ち葉。形の計算は lib/growth-draw.ts。ここは描くだけ。
 */
export function GrowthForest({ model, label }: { model: GrowthModel; label: string }) {
  const g = useMemo(() => drawGrowth(model), [model]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `${name}-${uid}`;

  if (model.trees.length === 0) return null;

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${g.height}`} role="img" aria-label={label} className="block h-auto w-full">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e6" />
          <stop offset="1" stopColor="#ffe4c7" />
        </linearGradient>
        <linearGradient id={id('soil')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a4f" />
          <stop offset="1" stopColor="#8f5a2e" />
        </linearGradient>
        <linearGradient id={id('bark')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5033" />
          <stop offset="0.55" stopColor="#9c6b41" />
          <stop offset="1" stopColor="#7a5033" />
        </linearGradient>
      </defs>

      <rect width={VIEW_W} height={GROUND_Y + 4} fill={`url(#${id('sky')})`} />
      <rect y={GROUND_Y} width={VIEW_W} height={g.height - GROUND_Y} fill={`url(#${id('soil')})`} />
      <path d={`M0,${GROUND_Y + 1}C100,${GROUND_Y - 3} 300,${GROUND_Y + 5} 400,${GROUND_Y}`} stroke="#a86b3c" strokeWidth={1} fill="none" opacity={0.6} />
      <path d={g.grass} stroke="#6f8f4a" strokeWidth={1.4} fill="none" opacity={0.55} strokeLinecap="round" />

      {g.shade.map((e, i) => (
        <ellipse key={`sh${i}`} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#5a3a1e" opacity={0.06} />
      ))}

      {g.fallen.map((t, i) => (
        <path key={`fl${i}`} d="M0,0C2,-3.2 5,-3.2 7,0C5,3.2 2,3.2 0,0Z" fill="#ffab3c" stroke="#d68414" strokeWidth={0.6} transform={t} />
      ))}

      {g.wood.map((w, i) => (
        <g key={`w${i}`}>
          <path d={w.d} fill={`url(#${id('bark')})`} />
          {w.hi && <polyline points={w.hi} fill="none" stroke="#c99a6a" strokeWidth={w.hiW} opacity={0.5} />}
        </g>
      ))}

      {g.leaves.map((l, i) => (
        <path key={`lf${i}`} d={l.d} fill={l.fill} transform={l.transform} />
      ))}

      {g.buds.map((b, i) => (
        <circle key={`bd${i}`} cx={b.cx} cy={b.cy} r={b.r} fill="none" stroke="#d68414" strokeWidth={b.sw} />
      ))}

      {g.flowers.map((fl, i) => (
        <g key={`flw${i}`}>
          {fl.petals.map((p, j) => (
            <circle key={j} cx={p.cx} cy={p.cy} r={p.r} fill="#ffab3c" />
          ))}
          <circle cx={fl.cx} cy={fl.cy} r={fl.r} fill="#ff6f3c" />
        </g>
      ))}

      {g.fruits.map((fr, i) => (
        <circle key={`fr${i}`} cx={fr.x} cy={fr.y} r={4 * fr.s} fill="#d84a1a" />
      ))}

      {g.hits.map((h, i) => (
        <text
          key={`h${i}`}
          x={h.labelX}
          y={h.labelY}
          textAnchor="middle"
          fontSize={11}
          fill="#fff8f0"
          fontWeight={700}
          style={{ paintOrder: 'stroke', stroke: '#5a3a1e', strokeWidth: 3 }}
        >
          {h.label}
        </text>
      ))}
    </svg>
  );
}
