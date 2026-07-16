type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-400'
  const variants: Record<string, string> = {
    primary: 'bg-sky-500 text-white hover:bg-sky-400',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
    ghost: 'bg-transparent text-slate-200 hover:bg-slate-800',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
