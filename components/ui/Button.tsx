type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
};

export function Button({ children, variant = 'primary', onClick, type = 'button' }: Props) {
  const base = 'h-[54px] rounded-[18px] flex items-center justify-center gap-2 text-[16px] font-extrabold w-full';
  const styleClass =
    variant === 'primary'
      ? 'bg-coral text-white shadow-[0_5px_0_#d84a1a]'
      : 'bg-white text-coral border-[1.5px] border-track';
  return (
    <button type={type} onClick={onClick} className={`${base} ${styleClass}`}>
      {children}
    </button>
  );
}
