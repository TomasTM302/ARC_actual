"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth"

// Lista de rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ["/login", "/register"]

export default function AuthRedirect() {
  const { isAuthenticated, isVigilante, isMantenimiento } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Si el usuario no está autenticado y no está en una ruta pública, redirigir a login
    if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Si el usuario está autenticado como vigilante y no está en el dashboard de vigilante, redirigir allí
    if (isAuthenticated && isVigilante && pathname !== "/vigilante" && !pathname.startsWith("/vigilante/")) {
      router.push("/vigilante")
      return
    }

    // Si el usuario está autenticado como mantenimiento y no está en el dashboard de auxiliar, redirigir allí
    // Nota: Mantenemos la ruta /auxiliar/ aunque el rol ahora sea "mantenimiento"
    if (isAuthenticated && isMantenimiento && pathname !== "/auxiliar" && !pathname.startsWith("/auxiliar/")) {
      router.push("/auxiliar")
      return
    }

    // Si el usuario está autenticado como residente o admin e intenta acceder a páginas de vigilante, redirigir a home
    if (isAuthenticated && !isVigilante && (pathname === "/vigilante" || pathname.startsWith("/vigilante/"))) {
      router.push("/")
      return
    }

    // Si el usuario está autenticado como residente o admin e intenta acceder a páginas de auxiliar/mantenimiento, redirigir a home
    if (isAuthenticated && !isMantenimiento && (pathname === "/auxiliar" || pathname.startsWith("/auxiliar/"))) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isVigilante, isMantenimiento, pathname, router])

  return null
}
