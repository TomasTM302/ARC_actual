"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Utensils, Waves, GlassWater, Users, Clock, Calendar, Info } from "lucide-react"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/lib/auth"
import AuthGuard from "@/components/auth-guard"
import ReservationModal from "@/components/reservation-modal"

export default function ReservaAreasPage() {
  const [activeTab, setActiveTab] = useState("uso-comun")
  const { user } = useAuthStore()

  // Estado para áreas comunes
  const [areas, setAreas] = useState<any[]>([])

  // State for reservation modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState({
    id: "",
    name: "",
    maxPeople: 0,
    deposit: 0,
    operatingHours: "",
    maxDuration: 0,
  })

  // Obtener áreas comunes desde la API
  useEffect(() => {
    fetch("/api/areas-comunes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.areas)) {
          setAreas(data.areas)
        }
      })
      .catch(() => setAreas([]))
  }, [])

  const handleReserveClick = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId)
    if (area && area.isActive !== false) {
      setSelectedArea({
        id: area.id,
        name: area.name,
        maxPeople: area.maxPeople || area.capacity || 0,
        deposit: area.deposit,
        operatingHours: area.operatingHours || area.schedule || "",
        maxDuration: area.maxDuration,
      })
      setIsModalOpen(true)
    }
  }

  const commonAreas = areas.filter((area) => area.type === "common" || area.tipo === "common")
  const privateAreas = areas.filter((area) => area.type === "private" || area.tipo === "private")

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "utensils":
        return <Utensils className="h-10 w-10 text-[#3b6dc7]" />
      case "waves":
        return <Waves className="h-10 w-10 text-[#3b6dc7]" />
      case "glass-water":
        return <GlassWater className="h-10 w-10 text-[#3b6dc7]" />
      case "users":
        return <Users className="h-10 w-10 text-[#3b6dc7]" />
      default:
        return <Utensils className="h-10 w-10 text-[#3b6dc7]" />
    }
  }

  return (
    <AuthGuard requireAuth>
      <main className="flex min-h-screen flex-col bg-[#0e2c52] pb-20">
        <header className="container mx-auto py-4 px-4 max-w-7xl">
          <Link href="/home" className="flex items-center text-white hover:text-gray-200">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver al inicio
          </Link>
        </header>

        <section className="container mx-auto flex-1 flex flex-col items-center justify-start py-8 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl text-gray-800 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Reserva de Áreas Comunes</h2>

            <Tabs defaultValue="uso-comun" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="uso-comun">Uso Común</TabsTrigger>
                <TabsTrigger value="evento-privado">Evento Privado</TabsTrigger>
              </TabsList>

              <TabsContent value="uso-comun" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
                  {commonAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`border rounded-lg overflow-hidden h-full flex flex-col ${!area.isActive ? "opacity-60" : ""}`}
                    >
                      <div className="bg-[#3b6dc7] text-white p-4">
                        <h3 className="text-xl font-semibold">{area.name}</h3>
                        <p className="text-sm opacity-90">Área común</p>
                      </div>

                      <div className="p-6 flex flex-col items-center flex-grow">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          {getIconComponent(area.icon)}
                        </div>

                        <p className="text-center text-gray-700 mb-6">{area.description}</p>

                        {area.details && (
                          <div className="w-full mb-4">
                            <details className="w-full">
                              <summary className="flex items-center justify-between cursor-pointer text-[#3b6dc7] hover:text-[#2d5db3] font-medium">
                                Ver detalles de {area.name.toLowerCase()}
                                <span className="text-[#3b6dc7]">▼</span>
                              </summary>
                              <div className="mt-3 text-sm text-gray-600 pl-2">
                                <ul className="list-disc pl-5 space-y-1">
                                  {area.details.map((detail, index) => (
                                    <li key={index}>{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            </details>
                          </div>
                        )}

                        {area.maxSimultaneousBookings && (
                          <div className="w-full bg-blue-50 p-3 rounded-md mb-4 flex items-center">
                            <Users className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-blue-700">
                              Disponibilidad: {area.currentBookings}/{area.maxSimultaneousBookings} reservas
                            </span>
                          </div>
                        )}

                        <div className="w-full border-t pt-4 mt-auto">
                          <h4 className="font-semibold text-lg mb-2">Costo de la Reserva: $ {area.maxDuration}</h4>
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>
                                Reservación con máximo {area.maxAdvanceBookingDays}{" "}
                                {area.maxAdvanceBookingDays === 1 ? "7 día" : " 7 días"} de anticipación
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Horario: {area.operatingHours}</span>
                            </div>
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Depósito reembolsable:{area.deposit}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Capacidad máxima: {area.maxPeople} personas</span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                            onClick={() => handleReserveClick(area.id)}
                            disabled={!area.isActive}
                          >
                            {area.isActive ? "Reservar ahora" : "No disponible"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="evento-privado" className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Eventos Privados</h3>
                      <p className="text-sm text-blue-700">
                        Para reservar áreas comunes para eventos privados, es necesario hacer la solicitud con al menos
                        2 semanas de anticipación y está sujeto a aprobación por parte de la administración.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                  {privateAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`border rounded-lg overflow-hidden h-full flex flex-col ${!area.isActive ? "opacity-60" : ""}`}
                    >
                      <div className="bg-[#3b6dc7] text-white p-4">
                        <h3 className="text-xl font-semibold">{area.name}</h3>
                        <p className="text-sm opacity-90">Evento privado</p>
                      </div>

                      <div className="p-6 flex flex-col items-center flex-grow">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          {getIconComponent(area.icon)}
                        </div>

                        <p className="text-center text-gray-700 mb-6">{area.description}</p>

                        <div className="w-full border-t pt-4 mt-auto">
                          <h4 className="font-semibold text-lg mb-2">Depósito reembolsable: ${area.deposit}</h4>
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>
                                Reservación con máximo {area.maxAdvanceBookingDays}{" "}
                                {area.maxAdvanceBookingDays === 1 ? "día" : "días"} de anticipación
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Horario: {area.operatingHours}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Duración máxima: {area.maxDuration} horas</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Capacidad máxima: {area.maxPeople} personas</span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                            onClick={() => handleReserveClick(area.id)}
                            disabled={!area.isActive}
                          >
                            {area.isActive ? "Solicitar reserva" : "No disponible"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Reservation Modal */}
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          areaId={selectedArea.id}
          areaName={selectedArea.name}
          maxPeople={selectedArea.maxPeople}
          deposit={selectedArea.deposit}
          operatingHours={selectedArea.operatingHours}
          maxDuration={selectedArea.maxDuration}
        />
      </main>
    </AuthGuard>
  )
}
