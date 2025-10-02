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

interface CreateIngredientFormProps {
  userId: string
}

export function CreateIngredientForm({ userId }: CreateIngredientFormProps) {
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("")
  const [calorias, setCalorias] = useState("")
  const [proteinas, setProteinas] = useState("")
  const [carbohidratos, setCarbohidratos] = useState("")
  const [grasas, setGrasas] = useState("")
  const [fibra, setFibra] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("ingredientes").insert({
        nombre,
        categoria: categoria || "otro",
        calorias: Number.parseFloat(calorias),
        proteinas: Number.parseFloat(proteinas),
        carbohidratos: Number.parseFloat(carbohidratos),
        grasas: Number.parseFloat(grasas),
        fibra: fibra ? Number.parseFloat(fibra) : null,
        es_publico: false,
        created_by: userId,
      })

      if (error) throw error

      router.push("/registro-alimentos")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear el ingrediente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Agregar Ingrediente Personalizado</h1>
          <p className="text-muted-foreground">Crea un nuevo ingrediente con su información nutricional</p>
        </div>
        <Link href="/registro-alimentos">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Información del Ingrediente</CardTitle>
          <CardDescription>Valores nutricionales por cada 100 gramos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre del Ingrediente *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej: Pechuga de pollo casera"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proteina">Proteína</SelectItem>
                    <SelectItem value="carbohidrato">Carbohidrato</SelectItem>
                    <SelectItem value="verdura">Verdura</SelectItem>
                    <SelectItem value="fruta">Fruta</SelectItem>
                    <SelectItem value="lacteo">Lácteo</SelectItem>
                    <SelectItem value="grasa">Grasa</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="calorias">Calorías (kcal) *</Label>
                  <Input
                    id="calorias"
                    type="number"
                    step="0.1"
                    min="0"
                    value={calorias}
                    onChange={(e) => setCalorias(e.target.value)}
                    required
                    placeholder="165"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="proteinas">Proteínas (g) *</Label>
                  <Input
                    id="proteinas"
                    type="number"
                    step="0.1"
                    min="0"
                    value={proteinas}
                    onChange={(e) => setProteinas(e.target.value)}
                    required
                    placeholder="31"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="carbohidratos">Carbohidratos (g) *</Label>
                  <Input
                    id="carbohidratos"
                    type="number"
                    step="0.1"
                    min="0"
                    value={carbohidratos}
                    onChange={(e) => setCarbohidratos(e.target.value)}
                    required
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grasas">Grasas (g) *</Label>
                  <Input
                    id="grasas"
                    type="number"
                    step="0.1"
                    min="0"
                    value={grasas}
                    onChange={(e) => setGrasas(e.target.value)}
                    required
                    placeholder="3.6"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fibra">Fibra (g)</Label>
                <Input
                  id="fibra"
                  type="number"
                  step="0.1"
                  min="0"
                  value={fibra}
                  onChange={(e) => setFibra(e.target.value)}
                  placeholder="0"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Creando Ingrediente..." : "Crear Ingrediente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
