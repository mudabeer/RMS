type CardProps = { title?: string; description?: string; className?: string; children: React.ReactNode }

export function Card({ title, description, className = '', children }: CardProps) {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/40 ${className}`}>
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
