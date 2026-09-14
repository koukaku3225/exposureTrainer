export function ProgressBar({ percent, color = '#ff6f3c' }: { percent: number; color?: string }) {
  return (
    <div className="h-2.5 rounded-full bg-track overflow-hidden flex">
      <div className="rounded-full" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
