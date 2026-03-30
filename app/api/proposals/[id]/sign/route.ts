import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { signer_name, signer_email, signature_data } = await request.json()

  if (!signer_name || !signer_email || !signature_data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Verify proposal exists and is in sent/draft status
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("id", id)
    .single()

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
  }

  if (proposal.status === "paid") {
    return NextResponse.json({ error: "Proposal already paid" }, { status: 400 })
  }

  const { error } = await supabase
    .from("proposals")
    .update({
      signer_name,
      signer_email,
      signature_data,
      signed_at: new Date().toISOString(),
      status: "signed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Sign error:", error)
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
