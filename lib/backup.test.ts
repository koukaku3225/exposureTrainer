import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildBackup, restoreBackup, isValidBackup } from './backup';
import { readList, readSettings, writeList, writeSettings, STORAGE_KEYS, DEFAULT_SETTINGS } from './storage';
import type { Theme } from './types';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('buildBackup / restoreBackup', () => {
  it('現在のデータをまとめて書き出し、復元するとそのまま読み戻せる', () => {
    const theme: Theme = { id: 't1', name: 'テーマ', createdAt: '', updatedAt: '', ifThen: null, stages: [] };
    writeList(STORAGE_KEYS.themes, [theme]);
    writeSettings({ ...DEFAULT_SETTINGS, points: 12 });

    const backup = buildBackup();
    expect(backup.themes).toEqual([theme]);
    expect(backup.settings.points).toBe(12);

    // 別のデータで上書きしてから復元し、元に戻ることを確認する
    writeList(STORAGE_KEYS.themes, []);
    writeSettings(DEFAULT_SETTINGS);
    restoreBackup(backup);

    expect(readList<Theme>(STORAGE_KEYS.themes)).toEqual([theme]);
    expect(readSettings().points).toBe(12);
  });
});

describe('isValidBackup', () => {
  it('正しい形なら true', () => {
    const backup = buildBackup();
    expect(isValidBackup(backup)).toBe(true);
  });

  it('themesが配列でなければ false', () => {
    expect(isValidBackup({ ...buildBackup(), themes: 'oops' })).toBe(false);
  });

  it('オブジェクトでなければ false', () => {
    expect(isValidBackup('not an object')).toBe(false);
    expect(isValidBackup(null)).toBe(false);
  });
});
