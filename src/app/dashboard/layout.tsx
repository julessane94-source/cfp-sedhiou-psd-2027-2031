import { ReactNode } from "react"
import Sidebar from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
