import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { TopicDetailView } from "@/components/topic-detail-view"

export default async function TemaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "nuevo") {
    redirect("/foro/nuevo")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  // Obtener tema
  const { data: tema } = await supabase
    .from("foro_temas")
    .select(
      `
      *,
      autor:profiles(nombre)
    `,
    )
    .eq("id", id)
    .single()

  if (!tema) {
    notFound()
  }

  // Obtener respuestas
  const { data: respuestas } = await supabase
    .from("foro_respuestas")
    .select(
      `
      *,
      autor:profiles(nombre)
    `,
    )
    .eq("tema_id", id)
    .order("created_at", { ascending: true })

  return <TopicDetailView tema={tema} respuestas={respuestas || []} userId={user.id} />
}
