"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface Ingrediente {
  id: string
  nombre: string
  calorias: number
  proteinas: number
  carbohidratos: number
  grasas: number
}

interface CreateRecipeFormProps {
  userId: string
  ingredientes: Ingrediente[]
}

interface IngredienteReceta {
  ingrediente: Ingrediente
  cantidad: number
}

export function CreateRecipeForm({ userId, ingredientes }: CreateRecipeFormProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [procedimiento, setProcedimiento] = useState("")
  const [tiempoPreparacion, setTiempoPreparacion] = useState("")
  const [porciones, setPorciones] = useState("1")
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteReceta[]>([])
  const [busquedaIngrediente, setBusquedaIngrediente] = useState("")
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [esPublica, setEsPublica] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const etiquetasDisponibles = [
    "vegetariana",
    "vegana",
    "sin_gluten",
    "baja_en_calorias",
    "alta_en_proteinas",
    "cetogenica",
    "paleo",
    "pescetariana",
  ]

  const ingredientesFiltrados = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(busquedaIngrediente.toLowerCase()),
  )

  const agregarIngrediente = (ingrediente: Ingrediente) => {
    if (!ingredientesSeleccionados.find((i) => i.ingrediente.id === ingrediente.id)) {
      setIngredientesSeleccionados([...ingredientesSeleccionados, { ingrediente, cantidad: 100 }])
    }
    setBusquedaIngrediente("")
  }

  const actualizarCantidad = (ingredienteId: string, cantidad: number) => {
    setIngredientesSeleccionados(
      ingredientesSeleccionados.map((i) => (i.ingrediente.id === ingredienteId ? { ...i, cantidad } : i)),
    )
  }

  const eliminarIngrediente = (ingredienteId: string) => {
    setIngredientesSeleccionados(ingredientesSeleccionados.filter((i) => i.ingrediente.id !== ingredienteId))
  }

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetas(etiquetas.includes(etiqueta) ? etiquetas.filter((e) => e !== etiqueta) : [...etiquetas, etiqueta])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ingredientesSeleccionados.length === 0) {
      setError("Debes agregar al menos un ingrediente")
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Crear receta
      const { data: receta, error: errorReceta } = await supabase
        .from("recetas")
        .insert({
          nombre,
          descripcion,
          procedimiento,
          tiempo_preparacion: Number.parseInt(tiempoPreparacion),
          porciones: Number.parseInt(porciones),
          created_by: userId,
          es_publica: esPublica,
        })
        .select()
        .single()

      if (errorReceta) throw errorReceta

      // Agregar ingredientes
      const ingredientesData = ingredientesSeleccionados.map((i) => ({
        receta_id: receta.id,
        ingrediente_id: i.ingrediente.id,
        cantidad: i.cantidad,
      }))

      const { error: errorIngredientes } = await supabase.from("receta_ingredientes").insert(ingredientesData)

      if (errorIngredientes) throw errorIngredientes

      // Agregar etiquetas
      if (etiquetas.length > 0) {
        const etiquetasData = etiquetas.map((etiqueta) => ({
          receta_id: receta.id,
          etiqueta,
        }))

        const { error: errorEtiquetas } = await supabase.from("receta_etiquetas").insert(etiquetasData)

        if (errorEtiquetas) throw errorEtiquetas
      }

      router.push(`/recetas/${receta.id}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear la receta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Crear Nueva Receta</h1>
          <p className="text-muted-foreground">Comparte tu receta saludable con la comunidad</p>
        </div>
        <Link href="/recetas">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Información Básica */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre de la Receta *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej: Ensalada César Saludable"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve descripción de tu receta..."
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tiempo">Tiempo de Preparación (min) *</Label>
                  <Input
                    id="tiempo"
                    type="number"
                    min="1"
                    value={tiempoPreparacion}
                    onChange={(e) => setTiempoPreparacion(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="porciones">Porciones *</Label>
                  <Input
                    id="porciones"
                    type="number"
                    min="1"
                    value={porciones}
                    onChange={(e) => setPorciones(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Ingredientes *</CardTitle>
              <CardDescription>Busca y agrega los ingredientes necesarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Buscar ingrediente..."
                  value={busquedaIngrediente}
                  onChange={(e) => setBusquedaIngrediente(e.target.value)}
                />
                {busquedaIngrediente && ingredientesFiltrados.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
                    {ingredientesFiltrados.slice(0, 10).map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => agregarIngrediente(ing)}
                        className="w-full p-3 text-left hover:bg-green-50"
                      >
                        <p className="font-medium">{ing.nombre}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(ing.calorias)} kcal/100g</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {ingredientesSeleccionados.length > 0 && (
                <div className="space-y-2">
                  {ingredientesSeleccionados.map((item) => (
                    <div key={item.ingrediente.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="font-medium">{item.ingrediente.nombre}</p>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.ingrediente.id, Number.parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">g</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarIngrediente(item.ingrediente.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Procedimiento */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Procedimiento *</CardTitle>
              <CardDescription>Describe paso a paso cómo preparar la receta</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                required
                placeholder="1. Lavar y cortar los vegetales...&#10;2. Calentar el aceite en una sartén...&#10;3. ..."
                rows={8}
              />
            </CardContent>
          </Card>

          {/* Etiquetas */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Etiquetas</CardTitle>
              <CardDescription>Selecciona las categorías que aplican a tu receta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {etiquetasDisponibles.map((etiqueta) => (
                  <label
                    key={etiqueta}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-green-50"
                  >
                    <Checkbox checked={etiquetas.includes(etiqueta)} onCheckedChange={() => toggleEtiqueta(etiqueta)} />
                    <span className="text-sm capitalize">{etiqueta.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibilidad */}
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox checked={esPublica} onCheckedChange={(checked) => setEsPublica(!!checked)} />
                <div>
                  <p className="font-medium">Hacer pública esta receta</p>
                  <p className="text-sm text-muted-foreground">Otros usuarios podrán ver y usar tu receta</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isLoading}>
            {isLoading ? "Creando Receta..." : "Crear Receta"}
          </Button>
        </div>
      </form>
    </div>
  )
}
