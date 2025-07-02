"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  PawPrintIcon as Paw,
  Bell,
  AlertTriangle,
  Wrench,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AvisoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { notices, petReports, getPetReportById } = useAppStore()

  const noticeId = params.id as string
  const notice = notices.find((n) => n.id === noticeId)

  let petReport = undefined
  if (notice?.type === "pet" && notice?.relatedId) {
    petReport = getPetReportById(notice.relatedId)
  }

  useEffect(() => {
    if (!notice) {
      router.push("/avisos")
    }
  }, [notice, router])

  if (!notice) {
    return null
  }

  // Función para obtener el icono según el tipo de aviso
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case "pet":
        return <Paw className="h-6 w-6 text-blue-500" />
      case "emergency":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "maintenance":
        return <Wrench className="h-6 w-6 text-yellow-500" />
      default:
        return <Bell className="h-6 w-6 text-gray-500" />
    }
  }

  // Función para obtener el color de fondo según el tipo de aviso
  const getNoticeBgColor = (type: string) => {
    switch (type) {
      case "pet":
        return "bg-blue-50"
      case "emergency":
        return "bg-red-50"
      case "maintenance":
        return "bg-yellow-50"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0e2c52] pb-20">
      <header className="container mx-auto py-4 px-4 max-w-7xl">
        <Link href="/avisos" className="flex items-center text-white hover:text-gray-200">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver a Avisos
        </Link>
      </header>

      <section className="container mx-auto flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl text-gray-800 mb-8 mx-auto">
          <div className={`mb-6 p-4 rounded-lg ${getNoticeBgColor(notice.type)}`}>
            <div className="flex items-center mb-2">
              {getNoticeIcon(notice.type)}
              <span className="text-xs text-gray-500 ml-auto">
                {format(new Date(notice.createdAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
              </span>
            </div>
            <h1 className="text-2xl font-semibold mt-1">{notice.title}</h1>
          </div>

          {notice.imageUrl && (
            <div className="mb-6">
              <img
                src={notice.imageUrl || "/placeholder.svg"}
                alt="Imagen del aviso"
                className="w-full max-h-96 object-contain rounded-md"
              />
            </div>
          )}

          {notice.type === "pet" && petReport ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium flex items-center mb-3">
                  <Paw className="mr-2 h-5 w-5 text-blue-500" />
                  Información de la Mascota
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{petReport.petName || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{petReport.petType || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Raza</p>
                    <p className="font-medium">{petReport.petBreed || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{petReport.petColor || "No especificado"}</p>
                  </div>
                </div>
                {petReport.characteristics && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Características distintivas</p>
                    <p>{petReport.characteristics}</p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-medium flex items-center mb-3">
                  <MapPin className="mr-2 h-5 w-5 text-red-500" />
                  Información de la Pérdida
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>
                      {petReport.lostDate
                        ? format(new Date(petReport.lostDate), "d 'de' MMMM, yyyy", { locale: es })
                        : "Fecha no especificada"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{petReport.lostTime || "Hora no especificada"}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Lugar donde se perdió</p>
                  <p>{petReport.lostLocation || "No especificado"}</p>
                </div>
                {petReport.details && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Detalles adicionales</p>
                    <p>{petReport.details}</p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-medium flex items-center mb-3">
                  <User className="mr-2 h-5 w-5 text-green-500" />
                  Información de Contacto
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{petReport.contactName || "No especificado"}</span>
                  </div>
                  {petReport.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{petReport.contactPhone}</span>
                    </div>
                  )}
                  {petReport.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{petReport.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mostrar imágenes de la mascota */}
              {petReport?.images && petReport.images.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-3">Fotografías</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {petReport.images.map((img, index) => (
                      <div key={index} className="aspect-square relative rounded overflow-hidden">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Imagen ${index + 1} de ${petReport.petName || "la mascota"}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-700 whitespace-pre-line">{notice.description}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
