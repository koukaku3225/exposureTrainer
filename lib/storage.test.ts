import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS, DEFAULT_SETTINGS } from './storage';

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

describe('readList/writeList', () => {
  it('空のキーは空配列を返す', () => {
    expect(readList(STORAGE_KEYS.themes)).toEqual([]);
  });

  it('書いたものをそのまま読み返せる', () => {
    writeList(STORAGE_KEYS.themes, [{ id: 't1' }]);
    expect(readList(STORAGE_KEYS.themes)).toEqual([{ id: 't1' }]);
  });
});

describe('readSettings/writeSettings', () => {
  it('未設定なら既定値を返す', () => {
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('書いた設定をマージして読み返せる（部分更新でも既定値が消えない）', () => {
    writeSettings({ ...DEFAULT_SETTINGS, points: 34 });
    expect(readSettings().points).toBe(34);
    expect(readSettings().guardrailThreshold).toBe(DEFAULT_SETTINGS.guardrailThreshold);
  });
});
