import type { Settings } from './types';

export const STORAGE_KEYS = {
  themes: 'exposure.themes',
  records: 'exposure.records',
  fearChecks: 'exposure.fearChecks',
  settings: 'exposure.settings',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  clearRequirement: { count: 3, maxAnxietyAfter: 3 },
  guardrailThreshold: 8,
  points: 0,
  rewards: [
    { id: 'r1', thresholdPt: 10, label: '好きなカフェに行く' },
    { id: 'r2', thresholdPt: 30, label: '映画を観る' },
    { id: 'r3', thresholdPt: 50, label: '新しい服を買う' },
  ],
  onboardingCompleted: false,
};

function isBrowser() {
  // window越しではなく localStorage を直接見る。
  // テストでは vi.stubGlobal('localStorage', ...) で window を介さず差し替えるため。
  return typeof localStorage !== 'undefined';
}

export function readList<T>(key: string): T[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeList<T>(key: string, items: T[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function readSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(s: Settings): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
}
