import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { anthropic } from "@/lib/anthropic"

const SYSTEM_PROMPT = `You are an expert agency proposal writer with 15+ years of experience winning high-value client contracts. Your proposals are known for being clear, persuasive, and professionally formatted.

You will be given details about a project and you must return a complete proposal as a JSON object with exactly this shape:

{
  "metadata": {
    "client_name": "string",
    "project_name": "string",
    "valid_until": "string (date 30 days from today formatted as Month DD, YYYY)"
  },
  "sections": [
    { "id": "cover", "title": "Cover", "content": "HTML string" },
    { "id": "executive_summary", "title": "Executive Summary", "content": "HTML string" },
    { "id": "scope", "title": "Scope of Work", "content": "HTML string" },
    { "id": "timeline", "title": "Timeline", "content": "HTML string" },
    { "id": "investment", "title": "Investment", "content": "HTML string" },
    { "id": "terms", "title": "Terms & Conditions", "content": "HTML string" }
  ]
}

Guidelines for each section:
- cover: A short compelling paragraph introducing the proposal, addressing the client by name. Express excitement about the project. Include the project name and a brief hook sentence.
- executive_summary: 2-3 paragraphs. Summarize the client's challenge/opportunity, your proposed solution, and the key outcomes they will achieve. Professional, confident tone.
- scope: Use <h3> tags for deliverable groups and <ul><li> for individual deliverables. Be specific about what is included. List 4-8 deliverable categories based on the project description.
- timeline: Use <h3> for phase names and <p> for phase descriptions. Break the project into 3-5 phases with realistic timeframes (e.g., "Phase 1 — Discovery & Strategy (Week 1-2)"). Include key milestones.
- investment: Start with a clear investment summary. Use a simple table-like layout with <div> tags showing the total. Include what is included in the investment. Mention payment terms (50% upfront, 50% on delivery). Show the exact dollar amount provided.
- terms: Professional standard agency terms. Cover: acceptance/signing, payment schedule, revision rounds (2 rounds included), IP transfer (upon full payment), confidentiality, project commencement, cancellation policy. Use <h3> and <p> tags. Keep each term concise.

ALL content must be valid HTML suitable for a rich text editor (Tiptap). Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags. Do NOT use markdown. Do NOT include \`\`\`json or any wrapper — return only the raw JSON object.`

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

  const userPrompt = `Please write a complete proposal for the following project:

Project Title: ${title}
Client Name: ${client_name}
Project Amount: $${amount.toLocaleString()}
Payment Terms: ${paymentTermsText}
Today's Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

Project Description:
${description}

Return only the JSON object as specified.`

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const rawContent = message.content[0].type === "text" ? message.content[0].text : ""

    // Strip any accidental markdown fences
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
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to save proposal" }, { status: 500 })
    }

    return NextResponse.json({ id: proposal.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Generation error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
