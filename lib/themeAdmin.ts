import type { PracticeRecord, Stage, Theme } from './types';

// 自分で作ったテーマの初期の段。同梱テーマと同じく難易度1〜10をひと通り用意する。
// 中身の課題はあとから自由に書き換える前提なので、ここでは強さの段取りだけを示す
const CUSTOM_STAGE_SUFFIXES = [
  'を頭の中で思い描く',
  'の準備だけしてみる',
  'をごく小さく試す',
  'を1回だけやってみる',
  'をふつうにやってみる',
  'を少し長く（多く）やる',
  'を慣れない場面でやる',
  'を思い切ってやる',
  'をうまくいかない前提でやる',
  'を本気でやりきる',
];

export function createCustomTheme(rawName: string): Theme {
  const name = rawName.trim();
  const now = new Date().toISOString();
  const stages: Stage[] = CUSTOM_STAGE_SUFFIXES.map((suffix, i) => {
    const stageName = `${name}${suffix}`;
    return {
      id: crypto.randomUUID(),
      level: i + 1,
      name: stageName,
      tasks: [stageName, '', ''],
      status: i === 0 ? 'now' : 'todo',
      order: i,
    };
  });
  return { id: crypto.randomUUID(), name, createdAt: now, updatedAt: now, ifThen: null, stages };
}

export function removeTheme(themes: Theme[], id: string): Theme[] {
  return themes.filter((t) => t.id !== id);
}

export function removeThemeRecords(records: PracticeRecord[], themeId: string): PracticeRecord[] {
  return records.filter((r) => r.themeId !== themeId);
}

export function setThemeHidden(themes: Theme[], id: string, hidden: boolean, now: string): Theme[] {
  return themes.map((t) => (t.id === id ? { ...t, hidden, updatedAt: now } : t));
}

export function splitByVisibility(themes: Theme[]): { visible: Theme[]; hidden: Theme[] } {
  return {
    visible: themes.filter((t) => !t.hidden),
    hidden: themes.filter((t) => t.hidden),
  };
}
