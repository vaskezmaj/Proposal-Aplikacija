import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { proposalId } = await request.json()

  if (!proposalId) {
    return NextResponse.json({ error: "Missing proposalId" }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, title, amount, client_email, client_name, status")
    .eq("id", proposalId)
    .single()

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
  }

  if (proposal.status === "paid") {
    return NextResponse.json({ error: "Already paid" }, { status: 400 })
  }

  const amountCents = Math.round(Number(proposal.amount) * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: {
      proposal_id: proposalId,
      client_name: proposal.client_name ?? "",
      client_email: proposal.client_email ?? "",
    },
    receipt_email: proposal.client_email ?? undefined,
    description: proposal.title,
  })

  // Store payment intent ID
  await supabase
    .from("proposals")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", proposalId)

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
