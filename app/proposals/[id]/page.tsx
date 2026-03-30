"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProposalEditor } from "@/components/ProposalEditor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Eye, Save, Check } from "lucide-react"
import Link from "next/link"

interface Section {
  id: string
  title: string
  content: string
}

interface Proposal {
  id: string
  title: string
  client_name: string
  client_email: string
  amount: number
  status: string
  content: {
    metadata: Record<string, string>
    sections: Section[]
  }
}

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then(r => r.json())
      .then(data => {
        setProposal(data)
        setSections(data.content?.sections ?? [])
        setLoading(false)
      })
      .catch(() => router.push("/dashboard"))
  }, [id, router])

  const updateSection = useCallback((sectionId: string, html: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content: html } : s))
    setSaved(false)
  }, [])

  async function save() {
    if (!proposal) return
    setSaving(true)
    const updatedContent = { ...proposal.content, sections }
    await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: updatedContent }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function sendToClient() {
    if (!proposal) return
    setSending(true)

    // Save first
    const updatedContent = { ...proposal.content, sections }
    await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: updatedContent, status: "sent" }),
    })

    const url = `${window.location.origin}/p/${id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setSending(false)
    setProposal(p => p ? { ...p, status: "sent" } : p)
    setTimeout(() => setCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f3ff" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 text-white" style={{ backgroundColor: "#0D1B3E" }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-white text-sm">{proposal.title}</h1>
                <Badge variant={proposal.status as "draft" | "sent" | "signed" | "paid"}>
                  {proposal.status}
                </Badge>
              </div>
              <p className="text-xs text-blue-200">{proposal.client_name} · ${Number(proposal.amount).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/p/${id}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Preview
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={save} disabled={saving}>
              {saved ? (
                <><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />Saved</>
              ) : (
                <><Save className="w-3.5 h-3.5 mr-1.5" />{saving ? "Saving..." : "Save"}</>
              )}
            </Button>
            {proposal.status === "draft" ? (
              <Button size="sm" onClick={sendToClient} disabled={sending}>
                {sending ? (
                  "Sending..."
                ) : copied ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5" />Link copied!</>
                ) : (
                  <><Send className="w-3.5 h-3.5 mr-1.5" />Send to Client</>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/p/${id}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" />Copied!</> : "Copy Link"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {copied && proposal.status !== "draft" && (
          <div className="rounded-xl p-4 text-sm text-center text-white font-medium" style={{ backgroundColor: "#2B3DE8" }}>
            Client link copied to clipboard — share it with your client.
          </div>
        )}
        {copied && proposal.status === "draft" && (
          <div className="rounded-xl p-4 text-sm text-center text-white font-medium" style={{ backgroundColor: "#2B3DE8" }}>
            Proposal sent! Client link copied to clipboard — share it with {proposal.client_name}.
          </div>
        )}

        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #dde3ff" }}>
            <div className="px-6 py-4 border-b" style={{ backgroundColor: "#f0f3ff", borderColor: "#dde3ff" }}>
              <h2 className="font-semibold" style={{ color: "#0D1B3E" }}>{section.title}</h2>
            </div>
            <ProposalEditor
              content={section.content}
              onChange={html => updateSection(section.id, html)}
              placeholder={`Write ${section.title.toLowerCase()} content...`}
            />
          </div>
        ))}
      </main>
    </div>
  )
}
