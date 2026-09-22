import type { PracticeRecord, Stage, Theme } from './types';

// 自分で作ったテーマの初期の段。中身の課題はあとから自由に書き換える前提なので、
// ここでは「小さく試す→ふつう→思い切って」の3段だけ用意する
const CUSTOM_STAGES: { level: number; suffix: string }[] = [
  { level: 1, suffix: 'をごく小さく試す' },
  { level: 4, suffix: 'をふつうにやってみる' },
  { level: 7, suffix: 'を思い切ってやる' },
];

export function createCustomTheme(rawName: string): Theme {
  const name = rawName.trim();
  const now = new Date().toISOString();
  const stages: Stage[] = CUSTOM_STAGES.map((s, i) => {
    const stageName = `${name}${s.suffix}`;
    return {
      id: crypto.randomUUID(),
      level: s.level,
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
