'use client';
import { useCallback, useEffect, useState } from 'react';
import { readList, STORAGE_KEYS } from './storage';
import type { PracticeRecord, Theme } from './types';

export function useTheme(id: string) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  const refresh = useCallback(() => {
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    setTheme(themes.find((t) => t.id === id) ?? null);
    setRecords(readList<PracticeRecord>(STORAGE_KEYS.records).filter((r) => r.themeId === id));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { theme, records, refresh };
}
