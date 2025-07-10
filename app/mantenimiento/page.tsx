"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"

export default function MantenimientoPage() {
  const { isAuthenticated, isMantenimiento } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isMantenimiento) {
      router.push("/home")
    } else {
      // Redirigir automáticamente a la vista de condominios como página principal
      router.replace("/mantenimiento/reportes-condominio")
    }
  }, [isAuthenticated, isMantenimiento, router])

  // Mostrar un loading mientras se redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
