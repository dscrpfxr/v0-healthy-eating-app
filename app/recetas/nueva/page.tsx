import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreateRecipeForm } from "@/components/create-recipe-form"

export default async function NuevaRecetaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener ingredientes disponibles
  const { data: ingredientes } = await supabase
    .from("ingredientes")
    .select("*")
    .or(`es_publico.eq.true,created_by.eq.${user.id}`)
    .order("nombre")

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-4xl p-6">
        <CreateRecipeForm userId={user.id} ingredientes={ingredientes || []} />
      </div>
    </div>
  )
}
