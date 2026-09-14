import type { Theme, Stage } from './types';

export type ThemeTemplate = {
  id: string;
  name: string;
  stages: { level: number; name: string }[];
};

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'public-speaking',
    name: '人前で話す',
    stages: [
      { level: 1, name: '30秒スピーチを録音して聞き返す' },
      { level: 2, name: '録画して表情ごと見返す' },
      { level: 3, name: '会議で一言だけ発言する' },
      { level: 4, name: '2〜3人の前で3分話す' },
      { level: 4, name: '話の途中でわざと一瞬詰まる' },
      { level: 5, name: '勉強会で自己紹介する' },
      { level: 6, name: 'オンラインで10人に5分発表する' },
      { level: 8, name: '30〜50人の前で話す' },
      { level: 10, name: '100人の前で話す' },
    ],
  },
  {
    id: 'shame',
    name: '恥（評判）',
    stages: [
      { level: 1, name: '近所のコンビニまでパジャマのまま行く' },
      { level: 2, name: 'エレベーターで独り言風に「失礼します」と言う' },
      { level: 3, name: '店員さんにちょっと変わった質問をする' },
      { level: 4, name: '会社資料にわざと小さな誤字を入れる' },
      { level: 5, name: '会議でわざと言葉に詰まってみる' },
      { level: 6, name: '普段と違うファッションで外出する' },
      { level: 7, name: 'オンライン会議でカメラをオンにして雑談する' },
      { level: 9, name: '人前で失敗談を自分から話す' },
    ],
  },
  {
    id: 'rejection',
    name: '拒絶',
    stages: [
      { level: 1, name: '知らない人と目を合わせる' },
      { level: 2, name: 'コンビニの店員に「ありがとう」と言う' },
      { level: 3, name: '同僚や知人に一言話しかける' },
      { level: 4, name: '道を尋ねる（知っている道でもよい）' },
      { level: 5, name: '店員に小さなお願いをする（例：試着したい）' },
      { level: 6, name: '断られてもいい軽い誘いをしてみる' },
      { level: 8, name: '本気の誘い・お願いをして、断られる可能性を受け入れる' },
    ],
  },
  {
    id: 'control',
    name: '不確実さ（コントロール）',
    stages: [
      { level: 1, name: '普段使わない道を歩いてみる' },
      { level: 2, name: '普段選ばないメニューを注文する' },
      { level: 3, name: '行き先を決めずに30分散歩する' },
      { level: 4, name: '調べずに知らない店に入ってみる' },
      { level: 5, name: '予定を1つ、当日決めにしてみる' },
      { level: 7, name: '計画を立てずに小さな旅に出る' },
    ],
  },
  {
    id: 'connection',
    name: 'つながり（自己開示）',
    stages: [
      { level: 1, name: '今日の天気について雑談する' },
      { level: 2, name: '「最近どうですか」と相手に質問する' },
      { level: 3, name: '親しい人に小さな本音を1つ話す' },
      { level: 4, name: '小さなお願いを誰かにしてみる' },
      { level: 5, name: '弱っていることを1つ打ち明ける' },
      { level: 7, name: '本音の相談を持ちかける' },
    ],
  },
];

export function instantiateTheme(template: ThemeTemplate): Theme {
  const now = new Date().toISOString();
  const stages: Stage[] = template.stages.map((s, i) => ({
    id: crypto.randomUUID(),
    level: s.level,
    name: s.name,
    status: i === 0 ? 'now' : 'todo',
    order: i,
  }));
  return {
    id: crypto.randomUUID(),
    name: template.name,
    createdAt: now,
    updatedAt: now,
    ifThen: null,
    stages,
  };
}
