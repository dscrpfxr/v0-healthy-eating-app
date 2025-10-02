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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <ProfileView user={user} profile={profile} />
    </div>
  )
}
