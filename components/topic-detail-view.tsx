"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface TopicDetailViewProps {
  tema: {
    id: string
    titulo: string
    descripcion: string
    categoria: string | null
    created_at: string
    user_id: string
    autor: {
      nombre: string
    }
  }
  respuestas: Array<{
    id: string
    contenido: string
    created_at: string
    user_id: string
    autor: {
      nombre: string
    }
  }>
  userId: string
}

export function TopicDetailView({ tema, respuestas, userId }: TopicDetailViewProps) {
  const [contenido, setContenido] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("foro_respuestas").insert({
        tema_id: tema.id,
        user_id: userId,
        contenido,
      })

      if (error) throw error

      setContenido("")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al publicar respuesta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Link href="/foro">
            <Button variant="outline">← Volver al Foro</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Tema Principal */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-green-900">{tema.titulo}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <span>Por {tema.autor?.nombre || "Usuario"}</span>
                    <span>•</span>
                    <span>{new Date(tema.created_at).toLocaleDateString("es-ES")}</span>
                  </CardDescription>
                </div>
                {tema.categoria && (
                  <Badge variant="secondary" className="ml-4">
                    {tema.categoria}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm leading-relaxed">{tema.descripcion}</div>
            </CardContent>
          </Card>

          {/* Respuestas */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Respuestas ({respuestas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {respuestas.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Aún no hay respuestas. ¡Sé el primero en responder!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {respuestas.map((respuesta) => (
                    <div key={respuesta.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{respuesta.autor?.nombre || "Usuario"}</span>
                        <span>•</span>
                        <span>{new Date(respuesta.created_at).toLocaleDateString("es-ES")}</span>
                      </div>
                      <div className="whitespace-pre-line text-sm leading-relaxed">{respuesta.contenido}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulario de Respuesta */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Tu Respuesta</CardTitle>
              <CardDescription>Comparte tu opinión o consejo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <Textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    required
                    placeholder="Escribe tu respuesta..."
                    rows={6}
                  />

                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? "Publicando..." : "Publicar Respuesta"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
