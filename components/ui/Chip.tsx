const TONES = {
  coral: 'bg-[#ffe9db] text-coral-dark',
  good: 'bg-[#fff3de] text-amber-dark',
  dim: 'bg-[#f5ece1] text-dim',
} as const;

export function Chip({
  children,
  tone = 'coral',
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-extrabold ${TONES[tone]}`}>
      {children}
    </div>
  );
}
