"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PenLine, RotateCcw } from "lucide-react"

interface SignatureModalProps {
  open: boolean
  proposalId: string
  proposalTitle: string
  onSigned: () => void
}

export function SignatureModal({ open, proposalId, proposalTitle, onSigned }: SignatureModalProps) {
  const sigRef = useRef<SignatureCanvas>(null)
  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"draw" | "type">("draw")
  const [typedSig, setTypedSig] = useState("")

  function clearSig() {
    sigRef.current?.clear()
  }

  async function handleSign() {
    if (!signerName.trim() || !signerEmail.trim()) {
      setError("Please enter your name and email.")
      return
    }

    let signatureData = ""
    if (tab === "draw") {
      if (sigRef.current?.isEmpty()) {
        setError("Please draw your signature.")
        return
      }
      signatureData = sigRef.current!.toDataURL("image/png")
    } else {
      if (!typedSig.trim()) {
        setError("Please type your signature.")
        return
      }
      // Render typed signature to canvas
      const canvas = document.createElement("canvas")
      canvas.width = 400
      canvas.height = 80
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = "italic 36px Georgia, serif"
      ctx.fillStyle = "#1e3a5f"
      ctx.fillText(typedSig, 20, 55)
      signatureData = canvas.toDataURL("image/png")
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/proposals/${proposalId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signer_name: signerName, signer_email: signerEmail, signature_data: signatureData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to sign")
      }

      onSigned()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-violet-600" />
            Sign & Accept Proposal
          </DialogTitle>
          <DialogDescription>
            By signing, you agree to the terms outlined in "{proposalTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sig-name">Your Full Name</Label>
              <Input
                id="sig-name"
                placeholder="Jane Smith"
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sig-email">Your Email</Label>
              <Input
                id="sig-email"
                type="email"
                placeholder="jane@company.com"
                value={signerEmail}
                onChange={e => setSignerEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-slate-200 p-1 gap-1">
            <button
              type="button"
              onClick={() => setTab("draw")}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "draw" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setTab("type")}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "type" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              Type
            </button>
          </div>

          {tab === "draw" ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#1e3a5f"
                  canvasProps={{ width: 460, height: 140, className: "w-full" }}
                  backgroundColor="rgba(248,250,252,1)"
                />
              </div>
              <button
                type="button"
                onClick={clearSig}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="typed-sig">Type your signature</Label>
              <input
                id="typed-sig"
                type="text"
                placeholder="Your full name"
                value={typedSig}
                onChange={e => setTypedSig(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-2xl italic font-serif text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <Button
            onClick={handleSign}
            disabled={submitting}
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? "Submitting..." : "Sign & Continue to Payment →"}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Your signature is legally binding. Timestamp and IP are recorded.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
