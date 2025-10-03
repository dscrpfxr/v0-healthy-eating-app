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

interface CompleteProfileFormProps {
  userId: string
  currentProfile: {
    nombre: string
    edad: number
    peso?: number
    altura?: number
    genero?: string
    tipos_dieta?: string
  } | null
}

export function CompleteProfileForm({ userId, currentProfile }: CompleteProfileFormProps) {
  const [peso, setPeso] = useState(currentProfile?.peso?.toString() || "")
  const [altura, setAltura] = useState(currentProfile?.altura?.toString() || "")
  const [genero, setGenero] = useState(currentProfile?.genero || "")
  const [tipoDieta, setTipoDieta] = useState(currentProfile?.tipos_dieta || "")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100
    return (peso / (alturaMetros * alturaMetros)).toFixed(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          peso: Number.parseFloat(peso),
          altura: Number.parseFloat(altura),
          genero,
          tipos_dieta: tipoDieta,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al guardar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const imc =
    peso && altura && Number.parseFloat(peso) > 0 && Number.parseFloat(altura) > 0
      ? calcularIMC(Number.parseFloat(peso), Number.parseFloat(altura))
      : null

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-2xl text-green-900">Completa tu Perfil</CardTitle>
        <CardDescription>Estos datos nos ayudarán a personalizar tus recomendaciones y calcular tu IMC</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  required
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="altura">Altura (cm) *</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  required
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                />
              </div>
            </div>

            {imc && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm font-medium text-green-900">
                  Tu IMC estimado: <span className="text-lg">{imc}</span>
                </p>
                <p className="mt-1 text-xs text-green-700">
                  {Number.parseFloat(imc) < 18.5 && "Bajo peso"}
                  {Number.parseFloat(imc) >= 18.5 && Number.parseFloat(imc) < 25 && "Peso normal"}
                  {Number.parseFloat(imc) >= 25 && Number.parseFloat(imc) < 30 && "Sobrepeso"}
                  {Number.parseFloat(imc) >= 30 && "Obesidad"}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="genero">Género (opcional)</Label>
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
              <Label htmlFor="tipos_dieta">Tipo de Dieta (opcional)</Label>
              <Select value={tipoDieta} onValueChange={setTipoDieta}>
                <SelectTrigger id="tipos_dieta">
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

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar y Continuar"}
              </Button>
              <Button type="button" variant="outline" onClick={handleSkip}>
                Completar Después
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
