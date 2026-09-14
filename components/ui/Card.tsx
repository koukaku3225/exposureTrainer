export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-[18px] p-4 shadow-[0_2px_10px_rgba(58,42,23,0.05)] flex flex-col gap-2.5 ${className}`}
    >
      {children}
    </div>
  );
}
