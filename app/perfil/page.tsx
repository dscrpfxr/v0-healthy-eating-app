import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileView } from "@/components/profile-view"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: ingredientes } = await supabase.from("ingredientes").select("id, nombre").order("nombre")

  const { data: intoleranciasData } = await supabase
    .from("intolerancias")
    .select("ingrediente_id")
    .eq("user_id", user.id)

  const intolerancias = intoleranciasData?.map((i) => i.ingrediente_id) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ProfileView user={user} profile={profile} ingredientes={ingredientes || []} intolerancias={intolerancias} />
    </div>
  )
}
