import type { Theme } from './types';

export function setThemeHidden(themes: Theme[], id: string, hidden: boolean, now: string): Theme[] {
  return themes.map((t) => (t.id === id ? { ...t, hidden, updatedAt: now } : t));
}

export function splitByVisibility(themes: Theme[]): { visible: Theme[]; hidden: Theme[] } {
  return {
    visible: themes.filter((t) => !t.hidden),
    hidden: themes.filter((t) => t.hidden),
  };
}
