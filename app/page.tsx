import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-green-900">
            Tu Compañero de Alimentación Saludable
          </h1>
          <p className="text-pretty text-xl text-green-700">
            Descubre recetas personalizadas, registra tus comidas y alcanza tus metas de salud
          </p>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-900">Comienza tu viaje saludable</CardTitle>
            <CardDescription className="text-base">
              Crea tu perfil para recibir recomendaciones personalizadas según tus preferencias y objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/auth/sign-up">
              <Button className="w-full bg-green-600 text-lg hover:bg-green-700" size="lg">
                Crear Cuenta
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full text-lg bg-transparent" size="lg">
                Iniciar Sesión
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-6 pt-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-green-900">Recetas Personalizadas</h3>
            <p className="text-sm text-green-700">Basadas en tus preferencias e intolerancias alimentarias</p>
          </div>

          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-green-900">Seguimiento Nutricional</h3>
            <p className="text-sm text-green-700">Registra tus comidas y monitorea tu progreso diario</p>
          </div>

          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-green-900">Comunidad Activa</h3>
            <p className="text-sm text-green-700">Comparte experiencias y aprende de otros usuarios</p>
          </div>
        </div>
      </div>
    </div>
  )
}
