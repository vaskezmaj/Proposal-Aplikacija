export const dynamic = "force-dynamic"

import { createServiceClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProposalClientView } from "./ProposalClientView"

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

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from("proposals")
    .select("id, title, client_name, client_email, amount, status, signer_name, content")
    .eq("id", id)
    .in("status", ["sent", "signed", "paid"])
    .single()

  if (!data) notFound()

  return <ProposalClientView proposal={data as Proposal} />
}
