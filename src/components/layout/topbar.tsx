import { Bell, Search } from "lucide-react"

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="relative hidden w-full max-w-md md:block">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Rechercher..."
          className="w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-xl p-2.5 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">Administrateur</div>
            <div className="text-xs text-slate-500">Direction</div>
          </div>
        </div>
      </div>
    </header>
  )
}
