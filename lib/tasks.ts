import type { Stage } from './types';

export const MAX_TASKS_PER_STAGE = 3;

// 段の tasks を常に3枠にそろえる（足りない分は空文字で埋める）。
export function padTasks(tasks: string[]): string[] {
  const padded = [...tasks];
  while (padded.length < MAX_TASKS_PER_STAGE) padded.push('');
  return padded.slice(0, MAX_TASKS_PER_STAGE);
}

// 実践のときに選べる課題を返す。空欄は除く。
// tasks が1件も入っていない（古いデータなど）場合は stage.name にフォールバックする。
export function getTaskOptions(stage: Stage): string[] {
  const filled = (stage.tasks ?? []).map((t) => t.trim()).filter((t) => t.length > 0);
  return filled.length > 0 ? filled : [stage.name];
}
