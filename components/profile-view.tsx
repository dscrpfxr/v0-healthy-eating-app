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
    nivel_actividad?: string
  } | null
}

export function ProfileView({ user, profile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [nombre, setNombre] = useState(profile?.nombre || "")
  const [edad, setEdad] = useState(profile?.edad?.toString() || "")
  const [peso, setPeso] = useState(profile?.peso?.toString() || "")
  const [altura, setAltura] = useState(profile?.altura?.toString() || "")
  const [genero, setGenero] = useState(profile?.genero || "")
  const [tipoDieta, setTipoDieta] = useState(profile?.tipo_dieta || "")
  const [nivelActividad, setNivelActividad] = useState(profile?.nivel_actividad || "moderado")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100
    return (peso / (alturaMetros * alturaMetros)).toFixed(1)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre,
          edad: Number.parseInt(edad),
          peso: peso ? Number.parseFloat(peso) : null,
          altura: altura ? Number.parseFloat(altura) : null,
          genero: genero || null,
          tipo_dieta: tipoDieta || null,
          nivel_actividad: nivelActividad || "moderado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setIsEditing(false)
      router.refresh()
    } catch (error: unknown) {
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
                    <Label htmlFor="tipo_dieta">Tipo de Dieta</Label>
                    <Select value={tipoDieta} onValueChange={setTipoDieta}>
                      <SelectTrigger id="tipo_dieta">
                        <SelectValue placeholder="Selecciona tu tipo de dieta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="omnivora">Omnívora</SelectItem>
                        <SelectItem value="vegetariana">Vegetariana</SelectItem>
                        <SelectItem value="vegana">Vegana</SelectItem>
                        <SelectItem value="pescetariana">Pescetariana</SelectItem>
                        <SelectItem value="sin_gluten">Sin Gluten</SelectItem>
                        <SelectItem value="cetogenica">Cetogénica</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <p className="text-sm text-muted-foreground">Tipo de Dieta</p>
                  <p className="font-medium capitalize">{profile?.tipo_dieta || "No especificado"}</p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">Nivel de Actividad</p>
                  <p className="font-medium capitalize">{profile?.nivel_actividad || "Moderado"}</p>
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
