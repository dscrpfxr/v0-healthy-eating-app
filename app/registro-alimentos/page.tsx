import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FoodLogForm } from "@/components/food-log-form"

export default async function RegistroAlimentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-4xl p-6">
        <FoodLogForm userId={user.id} />
      </div>
    </div>
  )
}
