"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface FoodLogFormProps {
  userId: string
}

interface SearchResult {
  id: string
  nombre: string
  calorias: number
  proteinas: number
  carbohidratos: number
  grasas: number
  categoria: string
  tipo: "ingrediente" | "receta"
}

export function FoodLogForm({ userId }: FoodLogFormProps) {
  const [busqueda, setBusqueda] = useState("")
  const [resultados, setResultados] = useState<SearchResult[]>([])
  const [seleccionado, setSeleccionado] = useState<SearchResult | null>(null)
  const [cantidad, setCantidad] = useState("100")
  const [momentoDia, setMomentoDia] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!busqueda.trim()) return

    setIsSearching(true)
    setError(null)
    const supabase = createClient()

    try {
      // Buscar en ingredientes
      const { data: ingredientes, error: errorIngredientes } = await supabase
        .from("ingredientes")
        .select("id, nombre, calorias, proteinas, carbohidratos, grasas, categoria")
        .or(`es_publico.eq.true,created_by.eq.${userId}`)
        .ilike("nombre", `%${busqueda}%`)
        .limit(10)

      if (errorIngredientes) throw errorIngredientes

      // Buscar en recetas
      const { data: recetas, error: errorRecetas } = await supabase
        .from("recetas")
        .select("id, nombre")
        .or(`es_publica.eq.true,created_by.eq.${userId}`)
        .ilike("nombre", `%${busqueda}%`)
        .limit(5)

      if (errorRecetas) throw errorRecetas

      // Combinar resultados
      const resultadosIngredientes: SearchResult[] =
        ingredientes?.map((ing) => ({
          ...ing,
          tipo: "ingrediente" as const,
        })) || []

      const resultadosRecetas: SearchResult[] =
        recetas?.map((rec) => ({
          id: rec.id,
          nombre: rec.nombre,
          calorias: 0,
          proteinas: 0,
          carbohidratos: 0,
          grasas: 0,
          categoria: "receta",
          tipo: "receta" as const,
        })) || []

      setResultados([...resultadosIngredientes, ...resultadosRecetas])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al buscar")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = async (resultado: SearchResult) => {
    if (resultado.tipo === "receta") {
      // Si es receta, obtener información nutricional completa
      const supabase = createClient()
      const { data: receta } = await supabase
        .from("recetas")
        .select(
          `
          *,
          receta_ingredientes (
            cantidad,
            ingrediente:ingredientes (
              calorias,
              proteinas,
              carbohidratos,
              grasas
            )
          )
        `,
        )
        .eq("id", resultado.id)
        .single()

      if (receta && receta.receta_ingredientes) {
        // Calcular totales nutricionales de la receta
        const totales = receta.receta_ingredientes.reduce(
          (acc: any, ri: any) => {
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

        setSeleccionado({
          ...resultado,
          ...totales,
        })
      }
    } else {
      setSeleccionado(resultado)
    }
    setResultados([])
    setBusqueda("")
  }

  const calcularNutrientes = () => {
    if (!seleccionado) return null

    const factor = Number.parseFloat(cantidad) / 100
    return {
      calorias: seleccionado.calorias * factor,
      proteinas: seleccionado.proteinas * factor,
      carbohidratos: seleccionado.carbohidratos * factor,
      grasas: seleccionado.grasas * factor,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seleccionado || !momentoDia) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const nutrientes = calcularNutrientes()
      if (!nutrientes) throw new Error("Error al calcular nutrientes")

      const { error } = await supabase.from("registro_alimentos").insert({
        user_id: userId,
        ingrediente_id: seleccionado.tipo === "ingrediente" ? seleccionado.id : null,
        receta_id: seleccionado.tipo === "receta" ? seleccionado.id : null,
        nombre_alimento: seleccionado.nombre,
        cantidad: Number.parseFloat(cantidad),
        calorias: nutrientes.calorias,
        proteinas: nutrientes.proteinas,
        carbohidratos: nutrientes.carbohidratos,
        grasas: nutrientes.grasas,
        momento_dia: momentoDia,
        fecha: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrar alimento")
    } finally {
      setIsLoading(false)
    }
  }

  const nutrientesCalculados = calcularNutrientes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Registrar Alimentos</h1>
          <p className="text-muted-foreground">Busca y añade los alimentos que has consumido</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Buscar Alimento o Receta</CardTitle>
          <CardDescription>Escribe el nombre del ingrediente o plato que consumiste</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: pollo, arroz, ensalada..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="bg-green-600 hover:bg-green-700">
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {resultados.length > 0 && (
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-sm font-medium">Resultados:</p>
                {resultados.map((resultado) => (
                  <button
                    key={resultado.id}
                    onClick={() => handleSelectResult(resultado)}
                    className="flex w-full items-center justify-between rounded-md p-3 text-left hover:bg-green-50"
                  >
                    <div>
                      <p className="font-medium">{resultado.nombre}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {resultado.tipo === "ingrediente" ? resultado.categoria : "Receta"}
                      </p>
                    </div>
                    {resultado.tipo === "ingrediente" && (
                      <p className="text-sm text-green-700">{Math.round(resultado.calorias)} kcal/100g</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {resultados.length === 0 && busqueda && !isSearching && (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="mb-2 text-sm font-semibold text-green-700">¿No encuentras lo que buscas?</p>
                <Link href="/ingredientes/nuevo">
                  <Button variant="outline" size="sm">
                    +   Agregar alimento personalizado  
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {seleccionado && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Detalles del Registro</CardTitle>
            <CardDescription>Especifica la cantidad y momento del día</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="font-medium text-green-900">{seleccionado.nombre}</p>
                  <p className="text-sm text-green-700 capitalize">
                    {seleccionado.tipo === "ingrediente" ? seleccionado.categoria : "Receta"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cantidad">Cantidad (gramos)</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="1"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="momento">Momento del Día</Label>
                  <Select value={momentoDia} onValueChange={setMomentoDia} required>
                    <SelectTrigger id="momento">
                      <SelectValue placeholder="Selecciona el momento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desayuno">Desayuno</SelectItem>
                      <SelectItem value="almuerzo">Almuerzo</SelectItem>
                      <SelectItem value="cena">Cena</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {nutrientesCalculados && (
                  <div className="rounded-lg border p-4">
                    <p className="mb-3 text-sm font-medium">Información Nutricional ({cantidad}g):</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Calorías</p>
                        <p className="font-semibold text-green-900">{Math.round(nutrientesCalculados.calorias)} kcal</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proteínas</p>
                        <p className="font-semibold">{Math.round(nutrientesCalculados.proteinas)}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbohidratos</p>
                        <p className="font-semibold">{Math.round(nutrientesCalculados.carbohidratos)}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Grasas</p>
                        <p className="font-semibold">{Math.round(nutrientesCalculados.grasas)}g</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-100 p-3">
                    <p className="text-sm text-green-800">¡Alimento registrado exitosamente!</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading || !momentoDia}
                  >
                    {isLoading ? "Registrando..." : "Registrar Alimento"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSeleccionado(null)} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
