import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RecipesView } from "@/components/recipes-view"

export default async function RecetasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("tipos_dieta").eq("id", user.id).single()

  // Obtener intolerancias del usuario
  const { data: intolerancias } = await supabase.from("intolerancias").select("ingrediente_id").eq("user_id", user.id)

  const ingredientesIntolerantes = intolerancias?.map((i) => i.ingrediente_id) || []

  // Obtener recetas públicas y del usuario
  const { data: recetas } = await supabase
    .from("recetas")
    .select(
      `
      *,
      receta_ingredientes (
        cantidad,
        ingrediente:ingredientes (
          id,
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
    .or(`es_publica.eq.true,created_by.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Filtrar recetas que no contengan ingredientes intolerantes
  const recetasFiltradas =
    recetas?.filter((receta) => {
      const tieneIntolerancia = receta.receta_ingredientes?.some((ri: any) =>
        ingredientesIntolerantes.includes(ri.ingrediente.id),
      )
      return !tieneIntolerancia
    }) || []

  // Obtener recetas favoritas del usuario
  const { data: favoritas } = await supabase.from("recetas_favoritas").select("receta_id").eq("user_id", user.id)

  const recetasFavoritasIds = favoritas?.map((f) => f.receta_id) || []

  return (
    <RecipesView
      userId={user.id}
      recetas={recetasFiltradas}
      tiposDieta={profile?.tipos_dieta || []}
      recetasFavoritasIds={recetasFavoritasIds}
    />
  )
}
