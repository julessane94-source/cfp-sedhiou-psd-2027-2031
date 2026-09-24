"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  Building2,
  UserCog,
  Handshake,
  Megaphone,
  FileText,
  ClipboardList,
  Target,
  BarChart3,
  Settings
} from "lucide-react"

const navigation = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["PSD 2027–2031", "/dashboard/psd", Target],
  ["Formations", "/formations", GraduationCap],
  ["Apprenants", "/apprenants", Users],
  ["Stages", "/stages", BriefcaseBusiness],
  ["Insertion", "/insertion", ClipboardList],
  ["Entrepreneuriat", "/entrepreneuriat", BarChart3],
  ["Infrastructures", "/infrastructures", Building2],
  ["Personnel", "/personnel", UserCog],
  ["Partenariats", "/partenariats", Handshake],
  ["Communication", "/communication", Megaphone],
  ["Documents", "/documents", FileText]
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden min-h-screen w-72 border-r bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b px-6 py-5">
          <div className="text-xl font-bold text-slate-900">
            CFP Sédhiou
          </div>
          <div className="mt-1 text-xs text-slate-500">
            PSD 2027–2031
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          <div className="space-y-1">
            {navigation.map(([label, href, Icon]) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`)

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t p-4">
          <Link
            href="/dashboard/utilisateurs"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Settings size={18} />
            Administration
          </Link>
        </div>
      </div>
    </aside>
  )
}
