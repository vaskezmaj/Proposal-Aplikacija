import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { anthropic } from "@/lib/anthropic"

const SYSTEM_PROMPT = `You are a proposal writer. Return a JSON object with this exact shape — no markdown, no extra text, just raw JSON:

{"metadata":{"client_name":"string","project_name":"string","valid_until":"string"},"sections":[{"id":"cover","title":"Cover","content":"HTML"},{"id":"scope","title":"Scope of Work","content":"HTML"},{"id":"investment","title":"Investment","content":"HTML"},{"id":"terms","title":"Terms","content":"HTML"}]}

Use <p><strong><ul><li><h3> tags. Be concise but professional.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, client_name, client_email, amount, description, payment_terms } = await request.json()

  if (!title || !client_name || !amount || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const paymentTermsLabel: Record<string, string> = {
    net7: "Net 7 (due within 7 days)",
    net14: "Net 14 (due within 14 days)",
    net30: "Net 30 (due within 30 days)",
    net45: "Net 45 (due within 45 days)",
    net60: "Net 60 (due within 60 days)",
    due_on_receipt: "Due on receipt",
  }
  const paymentTermsText = paymentTermsLabel[payment_terms ?? "net30"] ?? "Net 30 (due within 30 days)"

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Project: ${title} | Client: ${client_name} | Amount: $${amount} | Terms: ${paymentTermsText} | Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} | Description: ${description}`
      }],
    })

    const rawContent = message.content[0].type === "text" ? message.content[0].text : ""
    const cleaned = rawContent.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
    const proposalContent = JSON.parse(cleaned)

    const { data: proposal, error } = await supabase
      .from("proposals")
      .insert({
        user_id: user.id,
        title,
        client_name,
        client_email,
        description,
        amount,
        content: {
          ...proposalContent,
          metadata: {
            ...proposalContent.metadata,
            payment_terms: payment_terms ?? "net30",
            payment_terms_label: paymentTermsText,
          },
        },
        status: "draft",
      })
      .select("id")
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to save: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ id: proposal.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
