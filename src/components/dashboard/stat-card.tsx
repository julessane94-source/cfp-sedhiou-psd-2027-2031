import { ReactNode } from "react"

export function StatCard({
  title,
  value,
  description,
  icon
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-3">{icon}</div>
      </div>

      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  )
}
