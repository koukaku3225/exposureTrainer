// 現代的なUI 3パターン × 7画面 を生成する
import { writeFileSync } from 'node:fs';

// ---------- ラインアイコン ----------
const ICONS = {
  home: 'M4 11l8-6 8 6v8h-5v-5H9v5H4z',
  ladder: 'M4 19h5v-4h5v-4h6',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  chart: 'M4 19V9M11 19V4M18 19v-7',
  heart: 'M12 20s-7-4.5-9.5-9C.5 6.5 3 3 6.5 3 9 3 11 5 12 6.5 13 5 15 3 17.5 3 21 3 23.5 6.5 21.5 11 19 15.5 12 20 12 20z',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
  check: 'M4 12l5 5L20 6',
  warn: 'M12 3l9 16H3L12 3zM12 10v4M12 17h.01',
  star: 'M12 3l2.7 5.9L21 9.8l-4.5 4.2L17.7 21 12 17.6 6.3 21l1.2-7-4.5-4.2 6.3-.9L12 3z',
  plus: 'M12 5v14M5 12h14',
  sparkle: 'M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};
function icon(name, size, color, stroke = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="${ICONS[name]}"></path></svg>`;
}

// ---------- 見本データ（前回と共通） ----------
const LADDER = [
  { d: 1, name: '30秒スピーチを録音して聞き返す', st: 'clear' },
  { d: 2, name: '録画して表情ごと見返す', st: 'clear' },
  { d: 3, name: '会議で一言だけ発言する', st: 'now', n: '2/3' },
  { d: 4, name: '2〜3人の前で3分話す', st: 'todo' },
  { d: 4, name: '話の途中でわざと一瞬詰まる', st: 'todo' },
  { d: 5, name: '勉強会で自己紹介する', st: 'todo' },
  { d: 6, name: 'オンラインで10人に5分発表', st: 'todo' },
  { d: 8, name: '30〜50人の前で話す', st: 'heavy' },
  { d: 10, name: '100人の前で話す', st: 'goal' },
];
const FEARS = [
  { name: '失敗', yes: 2, all: 3 },
  { name: '拒絶', yes: 3, all: 3, top: true },
  { name: 'コントロール', yes: 1, all: 3 },
  { name: 'つながり', yes: 0, all: 3 },
  { name: '評判', yes: 2, all: 2, top: true },
];
const NAV = [['home', 'ホーム'], ['ladder', '段階表'], ['bolt', 'いどむ'], ['chart', '振り返り'], ['heart', 'チェック'], ['gear', '設定']];
// 実際は5項目にする（ホームは「いどむ」がCTAなので nav からは外す）
const NAV5 = [['home', 'ホーム'], ['ladder', '段階表'], ['bolt', 'いどむ'], ['chart', '振り返り'], ['gear', '設定']];

function makeTheme(t) {
  const T = { ...t };
  T.page = (inner, navIdx) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="${t.fontUrl}">
  <style>
    body { margin: 0; background: ${t.pageBg}; font-family: ${t.bodyFont}; color: ${t.text}; }
    a { color: ${t.accent}; } a:hover { color: ${t.accent2 || t.accent}; }
  </style>
</helmet>
<div style="width: 390px; height: 844px; box-sizing: border-box; display: flex; flex-direction: column; ${t.screenBg}">
  <div style="flex-grow: 1; padding: ${t.pad}; display: flex; flex-direction: column; gap: ${t.gap}; overflow: hidden;">
${inner}
  </div>
  <div style="height: 78px; box-sizing: border-box; padding-bottom: 12px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); ${t.navBg}">
    ${NAV5.map(([ic, label], i) => `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 10px; font-weight: ${i === navIdx ? 700 : 500}; color: ${i === navIdx ? t.accent : t.navDim};">${icon(ic, 20, i === navIdx ? t.accent : t.navDim, i === navIdx ? 2.2 : 1.8)}${label}</div>`).join('')}
  </div>
</div>
</x-dc>
</body>
</html>
`;
  return T;
}

// ============================================================
// D. やさしい暮らし（Finch 風：クリーム地・丸み・パステル）
// ============================================================
const D = makeTheme({
  key: 'D',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap',
  bodyFont: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif",
  pageBg: '#fbf3e7', screenBg: 'background: #fbf3e7;',
  text: '#4a3f33', dim: '#9c8d78', accent: '#e0844f', accent2: '#7a9b6e',
  good: '#7a9b6e', warn: '#d97757',
  pad: '48px 18px 10px', gap: '14px',
  navBg: 'background: #fffaf1; border-top: 1px solid #eee0cc;', navDim: '#b7a88f',
});
D.card = (inner, { bg = '#ffffff', pad = '18px' } = {}) => `<div style="background: ${bg}; border-radius: 22px; padding: ${pad}; box-shadow: 0 2px 10px rgba(74,63,51,0.06); display: flex; flex-direction: column; gap: 10px;">${inner}</div>`;
D.chip = (label, tone = 'accent') => `<div style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: ${tone === 'accent' ? '#fbe3d1' : tone === 'good' ? '#e2ecdc' : '#f3ece0'}; color: ${tone === 'accent' ? '#c1602f' : tone === 'good' ? '#547048' : T_D_dim()};">${label}</div>`;
function T_D_dim() { return '#9c8d78'; }
D.bar = (pct, color = D.accent, h = 10) => `<div style="height: ${h}px; border-radius: 999px; background: #f1e6d4; overflow: hidden; display: flex;"><div style="width: ${pct}%; background: ${color}; border-radius: 999px;"></div></div>`;
D.btn = (label, { primary = true, icon: ic } = {}) => `<div style="height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 700; ${primary ? `background: ${D.accent}; color: #fff;` : `background: #fff; color: ${D.text}; border: 1.5px solid #eadfcd;`}">${ic ? icon(ic, 18, primary ? '#fff' : D.accent, 2.2) : ''}${label}</div>`;
D.row = (label, { sub = '', right = '', ic } = {}) => `<div style="display: flex; align-items: center; gap: 12px; padding: 6px 0;">${ic ? `<div style="width: 38px; height: 38px; border-radius: 12px; background: #fbe3d1; display: flex; align-items: center; justify-content: center;">${icon(ic, 18, '#c1602f', 2.2)}</div>` : ''}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1px;"><div style="font-size: 14.5px; font-weight: 700;">${label}</div>${sub ? `<div style="font-size: 12px; color: ${D.dim};">${sub}</div>` : ''}</div>${right ? `<div style="font-size: 12.5px; color: ${D.dim};">${right}</div>` : icon('arrow', 16, D.dim, 2)}</div>`;
D.scale = (sel, label) => `<div style="display: flex; flex-direction: column; gap: 8px;">
  <div style="font-size: 13px; color: ${D.dim}; font-weight: 700;">${label}</div>
  <div style="display: flex; gap: 5px;">${Array.from({ length: 11 }, (_, n) => `<div style="flex-grow: 1; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; ${n === sel ? `background: ${D.accent}; color: #fff;` : 'background: #f5ecdc; color: #b7a88f;'}">${n}</div>`).join('')}</div></div>`;

// ============================================================
// E. Bento ダッシュボード（白地・角丸カード・タグ・データ寄り）
// ============================================================
const E = makeTheme({
  key: 'E',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Noto+Sans+JP:wght@400;500;700;900&display=swap',
  bodyFont: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
  pageBg: '#f4f5f7', screenBg: 'background: #f4f5f7;',
  text: '#14161a', dim: '#767c88', accent: '#4f46e5', accent2: '#0ea5a4',
  good: '#0ea5a4', warn: '#e05a3b',
  pad: '44px 16px 8px', gap: '12px',
  navBg: 'background: #ffffff; border-top: 1px solid #e7e9ee;', navDim: '#a4a9b4',
});
E.headFont = "'Space Grotesk', 'Noto Sans JP', sans-serif";
E.card = (inner, { bg = '#ffffff', pad = '16px', border = true } = {}) => `<div style="background: ${bg}; border-radius: 18px; padding: ${pad}; ${border ? 'border: 1px solid #e7e9ee;' : ''} display: flex; flex-direction: column; gap: 8px;">${inner}</div>`;
E.chip = (label, tone = 'accent') => `<div style="display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; font-family: ${E.headFont}; background: ${tone === 'accent' ? '#eeecfd' : tone === 'good' ? '#e1f5f4' : tone === 'warn' ? '#fde8e2' : '#eef0f3'}; color: ${tone === 'accent' ? '#4f46e5' : tone === 'good' ? '#0d7d7c' : tone === 'warn' ? '#c1442a' : '#767c88'};">${label}</div>`;
E.bar = (pct, color = E.accent, h = 8) => `<div style="height: ${h}px; border-radius: 6px; background: #eef0f3; overflow: hidden; display: flex;"><div style="width: ${pct}%; background: ${color}; border-radius: 6px;"></div></div>`;
E.btn = (label, { primary = true, icon: ic } = {}) => `<div style="height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; font-weight: 700; font-family: ${E.headFont}; ${primary ? `background: ${E.text}; color: #fff;` : `background: #fff; color: ${E.text}; border: 1.5px solid #e7e9ee;`}">${ic ? icon(ic, 17, primary ? '#fff' : E.text, 2) : ''}${label}</div>`;
E.row = (label, { sub = '', right = '', ic } = {}) => `<div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">${ic ? `<div style="width: 32px; height: 32px; border-radius: 9px; background: #f4f5f7; display: flex; align-items: center; justify-content: center;">${icon(ic, 16, E.text, 2)}</div>` : ''}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0;"><div style="font-size: 14px; font-weight: 700;">${label}</div>${sub ? `<div style="font-size: 11.5px; color: ${E.dim};">${sub}</div>` : ''}</div>${right ? `<div style="font-size: 12px; color: ${E.dim}; font-family: ${E.headFont};">${right}</div>` : icon('arrow', 15, E.dim, 2)}</div>`;
E.scale = (sel, label) => `<div style="display: flex; flex-direction: column; gap: 7px;">
  <div style="font-size: 12px; color: ${E.dim}; font-weight: 700;">${label}</div>
  <div style="display: flex; gap: 4px;">${Array.from({ length: 11 }, (_, n) => `<div style="flex-grow: 1; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: ${E.headFont}; font-weight: 700; font-size: 13px; ${n === sel ? `background: ${E.text}; color: #fff;` : 'background: #f4f5f7; color: #a4a9b4;'}">${n}</div>`).join('')}</div></div>`;

// ============================================================
// F. モダンクエスト（単色ビビッドアクセント・フラットな道・大きい丸ボタン）
// ============================================================
const F = makeTheme({
  key: 'F',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@400;500&family=M+PLUS+1p:wght@500;700;900&display=swap',
  bodyFont: "'Kiwi Maru', 'Hiragino Maru Gothic ProN', serif",
  pageBg: '#ffffff', screenBg: 'background: #ffffff;',
  text: '#1c1a2e', dim: '#8b87a8', accent: '#6c4bff', accent2: '#ff6f61',
  good: '#22b573', warn: '#ff6f61',
  pad: '46px 18px 8px', gap: '14px',
  navBg: 'background: #ffffff; border-top: 1px solid #efeef7;', navDim: '#b5b1d0',
});
F.headFont = "'M PLUS 1p', 'Kiwi Maru', sans-serif";
F.card = (inner, { bg = '#f7f6ff', pad = '18px' } = {}) => `<div style="background: ${bg}; border-radius: 24px; padding: ${pad}; display: flex; flex-direction: column; gap: 10px;">${inner}</div>`;
F.chip = (label, tone = 'accent') => `<div style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; font-family: ${F.headFont}; background: ${tone === 'accent' ? '#ece6ff' : tone === 'good' ? '#dff5e9' : '#ffe7e3'}; color: ${tone === 'accent' ? '#6c4bff' : tone === 'good' ? '#16915a' : '#e0503f'};">${label}</div>`;
F.bar = (pct, color = F.accent, h = 12) => `<div style="height: ${h}px; border-radius: 999px; background: #efeef7; overflow: hidden; display: flex;"><div style="width: ${pct}%; background: ${color}; border-radius: 999px;"></div></div>`;
F.btn = (label, { primary = true, icon: ic } = {}) => `<div style="height: 56px; border-radius: 999px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 700; font-family: ${F.headFont}; ${primary ? `background: ${F.accent}; color: #fff; box-shadow: 0 6px 16px rgba(108,75,255,0.28);` : `background: #f7f6ff; color: ${F.accent};`}">${ic ? icon(ic, 18, primary ? '#fff' : F.accent, 2.4) : ''}${label}</div>`;
F.row = (label, { sub = '', right = '', ic } = {}) => `<div style="display: flex; align-items: center; gap: 12px; padding: 6px 0;">${ic ? `<div style="width: 40px; height: 40px; border-radius: 14px; background: #ece6ff; display: flex; align-items: center; justify-content: center;">${icon(ic, 19, F.accent, 2.4)}</div>` : ''}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1px;"><div style="font-size: 15px; font-weight: 700;">${label}</div>${sub ? `<div style="font-size: 12px; color: ${F.dim};">${sub}</div>` : ''}</div>${right ? `<div style="font-size: 12.5px; color: ${F.dim};">${right}</div>` : icon('arrow', 16, F.dim, 2)}</div>`;
F.scale = (sel, label) => `<div style="display: flex; flex-direction: column; gap: 8px;">
  <div style="font-size: 13px; color: ${F.dim}; font-weight: 700;">${label}</div>
  <div style="display: flex; gap: 5px;">${Array.from({ length: 11 }, (_, n) => `<div style="flex-grow: 1; height: 40px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-family: ${F.headFont}; font-weight: 900; font-size: 14px; ${n === sel ? `background: ${F.accent}; color: #fff;` : 'background: #f7f6ff; color: #b5b1d0;'}">${n}</div>`).join('')}</div></div>`;

const THEMES = [D, E, F];

// ---------- 画面（共通コンテンツ、テーマの部品で描く） ----------
function home(T) {
  const heavy = T.key === 'D' ? '#c1602f' : T.key === 'E' ? '#c1442a' : '#e0503f';
  return T.page(`
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <div style="font-size: 12.5px; color: ${T.dim};">9月14日（月）</div>
      <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 22px; font-weight: 900;">今日の一歩</div>
    </div>
    ${T.card(`
      <div style="display: flex; justify-content: space-between; align-items: center;">
        ${T.chip('人前で話す')}${T.chip('難しさ 3', 'accent')}
      </div>
      <div style="font-size: 20px; font-weight: 700; line-height: 1.4;">会議で一言だけ発言する</div>
      <div style="display: flex; gap: 22px;">
        <div><div style="font-size: 11.5px; color: ${T.dim};">実践回数</div><div style="font-family: ${T.headFont || T.bodyFont}; font-size: 20px; font-weight: 900;">2<span style="font-size: 12px; color: ${T.dim};"> / 3回</span></div></div>
        <div><div style="font-size: 11.5px; color: ${T.dim};">前回の不安</div><div style="font-family: ${T.headFont || T.bodyFont}; font-size: 20px; font-weight: 900;">6→4</div></div>
      </div>
      ${T.bar(66)}
      <div style="font-size: 12px; color: ${T.dim};">あと1回。終わった後の不安が3以下なら次の段へ進めます。</div>
    `)}
    ${T.btn('実践を記録する', { primary: true, icon: 'bolt' })}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
      ${T.card(`<div style="font-size: 11.5px; color: ${T.dim};">今週の実践</div><div style="font-family: ${T.headFont || T.bodyFont}; font-size: 24px; font-weight: 900;">5<span style="font-size: 13px;">回</span></div>`, { pad: '14px' })}
      ${T.card(`<div style="font-size: 11.5px; color: ${T.dim};">ポイント</div><div style="font-family: ${T.headFont || T.bodyFont}; font-size: 24px; font-weight: 900; color: ${T.accent};">34<span style="font-size: 13px; color: ${T.dim};">/50</span></div>`, { pad: '14px' })}
    </div>
  `, 0);
}

function ladder(T) {
  const rows = LADDER.map((r) => {
    const stColor = r.st === 'clear' ? T.good : r.st === 'now' ? T.accent : r.st === 'heavy' ? T.warn : T.dim;
    const badge = r.st === 'clear' ? T.chip('クリア', 'good') : r.st === 'now' ? T.chip(`挑戦中 ${r.n}`, 'accent') : r.st === 'heavy' ? T.chip('負荷高', 'warn') : r.st === 'goal' ? T.chip('ゴール') : '';
    return `<div style="display: grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 9px 0; ${r.st !== 'clear' ? 'border-top: 1px solid rgba(0,0,0,0.05);' : ''}">
      <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 14px; font-weight: 900; color: ${stColor}; text-align: center;">${r.d}</div>
      <div style="font-size: 13.5px; font-weight: ${r.st === 'now' ? 700 : 500}; color: ${r.st === 'clear' ? T.dim : T.text};">${r.name}</div>
      <div>${badge}</div>
    </div>`;
  }).join('');
  return T.page(`
    <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 20px; font-weight: 900;">人前で話す の段階表</div>
    ${T.card(`<div style="font-size: 11.5px; color: ${T.dim};">数字＝難しさ（0〜10）。タップで名前・難しさを変更</div>${rows}`)}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
      ${T.btn('自分で追加', { primary: false, icon: 'plus' })}
      ${T.btn('AIに作らせる', { primary: false, icon: 'sparkle' })}
    </div>
    ${T.card(`<div style="font-size: 13px; line-height: 1.6;">難しさ8以上は負荷が高すぎます。ふだんは3〜5で地道に。</div>`, { bg: T.key === 'D' ? '#fdf1e6' : T.key === 'E' ? '#fff8f0' : '#fff3ef' })}
  `, 1);
}

function practice(T) {
  const toggle = (label, on) => `<div style="flex-grow: 1; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 700; ${on ? `background: ${T.accent}; color: #fff;` : 'background: rgba(0,0,0,0.04); color: ' + T.dim + ';'}">${label}</div>`;
  return T.page(`
    <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 19px; font-weight: 900;">実践を記録</div>
    ${T.card(`
      <div style="font-size: 12.5px; color: ${T.dim};">人前で話す ／ 難しさ3 ／ 3回め</div>
      <div style="font-size: 17px; font-weight: 700;">会議で一言だけ発言する</div>
      <div style="display: flex; gap: 8px;">${toggle('現実でやった', true)}${toggle('想像でやった', false)}</div>
      ${T.scale(6, 'はじめる前の不安')}
      ${T.scale(3, '終わった後の不安')}
      <div style="border-radius: 14px; padding: 12px; background: rgba(0,0,0,0.03); font-size: 13px; line-height: 1.6;"><span style="color: ${T.dim};">メモ：</span>声が少し震えたが、誰も気にしていなかった</div>
    `)}
    ${T.card(`
      <div style="font-size: 14.5px; line-height: 1.7;">不安が <b style="color: ${T.accent};">3</b> 下がりました。ゆうき <b style="color: ${T.accent};">+5pt</b><br>3回クリア。次の段へ進めます。</div>
      ${T.btn('次の段へ進む', { primary: true, icon: 'arrow' })}
      ${T.btn('もう少しこの段を続ける', { primary: false })}
    `)}
  `, 2);
}

function review(T) {
  const days = [['月', 1], ['火', 0], ['水', 2], ['木', 1], ['金', 1], ['土', 0], ['日', 0]];
  const pairs = [[7, 5], [6, 4], [6, 3]];
  return T.page(`
    <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 19px; font-weight: 900;">今週の振り返り</div>
    ${T.card(`
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 84px; gap: 7px;">
        ${days.map(([d, n]) => `<div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;"><div style="font-size: 11px; color: ${T.dim};">${n || ''}</div><div style="width: 100%; height: ${n * 22 + 4}px; background: ${T.accent}; border-radius: 6px;"></div><div style="font-size: 11px; color: ${T.dim};">${d}</div></div>`).join('')}
      </div>
      <div style="font-size: 12px; color: ${T.dim};">合計 5回（先週 3回）</div>`)}
    ${T.card(`
      <div style="font-size: 13.5px; font-weight: 700;">不安のうつりかわり：会議で一言</div>
      ${pairs.map(([b, a], i) => `<div style="display: grid; grid-template-columns: 38px minmax(0,1fr) 42px; align-items: center; gap: 8px; font-size: 11.5px; color: ${T.dim};"><div>${i + 1}回め</div><div style="display: flex; flex-direction: column; gap: 3px;">${T.bar(b * 10, T.dim === undefined ? '#ccc' : 'rgba(0,0,0,0.15)', 6)}${T.bar(a * 10, T.accent, 6)}</div><div style="font-family: ${T.headFont || T.bodyFont}; font-weight: 900; color: ${T.text}; font-size: 13px;">${b}→${a}</div></div>`).join('')}`)}
    ${T.card(`
      <div style="font-size: 13.5px; font-weight: 700;">今日できたこと</div>
      ${['会議で一言発言した', '店員さんにお礼を言えた', '録画を最後まで見返せた'].map((s) => `<div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px;">${icon('star', 15, T.accent, 2)}${s}</div>`).join('')}`)}
  `, 3);
}

function quiz(T) {
  return T.page(`
    <div style="display: flex; align-items: center; gap: 10px;">${T.bar(36, T.accent, 8)}<div style="font-family: ${T.headFont || T.bodyFont}; font-size: 13px; font-weight: 700; color: ${T.dim};">5/14</div></div>
    ${T.card(`<div style="font-size: 12px; color: ${T.dim};">しつもん 5</div><div style="font-size: 19px; font-weight: 700; line-height: 1.6; min-height: 120px;">知らない人に話しかけるとき、冷たくされないかと不安になる。</div>`)}
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${T.btn('はい', { primary: true, icon: 'check' })}
      ${T.btn('いいえ', { primary: false })}
    </div>
    <div style="flex-grow: 1;"></div>
    <div style="font-size: 11.5px; color: ${T.dim}; text-align: center; line-height: 1.6;">正解はありません。思ったとおりに答えてください。<br>これは診断ではなく、怖がりやすい種類を知るためのものです</div>
  `, 1);
}

function result(T) {
  const rows = FEARS.map((f) => `
    <div style="display: flex; flex-direction: column; gap: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; font-weight: ${f.top ? 700 : 500};">
        <div style="display: flex; align-items: center; gap: 6px; color: ${f.top ? T.accent : T.text};">${f.top ? icon('star', 13, T.accent, 2.4) : ''}${f.name}</div>
        <div style="font-family: ${T.headFont || T.bodyFont}; color: ${T.dim};">${f.yes}/${f.all}</div>
      </div>
      ${T.bar(Math.round((f.yes / f.all) * 100), f.top ? T.accent : 'rgba(0,0,0,0.12)', 8)}
    </div>`).join('');
  return T.page(`
    <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 19px; font-weight: 900;">あなたの恐怖のかたち</div>
    ${T.card(`${rows}<div style="font-size: 11.5px; color: ${T.dim};">前回（8/31）より 失敗 が1減りました</div>`)}
    ${T.card(`<div style="font-size: 14px; line-height: 1.7;"><b style="color: ${T.accent};">拒絶</b> と <b style="color: ${T.accent};">評判</b> が同じ割合です。どちらから挑みますか？</div>`)}
    ${T.row('評判', { sub: '恥・人前で話す の段階表へ', ic: 'star' })}
    ${T.row('拒絶', { sub: '拒絶 の段階表へ', ic: 'heart' })}
  `, 1);
}

function aiAndSettings(T) {
  const gen = [[true, 2, '乾杯のあと隣の人に一言感想を言う'], [true, 3, '相手に質問を1つする'], [false, 5, '自分の近況を30秒話す'], [true, 6, '次の集まりを自分から提案する']];
  const box = (on) => `<div style="width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; ${on ? `background: ${T.accent};` : 'border: 1.5px solid rgba(0,0,0,0.15);'}">${on ? icon('check', 13, '#fff', 3) : ''}</div>`;
  return T.page(`
    <div style="font-family: ${T.headFont || T.bodyFont}; font-size: 19px; font-weight: 900;">AIに課題を作らせる</div>
    ${T.card(`
      <div style="border-radius: 12px; padding: 12px; background: rgba(0,0,0,0.03); font-size: 13.5px; line-height: 1.6;">大学の同期との飲み会で、自分から話を振るのが怖い</div>
      ${T.btn('課題を作ってもらう', { primary: true, icon: 'sparkle' })}
      <div style="font-size: 11.5px; color: ${T.dim};">段階表に入れるものを選ぶ（難しさはあとで変更可）</div>
      ${gen.map(([on, d, s]) => `<div style="display: flex; align-items: center; gap: 10px; font-size: 13.5px;">${box(on)}<div style="font-family: ${T.headFont || T.bodyFont}; font-weight: 900; color: ${T.accent}; width: 16px;">${d}</div><div>${s}</div></div>`).join('')}
      ${T.btn('選んだ3つを段階表に入れる', { primary: false })}
    `)}
    ${T.card(`
      ${T.row('次の段へ進む目安', { right: '3回・不安3以下', ic: 'gear' })}
      ${T.row('ごほうびの設定', { right: '3件', ic: 'star' })}
      ${T.row('データの書き出し／読み込み', { ic: 'chart' })}
      ${T.row('はじめに読む注意', { ic: 'heart' })}
    `)}
  `, 4);
}

// ---------- 書き出し ----------
const SCREENS = [
  ['Home', 'ホーム', home], ['Ladder', '段階表', ladder], ['Practice', '実践記録', practice],
  ['Review', '振り返り', review], ['Quiz', '恐怖チェック 質問', quiz], ['Result', '恐怖チェック 結果', result],
  ['Ai', 'AI課題作成＋設定', aiAndSettings],
];
const PATTERNS = [[D, 'D', 'D やさしい暮らし'], [E, 'E', 'E Bentoダッシュボード'], [F, 'F', 'F モダンクエスト']];
const artboards = [];
PATTERNS.forEach(([T, prefix, pname], row) => {
  SCREENS.forEach(([id, title, fn], col) => {
    const html = fn(T);
    const file = `${prefix}${id}.dc.html`;
    writeFileSync(file, html);
    artboards.push({ file, title: `${pname}｜${title}`, x: col * 470, y: row * 1000, w: 390, h: 844, page: 'page-modern' });
  });
});
console.log(JSON.stringify(artboards, null, 2));
console.log(artboards.map((a) => `--artboard ${a.file}`).join(' '));
