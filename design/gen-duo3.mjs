// Duo3（コーラル・クリーム地）の全7画面を生成する
import { writeFileSync } from 'node:fs';

const C = {
  cream: '#fff8f0', text: '#3a2a17', dim: '#b09378', dim2: '#d6b89e',
  coral: '#ff6f3c', coralDark: '#d84a1a', amber: '#ffab3c', amberDark: '#d68414',
  gold: '#ff9500', good: '#ffab3c', track: '#ffe0cc', cardShadow: 'rgba(58,42,23,0.05)',
  font: "'M PLUS Rounded 1c', 'Hiragino Maru Gothic ProN', sans-serif",
};

const ICONS = {
  home: 'M4 11l8-6 8 6v8h-5v-5H9v5H4z',
  ladder: 'M4 19h5v-4h5v-4h6',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  chart: 'M4 19V9M11 19V4M18 19v-7',
  heart: 'M12 21s-7-4.5-9.5-9C.5 8 3 5 6.5 5 9 5 11 7 12 8.5 13 7 15 5 17.5 5 21 5 23.5 8 21.5 12 19 16.5 12 21 12 21z',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
  check: 'M4 12l5 5L20 6',
  star: 'M12 3l2.7 5.9L21 9.8l-4.5 4.2L17.7 21 12 17.6 6.3 21l1.2-7-4.5-4.2 6.3-.9L12 3z',
  plus: 'M12 5v14M5 12h14',
  sparkle: 'M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  flame: 'M12 2c1 4-3 5-3 9a5 5 0 0010 0c0-2-1-3-2-4 0 2-1 3-2 2 1-3-1-5-3-7z',
};
const icon = (name, size, color, stroke = 2, fill = 'none') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill === 'fill' ? color : 'none'}" stroke="${fill === 'fill' ? 'none' : color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${name === 'flame' || name === 'star' ? `<path d="${ICONS[name]}"></path>` : `<path d="${ICONS[name]}"></path>`}</svg>`;
const lockIcon = (size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="5" y="11" width="14" height="9" rx="2.5"></rect><path d="M8 11V8a4 4 0 118 0v3"></path></svg>`;
const arrowRightIcon = (size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>`;

const NAV = [['home', 'ホーム'], ['ladder', '段階表'], ['bolt', 'いどむ'], ['chart', '振り返り'], ['gear', '設定']];

function shell(inner, navIdx) {
  const hasNav = navIdx !== null && navIdx !== -1;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&display=swap">
  <style>
    body { margin: 0; background: ${C.cream}; font-family: ${C.font}; color: ${C.text}; }
    a { color: ${C.coral}; }
  </style>
</helmet>
<div style="width: 390px; height: 844px; box-sizing: border-box; background: ${C.cream}; display: flex; flex-direction: column;">
  <div style="flex-grow: 1; padding: 44px 18px ${hasNav ? '8px' : '28px'}; display: flex; flex-direction: column; gap: 14px; overflow: hidden;">
${inner}
  </div>
  ${hasNav ? `<div style="height: 78px; box-sizing: border-box; padding-bottom: 12px; border-top: 1px solid #ffe9db; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));">
    ${NAV.map(([ic, label], i) => `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: ${i === navIdx ? C.coral : C.dim2}; font-size: 10px; font-weight: ${i === navIdx ? 800 : 500};">${icon(ic, 20, i === navIdx ? C.coral : C.dim2, i === navIdx ? 2.2 : 1.8)}${label}</div>`).join('')}
  </div>` : ''}
</div>
</x-dc>
</body>
</html>
`;
}
const header = (title, sub) => `<div style="display: flex; flex-direction: column;">${sub ? `<div style="font-size: 12px; color: ${C.dim}; font-weight: 700;">${sub}</div>` : ''}<div style="font-size: 20px; font-weight: 900;">${title}</div></div>`;
// アイデア5：連続日数（ストリーク）は途切れると脅迫観念になりやすいので廃止。
// 「積み上げ」＝減らない・下がらない累計値だけを見せる。
const chips = () => `<div style="display: flex; align-items: center; gap: 10px;">
  <div style="display: flex; align-items: center; gap: 4px; background: #ffe9db; border-radius: 999px; padding: 6px 10px;">${icon('check', 14, C.coralDark, 3)}<div style="font-size: 13px; font-weight: 800; color: #c14a1f;">累計32回</div></div>
  <div style="display: flex; align-items: center; gap: 4px; background: #fff0dc; border-radius: 999px; padding: 6px 10px;">${icon('star', 14, C.amber, 0, 'fill')}<div style="font-size: 13px; font-weight: 800; color: #a5680a;">34</div></div>
</div>`;
const topBar = (title, sub) => `<div style="display: flex; align-items: center; justify-content: space-between;">${header(title, sub)}${chips()}</div>`;
const card = (inner, { pad = '16px' } = {}) => `<div style="background: #fff; border-radius: 18px; padding: ${pad}; box-shadow: 0 2px 10px ${C.cardShadow}; display: flex; flex-direction: column; gap: 10px;">${inner}</div>`;
const chip = (label, tone = 'coral') => `<div style="display: inline-flex; align-items: center; padding: 4px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 800; background: ${tone === 'coral' ? '#ffe9db' : tone === 'good' ? '#fff3de' : '#f5ece1'}; color: ${tone === 'coral' ? C.coralDark : tone === 'good' ? C.amberDark : C.dim};">${label}</div>`;
const bar = (pct, color = C.coral, h = 10) => `<div style="height: ${h}px; border-radius: 999px; background: ${C.track}; overflow: hidden; display: flex;"><div style="width: ${pct}%; background: ${color}; border-radius: 999px;"></div></div>`;
const btn = (label, { primary = true, ic } = {}) => `<div style="height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16px; font-weight: 800; ${primary ? `background: ${C.coral}; color: #fff; box-shadow: 0 5px 0 ${C.coralDark};` : `background: #fff; color: ${C.coral}; border: 1.5px solid #ffe0cc;`}">${ic ? icon(ic, 18, primary ? '#fff' : C.coral, 2.4) : ''}${label}</div>`;
const row = (label, { sub = '', right = '', ic } = {}) => `<div style="display: flex; align-items: center; gap: 12px; padding: 6px 0;">${ic ? `<div style="width: 38px; height: 38px; border-radius: 12px; background: #ffe9db; display: flex; align-items: center; justify-content: center;">${icon(ic, 18, C.coralDark, 2.2)}</div>` : ''}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1px;"><div style="font-size: 14.5px; font-weight: 700;">${label}</div>${sub ? `<div style="font-size: 12px; color: ${C.dim};">${sub}</div>` : ''}</div>${right ? `<div style="font-size: 12.5px; color: ${C.dim};">${right}</div>` : icon('arrow', 16, C.dim2, 2)}</div>`;
const scale = (sel, label) => `<div style="display: flex; flex-direction: column; gap: 8px;">
  <div style="font-size: 13px; color: ${C.dim}; font-weight: 700;">${label}</div>
  <div style="display: flex; gap: 5px;">${Array.from({ length: 11 }, (_, n) => `<div style="flex-grow: 1; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; ${n === sel ? `background: ${C.coral}; color: #fff;` : `background: #fff0e2; color: #d6a172;`}">${n}</div>`).join('')}</div></div>`;
const stageCard = () => `<div style="background: #fff; border-radius: 18px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 10px ${C.cardShadow};">
  <div style="width: 42px; height: 42px; border-radius: 14px; background: ${C.coral}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${icon('bolt', 20, '#fff', 2.6)}</div>
  <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 1px;">
    <div style="font-size: 11.5px; font-weight: 700; color: ${C.coral};">いまのステージ・2/3回</div>
    <div style="font-size: 14.5px; font-weight: 800; line-height: 1.3;">会議で一言だけ発言する</div>
  </div>
</div>`;
// アイデア1：if-thenプランニング。「次にXが起きたらYをやる」をカードにして常に見える位置に置く
const ifThenCard = (trigger, action, { editable = true } = {}) => `<div style="background: #fff4e9; border: 1.5px dashed #ffcda3; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
  <div style="width: 34px; height: 34px; border-radius: 11px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${icon('sparkle', 16, C.coral, 2.2)}</div>
  <div style="flex-grow: 1; font-size: 12.5px; line-height: 1.6;"><span style="color: ${C.dim};">次の一歩：</span><b>${trigger}</b> になったら → <b style="color: ${C.coralDark};">${action}</b></div>
  ${editable ? `<div style="font-size: 11px; color: ${C.coral}; font-weight: 700; flex-shrink: 0;">編集</div>` : ''}
</div>`;
// アイデア3：難易度ガードレール。上限を超える段は理由つきでロック表示
const lockedNote = () => `<div style="display: flex; align-items: center; gap: 8px; background: #fdf1e6; border-radius: 12px; padding: 10px 12px; font-size: 11.5px; color: ${C.dim}; line-height: 1.5;">${lockIcon(15, '#c9a980')}<div>難易度8以上は、直近3回を不安3以下でクリアすると解放されます</div></div>`;

// ---------- ホーム（提示された Duo3 案そのまま） ----------
function home() {
  return shell(`
    ${topBar('今日の一歩', 'おかえりなさい')}
    ${stageCard()}
    ${ifThenCard('会議が始まったら', '一言だけ発言する')}
    <div style="position: relative; flex-grow: 1; min-height: 0;">
      <svg width="354" height="430" viewBox="0 0 354 430" style="position: absolute; left: 0; top: 0;" fill="none">
        <path d="M180 400 C 90 400 90 340 180 330 S 270 280 180 260 S 90 220 180 190 S 270 150 190 120 S 100 90 190 40" stroke="${C.track}" stroke-width="14" stroke-linecap="round" stroke-dasharray="1 20"></path>
      </svg>
      <div style="position: absolute; left: 154px; top: 372px; width: 56px; height: 56px; border-radius: 28px; background: ${C.amber}; box-shadow: 0 5px 0 ${C.amberDark}; display: flex; align-items: center; justify-content: center;">${icon('check', 24, '#fff', 3)}</div>
      <div style="position: absolute; left: 244px; top: 302px; width: 56px; height: 56px; border-radius: 28px; background: ${C.amber}; box-shadow: 0 5px 0 ${C.amberDark}; display: flex; align-items: center; justify-content: center;">${icon('check', 24, '#fff', 3)}</div>
      <div style="position: absolute; left: 154px; top: 210px; width: 68px; height: 68px; border-radius: 34px; background: ${C.coral}; box-shadow: 0 6px 0 ${C.coralDark}, 0 0 0 6px ${C.track}; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #fff;">3</div>
      <div style="position: absolute; left: 244px; top: 148px; width: 54px; height: 54px; border-radius: 27px; background: #fff0e2; border: 2px solid #ffd9b8; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #d6a172; font-size: 18px;">4</div>
      <div style="position: absolute; left: 140px; top: 82px; width: 54px; height: 54px; border-radius: 27px; background: #fff0e2; border: 2px solid #ffd9b8; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #d6a172; font-size: 18px;">5</div>
      <div style="position: absolute; left: 76px; top: 8px; width: 60px; height: 60px; border-radius: 30px; background: #fff; border: 3px solid ${C.gold}; display: flex; align-items: center; justify-content: center;">${icon('star', 26, C.gold, 0, 'fill')}</div>
    </div>
    ${btn('いどむ', { primary: true, ic: 'bolt' })}
  `, 0);
}

// ---------- 段階表：ホームと同じ道の見た目で、全9段を縦に ----------
const LADDER = [
  { n: 1, name: '30秒スピーチを録音して聞き返す', st: 'clear' },
  { n: 2, name: '録画して表情ごと見返す', st: 'clear' },
  { n: 3, name: '会議で一言だけ発言する', st: 'now' },
  { n: 4, name: '2〜3人の前で3分話す', st: 'todo' },
  { n: 5, name: '話の途中でわざと一瞬詰まる', st: 'todo' },
  { n: 6, name: '勉強会で自己紹介する', st: 'todo' },
  { n: 7, name: 'オンラインで10人に5分発表', st: 'todo' },
  { n: 8, name: '30〜50人の前で話す', st: 'heavy' },
  { n: 9, name: '100人の前で話す', st: 'goal' },
];
function ladder() {
  const xs = [190, 100, 190, 280, 190, 100, 190, 280, 190];
  const ys = LADDER.map((_, i) => 470 - i * 58);
  const pathD = 'M' + xs.map((x, i) => `${x} ${ys[i]}`).join(' L');
  // アイデア3：難易度8以上（LADDERのstが heavy/goal）はガードレールで施錠する
  const nodes = LADDER.map((r, i) => {
    const locked = r.st === 'heavy' || r.st === 'goal';
    const style = r.st === 'clear' ? `background: ${C.amber}; box-shadow: 0 4px 0 ${C.amberDark};`
      : r.st === 'now' ? `background: ${C.coral}; box-shadow: 0 5px 0 ${C.coralDark}, 0 0 0 5px ${C.track};`
      : locked ? `background: #f2ece2; border: 2px dashed #d8c7ae;`
      : `background: #fff0e2; border: 2px solid #ffd9b8;`;
    const size = r.st === 'now' ? 58 : 46;
    const label = r.st === 'clear' ? icon('check', 20, '#fff', 3)
      : locked ? lockIcon(r.st === 'goal' ? 22 : 18, '#b8a082')
      : `<span style="color:${r.st === 'now' ? '#fff' : '#d6a172'};font-weight:900;font-size:${r.st === 'now' ? 20 : 15}px;">${r.n}</span>`;
    return `<div style="position: absolute; left: ${xs[i] - size / 2}px; top: ${ys[i] - size / 2}px; width: ${size}px; height: ${size}px; border-radius: ${size / 2}px; display: flex; align-items: center; justify-content: center; opacity: ${locked ? 0.85 : 1}; ${style}">${label}</div>`;
  }).join('');
  return shell(`
    ${header('人前で話す の段階表', '難しさ順に下から上へ')}
    <div style="position: relative; flex-grow: 1; min-height: 0; overflow: hidden;">
      <svg width="354" height="500" viewBox="0 0 354 500" style="position: absolute; left: 0; top: 6px;" fill="none">
        <path d="${pathD}" stroke="${C.track}" stroke-width="14" stroke-linecap="round" stroke-dasharray="1 20"></path>
      </svg>
      <div style="position: absolute; left: 0; top: 6px; width: 354px; height: 500px;">${nodes}</div>
      <div style="position: absolute; left: 0; bottom: 6px; background: #fff; border-radius: 14px; padding: 10px 14px; box-shadow: 0 2px 10px ${C.cardShadow}; font-size: 12.5px; font-weight: 700; color: ${C.coral};">▶ いまここ：会議で一言だけ発言する（2/3回）</div>
    </div>
    ${lockedNote()}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">
      ${btn('自分で追加', { primary: false, ic: 'plus' })}
      ${btn('AIに作らせる', { primary: false, ic: 'sparkle' })}
    </div>
  `, 1);
}

// アイデア4：「進む／続ける」を非対称な主従ボタンにせず、3択を対等に並べる
// （「今回はここでよかった」も恥じることなく選べる見た目にする）
const choiceRow = (label, sub, { selected = false } = {}) => `<div style="border-radius: 16px; padding: 13px 14px; display: flex; align-items: center; gap: 10px; ${selected ? `background: #fff4e9; border: 1.5px solid ${C.coral};` : `background: #fff; border: 1.5px solid #ffe0cc;`}">
  <div style="width: 22px; height: 22px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; ${selected ? `background: ${C.coral};` : `border: 1.5px solid #ffd9b8;`}">${selected ? icon('check', 13, '#fff', 3) : ''}</div>
  <div style="display: flex; flex-direction: column; gap: 1px;"><div style="font-size: 14px; font-weight: 800;">${label}</div><div style="font-size: 11.5px; color: ${C.dim};">${sub}</div></div>
</div>`;

function practice() {
  const toggle = (label, on) => `<div style="flex-grow: 1; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 700; ${on ? `background: ${C.coral}; color: #fff;` : `background: #fff0e2; color: ${C.dim};`}">${label}</div>`;
  const scaleCompact = (sel, label) => `<div style="display: flex; flex-direction: column; gap: 5px;">
    <div style="font-size: 12px; color: ${C.dim}; font-weight: 700;">${label}</div>
    <div style="display: flex; gap: 4px;">${Array.from({ length: 11 }, (_, n) => `<div style="flex-grow: 1; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; ${n === sel ? `background: ${C.coral}; color: #fff;` : `background: #fff0e2; color: #d6a172;`}">${n}</div>`).join('')}</div></div>`;
  return shell(`
    ${header('実践を記録')}
    ${card(`
      <div style="font-size: 12px; color: ${C.dim};">人前で話す ／ 難しさ3 ／ 3回め</div>
      <div style="font-size: 16px; font-weight: 800;">会議で一言だけ発言する</div>
      <div style="display: flex; gap: 6px;">${toggle('現実でやった', true)}${toggle('想像でやった', false)}</div>
      ${scaleCompact(6, 'はじめる前の不安')}
      ${scaleCompact(3, '終わった後の不安')}
    `, { pad: '14px' })}
    ${card(`
      <div style="font-size: 13.5px; line-height: 1.6;">不安が <b style="color: ${C.coral};">3</b> 下がりました。ゆうき <b style="color: ${C.coral};">+5pt</b>。3回クリアです。</div>
      <div style="font-size: 11.5px; color: ${C.dim}; font-weight: 700;">どうしますか？（どれを選んでも大丈夫です）</div>
      ${choiceRow('次の段へ進む', '難しさ4に挑戦する', { selected: true })}
      ${choiceRow('もう少しこの段を続ける', 'あと数回、同じ課題で慣れる')}
      ${choiceRow('今回はここでよかった', '今日はここまでにする')}
    `, { pad: '14px' })}
  `, 2);
}

function review() {
  const days = [['月', 1], ['火', 0], ['水', 2], ['木', 1], ['金', 1], ['土', 0], ['日', 0]];
  const pairs = [[7, 5], [6, 4], [6, 3]];
  return shell(`
    ${header('振り返り')}
    ${card(`
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div><div style="font-size: 22px; font-weight: 900; color: ${C.coral};">32<span style="font-size: 12px; color: ${C.dim};">回</span></div><div style="font-size: 11px; color: ${C.dim};">はじめてからの累計</div></div>
        <div style="width: 1px; background: #ffe9db;"></div>
        <div><div style="font-size: 22px; font-weight: 900; color: ${C.coral};">−48</div><div style="font-size: 11px; color: ${C.dim};">不安スコアの合計低下</div></div>
      </div>
      <div style="font-size: 11px; color: ${C.dim}; text-align: center;">どちらも積み上がるだけで、減ることはありません</div>`)}
    ${card(`
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 84px; gap: 7px;">
        ${days.map(([d, n]) => `<div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;"><div style="font-size: 11px; color: ${C.dim};">${n || ''}</div><div style="width: 100%; height: ${n * 22 + 4}px; background: ${C.coral}; border-radius: 6px;"></div><div style="font-size: 11px; color: ${C.dim};">${d}</div></div>`).join('')}
      </div>
      <div style="font-size: 12px; color: ${C.dim};">合計 5回（先週 3回）</div>`)}
    ${card(`
      <div style="font-size: 13.5px; font-weight: 800;">不安のうつりかわり：会議で一言</div>
      ${pairs.map(([b, a], i) => `<div style="display: grid; grid-template-columns: 38px minmax(0,1fr) 42px; align-items: center; gap: 8px; font-size: 11.5px; color: ${C.dim};"><div>${i + 1}回め</div><div style="display: flex; flex-direction: column; gap: 3px;">${bar(b * 10, '#ffd9b8', 6)}${bar(a * 10, C.coral, 6)}</div><div style="font-weight: 900; color: ${C.text}; font-size: 13px;">${b}→${a}</div></div>`).join('')}`)}
    ${card(`
      <div style="font-size: 13.5px; font-weight: 800;">今日できたこと</div>
      ${['会議で一言発言した', '店員さんにお礼を言えた', '録画を最後まで見返せた'].map((s) => `<div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px;">${icon('star', 15, C.amber, 0, 'fill')}${s}</div>`).join('')}`)}
  `, 3);
}

function quiz() {
  return shell(`
    <div style="display: flex; align-items: center; gap: 10px;">${bar(36, C.coral, 8)}<div style="font-size: 13px; font-weight: 800; color: ${C.dim};">5/14</div></div>
    ${card(`<div style="font-size: 12px; color: ${C.dim};">しつもん 5</div><div style="font-size: 19px; font-weight: 800; line-height: 1.6; min-height: 120px;">知らない人に話しかけるとき、冷たくされないかと不安になる。</div>`)}
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${btn('はい', { primary: true, ic: 'check' })}
      ${btn('いいえ', { primary: false })}
    </div>
    <div style="flex-grow: 1;"></div>
    <div style="font-size: 11.5px; color: ${C.dim}; text-align: center; line-height: 1.6;">正解はありません。思ったとおりに答えてください。<br>これは診断ではなく、怖がりやすい種類を知るためのものです</div>
  `, 1);
}

function result() {
  const FEARS = [
    { name: '失敗', yes: 2, all: 3 }, { name: '拒絶', yes: 3, all: 3, top: true },
    { name: 'コントロール', yes: 1, all: 3 }, { name: 'つながり', yes: 0, all: 3 },
    { name: '評判', yes: 2, all: 2, top: true },
  ];
  const rows = FEARS.map((f) => `
    <div style="display: flex; flex-direction: column; gap: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; font-weight: ${f.top ? 800 : 500};">
        <div style="display: flex; align-items: center; gap: 6px; color: ${f.top ? C.coral : C.text};">${f.top ? icon('star', 13, C.coral, 0, 'fill') : ''}${f.name}</div>
        <div style="color: ${C.dim}; font-weight: 700;">${f.yes}/${f.all}</div>
      </div>
      ${bar(Math.round((f.yes / f.all) * 100), f.top ? C.coral : '#ffe0cc', 8)}
    </div>`).join('');
  return shell(`
    ${header('あなたの恐怖のかたち')}
    ${card(`${rows}<div style="font-size: 11.5px; color: ${C.dim};">前回（8/31）より 失敗 が1減りました</div>`)}
    ${card(`<div style="font-size: 14px; line-height: 1.7;"><b style="color: ${C.coral};">拒絶</b> と <b style="color: ${C.coral};">評判</b> が同じ割合です。どちらから挑みますか？</div>`)}
    ${row('評判', { sub: '恥・人前で話す の段階表へ', ic: 'star' })}
    ${row('拒絶', { sub: '拒絶 の段階表へ', ic: 'heart' })}
  `, 1);
}

function aiAndSettings() {
  const gen = [[true, 2, '乾杯のあと隣の人に一言感想を言う'], [true, 3, '相手に質問を1つする'], [false, 5, '自分の近況を30秒話す'], [true, 6, '次の集まりを自分から提案する']];
  const box = (on) => `<div style="width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; ${on ? `background: ${C.coral};` : `border: 1.5px solid #ffd9b8;`}">${on ? icon('check', 13, '#fff', 3) : ''}</div>`;
  return shell(`
    ${header('AIに課題を作らせる')}
    ${card(`
      <div style="border-radius: 12px; padding: 12px; background: #fff8f0; border: 1px solid #ffe9db; font-size: 13.5px; line-height: 1.6;">大学の同期との飲み会で、自分から話を振るのが怖い</div>
      ${btn('課題を作ってもらう', { primary: true, ic: 'sparkle' })}
      <div style="font-size: 11.5px; color: ${C.dim};">段階表に入れるものを選ぶ（難しさはあとで変更可）</div>
      ${gen.map(([on, d, s]) => `<div style="display: flex; align-items: center; gap: 10px; font-size: 13.5px;">${box(on)}<div style="font-weight: 900; color: ${C.coral}; width: 16px;">${d}</div><div>${s}</div></div>`).join('')}
      ${btn('選んだ3つを段階表に入れる', { primary: false })}
    `)}
    ${card(`
      ${row('次の段へ進む目安', { right: '3回・不安3以下', ic: 'gear' })}
      ${row('ごほうびの設定', { right: '3件', ic: 'star' })}
      ${row('データの書き出し／読み込み', { ic: 'chart' })}
      ${row('はじめに読む注意', { ic: 'heart' })}
    `)}
  `, 4);
}

// アイデア2：初回は必ず成功で終わる。難易度1固定・失敗しようがない課題を1つだけ出す
function onboard1() {
  return shell(`
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 22px; align-items: center; text-align: center;">
      <div style="width: 72px; height: 72px; border-radius: 36px; background: #fff; border: 3px solid ${C.gold}; display: flex; align-items: center; justify-content: center;">${icon('sparkle', 30, C.gold, 2.2)}</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 21px; font-weight: 900;">はじめまして</div>
        <div style="font-size: 13.5px; color: ${C.dim}; line-height: 1.8; max-width: 280px;">怖いことを、少しずつ小さく試して慣れていくアプリです。<br>まずは1つだけ、絶対に失敗しない一歩から始めましょう。</div>
      </div>
      ${card(`
        <div style="display: flex; align-items: center; gap: 10px;">${chip('難易度 1', 'coral')}<div style="font-size: 11.5px; color: ${C.dim};">30秒で終わります</div></div>
        <div style="font-size: 16px; font-weight: 800; text-align: left;">スマホで30秒だけ、独り言でスピーチの練習をしてみる</div>
      `)}
    </div>
    ${btn('やってみる', { primary: true, ic: 'bolt' })}
  `, -1);
}
function onboard2() {
  return shell(`
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 20px; align-items: center; text-align: center;">
      <div style="width: 84px; height: 84px; border-radius: 42px; background: ${C.amber}; box-shadow: 0 6px 0 ${C.amberDark}; display: flex; align-items: center; justify-content: center;">${icon('check', 36, '#fff', 3.4)}</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 21px; font-weight: 900;">できました！</div>
        <div style="font-size: 13.5px; color: ${C.dim}; line-height: 1.8; max-width: 280px;">これが「いどむ」です。むずかしく考えず、こんな小さな一歩から積み重ねていきます。</div>
      </div>
      ${card(`
        <div style="font-size: 12.5px; color: ${C.dim};">次はどんな怖さに取り組みますか？あとで変更もできます</div>
        ${choiceRow('人前で話すのが怖い', 'サンプルの段階表から始める', { selected: true })}
        ${choiceRow('自分でテーマを決める', '')}
      `)}
    </div>
    ${btn('はじめる', { primary: true, ic: 'arrow' })}
  `, -1);
}

const SCREENS = [
  ['Onboard1', 'はじめに 1', onboard1], ['Onboard2', 'はじめに 2', onboard2],
  ['Main', 'ホーム', home], ['Ladder', '段階表', ladder], ['Practice', '実践記録', practice],
  ['Review', '振り返り', review], ['Quiz', '恐怖チェック 質問', quiz], ['Result', '恐怖チェック 結果', result],
  ['Ai', 'AI課題作成＋設定', aiAndSettings],
];
const artboards = SCREENS.map(([id, title, fn], i) => {
  const file = `${id}.dc.html`;
  writeFileSync(file, fn());
  return { file, title, x: i * 470, y: 0, w: 390, h: 844 };
});
writeFileSync('duo3-canvas.json', JSON.stringify({ artboards, launch: { view: 'canvas' } }, null, 2));
console.log(artboards.map((a) => `--artboard ${a.file}`).join(' '));
