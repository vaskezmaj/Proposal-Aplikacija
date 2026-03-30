"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { CheckCircle, Mail, Calendar } from "lucide-react"

interface SuccessScreenProps {
  signerName: string
  proposalTitle: string
}

export function SuccessScreen({ signerName, proposalTitle }: SuccessScreenProps) {
  useEffect(() => {
    // Initial big burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#2B3DE8", "#7DF9FF", "#0D1B3E", "#FFB3C8", "#ffffff"],
    })

    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#2B3DE8", "#7DF9FF", "#FFB3C8", "#ffffff"],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#2B3DE8", "#7DF9FF", "#FFB3C8", "#ffffff"],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    setTimeout(() => requestAnimationFrame(frame), 600)
  }, [])

  const firstName = signerName.split(" ")[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #162050 60%, #2B3DE8 100%)" }}>
      <div className="text-center max-w-lg px-8 py-12">

        {/* Brand */}
        <div className="mb-10">
          <span className="text-2xl text-white font-semibold" style={{ fontFamily: "var(--font-jakarta)" }}>
            Otvori <span className="font-extrabold" style={{ color: "#7DF9FF" }}>LLC</span>
          </span>
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 animate-bounce" style={{ backgroundColor: "rgba(125,249,255,0.15)", border: "2px solid rgba(125,249,255,0.4)" }}>
          <CheckCircle className="w-12 h-12" style={{ color: "#7DF9FF" }} />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>
          Thank You!
        </h1>
        <p className="text-xl font-medium mb-6" style={{ color: "#7DF9FF" }}>
          {firstName}, you&apos;re officially onboard.
        </p>

        {/* Proposal name */}
        <div className="bg-white/10 rounded-2xl px-6 py-4 mb-8 border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Proposal accepted & paid</p>
          <p className="text-white font-semibold text-lg">&ldquo;{proposalTitle}&rdquo;</p>
        </div>

        {/* Next steps */}
        <div className="space-y-3 text-left mb-10">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(125,249,255,0.15)" }}>
              <Mail className="w-3.5 h-3.5" style={{ color: "#7DF9FF" }} />
            </div>
            <p className="text-slate-300 text-sm">
              A payment receipt has been sent to your email address.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(125,249,255,0.15)" }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: "#7DF9FF" }} />
            </div>
            <p className="text-slate-300 text-sm">
              We&apos;ll reach out shortly to schedule a kickoff call and get things moving.
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          You can safely close this page.
        </p>
      </div>
    </div>
  )
}
