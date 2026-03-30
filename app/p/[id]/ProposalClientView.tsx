"use client"

import { useState, useEffect } from "react"
import { SignatureModal } from "@/components/SignatureModal"
import { PaymentModal } from "@/components/PaymentModal"
import { SuccessScreen } from "@/components/SuccessScreen"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, PenLine } from "lucide-react"

interface Proposal {
  id: string
  title: string
  client_name: string
  client_email: string
  amount: number
  status: string
  signer_name: string | null
  content: {
    metadata: Record<string, string>
    sections: Array<{ id: string; title: string; content: string }>
  }
}

export function ProposalClientView({ proposal }: { proposal: Proposal }) {
  const [showSignature, setShowSignature] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [signerName, setSignerName] = useState(proposal.signer_name ?? "")
  const [status, setStatus] = useState(proposal.status)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function handleSigned(name?: string) {
    if (name) setSignerName(name)
    setShowSignature(false)
    setStatus("signed")
    setTimeout(() => setShowPayment(true), 400)
  }

  function handlePaid() {
    setShowPayment(false)
    setStatus("paid")
    setShowSuccess(true)
  }

  const sections = proposal.content?.sections ?? []
  const meta = proposal.content?.metadata ?? {}
  const alreadyPaid = status === "paid"
  const alreadySigned = status === "signed" || alreadyPaid

  return (
    <div className="min-h-screen bg-white relative">

      {/* Watermark — client only to avoid hydration mismatch */}
      {mounted && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="select-none"
            style={{
              width: "clamp(400px, 60vw, 800px)",
              opacity: 0.16,
              transform: "rotate(0deg)",
              filter: "grayscale(100%)",
            }}
          />
        </div>
      )}

      {/* Header bar */}
      <header className="text-white" style={{ backgroundColor: "#0D1B3E" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-jakarta)" }}>
              Otvori <span className="font-extrabold" style={{ color: "#7DF9FF" }}>LLC</span>
            </span>
          </div>
          <div className="text-sm text-slate-400">
            {meta.valid_until && `Valid until ${meta.valid_until}`}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative z-10 text-white" style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #162050 60%, #2B3DE8 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-3">Proposal for</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{proposal.title}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold">
                {proposal.client_name?.[0]?.toUpperCase() ?? "C"}
              </div>
              <span>{proposal.client_name}</span>
            </div>
            <div className="text-slate-500">·</div>
            <div className="text-2xl font-bold" style={{ color: "#7DF9FF" }}>
              ${Number(proposal.amount).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Proposal sections */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {sections.map((section, i) => (
            <section key={section.id}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: "#2B3DE8" }}>
                  {i + 1}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div
                className="proposal-content text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </section>
          ))}
        </div>

        {/* Signature area */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          {alreadyPaid ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Proposal Accepted & Paid</h3>
              <p className="text-slate-500">
                Signed by <strong>{signerName}</strong>. Thank you for your business!
              </p>
            </div>
          ) : alreadySigned ? (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <PenLine className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Proposal Signed</h3>
              <p className="text-slate-500 mb-6">
                Signed by <strong>{signerName}</strong>. Complete your payment to finalize.
              </p>
              <Button
                size="lg"
                onClick={() => setShowPayment(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Complete Payment · ${Number(proposal.amount).toLocaleString()}
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to move forward?</h3>
              <p className="text-slate-500 mb-6 max-w-lg">
                By signing this proposal you agree to the terms outlined above. You&apos;ll be prompted
                to complete payment after signing.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  size="xl"
                  onClick={() => setShowSignature(true)}
                  style={{ backgroundColor: "#2B3DE8" }}
                  className="hover:opacity-90"
                >
                  <PenLine className="w-5 h-5 mr-2" />
                  Sign & Accept Proposal
                </Button>
                <p className="text-sm text-slate-400">
                  Takes less than 30 seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400">
          <span style={{ fontFamily: "var(--font-jakarta)" }}>Otvori <strong style={{ color: "#2B3DE8" }}>LLC</strong></span>
          {meta.valid_until && <span>This proposal expires {meta.valid_until}</span>}
        </div>
      </footer>

      {/* Sticky CTA (visible when not signed) */}
      {!alreadySigned && !alreadyPaid && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{proposal.title}</p>
              <p className="text-sm text-slate-500">${Number(proposal.amount).toLocaleString()} · {proposal.client_name}</p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowSignature(true)}
              className="shrink-0 hover:opacity-90"
              style={{ backgroundColor: "#2B3DE8" }}
            >
              <PenLine className="w-4 h-4 mr-2" />
              Accept & Sign
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SignatureModal
        open={showSignature}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        onSigned={() => handleSigned()}
      />

      <PaymentModal
        open={showPayment}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        amount={Number(proposal.amount)}
        onPaid={handlePaid}
      />

      {showSuccess && (
        <SuccessScreen
          signerName={signerName || proposal.client_name}
          proposalTitle={proposal.title}
        />
      )}
    </div>
  )
}
