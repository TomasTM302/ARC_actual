"use client"

import type React from "react"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { ClipboardList, FileText, LogOut, User } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function AuxiliarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, isAuthenticated, isAuxiliar } = useAuthStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (!isAuxiliar) {
      router.push("/")
    }
  }, [isAuthenticated, isAuxiliar, router])

  // No mostrar el layout de auxiliar para páginas que no son de auxiliar
  if (!pathname.startsWith("/auxiliar")) {
    return <div className="min-h-screen">{children}</div>
  }

  if (!isAuthenticated || !isAuxiliar) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header con navbar */}
      <header className="bg-[#0e2c52] text-white shadow-md sticky top-0 z-10">
        {/* Parte superior del header con título y perfil */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold text-white">Panel Auxiliar</h1>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm">{user?.firstName || "Usuario"}</span>
            <div className="w-8 h-8 bg-[#1a4580] rounded-full flex items-center justify-center text-white">
              {user?.firstName?.charAt(0) || "A"}
            </div>
          </div>
        </div>

        {/* Navbar con los enlaces que estaban en el sidebar */}
        <nav className="flex bg-[#1a4580]">
          <NavLink
            href="/auxiliar"
            icon={<ClipboardList size={isMobile ? 18 : 20} />}
            label="Mis Tareas"
            isActive={pathname === "/auxiliar"}
          />
          <NavLink
            href="/auxiliar/reportes"
            icon={<FileText size={isMobile ? 18 : 20} />}
            label="Mis Reportes"
            isActive={pathname === "/auxiliar/reportes"}
          />
          <NavLink
            href="/auxiliar/perfil"
            icon={<User size={isMobile ? 18 : 20} />}
            label="Mi Perfil"
            isActive={pathname === "/auxiliar/perfil"}
          />
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1 py-3 px-2 text-gray-300 hover:bg-[#0e2c52] hover:text-white transition-colors flex-1"
          >
            <LogOut size={isMobile ? 18 : 20} />
            <span className={isMobile ? "text-xs" : "text-sm"}>Salir</span>
          </button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-4 pb-16">{children}</main>

      {/* Footer móvil */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0e2c52] border-t border-[#1a4580] py-2 px-4 z-10 md:hidden">
        <div className="flex justify-around items-center">
          <Link
            href="/auxiliar"
            className={`flex flex-col items-center ${pathname === "/auxiliar" ? "text-white" : "text-gray-400"}`}
          >
            <ClipboardList size={24} />
            <span className="text-xs font-medium mt-1">Tareas</span>
          </Link>

          <Link
            href="/auxiliar/reportes"
            className={`flex flex-col items-center ${
              pathname === "/auxiliar/reportes" ? "text-white" : "text-gray-400"
            }`}
          >
            <FileText size={24} />
            <span className="text-xs font-medium mt-1">Reportes</span>
          </Link>

          <Link
            href="/auxiliar/perfil"
            className={`flex flex-col items-center ${pathname === "/auxiliar/perfil" ? "text-white" : "text-gray-400"}`}
          >
            <User size={24} />
            <span className="text-xs font-medium mt-1">Perfil</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavLink({ href, icon, label, isActive, ...props }: NavLinkProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-1 py-3 px-2 ${
        isActive ? "bg-[#0e2c52] text-white" : "text-gray-300 hover:bg-[#0e2c52] hover:text-white"
      } transition-colors flex-1`}
      {...props}
    >
      {icon}
      <span className={isMobile ? "text-xs" : "text-sm"}>{label}</span>
    </Link>
  )
}
