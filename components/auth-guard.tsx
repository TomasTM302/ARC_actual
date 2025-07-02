"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth"

type UserRole = string // Define UserRole type

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requireVigilante?: boolean
  requireMantenimiento?: boolean
  requireRole?: UserRole
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireVigilante = false,
  requireMantenimiento = false,
  requireRole,
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isVigilante, isMantenimiento, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Si authentication es requerida y el usuario no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Si se requieren privilegios de admin y el usuario no es admin
    if (requireAdmin && !isAdmin) {
      router.push("/")
      return
    }

    // Si se requieren privilegios de vigilante y el usuario no es vigilante
    if (requireVigilante && !isVigilante) {
      router.push("/")
      return
    }

    // Si se requieren privilegios de mantenimiento y el usuario no es mantenimiento
    if (requireMantenimiento && !isMantenimiento) {
      router.push("/")
      return
    }

    // Si se requiere un rol específico y el usuario no tiene ese rol
    if (requireRole && user?.role !== requireRole) {
      router.push("/")
      return
    }
  }, [
    isAuthenticated,
    isAdmin,
    isVigilante,
    isMantenimiento,
    requireAuth,
    requireAdmin,
    requireVigilante,
    requireMantenimiento,
    requireRole,
    router,
    pathname,
    user?.role,
  ])

  // Si authentication es requerida pero el usuario no está autenticado, o
  // si se requieren privilegios de admin pero el usuario no es admin, o
  // si se requieren privilegios de vigilante pero el usuario no es vigilante, o
  // si se requieren privilegios de auxiliar pero el usuario no es auxiliar, o
  // si se requiere un rol específico pero el usuario no tiene ese rol,
  // no renderizar los children
  if (
    (requireAuth && !isAuthenticated) ||
    (requireAdmin && !isAdmin) ||
    (requireVigilante && !isVigilante) ||
    (requireMantenimiento && !isMantenimiento) ||
    (requireRole && user?.role !== requireRole)
  ) {
    return null
  }

  return <>{children}</>
}
