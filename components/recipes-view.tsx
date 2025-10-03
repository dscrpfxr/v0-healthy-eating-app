"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Receta {
  id: string
  nombre: string
  descripcion: string
  tiempo_preparacion: number
  porciones: number
  imagen_url: string | null
  created_by: string
  receta_ingredientes: Array<{
    cantidad: number
    ingrediente: {
      id: string
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

interface RecipesViewProps {
  userId: string
  recetas: Receta[]
  tiposDieta: string[]
  recetasFavoritasIds: string[]
}

export function RecipesView({ userId, recetas, tiposDieta, recetasFavoritasIds }: RecipesViewProps) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | null>(null)
  const router = useRouter()

  const calcularNutrientes = (receta: Receta) => {
    return receta.receta_ingredientes.reduce(
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
  }

  const recetasFiltradas = recetas.filter((receta) => {
    const coincideBusqueda = !busqueda || receta.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEtiqueta = !filtroEtiqueta || receta.receta_etiquetas.some((e) => e.etiqueta === filtroEtiqueta)
    return coincideBusqueda && coincideEtiqueta
  })

  const recetasRecomendadas = recetasFiltradas.filter((receta) => {
    if (!tiposDieta || tiposDieta.length === 0) return true
    // Recipe matches if it has at least one tag that matches any of the user's diet types
    return receta.receta_etiquetas.some((e) => tiposDieta.includes(e.etiqueta))
  })

  const etiquetasUnicas = Array.from(new Set(recetas.flatMap((r) => r.receta_etiquetas.map((e) => e.etiqueta))))

  const handleToggleFavorito = async (recetaId: string, esFavorita: boolean) => {
    const supabase = createClient()

    if (esFavorita) {
      await supabase.from("recetas_favoritas").delete().eq("user_id", userId).eq("receta_id", recetaId)
    } else {
      await supabase.from("recetas_favoritas").insert({
        user_id: userId,
        receta_id: recetaId,
      })
    }

    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Recetas</h1>
            <p className="text-muted-foreground">Descubre recetas personalizadas según tus preferencias</p>
          </div>
          <div className="flex gap-3">
            <Link href="/recetas/nueva">
              <Button className="bg-green-600 hover:bg-green-700">Crear Receta</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <Card className="mb-6 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input placeholder="Buscar recetas..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filtroEtiqueta === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEtiqueta(null)}
                  className={filtroEtiqueta === null ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Todas
                </Button>
                {etiquetasUnicas.map((etiqueta) => (
                  <Button
                    key={etiqueta}
                    variant={filtroEtiqueta === etiqueta ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroEtiqueta(etiqueta)}
                    className={filtroEtiqueta === etiqueta ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {etiqueta.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recetas Recomendadas */}
        {recetasRecomendadas.length > 0 && !busqueda && !filtroEtiqueta && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-green-900">Recomendadas para ti</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recetasRecomendadas.slice(0, 6).map((receta) => {
                const nutrientes = calcularNutrientes(receta)
                const esFavorita = recetasFavoritasIds.includes(receta.id)
                return (
                  <Card key={receta.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-green-900">{receta.nombre}</CardTitle>
                          <CardDescription className="line-clamp-2">{receta.descripcion}</CardDescription>
                        </div>
                        <button onClick={() => handleToggleFavorito(receta.id, esFavorita)} className="ml-2">
                          <svg
                            className={`h-6 w-6 ${esFavorita ? "fill-red-500 text-red-500" : "text-gray-400"}`}
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {receta.receta_etiquetas.slice(0, 3).map((e) => (
                            <Badge key={e.etiqueta} variant="secondary" className="text-xs">
                              {e.etiqueta.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>⏱️ {receta.tiempo_preparacion} min</span>
                          <span>🍽️ {receta.porciones} porciones</span>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-sm font-medium text-green-900">
                            {Math.round(nutrientes.calorias / receta.porciones)} kcal/porción
                          </p>
                          <p className="text-xs text-green-700">
                            P: {Math.round(nutrientes.proteinas / receta.porciones)}g • C:{" "}
                            {Math.round(nutrientes.carbohidratos / receta.porciones)}g • G:{" "}
                            {Math.round(nutrientes.grasas / receta.porciones)}g
                          </p>
                        </div>
                        <Link href={`/recetas/${receta.id}`}>
                          <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                            Ver Receta
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Todas las Recetas */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-green-900">
            {busqueda || filtroEtiqueta ? "Resultados" : "Todas las Recetas"}
          </h2>
          {recetasFiltradas.length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No se encontraron recetas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recetasFiltradas.map((receta) => {
                const nutrientes = calcularNutrientes(receta)
                const esFavorita = recetasFavoritasIds.includes(receta.id)
                return (
                  <Card key={receta.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-green-900">{receta.nombre}</CardTitle>
                          <CardDescription className="line-clamp-2">{receta.descripcion}</CardDescription>
                        </div>
                        <button onClick={() => handleToggleFavorito(receta.id, esFavorita)} className="ml-2">
                          <svg
                            className={`h-6 w-6 ${esFavorita ? "fill-red-500 text-red-500" : "text-gray-400"}`}
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {receta.receta_etiquetas.slice(0, 3).map((e) => (
                            <Badge key={e.etiqueta} variant="secondary" className="text-xs">
                              {e.etiqueta.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>⏱️ {receta.tiempo_preparacion} min</span>
                          <span>🍽️ {receta.porciones} porciones</span>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-sm font-medium text-green-900">
                            {Math.round(nutrientes.calorias / receta.porciones)} kcal/porción
                          </p>
                          <p className="text-xs text-green-700">
                            P: {Math.round(nutrientes.proteinas / receta.porciones)}g • C:{" "}
                            {Math.round(nutrientes.carbohidratos / receta.porciones)}g • G:{" "}
                            {Math.round(nutrientes.grasas / receta.porciones)}g
                          </p>
                        </div>
                        <Link href={`/recetas/${receta.id}`}>
                          <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                            Ver Receta
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
