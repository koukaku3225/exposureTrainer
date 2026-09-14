export function AnxietyScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[13px] text-dim font-bold">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-grow h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
              n === value ? 'bg-coral text-white' : 'bg-[#fff0e2] text-[#d6a172]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
