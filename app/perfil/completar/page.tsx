import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompleteProfileForm } from "@/components/complete-profile-form"

export default async function CompleteProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar si el perfil ya está completo
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Si ya tiene peso y altura, redirigir al dashboard
  if (profile?.peso && profile?.altura) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
      <div className="w-full max-w-2xl">
        <CompleteProfileForm userId={user.id} currentProfile={profile} />
      </div>
    </div>
  )
}
