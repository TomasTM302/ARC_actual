"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  BarChart3,
  Users,
  Check,
  Search,
  Filter,
  FileText,
  X,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCommonAreasStore } from "@/lib/common-areas-store"
import AuthGuard from "@/components/auth-guard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import CommonAreasConfigPanel from "@/components/common-areas-config-panel"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function AdminCommonAreasPage() {
  const { areas } = useCommonAreasStore()
  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditAreaOpen, setIsEditAreaOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false)

  // Datos simulados para el panel
  const reservationStats = {
    total: 50,
    confirmed: 40,
    pending: 6,
    canceled: 4,
  }

  const incomeStats = {
    deposits: 48900,
    eventIncome: 14000,
    total: 62900,
  }

  const userStats = {
    total: 8,
    residents: 6,
    admins: 2,
  }

  // Datos simulados para el calendario
  const currentMonth = "abril 2025"
  const daysOfWeek = ["lu", "ma", "mi", "ju", "vi", "sa", "do"]
  const daysInMonth = [
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true, isSelected: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
  ]

  // Datos simulados para reservaciones del día seleccionado
  const selectedDayReservations = [
    {
      id: "asador-9",
      name: "Asador 9",
      status: "confirmed",
      time: "11:00 - 16:00",
      contact: "555-678-9012",
      resident: "Patricia López",
      address: "Av. Principal #304, Int. 5A",
    },
    {
      id: "asador-1",
      name: "Asador 1",
      status: "pending",
      time: "09:00 - 14:00",
      contact: "555-456-7890",
      resident: "Laura Martínez",
      address: "Blvd. Jardines #201, Int. 3C",
    },
  ]

  // Datos simulados para lista de reservaciones
  const allReservations = [
    {
      id: "res-1",
      area: "Asador 1",
      date: "14/06/2024",
      time: "14:00 - 18:00",
      user: "Carlos Mendoza",
      payment: "pending",
      status: "confirmed",
    },
    {
      id: "res-2",
      area: "Alberca",
      date: "17/06/2024",
      time: "12:00 - 16:00",
      user: "Ana García",
      payment: "pending",
      status: "confirmed",
    },
    {
      id: "res-3",
      area: "SALÓN Completo",
      date: "09/06/2024",
      time: "16:00 - 23:00",
      user: "Roberto Sánchez",
      payment: "pending",
      status: "confirmed",
    },
    {
      id: "res-4",
      area: "Terraza",
      date: "24/06/2024",
      time: "18:00 - 22:00",
      user: "Laura Martínez",
      payment: "complete",
      status: "pending",
    },
    {
      id: "res-5",
      area: "Barra",
      date: "29/06/2024",
      time: "19:00 - 23:00",
      user: "Carlos Mendoza",
      payment: "complete",
      status: "canceled",
    },
    {
      id: "res-6",
      area: "Asador 1",
      date: "19/06/2024",
      time: "12:00 - 17:00",
      user: "Miguel Rodríguez",
      payment: "complete",
      status: "confirmed",
    },
    {
      id: "res-7",
      area: "Asador 1",
      date: "20/06/2024",
      time: "18:00 - 22:00",
      user: "Patricia López",
      payment: "complete",
      status: "confirmed",
    },
    {
      id: "res-8",
      area: "Asador 2",
      date: "21/06/2024",
      time: "10:00 - 14:00",
      user: "Javier Torres",
      payment: "complete",
      status: "confirmed",
    },
    {
      id: "res-9",
      area: "Asador 2",
      date: "21/06/2024",
      time: "15:00 - 20:00",
      user: "Roberto Sánchez",
      payment: "complete",
      status: "confirmed",
    },
  ]

  // Datos simulados para pagos por transferencia
  const pendingPayments = [
    {
      id: "res-1",
      area: "Asador 1",
      date: "14/06/2024",
      time: "14:00 - 18:00",
      client: "Carlos Mendoza",
      contact: "555-123-4567",
      amount: 500,
      reference: "TR-100000",
    },
    {
      id: "res-2",
      area: "Alberca",
      date: "17/06/2024",
      time: "12:00 - 16:00",
      client: "Ana García",
      contact: "555-234-5678",
      amount: 1500,
      reference: "TR-100001",
    },
  ]

  // Datos simulados para depósitos reembolsables
  const refundableDeposits = [
    {
      id: "res-1234",
      area: "Alberca",
      date: "2024-06-15",
      resident: "Carlos Mendoza",
      amount: 1500,
      status: "pending",
    },
    {
      id: "res-9012",
      area: "Asador 3",
      date: "2024-06-18",
      resident: "Roberto Sánchez",
      amount: 1000,
      status: "pending",
    },
    {
      id: "res-5678",
      area: "Salón de Eventos",
      date: "2024-06-20",
      resident: "Ana García",
      amount: 3500,
      status: "refunded",
    },
  ]

  const handleEditArea = (area) => {
    setSelectedArea(area)
    setIsEditAreaOpen(true)
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <main className="flex min-h-screen flex-col bg-[#0e2c52]">
        <header className="container mx-auto py-4 px-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="flex items-center text-white hover:text-gray-200">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al panel administrativo
            </Link>
          </div>
        </header>

        <section className="container mx-auto flex-1 flex flex-col items-center justify-start py-8 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-7xl text-gray-800 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Panel de Administración de Áreas Comunes</h2>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold">{reservationStats.total}</div>
                <div className="text-gray-500">Reservaciones totales</div>
              </div>

              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-4xl font-bold">{reservationStats.confirmed}</div>
                <div className="text-gray-500">Confirmadas</div>
              </div>

              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="bg-yellow-100 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-4xl font-bold">{reservationStats.pending}</div>
                <div className="text-gray-500">Pendientes</div>
              </div>

              <div className="border rounded-lg p-6 flex flex-col items-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-4xl font-bold">{reservationStats.canceled}</div>
                <div className="text-gray-500">Canceladas</div>
              </div>
            </div>

            {/* Secciones de ingresos y usuarios */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Ingresos</h3>
                <p className="text-gray-500 mb-6">Resumen de ingresos por depósitos y costos de eventos</p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-gray-500">Depósitos totales</div>
                        <div className="text-2xl font-bold">${incomeStats.deposits.toLocaleString()}</div>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                      Reembolsables
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-4">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-gray-500">Ingresos por eventos</div>
                        <div className="text-2xl font-bold">${incomeStats.eventIncome.toLocaleString()}</div>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                      No reembolsables
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-4">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-gray-500">Total</div>
                        <div className="text-2xl font-bold">${incomeStats.total.toLocaleString()}</div>
                      </div>
                    </div>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar reporte
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Usuarios</h3>
                <p className="text-gray-500 mb-6">Información de residentes registrados</p>

                <div className="flex flex-col items-center mb-6">
                  <div className="mb-4">
                    <Users className="h-16 w-16 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold">{userStats.total}</div>
                  <div className="text-gray-500">Usuarios registrados</div>
                </div>

                <Button variant="outline" className="w-full bg-gray-200 text-black hover:bg-gray-300">
                  Ver todos los usuarios
                </Button>
              </div>
            </div>

            {/* Pestañas de navegación */}
            <div className="bg-gray-50 rounded-lg p-2 mb-6 flex overflow-x-auto">
              <button
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === "calendar" ? "bg-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("calendar")}
              >
                Calendario de reservaciones
              </button>
              <button
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === "list" ? "bg-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("list")}
              >
                Lista de reservaciones
              </button>
              <button
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === "payments" ? "bg-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("payments")}
              >
                Pagos por transferencia
              </button>
              <button
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === "deposits" ? "bg-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("deposits")}
              >
                Depósitos reembolsables
              </button>
              <button
                className={`px-4 py-2 rounded-md whitespace-nowrap ${activeTab === "config" ? "bg-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                onClick={() => setActiveTab("config")}
              >
                Configuración de áreas
              </button>
            </div>

            {/* Calendario de reservaciones */}
            {activeTab === "calendar" && (
              <div className="border rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Reservaciones por fecha</h3>
                  <p className="text-gray-500">Selecciona una fecha para ver las reservaciones</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="font-medium">{currentMonth}</div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ArrowLeft className="h-5 w-5 transform rotate-180" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {daysOfWeek.map((day, i) => (
                        <div key={i} className="text-center text-sm text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {daysInMonth.map((day, i) => (
                        <button
                          key={i}
                          className={`
                            h-10 w-full rounded-md flex items-center justify-center text-sm
                            ${!day.isCurrentMonth ? "text-gray-300" : ""}
                            ${day.isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
                          `}
                        >
                          {day.day}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Button variant="default" className="w-full bg-blue-600">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar reporte del día
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold mb-4">Reservaciones para el 22 de abril de 2025</h4>

                    <div className="space-y-4">
                      {selectedDayReservations.map((reservation) => (
                        <div key={reservation.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-medium">{reservation.name}</span>
                            </div>
                            {reservation.status === "confirmed" ? (
                              <Badge className="bg-green-500">Confirmada</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">Pendiente</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Horario:</p>
                              <p className="font-medium">{reservation.time}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Reservado por:</p>
                              <p className="font-medium">{reservation.resident}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Contacto:</p>
                              <p className="font-medium">{reservation.contact}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Dirección:</p>
                              <p className="font-medium">{reservation.address}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center bg-gray-200 text-black hover:bg-gray-300"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Comprobante
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de reservaciones */}
            {activeTab === "list" && (
              <div className="border rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Todas las reservaciones</h3>
                  <p className="text-gray-500">Lista completa de reservaciones</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Buscar por ID, área, usuario o fecha..." className="pl-10" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="flex items-center bg-gray-200 text-black hover:bg-gray-300"
                        onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {statusFilter === "all"
                          ? "Todos los estados"
                          : statusFilter === "confirmed"
                            ? "Confirmadas"
                            : statusFilter === "pending"
                              ? "Pendientes"
                              : "Canceladas"}
                      </Button>
                      <div
                        className="absolute mt-1 w-40 bg-white border rounded-md shadow-lg z-10"
                        style={{ display: statusMenuOpen ? "block" : "none" }}
                      >
                        <div className="py-1">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setStatusFilter("all")
                              setStatusMenuOpen(false)
                            }}
                          >
                            Todos los estados
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setStatusFilter("confirmed")
                              setStatusMenuOpen(false)
                            }}
                          >
                            Confirmadas
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setStatusFilter("pending")
                              setStatusMenuOpen(false)
                            }}
                          >
                            Pendientes
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setStatusFilter("canceled")
                              setStatusMenuOpen(false)
                            }}
                          >
                            Canceladas
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="flex items-center bg-gray-200 text-black hover:bg-gray-300"
                        onClick={() => setPaymentMenuOpen(!paymentMenuOpen)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {paymentFilter === "all"
                          ? "Todos los pagos"
                          : paymentFilter === "pending"
                            ? "Pendientes"
                            : "Completos"}
                      </Button>
                      <div
                        className="absolute mt-1 w-40 bg-white border rounded-md shadow-lg z-10"
                        style={{ display: paymentMenuOpen ? "block" : "none" }}
                      >
                        <div className="py-1">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setPaymentFilter("all")
                              setPaymentMenuOpen(false)
                            }}
                          >
                            Todos los pagos
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setPaymentFilter("pending")
                              setPaymentMenuOpen(false)
                            }}
                          >
                            Pendientes
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setPaymentFilter("complete")
                              setPaymentMenuOpen(false)
                            }}
                          >
                            Completos
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button variant="default" className="bg-blue-600">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar reporte
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Área</th>
                        <th className="py-3 px-4 text-left">Fecha</th>
                        <th className="py-3 px-4 text-left">Horario</th>
                        <th className="py-3 px-4 text-left">Usuario</th>
                        <th className="py-3 px-4 text-left">Pago</th>
                        <th className="py-3 px-4 text-left">Estado</th>
                        <th className="py-3 px-4 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReservations
                        .filter(
                          (reservation) =>
                            (statusFilter === "all" || reservation.status === statusFilter) &&
                            (paymentFilter === "all" || reservation.payment === paymentFilter),
                        )
                        .map((reservation) => (
                          <tr key={reservation.id} className="border-b">
                            <td className="py-3 px-4">{reservation.id}</td>
                            <td className="py-3 px-4">{reservation.area}</td>
                            <td className="py-3 px-4">{reservation.date}</td>
                            <td className="py-3 px-4">{reservation.time}</td>
                            <td className="py-3 px-4">{reservation.user}</td>
                            <td className="py-3 px-4">
                              {reservation.payment === "pending" ? (
                                <Badge className="bg-yellow-500 text-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Transferencia (Pendiente)
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500 text-white">Completo</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {reservation.status === "confirmed" ? (
                                <Badge className="bg-green-500">Confirmada</Badge>
                              ) : reservation.status === "pending" ? (
                                <Badge className="bg-yellow-500">Pendiente</Badge>
                              ) : (
                                <Badge className="bg-red-500">Cancelada</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagos por transferencia */}
            {activeTab === "payments" && (
              <div className="border rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Pagos por transferencia pendientes</h3>
                  <p className="text-gray-500">Verifica y aprueba los pagos realizados por transferencia bancaria</p>
                </div>

                <div className="space-y-6">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <Info className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium">Transferencia pendiente</span>
                        <Badge className="ml-auto bg-yellow-500">Pendiente de verificación</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Reservación:</p>
                          <p className="font-medium">
                            {payment.id} - {payment.area}
                          </p>

                          <p className="text-sm text-gray-500 mt-4 mb-1">Fecha y horario:</p>
                          <p className="font-medium">
                            {payment.date} | {payment.time}
                          </p>

                          <p className="text-sm text-gray-500 mt-4 mb-1">Monto:</p>
                          <p className="font-medium">${payment.amount}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">Cliente:</p>
                          <p className="font-medium">{payment.client}</p>

                          <p className="text-sm text-gray-500 mt-4 mb-1">Contacto:</p>
                          <p className="font-medium">{payment.contact}</p>

                          <p className="text-sm text-gray-500 mt-4 mb-1">Referencia de transferencia:</p>
                          <p className="font-medium">{payment.reference}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center">
                          <Info className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium">Verificación requerida</span>
                        </div>
                        <p className="text-sm mt-1">
                          Verifica que la transferencia se haya recibido correctamente antes de aprobar el pago.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="default" className="bg-red-600 text-white hover:bg-red-700">
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Depósitos reembolsables */}
            {activeTab === "deposits" && (
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Depósitos Reembolsables</h3>
                  <Button variant="outline" className="flex items-center bg-gray-200 text-black hover:bg-gray-300">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar reporte
                  </Button>
                </div>

                <div className="bg-white rounded-lg border p-6 mb-6">
                  <h4 className="text-xl font-semibold mb-2">Estado de depósitos</h4>
                  <p className="text-gray-500 mb-6">Gestiona los depósitos reembolsables de las reservaciones</p>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Reservación</th>
                          <th className="py-3 px-4 text-left">Área</th>
                          <th className="py-3 px-4 text-left">Fecha</th>
                          <th className="py-3 px-4 text-left">Residente</th>
                          <th className="py-3 px-4 text-left">Monto</th>
                          <th className="py-3 px-4 text-left">Estado</th>
                          <th className="py-3 px-4 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refundableDeposits.map((deposit) => (
                          <tr key={deposit.id} className="border-b">
                            <td className="py-3 px-4">{deposit.id}</td>
                            <td className="py-3 px-4">{deposit.area}</td>
                            <td className="py-3 px-4">{deposit.date}</td>
                            <td className="py-3 px-4">{deposit.resident}</td>
                            <td className="py-3 px-4">${deposit.amount.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              {deposit.status === "pending" ? (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                                  Pendiente
                                </span>
                              ) : (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                                  Reembolsado
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {deposit.status === "pending" ? (
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Check className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Configuración de áreas */}
            {activeTab === "config" && (
              <div className="border rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Configuración de áreas comunes</h3>
                  <p className="text-gray-500">Administra los parámetros de las áreas comunes</p>
                </div>

                {/* Aquí se muestra el componente CommonAreasConfigPanel directamente */}
                <CommonAreasConfigPanel />
              </div>
            )}
          </div>
        </section>

        {/* Modal de edición de área */}
        <Dialog open={isEditAreaOpen} onOpenChange={setIsEditAreaOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar {selectedArea?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Nombre:
                </label>
                <div className="col-span-3">
                  <Input id="name" type="text" defaultValue={selectedArea?.name} className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="deposit" className="text-right text-sm">
                  Depósito:
                </label>
                <div className="col-span-3">
                  <Input id="deposit" type="number" defaultValue={selectedArea?.deposit} className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxAdvance" className="text-right text-sm">
                  Anticipación máxima (días):
                </label>
                <div className="col-span-3">
                  <Input id="maxAdvance" type="number" defaultValue={selectedArea?.maxAdvance} className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxDuration" className="text-right text-sm">
                  Duración máxima (horas):
                </label>
                <div className="col-span-3">
                  <Input id="maxDuration" type="number" defaultValue={selectedArea?.maxDuration} className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="schedule" className="text-right text-sm">
                  Horario:
                </label>
                <div className="col-span-3">
                  <Input id="schedule" type="text" defaultValue={selectedArea?.schedule} className="w-full" />
                </div>
              </div>
              {selectedArea?.capacity !== null && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="capacity" className="text-right text-sm">
                    Capacidad máxima:
                  </label>
                  <div className="col-span-3">
                    <Input id="capacity" type="number" defaultValue={selectedArea?.capacity} className="w-full" />
                  </div>
                </div>
              )}
              {selectedArea?.simultaneousReservations !== null && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="simultaneousReservations" className="text-right text-sm">
                    Reservas simultáneas:
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="simultaneousReservations"
                      type="number"
                      defaultValue={selectedArea?.simultaneousReservations}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAreaOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AuthGuard>
  )
}
