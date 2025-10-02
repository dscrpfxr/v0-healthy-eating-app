"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createTopicAction({
  userId,
  titulo,
  descripcion,
  categoria,
}: {
  userId: string
  titulo: string
  descripcion: string
  categoria: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("foro_temas").insert({
    user_id: userId,
    titulo,
    descripcion,
    categoria,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/foro")
  return { success: true }
}
