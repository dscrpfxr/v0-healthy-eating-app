import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ForumView } from "@/components/forum-view"

export default async function ForoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener temas del foro con información del autor
  const { data: temas } = await supabase
    .from("foro_temas")
    .select(
      `
      *,
      autor:profiles(nombre),
      respuestas:foro_respuestas(count)
    `,
    )
    .order("created_at", { ascending: false })

  return <ForumView user={user} temas={temas || []} />
}
