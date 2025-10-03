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
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface ProfileViewProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    nombre: string
    edad: number
    peso?: number
    altura?: number
    genero?: string
    tipo_dieta?: string
    tipos_dieta?: string[]
    nivel_actividad?: string
  } | null
  ingredientes: Array<{
    id: string
    nombre: string
  }>
  intolerancias: string[]
}

export function ProfileView({ user, profile, ingredientes, intolerancias }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [nombre, setNombre] = useState(profile?.nombre || "")
  const [edad, setEdad] = useState(profile?.edad?.toString() || "")
  const [peso, setPeso] = useState(profile?.peso?.toString() || "")
  const [altura, setAltura] = useState(profile?.altura?.toString() || "")
  const [genero, setGenero] = useState(profile?.genero || "")
  const [tiposDieta, setTiposDieta] = useState<string[]>(profile?.tipos_dieta || [])
  const [nivelActividad, setNivelActividad] = useState(profile?.nivel_actividad || "moderado")
  const [intoleranciasList, setIntoleranciasList] = useState<string[]>(intolerancias)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100
    return (peso / (alturaMetros * alturaMetros)).toFixed(1)
  }

  const handleToggleDietType = (dietType: string) => {
    setTiposDieta((prev) => (prev.includes(dietType) ? prev.filter((d) => d !== dietType) : [...prev, dietType]))
  }

  const handleToggleIntolerance = (ingredienteId: string) => {
    setIntoleranciasList((prev) =>
      prev.includes(ingredienteId) ? prev.filter((i) => i !== ingredienteId) : [...prev, ingredienteId],
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      console.log("[v0] Guardando perfil con tipos_dieta:", tiposDieta)
      console.log("[v0] Guardando intolerancias:", intoleranciasList)

      const profileUpdate = {
        nombre,
        edad: Number.parseInt(edad),
        peso: peso ? Number.parseFloat(peso) : null,
        altura: altura ? Number.parseFloat(altura) : null,
        genero: genero || null,
        tipos_dieta: tiposDieta,
        nivel_actividad: nivelActividad || "moderado",
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Datos a actualizar:", profileUpdate)

      const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("id", user.id)

      if (profileError) {
        console.error("[v0] Error al actualizar perfil:", profileError)
        throw profileError
      }

      console.log("[v0] Perfil actualizado exitosamente")

      const { error: deleteError } = await supabase.from("intolerancias").delete().eq("user_id", user.id)

      if (deleteError) {
        console.error("[v0] Error al eliminar intolerancias:", deleteError)
        throw deleteError
      }

      console.log("[v0] Intolerancias eliminadas")

      if (intoleranciasList.length > 0) {
        const intolerancesToInsert = intoleranciasList.map((ingredienteId) => ({
          user_id: user.id,
          ingrediente_id: ingredienteId,
        }))

        console.log("[v0] Insertando intolerancias:", intolerancesToInsert)

        const { error: intoleranciaError } = await supabase.from("intolerancias").insert(intolerancesToInsert)

        if (intoleranciaError) {
          console.error("[v0] Error al insertar intolerancias:", intoleranciaError)
          throw intoleranciaError
        }

        console.log("[v0] Intolerancias insertadas exitosamente")
      }

      setIsEditing(false)
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Error general al guardar:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error al guardar")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const imc =
    profile?.peso && profile?.altura
      ? calcularIMC(profile.peso, profile.altura)
      : peso && altura && Number.parseFloat(peso) > 0 && Number.parseFloat(altura) > 0
        ? calcularIMC(Number.parseFloat(peso), Number.parseFloat(altura))
        : null

  const dietTypes = [
    { value: "omnivora", label: "Omnívora" },
    { value: "vegetariana", label: "Vegetariana" },
    { value: "vegana", label: "Vegana" },
    { value: "pescetariana", label: "Pescetariana" },
    { value: "sin_gluten", label: "Sin Gluten" },
    { value: "cetogenica", label: "Cetogénica" },
    { value: "paleo", label: "Paleo" },
  ]

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-900">Mi Perfil</h1>
        <Link href="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-900">Información Personal</CardTitle>
                <CardDescription>Tus datos básicos y de salud</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edad">Edad</Label>
                    <Input id="edad" type="number" value={edad} onChange={(e) => setEdad(e.target.value)} required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="altura">Altura (cm)</Label>
                      <Input
                        id="altura"
                        type="number"
                        step="0.1"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="genero">Género</Label>
                    <Select value={genero} onValueChange={setGenero}>
                      <SelectTrigger id="genero">
                        <SelectValue placeholder="Selecciona tu género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipos de Dieta (puedes seleccionar varios)</Label>
                    <div className="grid gap-3 rounded-lg border p-4">
                      {dietTypes.map((diet) => (
                        <div key={diet.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={diet.value}
                            checked={tiposDieta.includes(diet.value)}
                            onCheckedChange={() => handleToggleDietType(diet.value)}
                          />
                          <label
                            htmlFor={diet.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {diet.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nivel_actividad">Nivel de Actividad Física</Label>
                    <Select value={nivelActividad} onValueChange={setNivelActividad}>
                      <SelectTrigger id="nivel_actividad">
                        <SelectValue placeholder="Selecciona tu nivel de actividad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentario (poco o ningún ejercicio)</SelectItem>
                        <SelectItem value="ligero">Ligero (ejercicio 1-3 días/semana)</SelectItem>
                        <SelectItem value="moderado">Moderado (ejercicio 3-5 días/semana)</SelectItem>
                        <SelectItem value="activo">Activo (ejercicio intenso 6-7 días/semana)</SelectItem>
                        <SelectItem value="muy_activo">Muy Activo (ejercicio muy intenso o trabajo físico)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Intolerancias Alimentarias</Label>
                    <div className="max-h-60 overflow-y-auto rounded-lg border p-4">
                      <div className="grid gap-3">
                        {ingredientes.map((ingrediente) => (
                          <div key={ingrediente.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`intol-${ingrediente.id}`}
                              checked={intoleranciasList.includes(ingrediente.id)}
                              onCheckedChange={() => handleToggleIntolerance(ingrediente.id)}
                            />
                            <label
                              htmlFor={`intol-${ingrediente.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {ingrediente.nombre}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{profile?.nombre || "No especificado"}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Correo</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{profile?.edad || "No especificado"} años</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="font-medium">{profile?.peso ? `${profile.peso} kg` : "No especificado"}</p>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm text-muted-foreground">Altura</p>
                    <p className="font-medium">{profile?.altura ? `${profile.altura} cm` : "No especificado"}</p>
                  </div>
                </div>
                {imc && (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">
                      IMC: <span className="text-lg">{imc}</span>
                    </p>
                  </div>
                )}
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium capitalize">{profile?.genero || "No especificado"}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Tipos de Dieta</p>
                  <div className="flex flex-wrap gap-2">
                    {tiposDieta.length > 0 ? (
                      tiposDieta.map((tipo) => (
                        <span
                          key={tipo}
                          className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                        >
                          {dietTypes.find((d) => d.value === tipo)?.label || tipo}
                        </span>
                      ))
                    ) : (
                      <p className="font-medium">No especificado</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Nivel de Actividad</p>
                  <p className="font-medium capitalize">{profile?.nivel_actividad || "Moderado"}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Intolerancias Alimentarias</p>
                  <div className="flex flex-wrap gap-2">
                    {intoleranciasList.length > 0 ? (
                      intoleranciasList.map((intolId) => {
                        const ingrediente = ingredientes.find((i) => i.id === intolId)
                        return (
                          <span
                            key={intolId}
                            className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800"
                          >
                            {ingrediente?.nombre || "Desconocido"}
                          </span>
                        )
                      })
                    ) : (
                      <p className="font-medium">Ninguna</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Configuración de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
