"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface RecipeDetailViewProps {
  receta: {
    id: string
    nombre: string
    descripcion: string
    procedimiento: string
    tiempo_preparacion: number
    porciones: number
    receta_ingredientes: Array<{
      cantidad: number
      ingrediente: {
        nombre: string
        calorias: number
        proteinas: number
        carbohidratos: number
        grasas: number
      }
    }>
    receta_etiquetas: Array<{
      etiqueta: string
    }>
  }
  userId: string
  esFavorita: boolean
}

export function RecipeDetailView({ receta, userId, esFavorita: esFavoritaInicial }: RecipeDetailViewProps) {
  const [esFavorita, setEsFavorita] = useState(esFavoritaInicial)
  const router = useRouter()

  const nutrientesTotales = receta.receta_ingredientes.reduce(
    (acc, ri) => {
      const factor = ri.cantidad / 100
      return {
        calorias: acc.calorias + ri.ingrediente.calorias * factor,
        proteinas: acc.proteinas + ri.ingrediente.proteinas * factor,
        carbohidratos: acc.carbohidratos + ri.ingrediente.carbohidratos * factor,
        grasas: acc.grasas + ri.ingrediente.grasas * factor,
      }
    },
    { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
  )

  const nutrientesPorPorcion = {
    calorias: nutrientesTotales.calorias / receta.porciones,
    proteinas: nutrientesTotales.proteinas / receta.porciones,
    carbohidratos: nutrientesTotales.carbohidratos / receta.porciones,
    grasas: nutrientesTotales.grasas / receta.porciones,
  }

  const handleToggleFavorito = async () => {
    const supabase = createClient()

    if (esFavorita) {
      await supabase.from("recetas_favoritas").delete().eq("user_id", userId).eq("receta_id", receta.id)
      setEsFavorita(false)
    } else {
      await supabase.from("recetas_favoritas").insert({
        user_id: userId,
        receta_id: receta.id,
      })
      setEsFavorita(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/recetas">
            <Button variant="outline">← Volver a Recetas</Button>
          </Link>
          <button onClick={handleToggleFavorito}>
            <svg
              className={`h-8 w-8 ${esFavorita ? "fill-red-500 text-red-500" : "text-gray-400"}`}
              fill={esFavorita ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-3xl text-green-900">{receta.nombre}</CardTitle>
              <CardDescription className="text-base">{receta.descripcion}</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                {receta.receta_etiquetas.map((e) => (
                  <Badge key={e.etiqueta} variant="secondary">
                    {e.etiqueta.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-medium">Tiempo</p>
                    <p className="text-muted-foreground">{receta.tiempo_preparacion} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <p className="font-medium">Porciones</p>
                    <p className="text-muted-foreground">{receta.porciones}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Nutricional */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Información Nutricional</CardTitle>
              <CardDescription>Por porción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-sm text-green-700">Calorías</p>
                  <p className="text-2xl font-bold text-green-900">{Math.round(nutrientesPorPorcion.calorias)}</p>
                  <p className="text-xs text-green-700">kcal</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-sm text-blue-700">Proteínas</p>
                  <p className="text-2xl font-bold text-blue-900">{Math.round(nutrientesPorPorcion.proteinas)}</p>
                  <p className="text-xs text-blue-700">gramos</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4 text-center">
                  <p className="text-sm text-amber-700">Carbohidratos</p>
                  <p className="text-2xl font-bold text-amber-900">{Math.round(nutrientesPorPorcion.carbohidratos)}</p>
                  <p className="text-xs text-amber-700">gramos</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <p className="text-sm text-orange-700">Grasas</p>
                  <p className="text-2xl font-bold text-orange-900">{Math.round(nutrientesPorPorcion.grasas)}</p>
                  <p className="text-xs text-orange-700">gramos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Ingredientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {receta.receta_ingredientes.map((ri, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                      {index + 1}
                    </span>
                    <span>
                      {ri.cantidad}g de {ri.ingrediente.nombre}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Procedimiento */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Procedimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm leading-relaxed">{receta.procedimiento}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
