"use client"
import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth"
import AuthGuard from "@/components/auth-guard"
import RegisterUserModal from "@/components/register-user-modal"

export default function UsersPage() {
  const { getUsers } = useAuthStore()
  const users = getUsers()
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Función para obtener el estilo y texto según el rol
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return { bgColor: "bg-blue-100", textColor: "text-blue-800", label: "Administrador" }
      case "mantenimiento":
        return { bgColor: "bg-amber-100", textColor: "text-amber-800", label: "Mantenimiento" }
      case "vigilante":
        return { bgColor: "bg-purple-100", textColor: "text-purple-800", label: "Vigilante" }
      default:
        return { bgColor: "bg-green-100", textColor: "text-green-800", label: "Residente" }
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <div className="bg-white rounded-lg p-6 w-full text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Usuarios Registrados</h2>
          <Button className="bg-[#3b6dc7] hover:bg-[#2d5db3] text-white" onClick={() => setIsRegisterModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Teléfono</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Casa</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const { bgColor, textColor, label } = getRoleBadgeStyle(user.role)
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.phone}</td>
                    <td className="py-3 px-4 text-sm">{user.house}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}>{label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay usuarios registrados.</p>
          </div>
        )}

        {/* Modal de registro de usuario */}
        <RegisterUserModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
      </div>
    </AuthGuard>
  )
}
