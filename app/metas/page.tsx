import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GoalsView } from "@/components/goals-view"

export default async function MetasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Obtener meta activa
  const { data: metaActiva } = await supabase
    .from("metas_salud")
    .select("*")
    .eq("user_id", user.id)
    .eq("activa", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Obtener progreso
  const { data: progreso } = await supabase
    .from("progreso_salud")
    .select("*")
    .eq("user_id", user.id)
    .order("fecha", { ascending: false })
    .limit(30)

  return <GoalsView user={user} profile={profile} metaActiva={metaActiva} progreso={progreso || []} />
}
