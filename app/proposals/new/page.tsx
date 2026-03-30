"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NewProposalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    client_name: "",
    client_email: "",
    amount: "",
    payment_terms: "net30",
    description: "",
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          client_name: form.client_name,
          client_email: form.client_email,
          amount: parseFloat(form.amount),
          payment_terms: form.payment_terms,
          description: form.description,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate proposal")

      router.push(`/proposals/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f3ff" }}>
      <header className="text-white" style={{ backgroundColor: "#0D1B3E" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <span className="font-semibold text-white" style={{ fontFamily: "var(--font-jakarta)" }}>
            Otvori <span className="font-extrabold" style={{ color: "#7DF9FF" }}>LLC</span>
          </span>
          <span className="text-blue-300 text-sm">/ New Proposal</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid #dde3ff" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8ecff" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#2B3DE8" }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "#0D1B3E" }}>AI Proposal Generator</h2>
              <p className="text-xs text-slate-500">Claude Opus will write your full proposal in seconds</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                placeholder="e.g. Brand Identity & Website Design for Acme Co."
                value={form.title}
                onChange={e => update("title", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  placeholder="Jane Smith"
                  value={form.client_name}
                  onChange={e => update("client_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="jane@acme.com"
                  value={form.client_email}
                  onChange={e => update("client_email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Project Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={e => update("amount", e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment_terms">Payment Terms (Invoice Due Date)</Label>
              <select
                id="payment_terms"
                value={form.payment_terms}
                onChange={e => update("payment_terms", e.target.value)}
                className="w-full rounded-md bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ border: "1px solid #dde3ff", color: "#0D1B3E", "--tw-ring-color": "#2B3DE8" } as React.CSSProperties}
              >
                <option value="net7">Net 7 — due in 7 days</option>
                <option value="net14">Net 14 — due in 14 days</option>
                <option value="net30">Net 30 — due in 30 days</option>
                <option value="net45">Net 45 — due in 45 days</option>
                <option value="net60">Net 60 — due in 60 days</option>
                <option value="due_on_receipt">Due on receipt</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project scope, goals, and deliverables in 1–3 paragraphs. The more detail you give, the better the AI-generated proposal will be."
                value={form.description}
                onChange={e => update("description", e.target.value)}
                className="min-h-[160px] resize-none"
                required
              />
              <p className="text-xs text-slate-400">
                Claude Opus 4.6 will use this to generate a complete professional proposal with executive summary, scope, timeline, investment, and terms.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full hover:opacity-90"
              style={{ backgroundColor: "#2B3DE8" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating your proposal with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Proposal with AI
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
