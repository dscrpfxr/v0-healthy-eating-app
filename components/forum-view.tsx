"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import Link from "next/link"
import { createTopicAction } from "@/app/foro/actions"

interface Tema {
  id: string
  titulo: string
  descripcion: string
  categoria: string | null
  created_at: string
  autor: {
    nombre: string
  }
  respuestas: Array<{ count: number }>
}

interface ForumViewProps {
  user: {
    id: string
  }
  temas: Tema[]
}

export function ForumView({ user, temas }: ForumViewProps) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const categorias = ["nutricion", "recetas", "ejercicio", "motivacion", "general"]

  const temasFiltrados = temas.filter((tema) => {
    const coincideBusqueda =
      !busqueda ||
      tema.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      tema.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = !filtroCategoria || tema.categoria === filtroCategoria
    return coincideBusqueda && coincideCategoria
  })

  const contarRespuestas = (tema: Tema) => {
    return tema.respuestas?.[0]?.count || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Foro Comunitario</h1>
            <p className="text-muted-foreground">Comparte experiencias y aprende de otros usuarios</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-green-600 hover:bg-green-700"
            >
              {mostrarFormulario ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Tema
                </>
              )}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>

        {mostrarFormulario && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Crear Nuevo Tema</CardTitle>
              <CardDescription>Comparte tu pregunta o experiencia con la comunidad</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTopicFormInline userId={user.id} onSuccess={() => setMostrarFormulario(false)} />
            </CardContent>
          </Card>
        )}

        {/* Búsqueda y Filtros */}
        <Card className="mb-6 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input placeholder="Buscar temas..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filtroCategoria === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroCategoria(null)}
                  className={filtroCategoria === null ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Todas
                </Button>
                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    variant={filtroCategoria === categoria ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroCategoria(categoria)}
                    className={filtroCategoria === categoria ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Temas */}
        <div className="space-y-4">
          {temasFiltrados.length === 0 ? (
            <Card className="border-green-200">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  {busqueda || filtroCategoria ? "No se encontraron temas" : "Aún no hay temas en el foro"}
                </p>
                <Button onClick={() => setMostrarFormulario(true)} className="bg-green-600 hover:bg-green-700">
                  Crear Primer Tema
                </Button>
              </CardContent>
            </Card>
          ) : (
            temasFiltrados.map((tema) => (
              <Link key={tema.id} href={`/foro/${tema.id}`}>
                <Card className="border-green-200 transition-colors hover:bg-green-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-green-900">{tema.titulo}</CardTitle>
                        <CardDescription className="line-clamp-2">{tema.descripcion}</CardDescription>
                      </div>
                      {tema.categoria && (
                        <Badge variant="secondary" className="ml-4">
                          {tema.categoria}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Por {tema.autor?.nombre || "Usuario"}</span>
                      <span>•</span>
                      <span>{new Date(tema.created_at).toLocaleDateString("es-ES")}</span>
                      <span>•</span>
                      <span>{contarRespuestas(tema)} respuestas</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CreateTopicFormInline({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await createTopicAction({
        userId,
        titulo,
        descripcion,
        categoria: categoria || null,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setTitulo("")
        setDescripcion("")
        setCategoria("")
        onSuccess()
        router.refresh()
      }
    } catch (err) {
      setError("Error al crear el tema")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="¿Cuál es tu pregunta o tema?"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripción *</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe tu pregunta o comparte tu experiencia..."
            rows={4}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Selecciona una categoría (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nutricion">Nutrición</SelectItem>
              <SelectItem value="recetas">Recetas</SelectItem>
              <SelectItem value="ejercicio">Ejercicio</SelectItem>
              <SelectItem value="motivacion">Motivación</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Creando..." : "Publicar Tema"}
        </Button>
      </div>
    </form>
  )
}
