"use client"

import { useEffect, useState } from "react"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Lock } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
  open: boolean
  proposalId: string
  proposalTitle: string
  amount: number
  onPaid: () => void
}

export function PaymentModal({ open, proposalId, proposalTitle, amount, onPaid }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || clientSecret) return
    setLoading(true)
    fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setClientSecret(data.clientSecret)
        }
        setLoading(false)
      })
  }, [open, proposalId, clientSecret])

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription>
            {proposalTitle} · <strong>${amount.toLocaleString()}</strong>
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="text-red-600 text-sm py-6 text-center">{error}</p>
        ) : loading || !clientSecret ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0f172a",
                  borderRadius: "8px",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                },
              },
            }}
          >
            <CheckoutForm amount={amount} onPaid={onPaid} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CheckoutForm({ amount, onPaid }: { amount: number; onPaid: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError("")

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Payment failed")
      setSubmitting(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed")
      setSubmitting(false)
    } else {
      onPaid()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting || !stripe}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {submitting ? (
          "Processing..."
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ${amount.toLocaleString()} Securely
          </>
        )}
      </Button>

      <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secured by Stripe · SSL encrypted
      </p>
    </form>
  )
}
