import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS } from './storage';
import type { FearCheckResult, PracticeRecord, Settings, Theme } from './types';

export const BACKUP_FORMAT_VERSION = 1;

export type BackupData = {
  formatVersion: number;
  exportedAt: string;
  themes: Theme[];
  records: PracticeRecord[];
  fearChecks: FearCheckResult[];
  settings: Settings;
};

export function buildBackup(): BackupData {
  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    themes: readList<Theme>(STORAGE_KEYS.themes),
    records: readList<PracticeRecord>(STORAGE_KEYS.records),
    fearChecks: readList<FearCheckResult>(STORAGE_KEYS.fearChecks),
    settings: readSettings(),
  };
}

// 読み込みは全置き換え（バックアップからの復元）。中途半端な統合はしない。
export function restoreBackup(data: BackupData): void {
  writeList(STORAGE_KEYS.themes, data.themes);
  writeList(STORAGE_KEYS.records, data.records);
  writeList(STORAGE_KEYS.fearChecks, data.fearChecks);
  writeSettings(data.settings);
}

export function isValidBackup(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.formatVersion === 'number' &&
    Array.isArray(d.themes) &&
    Array.isArray(d.records) &&
    Array.isArray(d.fearChecks) &&
    typeof d.settings === 'object' &&
    d.settings !== null
  );
}
