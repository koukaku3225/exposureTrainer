// レトロRPG風 UI モック 3パターン × 7画面 の .dc.html を生成する
import { writeFileSync } from 'node:fs';

// ---------- ドット絵アイコン（8x8） ----------
const BITMAPS = {
  sword: ['......11', '.....111', '....111.', '1..111..', '.1111...', '..11....', '.1.11...', '1...1...'],
  stairs: ['......11', '......11', '....1111', '....1111', '..111111', '..111111', '11111111', '11111111'],
  book: ['1111111.', '1.....11', '1.111.11', '1.....11', '1.111.11', '1.....11', '1111111.', '........'],
  star: ['...11...', '...11...', '11111111', '.111111.', '..1111..', '.11..11.', '11....11', '........'],
  gear: ['..1..1..', '.111111.', '111..111', '.1....1.', '.1....1.', '111..111', '.111111.', '..1..1..'],
  heart: ['.11..11.', '11111111', '11111111', '11111111', '.111111.', '..1111..', '...11...', '........'],
  crystal: ['...11...', '..1111..', '.111111.', '11111111', '.111111.', '..1111..', '...11...', '........'],
  warn: ['...11...', '..1111..', '..1..1..', '.11..11.', '.11..11.', '11111111', '111..111', '11111111'],
  check: ['........', '.......1', '......11', '1....11.', '11..11..', '.1111...', '..11....', '........'],
};
function icon(name, size, color) {
  const px = size / 8;
  const rects = BITMAPS[name].flatMap((row, y) => [...row].map((c, x) => (c === '1' ? `<rect x="${x * px}" y="${y * px}" width="${px}" height="${px}"></rect>` : ''))).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="${color}" shape-rendering="crispEdges" style="flex-shrink: 0;">${rects}</svg>`;
}
const cursorSvg = (color) => `<svg width="10" height="14" viewBox="0 0 10 14" fill="${color}" style="flex-shrink: 0;"><path d="M0 0L10 7L0 14Z"></path></svg>`;

// ---------- 見本データ ----------
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
const NAV = [['stairs', '段階表'], ['sword', 'いどむ'], ['star', '振り返り'], ['heart', 'チェック'], ['gear', '設定']];

// ---------- テーマ ----------
function makeTheme(t) {
  const T = { ...t };
  T.win = (title, body, extra = '') => t.winFrame(title, `<div style="display: flex; flex-direction: column; gap: 8px;">${body}</div>`, extra);
  T.row = (label, { active = false, right = '', sub = '', color } = {}) => `
    <div style="display: flex; align-items: center; gap: 8px; min-height: 40px;">
      <div style="width: 12px; display: flex;">${active ? cursorSvg(t.accent) : ''}</div>
      <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;">
        <div style="font-size: 15px; color: ${color || (active ? t.accent : t.text)};">${label}</div>
        ${sub ? `<div style="font-size: 12px; color: ${t.dim};">${sub}</div>` : ''}
      </div>
      ${right ? `<div style="font-size: 13px; color: ${t.dim}; flex-shrink: 0;">${right}</div>` : ''}
    </div>`;
  T.bar = (pct, color, h = 10) => `<div style="height: ${h}px; ${t.barTrack} display: flex; flex-grow: 1;"><div style="width: ${pct}%; background: ${color};"></div></div>`;
  T.scale = (sel, label) => {
    const cell = (n) => `<div style="height: 44px; display: flex; align-items: center; justify-content: center; font-family: ${t.headFont}; font-size: 18px; ${n === sel ? t.cellOn : t.cellOff}">${n}</div>`;
    return `<div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="font-size: 13px; color: ${t.dim};">${label}</div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px;">${[0, 1, 2, 3, 4, 5].map(cell).join('')}</div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px;">${[6, 7, 8, 9, 10].map(cell).join('')}<div></div></div>
    </div>`;
  };
  T.nav = (active) => `
    <div style="height: 76px; box-sizing: border-box; padding-bottom: 10px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); ${t.navStyle}">
      ${NAV.map(([ic, label], i) => `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; font-size: 11px; color: ${i === active ? t.navOn || t.accent : t.navDim};">${icon(ic, 20, i === active ? t.navOn || t.accent : t.navDim)}${label}</div>`).join('')}
    </div>`;
  T.page = (inner, navIdx, bg) => `<!doctype html>
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
    a { color: ${t.accent}; } a:hover { color: ${t.text}; }
  </style>
</helmet>
<div style="width: 390px; height: 844px; box-sizing: border-box; display: flex; flex-direction: column; ${bg || t.screenBg}">
  <div style="flex-grow: 1; padding: 40px 16px 12px; display: flex; flex-direction: column; gap: 16px; min-height: 0;">
${inner}
  </div>
${T.nav(navIdx)}
</div>
</x-dc>
</body>
</html>
`;
  return T;
}

const A = makeTheme({
  key: 'A',
  fontUrl: 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap',
  headFont: "'DotGothic16', monospace",
  bodyFont: "'DotGothic16', 'MS Gothic', monospace",
  pageBg: '#000', screenBg: 'background: #000;',
  text: '#ffffff', dim: '#a8a8a8', accent: '#ffd84a', good: '#5ee07a', warn: '#ff6b5a',
  barTrack: 'border: 2px solid #fff; background: #000;',
  cellOn: 'background: #ffd84a; color: #000; border: 2px solid #ffd84a;',
  cellOff: 'border: 2px solid #fff; color: #fff;',
  navStyle: 'background: #000; border-top: 3px solid #fff;', navDim: '#8a8a8a',
  winFrame: (title, body, extra) => `<div style="position: relative; border: 3px solid #fff; border-radius: 8px; background: #000; padding: ${title ? '20px' : '12px'} 14px 12px; ${extra}">
    ${title ? `<div style="position: absolute; top: -12px; left: 14px; background: #000; padding: 0 6px; font-size: 15px;">${title}</div>` : ''}${body}</div>`,
  btn: (label, primary = true) => `<div style="height: 50px; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 8px; font-size: 17px; ${primary ? 'border: 3px solid #ffd84a; color: #ffd84a;' : 'border: 2px solid #fff; color: #fff;'}">${primary ? cursorSvg('#ffd84a') : ''}${label}</div>`,
});

const B = makeTheme({
  key: 'B',
  fontUrl: 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Kiwi+Maru:wght@400;500&display=swap',
  headFont: "'DotGothic16', monospace",
  bodyFont: "'Kiwi Maru', 'Hiragino Maru Gothic ProN', serif",
  pageBg: '#0b1233', screenBg: 'background: linear-gradient(180deg, #18245e 0%, #0b1233 100%);',
  text: '#f6f0dc', dim: '#aab4e6', accent: '#ffcf4a', good: '#6fe0a0', warn: '#ff7a6a',
  barTrack: 'background: #0b1233; border: 2px solid #f6f0dc; border-radius: 3px; overflow: hidden;',
  cellOn: 'background: #ffcf4a; color: #1b1f44; border-radius: 6px; box-shadow: 0 3px 0 #b88a1a;',
  cellOff: 'background: #0f1a4d; color: #f6f0dc; border-radius: 6px; border: 2px solid #3d4fb8;',
  navStyle: 'background: #0b1233; border-top: 2px solid #f6f0dc;', navDim: '#7d88c0',
  winFrame: (title, body, extra) => `<div style="background: linear-gradient(180deg, #2a3aa0 0%, #141e5c 100%); border: 2px solid #f6f0dc; border-radius: 6px; box-shadow: 0 0 0 2px #0b1233, inset 0 0 0 2px #3d4fb8; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; ${extra}">
    ${title ? `<div style="font-family: 'DotGothic16', monospace; font-size: 14px; color: #ffcf4a;">${title}</div>` : ''}${body}</div>`,
  btn: (label, primary = true) => `<div style="height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-family: 'DotGothic16', monospace; font-size: 17px; ${primary ? 'background: #ffcf4a; color: #1b1f44; border: 2px solid #fff4d0; box-shadow: 0 4px 0 #b88a1a;' : 'background: #141e5c; color: #f6f0dc; border: 2px solid #f6f0dc;'}">${label}</div>`,
});
const GRASS = 'background-color: #3e8c4c; background-image: radial-gradient(#4ea55c 1.6px, transparent 1.7px), radial-gradient(#357a41 1.6px, transparent 1.7px); background-size: 14px 14px, 14px 14px; background-position: 0 0, 7px 7px;';

const C = makeTheme({
  key: 'C',
  fontUrl: 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Zen+Maru+Gothic:wght@500;700&display=swap',
  headFont: "'DotGothic16', monospace",
  bodyFont: "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif",
  pageBg: '#2b2018', screenBg: 'background: repeating-linear-gradient(90deg, #2b2018 0 22px, #31251c 22px 44px);',
  text: '#3a2a1a', dim: '#7a6448', accent: '#8e2f25', good: '#3f7a3a', warn: '#b5452c',
  barTrack: 'background: #d9c79c; border: 2px solid #5a3d22;',
  cellOn: 'background: #8e2f25; color: #fbeed2; border: 2px solid #5a2018;',
  cellOff: 'background: #f7ecd2; color: #3a2a1a; border: 2px solid #b8893a;',
  navStyle: 'background: #1f1711; border-top: 2px solid #b8893a;', navDim: '#9c8766', navOn: '#e8bd62',
  winFrame: (title, body, extra) => `<div style="position: relative; background: #efe2c2; border: 2px solid #5a3d22; border-radius: 3px; box-shadow: inset 0 0 0 4px #efe2c2, inset 0 0 0 5px #b8893a, 0 3px 0 #1a130d; padding: ${title ? '22px' : '14px'} 16px 14px; ${extra}">
    ${title ? `<div style="position: absolute; top: -11px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #8e2f25; color: #fbeed2; font-family: 'DotGothic16', monospace; font-size: 14px; padding: 2px 14px; border: 2px solid #5a2018;">${title}</div>` : ''}${body}</div>`,
  btn: (label, primary = true) => `<div style="height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-family: 'DotGothic16', monospace; font-size: 17px; ${primary ? 'background: #8e2f25; color: #fbeed2; border: 2px solid #5a2018; box-shadow: 0 3px 0 #1a130d;' : 'background: #efe2c2; color: #3a2a1a; border: 2px solid #5a3d22;'}">${label}</div>`,
});

// ---------- 画面（共通） ----------
const dots = (T, done, all) => `<div style="display: flex; gap: 6px;">${Array.from({ length: all }, (_, i) => `<div style="width: 18px; height: 18px; ${i < done ? `background: ${T.good};` : `border: 2px dashed ${T.dim}; box-sizing: border-box;`}"></div>`).join('')}</div>`;

function statusWin(T) {
  return T.win('ゆうき', `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="font-family: ${T.headFont}; font-size: 22px; color: ${T.accent};">34<span style="font-size: 13px; color: ${T.dim};"> / 50pt</span></div>
      ${T.bar(68, T.accent, 12)}
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 13px; color: ${T.dim};">
      <div>ごほうび：新しい服まで あと16pt</div><div>今週 5回</div>
    </div>`);
}
function questWin(T) {
  return T.win('いまのクエスト', `
    <div style="display: flex; justify-content: space-between; font-size: 13px; color: ${T.dim};"><div>人前で話す</div><div>難しさ 3</div></div>
    <div style="font-size: 20px; line-height: 1.4;">会議で一言だけ発言する</div>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">${dots(T, 2, 3)}<div style="font-size: 13px; color: ${T.dim};">2/3回</div></div>
      <div style="font-size: 13px; color: ${T.dim};">前回の不安 <span style="font-family: ${T.headFont}; font-size: 16px; color: ${T.text};">6→4</span></div>
    </div>`);
}
const msgWin = (T, text) => T.win('', `<div style="font-size: 15px; line-height: 1.8; text-wrap: pretty;">${text}</div>`);

function home(T) {
  return T.page(`
    ${statusWin(T)}
    ${questWin(T)}
    ${msgWin(T, 'あと1回。終わった後の不安が 3以下 なら、次の段へ進めるぞ。')}
    ${T.win('コマンド', `
      ${T.row('いどむ（実践を記録）', { active: true })}
      ${T.row('段階表を見る')}
      ${T.row('恐怖チェック', { right: '前回 8/31' })}`)}
  `, 1);
}

function ladderRowStatus(T, r) {
  if (r.st === 'clear') return `<div style="display: flex; align-items: center; gap: 4px; color: ${T.good};">${icon('check', 14, T.good)}クリア</div>`;
  if (r.st === 'now') return `<div style="color: ${T.accent};">挑戦中 ${r.n}</div>`;
  if (r.st === 'heavy') return `<div style="display: flex; align-items: center; gap: 4px; color: ${T.warn};">${icon('warn', 14, T.warn)}負荷高</div>`;
  if (r.st === 'goal') return `<div style="color: ${T.dim};">ゴール</div>`;
  return '';
}
function ladder(T) {
  const rows = LADDER.map((r) => `
    <div style="display: grid; grid-template-columns: 12px 34px minmax(0, 1fr) auto; align-items: center; gap: 8px; min-height: 38px; font-size: 14px; color: ${r.st === 'clear' ? T.dim : T.text};">
      <div style="display: flex;">${r.st === 'now' ? cursorSvg(T.accent) : ''}</div>
      <div style="font-family: ${T.headFont}; font-size: 16px; text-align: center; color: ${r.st === 'heavy' ? T.warn : T.accent};">${r.d}</div>
      <div style="${r.st === 'now' ? `color: ${T.accent};` : ''}">${r.name}</div>
      <div style="font-size: 12px;">${ladderRowStatus(T, r)}</div>
    </div>`).join('');
  return T.page(`
    ${T.win('人前で話す の段階表', `
      <div style="font-size: 12px; color: ${T.dim};">数字＝難しさ（0〜10）。行をタップで名前・難しさを変更</div>
      ${rows}`)}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
      ${T.btn('＋ 自分で追加', false)}
      ${T.btn('AIに作らせる', false)}
    </div>
    ${msgWin(T, '難しさ8以上は負荷が高すぎる。3〜5で地道に積もう。')}
  `, 0);
}

function practice(T) {
  const toggle = (label, on) => `<div style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 15px; ${on ? T.cellOn : T.cellOff}">${label}</div>`;
  return T.page(`
    ${T.win('いどむ', `
      <div style="font-size: 13px; color: ${T.dim};">人前で話す ／ 難しさ 3 ／ 3回め</div>
      <div style="font-size: 19px;">会議で一言だけ発言する</div>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;">${toggle('現実でやった', true)}${toggle('想像でやった', false)}</div>
      ${T.scale(6, 'はじめる前の不安')}
      ${T.scale(3, '終わった後の不安')}
      <div style="min-height: 44px; box-sizing: border-box; font-size: 14px; line-height: 1.6; padding: 10px; ${T.cellOff}"><span style="color: ${T.dim};">メモ：</span>声が少し震えたが、誰も気にしていなかった</div>`)}
    ${T.win('', `
      <div style="font-size: 15px; line-height: 1.8;">不安が <span style="color: ${T.accent};">3</span> 下がった！ ゆうき <span style="color: ${T.accent};">+5pt</span><br>3回クリア。次の段へ進めるぞ。</div>
      ${T.row('次の段へ進む', { active: true })}
      ${T.row('もう少しこの段を続ける')}`)}
  `, 1);
}

function review(T) {
  const days = [['月', 1], ['火', 0], ['水', 2], ['木', 1], ['金', 1], ['土', 0], ['日', 0]];
  const pairs = [[7, 5], [6, 4], [6, 3]];
  return T.page(`
    ${T.win('今週のぼうけん', `
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 92px; gap: 8px;">
        ${days.map(([d, n]) => `<div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="font-size: 12px; color: ${T.dim};">${n || ''}</div>
          <div style="width: 100%; height: ${n * 26}px; background: ${T.accent};"></div>
          <div style="font-size: 12px; color: ${T.dim};">${d}</div></div>`).join('')}
      </div>
      <div style="font-size: 13px; color: ${T.dim};">合計 5回（先週 3回）</div>`)}
    ${T.win('不安のうつりかわり：会議で一言', `
      ${pairs.map(([b, a], i) => `<div style="display: grid; grid-template-columns: 36px minmax(0, 1fr) 40px; align-items: center; gap: 8px; font-size: 12px; color: ${T.dim};">
        <div>${i + 1}回め</div>
        <div style="display: flex; flex-direction: column; gap: 3px;">${T.bar(b * 10, T.dim, 8)}${T.bar(a * 10, T.accent, 8)}</div>
        <div style="font-family: ${T.headFont}; font-size: 14px; color: ${T.text};">${b}→${a}</div></div>`).join('')}
      <div style="display: flex; gap: 14px; font-size: 12px; color: ${T.dim};"><div>上：はじめる前</div><div style="color: ${T.accent};">下：終わった後</div></div>`)}
    ${T.win('今日できたこと', `
      ${['会議で一言発言した', '店員さんにお礼を言えた', '録画を最後まで見返せた'].map((s) => `<div style="display: flex; align-items: center; gap: 10px; font-size: 14px; min-height: 28px;">${icon('star', 14, T.accent)}${s}</div>`).join('')}`)}
  `, 2);
}

function quiz(T) {
  return T.page(`
    ${T.win('恐怖チェック', `
      <div style="display: flex; align-items: center; gap: 10px;">${T.bar(36, T.accent, 10)}<div style="font-family: ${T.headFont}; font-size: 14px;">5/14</div></div>`)}
    ${T.win('', `
      <div style="font-size: 13px; color: ${T.dim};">しつもん 5</div>
      <div style="font-size: 20px; line-height: 1.7; text-wrap: pretty; min-height: 140px;">知らない人に話しかけるとき、冷たくされないかと不安になる。</div>`)}
    ${T.win('', `
      ${T.row('はい', { active: true })}
      ${T.row('いいえ')}`)}
    <div style="flex-grow: 1;"></div>
    ${msgWin(T, '正解はない。思ったとおりに答えてくれ。<br><span style="font-size: 12px; color: ${T.dim};">これは診断ではなく、怖がりやすい種類を知るためのものです</span>')}
  `, 3);
}

function result(T) {
  const rows = FEARS.map((f) => `
    <div style="display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; color: ${f.top ? T.accent : T.text};">
        <div style="display: flex; align-items: center; gap: 6px;">${f.top ? icon('crystal', 12, T.accent) : ''}${f.name}</div>
        <div style="font-family: ${T.headFont};">${f.yes}/${f.all}</div>
      </div>
      ${T.bar(Math.round((f.yes / f.all) * 100), f.top ? T.accent : T.dim, 10)}
    </div>`).join('');
  return T.page(`
    ${T.win('あなたの恐怖のかたち', `
      ${rows}
      <div style="font-size: 12px; color: ${T.dim};">前回（8/31）より 失敗が 1 減った</div>`)}
    ${msgWin(T, '<span style="color: ' + T.accent + ';">拒絶</span> と <span style="color: ' + T.accent + ';">評判</span> が同じ割合だ。<br>どちらから挑む？')}
    ${T.win('', `
      ${T.row('評判', { active: true, sub: '恥・人前で話す の段階表へ' })}
      ${T.row('拒絶', { sub: '拒絶 の段階表へ' })}`)}
  `, 3);
}

function aiAndSettings(T) {
  const gen = [[true, 2, '乾杯のあと隣の人に一言感想を言う'], [true, 3, '相手に質問を1つする'], [false, 5, '自分の近況を30秒話す'], [true, 6, '次の集まりを自分から提案する']];
  const box = (on) => `<div style="width: 22px; height: 22px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; ${on ? T.cellOn : T.cellOff}">${on ? icon('check', 14, T.key === 'A' ? '#000' : T.key === 'B' ? '#1b1f44' : '#fbeed2') : ''}</div>`;
  return T.page(`
    ${T.win('AIに課題を作らせる', `
      <div style="min-height: 58px; font-size: 14px; line-height: 1.6; padding: 8px 10px; ${T.cellOff}">大学の同期との飲み会で、自分から話を振るのが怖い</div>
      ${T.btn('課題を作ってもらう', true)}
      <div style="font-size: 12px; color: ${T.dim};">段階表に入れるものを選ぶ（難しさはあとで変えられる）</div>
      ${gen.map(([on, d, s]) => `<div style="display: flex; align-items: center; gap: 10px; min-height: 36px; font-size: 14px;">${box(on)}<div style="font-family: ${T.headFont}; width: 18px; color: ${T.accent};">${d}</div><div>${s}</div></div>`).join('')}
      ${T.btn('選んだ3つを段階表に入れる', false)}`)}
    ${T.win('せってい', `
      ${T.row('次の段へ進む目安', { right: '3回・不安3以下' })}
      ${T.row('ごほうびの設定', { right: '3件' })}
      ${T.row('データの書き出し／読み込み')}
      ${T.row('はじめに読む注意')}`)}
  `, 4);
}

// ---------- パターン2（ワールドマップ）だけ、ホームと段階表をマップで描く ----------
function mapNodes(nodes) {
  return nodes.map(({ x, y, label, kind }) => {
    const size = kind === 'now' ? 50 : 38;
    const style = {
      clear: 'background: #6fe0a0; color: #123b2a; border: 3px solid #f6f0dc;',
      now: 'background: #ffcf4a; color: #1b1f44; border: 3px solid #fff4d0; box-shadow: 0 0 0 6px rgba(255,207,74,0.35);',
      todo: 'background: #6d5a3a; color: #f6f0dc; border: 3px solid #f6f0dc;',
      heavy: 'background: #b8453a; color: #fff; border: 3px solid #f6f0dc;',
      goal: 'background: #2a3aa0; color: #ffcf4a; border: 3px solid #ffcf4a;',
    }[kind];
    return `<div style="position: absolute; left: ${x - size / 2}px; top: ${y - size / 2}px; width: ${size}px; height: ${size}px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'DotGothic16', monospace; font-size: ${kind === 'now' ? 22 : 16}px; ${style}">${label}</div>`;
  }).join('');
}
B.homeOverride = () => {
  const T = B;
  const nodes = [
    { x: 40, y: 250, label: '1', kind: 'clear' }, { x: 130, y: 205, label: '2', kind: 'clear' },
    { x: 215, y: 240, label: '3', kind: 'now' }, { x: 300, y: 185, label: '4', kind: 'todo' },
    { x: 220, y: 120, label: '5', kind: 'todo' }, { x: 120, y: 90, label: '6', kind: 'todo' },
    { x: 230, y: 40, label: '8', kind: 'heavy' }, { x: 318, y: 40, label: '10', kind: 'goal' },
  ];
  const path = 'M40 250 L130 205 L215 240 L300 185 L220 120 L120 90 L230 40 L318 40';
  return T.page(`
    ${statusWin(T)}
    <div style="position: relative; height: 290px; border: 2px solid #f6f0dc; border-radius: 6px; box-shadow: 0 0 0 2px #0b1233; overflow: hidden; ${GRASS}">
      <svg width="354" height="290" viewBox="0 0 354 290" style="position: absolute; left: 0; top: 0;" fill="none"><path d="${path}" stroke="#d9c38a" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"></path><path d="M0 0 H60 V30 H0Z M290 250 H354 V290 H290Z" fill="#3d6fd1"></path></svg>
      ${mapNodes(nodes)}
      <div style="position: absolute; left: 10px; bottom: 8px; font-family: 'DotGothic16', monospace; font-size: 13px; color: #fff; text-shadow: 0 2px 0 #123b2a;">人前で話す の大陸</div>
    </div>
    ${questWin(T)}
    ${T.btn('いどむ', true)}
  `, 1);
};
B.ladderOverride = () => {
  const T = B;
  const nodes = [
    { x: 60, y: 520, label: '1', kind: 'clear' }, { x: 170, y: 490, label: '2', kind: 'clear' },
    { x: 280, y: 440, label: '3', kind: 'now' }, { x: 190, y: 370, label: '4', kind: 'todo' },
    { x: 80, y: 320, label: '4', kind: 'todo' }, { x: 150, y: 240, label: '5', kind: 'todo' },
    { x: 270, y: 200, label: '6', kind: 'todo' }, { x: 200, y: 110, label: '8', kind: 'heavy' },
    { x: 90, y: 50, label: '10', kind: 'goal' },
  ];
  const path = 'M' + nodes.map((n) => `${n.x} ${n.y}`).join(' L');
  return T.page(`
    <div style="position: relative; flex-grow: 1; border: 2px solid #f6f0dc; border-radius: 6px; box-shadow: 0 0 0 2px #0b1233; overflow: hidden; ${GRASS}">
      <svg width="354" height="580" viewBox="0 0 354 580" style="position: absolute; left: 0; top: 0;" fill="none"><path d="${path}" stroke="#d9c38a" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"></path><path d="M300 0 H354 V90 H320Z M0 380 H30 V470 H0Z" fill="#3d6fd1"></path></svg>
      ${mapNodes(nodes)}
      <div style="position: absolute; left: 10px; top: 8px; font-family: 'DotGothic16', monospace; font-size: 13px; color: #fff; text-shadow: 0 2px 0 #123b2a;">人前で話す の大陸</div>
      <div style="position: absolute; left: 222px; top: 96px; font-size: 11px; color: #fff; background: rgba(11,18,51,0.8); padding: 2px 6px;">負荷高</div>
      <div style="position: absolute; left: 118px; top: 38px; font-size: 11px; color: #fff; background: rgba(11,18,51,0.8); padding: 2px 6px;">100人の前で話す</div>
    </div>
    ${T.win('ステージ 3 ／ 難しさ 3', `
      <div style="font-size: 18px;">会議で一言だけ発言する</div>
      <div style="display: flex; align-items: center; justify-content: space-between;">${dots(T, 2, 3)}<div style="font-size: 13px; color: ${T.dim};">名前・難しさを変える ＞</div></div>`)}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">${T.btn('＋ 自分で追加', false)}${T.btn('AIに作らせる', false)}</div>
  `, 0);
};

// ---------- パターン3（冒険手帳）は暗い背景上の文字色を補正 ----------
// 冒険手帳は紙のウィンドウの外に文字を置かない構成なので、そのまま使える

// ---------- 書き出し ----------
const SCREENS = [
  ['Home', 'ホーム', home], ['Ladder', '段階表', ladder], ['Practice', '実践記録', practice],
  ['Review', '振り返り', review], ['Quiz', '恐怖チェック 質問', quiz], ['Result', '恐怖チェック 結果', result],
  ['Ai', 'AI課題作成＋設定', aiAndSettings],
];
const PATTERNS = [[A, 'P1', '1 コマンド'], [B, 'P2', '2 ワールドマップ'], [C, 'P3', '3 冒険手帳']];
const artboards = [];
const files = [];
PATTERNS.forEach(([T, prefix, pname], row) => {
  SCREENS.forEach(([id, title, fn], col) => {
    let html = fn(T);
    if (T === B && id === 'Home') html = B.homeOverride();
    if (T === B && id === 'Ladder') html = B.ladderOverride();
    const file = row === 0 && col === 0 ? 'Main.dc.html' : `${prefix}${id}.dc.html`;
    writeFileSync(file, html);
    files.push(file);
    artboards.push({ file, title: `${pname}｜${title}`, x: col * 470, y: row * 1000, w: 390, h: 844, page: 'page-1' });
  });
});
[['NoteDirection.dc.html', 'A ノート風'], ['QuestDirection.dc.html', 'B クエスト風'], ['MeterDirection.dc.html', 'C 計測ツール風']].forEach(([file, title], i) => {
  artboards.push({ file, title, x: i * 490, y: 0, w: 390, h: 844, page: 'page-2' });
  files.push(file);
});
const canvas = {
  pages: [{ id: 'page-1', name: 'レトロRPG風 3パターン' }, { id: 'page-2', name: '初期のホーム案' }],
  artboards,
  annotations: [
    { id: 'p1-note', page: 'page-1', x: -330, y: 0, w: 260, text: 'パターン1 コマンド\n黒地に白枠のウィンドウとドット文字。8ビット時代の雰囲気。\n良い点：文字が大きくくっきり、迷わない\n弱い点：色が少なく、グラフの読みやすさは控えめ' },
    { id: 'p2-note', page: 'page-1', x: -330, y: 1000, w: 260, text: 'パターン2 ワールドマップ\n段階表を草原の大陸マップで表示。青いグラデーションのウィンドウ。\n良い点：進んでいる実感が一番強い\n弱い点：課題が多いとマップが込み合う。課題名はタップしないと見えない' },
    { id: 'p3-note', page: 'page-1', x: -330, y: 2000, w: 260, text: 'パターン3 冒険手帳\n木の机に羊皮紙の手帳。赤いリボンの見出し。\n良い点：落ち着いていて、記録を読み返す気になる\n弱い点：ゲームらしい高揚感は3つの中で弱め' },
    { id: 'old-note', page: 'page-2', x: 0, y: -140, w: 700, text: '前回のホーム3案（比較用に残しています）' },
  ],
  launch: { view: 'canvas', page: 'page-1' },
};
writeFileSync('canvas.json', JSON.stringify(canvas, null, 2));
console.log(files.map((f) => `--artboard ${f}`).join(' '));
