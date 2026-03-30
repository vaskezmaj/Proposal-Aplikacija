export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText, LogOut } from "lucide-react"
import { formatDistanceToNow } from "@/lib/date"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, client_name, amount, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f3ff" }}>
      {/* Header */}
      <header style={{ backgroundColor: "var(--otvori-navy)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl text-white" style={{ fontFamily: "var(--font-jakarta)" }}>
              Otvori <span className="font-extrabold" style={{ color: "#7DF9FF" }}>LLC</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-200">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="sm" type="submit" className="text-white hover:bg-white/10">
                <LogOut className="w-4 h-4 mr-1" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
            <p className="text-slate-500 text-sm mt-1">
              {proposals?.length ?? 0} proposal{proposals?.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <Link href="/proposals/new">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </Link>
        </div>

        {/* Proposals list */}
        {!proposals || proposals.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl" style={{ border: "1px solid #dde3ff" }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No proposals yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Create your first AI-generated proposal and close your next deal.
            </p>
            <Link href="/proposals/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create your first proposal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #dde3ff" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #dde3ff", backgroundColor: "#f0f3ff" }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#2B3DE8" }}>Proposal</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#2B3DE8" }}>Client</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#2B3DE8" }}>Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#2B3DE8" }}>Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#2B3DE8" }}>Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody style={{ borderTop: "none" }}>
                {proposals.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-blue-50/40" style={{ borderBottom: "1px solid #f0f3ff" }}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{p.title}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{p.client_name || "—"}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm font-medium">
                      ${Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status as "draft" | "sent" | "signed" | "paid"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(p.created_at))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/proposals/${p.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
