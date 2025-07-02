"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Edit, Trash2, Store, ExternalLink, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth"
import AuthGuard from "@/components/auth-guard"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import NewBusinessModal from "@/components/new-business-modal"

export default function AdminComerciosPage() {
  const { nearbyBusinesses, deleteNearbyBusiness } = useAppStore()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewBusinessModalOpen, setIsNewBusinessModalOpen] = useState(false)

  // Filtrar comercios por término de búsqueda
  const filteredBusinesses = nearbyBusinesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string, createdBy: string) => {
    // Verificar si el usuario actual es el creador del comercio
    if (user?.id !== createdBy) {
      alert("Solo puedes eliminar comercios que hayas creado")
      return
    }

    if (confirm("¿Estás seguro de que deseas eliminar este comercio?")) {
      deleteNearbyBusiness(id)
    }
  }

  // Función para verificar si el usuario puede editar/eliminar un comercio
  const canEditBusiness = (createdBy: string) => {
    return user?.id === createdBy
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <main className="flex min-h-screen flex-col bg-[#0e2c52]">
        <section className="container mx-auto flex-1 flex flex-col items-start justify-start py-6 px-4">
          <div className="w-full mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Comercios Cercanos</h1>
              <p className="text-gray-300 mt-2">Gestiona los comercios cercanos al residencial.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                className="bg-[#d6b15e] hover:bg-[#c4a14e] text-[#0e2c52]"
                onClick={() => setIsNewBusinessModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Comercio
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-6xl mx-auto">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
              />
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No se encontraron comercios.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <div key={business.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={business.imageUrl || "/placeholder.svg"}
                        alt={business.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">{business.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{business.category}</p>

                      <div className="flex items-center text-sm text-blue-600 mb-3">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <a
                          href={business.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:underline"
                        >
                          {business.websiteUrl}
                        </a>
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Creado: {format(new Date(business.createdAt), "d MMM yyyy", { locale: es })}
                      </div>

                      <div className="flex justify-between">
                        {canEditBusiness(business.createdBy) ? (
                          <>
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(business.id, business.createdBy)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center text-gray-500 text-sm">
                            <Lock className="h-4 w-4 mr-1" />
                            <span>Creado por otro administrador</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal para nuevo comercio */}
        <NewBusinessModal isOpen={isNewBusinessModalOpen} onClose={() => setIsNewBusinessModalOpen(false)} />
      </main>
    </AuthGuard>
  )
}
