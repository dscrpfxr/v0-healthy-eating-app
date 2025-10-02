import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardView } from "@/components/dashboard-view"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
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

  // Obtener registro de alimentos del día
  const hoy = new Date().toISOString().split("T")[0]
  const { data: registroHoy } = await supabase
    .from("registro_alimentos")
    .select("*")
    .eq("user_id", user.id)
    .eq("fecha", hoy)
    .order("created_at", { ascending: false })

  return <DashboardView user={user} profile={profile} metaActiva={metaActiva} registroHoy={registroHoy || []} />
}
