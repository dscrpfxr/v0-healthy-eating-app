"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardViewProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    nombre: string
    edad: number
    peso?: number
    altura?: number
  } | null
  metaActiva: {
    id: string
    calorias_diarias: number
    peso_objetivo?: number
  } | null
  registroHoy: Array<{
    id: string
    nombre_alimento: string
    cantidad: number
    calorias: number
    proteinas: number
    carbohidratos: number
    grasas: number
    momento_dia: string
    created_at: string
  }>
}

export function DashboardView({ user, profile, metaActiva, registroHoy }: DashboardViewProps) {
  const router = useRouter()

  // Calcular totales del día
  const totales = registroHoy.reduce(
    (acc, item) => ({
      calorias: acc.calorias + Number(item.calorias),
      proteinas: acc.proteinas + Number(item.proteinas),
      carbohidratos: acc.carbohidratos + Number(item.carbohidratos),
      grasas: acc.grasas + Number(item.grasas),
    }),
    { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 },
  )

  const caloriasMeta = metaActiva?.calorias_diarias || 2000
  const porcentajeCalorias = Math.min((totales.calorias / caloriasMeta) * 100, 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-4xl text-green-700">Hola, {profile?.nombre || "Usuario"}</h1>
            <p className="text-green-600">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link href="/perfil">
            <Button variant="outline">Ver Perfil</Button>
          </Link>
        </div>

        {/* Panel de Calorías */}
        <Card className="mb-6 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Resumen Nutricional del Día</CardTitle>
            <CardDescription>Calorías y macronutrientes consumidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Calorías */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Calorías</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(totales.calorias)} / {caloriasMeta} kcal
                  </span>
                </div>
                <Progress value={porcentajeCalorias} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {caloriasMeta - totales.calorias > 0
                    ? `Te quedan ${Math.round(caloriasMeta - totales.calorias)} kcal`
                    : `Has excedido por ${Math.round(totales.calorias - caloriasMeta)} kcal`}
                </p>
              </div>

              {/* Macronutrientes */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-600">Proteínas</p>
                  <p className="text-2xl font-bold text-blue-800">{Math.round(totales.proteinas)}g</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                  <p className="text-sm text-amber-600 font-medium">Carbohidratos</p>
                  <p className="text-2xl font-bold text-amber-800">{Math.round(totales.carbohidratos)}g</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">Grasas</p>
                  <p className="text-2xl font-bold text-orange-800">{Math.round(totales.grasas)}g</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/registro-alimentos" className="block">
            <Card className="cursor-pointer border-green-200 transition-colors hover:bg-green-50">
              <CardContent className="flex items-center gap-4 p-6 px-[22px] py-[22px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-900">Registrar Alimentos</p>
                  <p className="text-xs text-muted-foreground">Añadir comida del día</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recetas" className="block">
            <Card className="cursor-pointer border-green-200 transition-colors hover:bg-green-50">
              <CardContent className="flex items-center gap-4 p-6 px-[22px] py-[22px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-900">Buscar Recetas</p>
                  <p className="text-xs text-muted-foreground">Recetas personalizadas</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/metas" className="block">
            <Card className="cursor-pointer border-green-200 transition-colors hover:bg-green-50">
              <CardContent className="flex items-center gap-4 p-6 py-[22px] px-[22px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-900">{metaActiva ? "Establecer metas" : "Establecer Metas"}</p>
                  <p className="text-xs text-muted-foreground">
                    {metaActiva ? "Seguimiento de objetivos" : "Define tus objetivos"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/foro" className="block">
            <Card className="cursor-pointer border-green-200 transition-colors hover:bg-green-50">
              <CardContent className="flex items-center gap-4 p-6 px-[22px] py-[22px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-900">Ver Foro</p>
                  <p className="text-xs text-muted-foreground">Comunidad y consejos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Registro de Alimentos del Día */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Alimentos Consumidos Hoy</CardTitle>
            <CardDescription>
              {registroHoy.length === 0
                ? "Aún no has registrado ningún alimento hoy"
                : `${registroHoy.length} alimento${registroHoy.length > 1 ? "s" : ""} registrado${registroHoy.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registroHoy.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">
                  Comienza a registrar tus alimentos para llevar un seguimiento de tu nutrición
                </p>
                <Link href="/registro-alimentos">
                  <Button className="bg-green-600 hover:bg-green-700">Registrar Primer Alimento</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {registroHoy.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-green-600">{item.nombre_alimento}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad}g • {item.momento_dia}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-900">{Math.round(item.calorias)} kcal</p>
                      <p className="text-xs text-green-500">
                        P: {Math.round(item.proteinas)}g • C: {Math.round(item.carbohidratos)}g • G:{" "}
                        {Math.round(item.grasas)}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
