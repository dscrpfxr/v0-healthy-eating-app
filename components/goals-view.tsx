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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Share2, Edit } from "lucide-react"
import Link from "next/link"

interface GoalsViewProps {
  user: {
    id: string
  }
  profile: {
    nombre: string
    peso?: number
    altura?: number
    edad?: number
    genero?: string
    nivel_actividad?: string
  } | null
  metaActiva: {
    id: string
    peso_objetivo?: number
    calorias_diarias: number
    meta_descripcion?: string
    fecha_inicio: string
    fecha_objetivo?: string
    nivel_actividad?: string
  } | null
  progreso: Array<{
    id: string
    peso?: number
    medida_pecho?: number
    medida_cintura?: number
    medida_cadera?: number
    foto_url?: string
    notas?: string
    fecha: string
  }>
}

function calcularIMC(peso: number, altura: number): number {
  const alturaMetros = altura > 10 ? altura / 100 : altura
  return peso / (alturaMetros * alturaMetros)
}

function calcularTMB(peso: number, altura: number, edad: number, genero: string): number {
  // Fórmula Mifflin-St Jeor
  const alturaCm = altura > 10 ? altura : altura * 100

  if (genero?.toLowerCase() === "masculino" || genero?.toLowerCase() === "hombre") {
    return 10 * peso + 6.25 * alturaCm - 5 * edad + 5
  } else {
    return 10 * peso + 6.25 * alturaCm - 5 * edad - 161
  }
}

function calcularTDEE(tmb: number, nivelActividad: string): number {
  // Factores de actividad según nivel
  const factores: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  }

  return tmb * (factores[nivelActividad] || 1.55)
}

function calcularCaloriasObjetivo(
  pesoActual: number,
  pesoObjetivo: number,
  altura: number,
  edad: number,
  genero: string,
  nivelActividad: string,
  fechaObjetivo?: string,
): { calorias: number; tipoMeta: "mantener" | "subir" | "bajar"; recomendacion: string } {
  const diferenciaPeso = Math.abs(pesoObjetivo - pesoActual)
  const tmb = calcularTMB(pesoActual, altura, edad, genero)
  const tdee = calcularTDEE(tmb, nivelActividad)
  const imc = calcularIMC(pesoActual, altura)

  // Determinar tipo de meta
  let tipoMeta: "mantener" | "subir" | "bajar"
  let recomendacion = ""

  if (Math.abs(pesoObjetivo - pesoActual) <= 2) {
    tipoMeta = "mantener"
    recomendacion = `Tu IMC actual es ${imc.toFixed(1)}. Mantén tu peso actual con una dieta balanceada.`
    return { calorias: Math.round(tdee), tipoMeta, recomendacion }
  } else if (pesoObjetivo > pesoActual) {
    tipoMeta = "subir"

    // Calcular calorías para subir de peso
    if (!fechaObjetivo) {
      // Si no hay fecha, asumir 0.5kg por semana (ganancia saludable)
      const caloriasExtra = 500 // ~0.5kg por semana
      recomendacion = `Para subir ${diferenciaPeso.toFixed(1)}kg de forma saludable (IMC actual: ${imc.toFixed(1)}), necesitas un superávit calórico. Se recomienda ganar ~0.5kg por semana.`
      return { calorias: Math.round(tdee + caloriasExtra), tipoMeta, recomendacion }
    } else {
      const diasHastaObjetivo = Math.max(
        1,
        Math.floor((new Date(fechaObjetivo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      )
      // 1kg de peso = ~7700 calorías
      const caloriasExtraDiarias = (diferenciaPeso * 7700) / diasHastaObjetivo
      const caloriasObjetivo = tdee + caloriasExtraDiarias

      recomendacion = `Para subir ${diferenciaPeso.toFixed(1)}kg en ${diasHastaObjetivo} días (IMC actual: ${imc.toFixed(1)}), necesitas consumir ${Math.round(caloriasExtraDiarias)} calorías extra al día.`
      return { calorias: Math.round(caloriasObjetivo), tipoMeta, recomendacion }
    }
  } else {
    tipoMeta = "bajar"

    // Calcular calorías para bajar de peso
    if (!fechaObjetivo) {
      // Si no hay fecha, asumir 0.5kg por semana (pérdida saludable)
      const caloriasDeficit = 500 // ~0.5kg por semana
      recomendacion = `Para bajar ${diferenciaPeso.toFixed(1)}kg de forma saludable (IMC actual: ${imc.toFixed(1)}), necesitas un déficit calórico. Se recomienda perder ~0.5kg por semana.`
      return { calorias: Math.round(Math.max(1200, tdee - caloriasDeficit)), tipoMeta, recomendacion }
    } else {
      const diasHastaObjetivo = Math.max(
        1,
        Math.floor((new Date(fechaObjetivo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      )
      // 1kg de peso = ~7700 calorías
      const caloriasDeficitDiarias = (diferenciaPeso * 7700) / diasHastaObjetivo
      const caloriasObjetivo = tdee - caloriasDeficitDiarias

      // No bajar de 1200 calorías (mínimo saludable)
      const caloriasFinal = Math.max(1200, caloriasObjetivo)

      if (caloriasFinal === 1200 && caloriasObjetivo < 1200) {
        recomendacion = `Para bajar ${diferenciaPeso.toFixed(1)}kg de forma saludable (IMC actual: ${imc.toFixed(1)}), se recomienda un mínimo de 1200 calorías. Considera extender tu fecha objetivo.`
      } else {
        recomendacion = `Para bajar ${diferenciaPeso.toFixed(1)}kg en ${diasHastaObjetivo} días (IMC actual: ${imc.toFixed(1)}), necesitas un déficit de ${Math.round(caloriasDeficitDiarias)} calorías al día.`
      }

      return { calorias: Math.round(caloriasFinal), tipoMeta, recomendacion }
    }
  }
}

export function GoalsView({ user, profile, metaActiva, progreso }: GoalsViewProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(!metaActiva)
  const [mostrarRegistroProgreso, setMostrarRegistroProgreso] = useState(false)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const router = useRouter()

  const calcularProgreso = () => {
    if (!metaActiva?.peso_objetivo || !profile?.peso) return 0

    // Obtener peso inicial de la meta (primer progreso o peso del perfil)
    const progresosDeMeta = progreso.filter((p) => p.peso)
    const pesoInicial =
      progresosDeMeta.length > 0 ? progresosDeMeta[progresosDeMeta.length - 1].peso || profile.peso : profile.peso

    const pesoActual = profile.peso
    const pesoObjetivo = metaActiva.peso_objetivo

    // Determinar si es subir o bajar de peso
    if (pesoObjetivo > pesoInicial) {
      // Meta de subir de peso
      const progresoTotal = pesoObjetivo - pesoInicial
      const progresoActual = pesoActual - pesoInicial
      return Math.min(Math.max(0, Math.round((progresoActual / progresoTotal) * 100)), 100)
    } else if (pesoObjetivo < pesoInicial) {
      // Meta de bajar de peso
      const progresoTotal = pesoInicial - pesoObjetivo
      const progresoActual = pesoInicial - pesoActual
      return Math.min(Math.max(0, Math.round((progresoActual / progresoTotal) * 100)), 100)
    } else {
      // Meta de mantener peso
      const diferencia = Math.abs(pesoActual - pesoObjetivo)
      if (diferencia <= 2) return 100 // Dentro del rango de mantenimiento
      return Math.max(0, 100 - Math.round(diferencia * 10))
    }
  }

  const metaCompletada = () => {
    if (!metaActiva?.peso_objetivo || !profile?.peso) return false

    const progresosDeMeta = progreso.filter((p) => p.peso)
    const pesoInicial =
      progresosDeMeta.length > 0 ? progresosDeMeta[progresosDeMeta.length - 1].peso || profile.peso : profile.peso

    const pesoActual = profile.peso
    const pesoObjetivo = metaActiva.peso_objetivo

    if (pesoObjetivo > pesoInicial) {
      // Meta de subir: completada si peso actual >= peso objetivo
      return pesoActual >= pesoObjetivo
    } else if (pesoObjetivo < pesoInicial) {
      // Meta de bajar: completada si peso actual <= peso objetivo
      return pesoActual <= pesoObjetivo
    } else {
      // Meta de mantener: completada si está dentro de 2kg
      return Math.abs(pesoActual - pesoObjetivo) <= 2
    }
  }

  const calcularTiempoTranscurrido = () => {
    if (!metaActiva) return ""
    const inicio = new Date(metaActiva.fecha_inicio)
    const ahora = new Date()
    const dias = Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))

    if (dias < 7) return `${dias} día${dias !== 1 ? "s" : ""}`
    if (dias < 30) return `${Math.floor(dias / 7)} semana${Math.floor(dias / 7) !== 1 ? "s" : ""}`
    return `${Math.floor(dias / 30)} mes${Math.floor(dias / 30) !== 1 ? "es" : ""}`
  }

  const compartirProgreso = () => {
    const mensaje = "App Cocina Saludable. Tu amigo completó una nueva meta, felicítalo. ¿Qué esperas para unirte?"

    if (navigator.share) {
      navigator
        .share({
          title: "Cocina Saludable",
          text: mensaje,
        })
        .catch(() => {
          navigator.clipboard.writeText(mensaje)
          alert("Mensaje copiado al portapapeles")
        })
    } else {
      navigator.clipboard.writeText(mensaje)
      alert("Mensaje copiado al portapapeles")
    }
  }

  const porcentajeProgreso = calcularProgreso()
  const progresosDeMeta = progreso.filter((p) => p.peso)
  const pesoInicial = progresosDeMeta.length > 0 ? progresosDeMeta[progresosDeMeta.length - 1].peso : profile?.peso
  const ultimoProgreso = progreso.length > 0 ? progreso[0] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Mis Metas de Salud</h1>
            <p className="text-muted-foreground">Establece y sigue tu progreso hacia tus objetivos</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Volver al Dashboard</Button>
          </Link>
        </div>

        {!metaActiva && !mostrarFormulario ? (
          <Card className="border-green-200">
            <CardContent className="py-12 text-center">
              <h3 className="mb-2 text-xl font-semibold text-green-900">No tienes metas activas</h3>
              <p className="mb-6 text-muted-foreground">Establece tu primera meta para comenzar a seguir tu progreso</p>
              <Button onClick={() => setMostrarFormulario(true)} className="bg-green-600 hover:bg-green-700">
                Establecer Meta
              </Button>
            </CardContent>
          </Card>
        ) : mostrarFormulario || editandoMeta ? (
          <CreateGoalForm
            userId={user.id}
            profile={profile}
            metaExistente={editandoMeta ? metaActiva : null}
            ultimoPesoRegistrado={progresosDeMeta.length > 0 ? progresosDeMeta[0].peso : undefined}
            onCancel={() => {
              setMostrarFormulario(false)
              setEditandoMeta(false)
            }}
            onSuccess={() => {
              setMostrarFormulario(false)
              setEditandoMeta(false)
              router.refresh()
            }}
          />
        ) : (
          metaActiva && (
            <div className="space-y-6">
              <Card className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-green-900">Meta Actual</CardTitle>
                      <CardDescription>{metaActiva.meta_descripcion || "Tu objetivo de salud"}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setEditandoMeta(true)} variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button onClick={compartirProgreso} variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 space-y-4">
                    <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">Progreso hacia tu meta</span>
                        <span className="text-2xl font-bold text-green-900">{porcentajeProgreso}%</span>
                      </div>
                      <Progress value={porcentajeProgreso} className="h-4" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      {pesoInicial && (
                        <div className="rounded-lg border bg-white p-4">
                          <p className="text-xs text-muted-foreground">Peso Inicial</p>
                          <p className="text-2xl font-bold text-gray-900">{pesoInicial} kg</p>
                        </div>
                      )}
                      {profile?.peso && (
                        <div className="rounded-lg border bg-white p-4">
                          <p className="text-xs text-muted-foreground">Peso Actual</p>
                          <p className="text-2xl font-bold text-green-900">{profile.peso} kg</p>
                        </div>
                      )}
                      {metaActiva.peso_objetivo && (
                        <div className="rounded-lg border bg-white p-4">
                          <p className="text-xs text-muted-foreground">Peso Objetivo</p>
                          <p className="text-2xl font-bold text-blue-900">{metaActiva.peso_objetivo} kg</p>
                        </div>
                      )}
                      <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs text-muted-foreground">Calorías Diarias</p>
                        <p className="text-2xl font-bold text-orange-900">{metaActiva.calorias_diarias}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tiempo Transcurrido</p>
                        <p className="text-lg font-semibold">{calcularTiempoTranscurrido()}</p>
                      </div>
                      {metaActiva.fecha_objetivo && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Fecha Objetivo</p>
                          <p className="text-lg font-semibold">
                            {new Date(metaActiva.fecha_objetivo).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {metaCompletada() ? (
                    <div className="rounded-lg bg-green-100 p-6 text-center">
                      <h3 className="mb-2 text-xl font-bold text-green-900">¡Felicitaciones! 🎉</h3>
                      <p className="mb-4 text-green-700">Has completado tu meta. ¿Listo para un nuevo desafío?</p>
                      <Button onClick={() => setMostrarFormulario(true)} className="bg-green-600 hover:bg-green-700">
                        Establecer Nueva Meta
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setMostrarRegistroProgreso(!mostrarRegistroProgreso)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Registrar Progreso
                    </Button>
                  )}
                </CardContent>
              </Card>

              {mostrarRegistroProgreso && (
                <ProgressForm
                  userId={user.id}
                  metaId={metaActiva.id}
                  ultimoProgreso={ultimoProgreso}
                  onCancel={() => setMostrarRegistroProgreso(false)}
                  onSuccess={() => {
                    setMostrarRegistroProgreso(false)
                    router.refresh()
                  }}
                />
              )}

              {ultimoProgreso && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900">Último Registro</CardTitle>
                    <CardDescription>
                      {new Date(ultimoProgreso.fecha).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-4">
                      {ultimoProgreso.peso && (
                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-xs text-green-700">Peso</p>
                          <p className="text-lg font-semibold text-green-900">{ultimoProgreso.peso} kg</p>
                        </div>
                      )}
                      {ultimoProgreso.medida_pecho && (
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-700">Pecho</p>
                          <p className="text-lg font-semibold text-blue-900">{ultimoProgreso.medida_pecho} cm</p>
                        </div>
                      )}
                      {ultimoProgreso.medida_cintura && (
                        <div className="rounded-lg bg-amber-50 p-3">
                          <p className="text-xs text-amber-700">Cintura</p>
                          <p className="text-lg font-semibold text-amber-900">{ultimoProgreso.medida_cintura} cm</p>
                        </div>
                      )}
                      {ultimoProgreso.medida_cadera && (
                        <div className="rounded-lg bg-orange-50 p-3">
                          <p className="text-xs text-orange-700">Cadera</p>
                          <p className="text-lg font-semibold text-orange-900">{ultimoProgreso.medida_cadera} cm</p>
                        </div>
                      )}
                    </div>
                    {ultimoProgreso.notas && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">{ultimoProgreso.notas}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function CreateGoalForm({
  userId,
  profile,
  metaExistente,
  ultimoPesoRegistrado,
  onCancel,
  onSuccess,
}: {
  userId: string
  profile: {
    peso?: number
    altura?: number
    edad?: number
    genero?: string
    nivel_actividad?: string
  } | null
  metaExistente?: {
    id: string
    peso_objetivo?: number
    calorias_diarias: number
    meta_descripcion?: string
    fecha_objetivo?: string
    nivel_actividad?: string
  } | null
  ultimoPesoRegistrado?: number
  onCancel: () => void
  onSuccess: () => void
}) {
  const [pesoObjetivo, setPesoObjetivo] = useState(metaExistente?.peso_objetivo?.toString() || "")
  const [metaDescripcion, setMetaDescripcion] = useState(metaExistente?.meta_descripcion || "")
  const [fechaObjetivo, setFechaObjetivo] = useState(metaExistente?.fecha_objetivo || "")
  const [nivelActividad, setNivelActividad] = useState(
    metaExistente?.nivel_actividad || profile?.nivel_actividad || "moderado",
  )
  const [caloriasCalculadas, setCaloriasCalculadas] = useState<number | null>(metaExistente?.calorias_diarias || null)
  const [recomendacion, setRecomendacion] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calcularCalorias = () => {
    if (!pesoObjetivo || !profile?.peso || !profile?.altura || !profile?.edad || !profile?.genero) {
      setError("Necesitas completar tu perfil (peso, altura, edad, género) para calcular calorías automáticamente")
      return
    }

    const pesoActual = ultimoPesoRegistrado || profile.peso
    const resultado = calcularCaloriasObjetivo(
      pesoActual,
      Number.parseFloat(pesoObjetivo),
      profile.altura,
      profile.edad,
      profile.genero,
      nivelActividad,
      fechaObjetivo || undefined,
    )

    setCaloriasCalculadas(resultado.calorias)
    setRecomendacion(resultado.recomendacion)
    setError(null)

    if (resultado.tipoMeta !== "mantener" && !fechaObjetivo) {
      setError("La fecha objetivo es obligatoria para metas de subir o bajar de peso")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!caloriasCalculadas) {
      setError("Por favor calcula las calorías antes de guardar")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      if (metaExistente) {
        // Update existing goal
        const { error } = await supabase
          .from("metas_salud")
          .update({
            peso_objetivo: pesoObjetivo ? Number.parseFloat(pesoObjetivo) : null,
            calorias_diarias: caloriasCalculadas,
            meta_descripcion: metaDescripcion || null,
            fecha_objetivo: fechaObjetivo || null,
            nivel_actividad: nivelActividad,
          })
          .eq("id", metaExistente.id)

        if (error) throw error
      } else {
        await supabase.from("metas_salud").update({ activa: false }).eq("user_id", userId).eq("activa", true)

        // Create new goal
        const { error } = await supabase.from("metas_salud").insert({
          user_id: userId,
          peso_objetivo: pesoObjetivo ? Number.parseFloat(pesoObjetivo) : null,
          calorias_diarias: caloriasCalculadas,
          meta_descripcion: metaDescripcion || null,
          fecha_objetivo: fechaObjetivo || null,
          nivel_actividad: nivelActividad,
          activa: true,
        })

        if (error) throw error
      }

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la meta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-900">{metaExistente ? "Editar Meta" : "Establecer Nueva Meta"}</CardTitle>
        <CardDescription>Define tus objetivos de salud y nutrición</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción de tu Meta</Label>
              <Textarea
                id="descripcion"
                value={metaDescripcion}
                onChange={(e) => setMetaDescripcion(e.target.value)}
                placeholder="Ej: Perder peso de forma saludable, ganar masa muscular, mantener un estilo de vida equilibrado..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="peso_objetivo">Peso Objetivo (kg) *</Label>
                <Input
                  id="peso_objetivo"
                  type="number"
                  step="0.1"
                  value={pesoObjetivo}
                  onChange={(e) => {
                    setPesoObjetivo(e.target.value)
                    setCaloriasCalculadas(null)
                    setRecomendacion("")
                  }}
                  placeholder={
                    ultimoPesoRegistrado
                      ? `Último peso: ${ultimoPesoRegistrado}kg`
                      : profile?.peso
                        ? `Actual: ${profile.peso}kg`
                        : "Requerido"
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha_objetivo">Fecha Objetivo *</Label>
                <Input
                  id="fecha_objetivo"
                  type="date"
                  value={fechaObjetivo}
                  onChange={(e) => {
                    setFechaObjetivo(e.target.value)
                    setCaloriasCalculadas(null)
                    setRecomendacion("")
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nivel_actividad_meta">Nivel de Actividad para esta Meta</Label>
              <Select
                value={nivelActividad}
                onValueChange={(value) => {
                  setNivelActividad(value)
                  setCaloriasCalculadas(null)
                  setRecomendacion("")
                }}
              >
                <SelectTrigger id="nivel_actividad_meta">
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
              <p className="text-xs text-muted-foreground">
                Puedes ajustar tu nivel de actividad para esta meta específica
              </p>
            </div>

            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Calorías Diarias</p>
                  {caloriasCalculadas && (
                    <p className="text-2xl font-bold text-blue-900">{caloriasCalculadas} kcal/día</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={calcularCalorias}
                  variant="outline"
                  className="border-blue-300 bg-white hover:bg-blue-100"
                >
                  Calcular Calorías
                </Button>
              </div>
              {recomendacion && (
                <div className="rounded-md bg-white p-3">
                  <p className="text-sm text-blue-800">{recomendacion}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading || !caloriasCalculadas}
              >
                {isLoading ? "Guardando..." : metaExistente ? "Guardar Cambios" : "Crear Meta"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ProgressForm({
  userId,
  metaId,
  ultimoProgreso,
  onCancel,
  onSuccess,
}: {
  userId: string
  metaId: string
  ultimoProgreso: {
    id: string
    peso?: number
    medida_pecho?: number
    medida_cintura?: number
    medida_cadera?: number
    notas?: string
  } | null
  onCancel: () => void
  onSuccess: () => void
}) {
  const [peso, setPeso] = useState(ultimoProgreso?.peso?.toString() || "")
  const [medidaPecho, setMedidaPecho] = useState(ultimoProgreso?.medida_pecho?.toString() || "")
  const [medidaCintura, setMedidaCintura] = useState(ultimoProgreso?.medida_cintura?.toString() || "")
  const [medidaCadera, setMedidaCadera] = useState(ultimoProgreso?.medida_cadera?.toString() || "")
  const [notas, setNotas] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (ultimoProgreso) {
        const { error } = await supabase
          .from("progreso_salud")
          .update({
            peso: peso ? Number.parseFloat(peso) : null,
            medida_pecho: medidaPecho ? Number.parseFloat(medidaPecho) : null,
            medida_cintura: medidaCintura ? Number.parseFloat(medidaCintura) : null,
            medida_cadera: medidaCadera ? Number.parseFloat(medidaCadera) : null,
            notas: notas || null,
            fecha: new Date().toISOString().split("T")[0],
          })
          .eq("id", ultimoProgreso.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("progreso_salud").insert({
          user_id: userId,
          meta_id: metaId,
          peso: peso ? Number.parseFloat(peso) : null,
          medida_pecho: medidaPecho ? Number.parseFloat(medidaPecho) : null,
          medida_cintura: medidaCintura ? Number.parseFloat(medidaCintura) : null,
          medida_cadera: medidaCadera ? Number.parseFloat(medidaCadera) : null,
          notas: notas || null,
          fecha: new Date().toISOString().split("T")[0],
        })

        if (error) throw error
      }

      if (peso) {
        await supabase
          .from("profiles")
          .update({ peso: Number.parseFloat(peso), updated_at: new Date().toISOString() })
          .eq("id", userId)
      }

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrar progreso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-900">
          {ultimoProgreso ? "Actualizar Progreso" : "Registrar Progreso"}
        </CardTitle>
        <CardDescription>Registra tus medidas y observaciones del día</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="70.5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pecho">Medida Pecho (cm)</Label>
                <Input
                  id="pecho"
                  type="number"
                  step="0.1"
                  value={medidaPecho}
                  onChange={(e) => setMedidaPecho(e.target.value)}
                  placeholder="95"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cintura">Medida Cintura (cm)</Label>
                <Input
                  id="cintura"
                  type="number"
                  step="0.1"
                  value={medidaCintura}
                  onChange={(e) => setMedidaCintura(e.target.value)}
                  placeholder="80"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cadera">Medida Cadera (cm)</Label>
                <Input
                  id="cadera"
                  type="number"
                  step="0.1"
                  value={medidaCadera}
                  onChange={(e) => setMedidaCadera(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="¿Cómo te sientes hoy? ¿Algún logro o desafío?"
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Guardando..." : ultimoProgreso ? "Actualizar Progreso" : "Registrar Progreso"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
