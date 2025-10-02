import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { RecipeDetailView } from "@/components/recipe-detail-view"

export default async function RecetaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: receta } = await supabase
    .from("recetas")
    .select(
      `
      *,
      receta_ingredientes (
        cantidad,
        ingrediente:ingredientes (
          nombre,
          calorias,
          proteinas,
          carbohidratos,
          grasas
        )
      ),
      receta_etiquetas (
        etiqueta
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!receta) {
    notFound()
  }

  // Verificar si es favorita
  const { data: favorita } = await supabase
    .from("recetas_favoritas")
    .select("id")
    .eq("user_id", user.id)
    .eq("receta_id", id)
    .single()

  return <RecipeDetailView receta={receta} userId={user.id} esFavorita={!!favorita} />
}
