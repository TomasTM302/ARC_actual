"use client"

import { useState, useEffect } from "react"
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
  // Estado para reservaciones reales
  const [reservaciones, setReservaciones] = useState<any[]>([])

  // Variables simuladas para estadísticas
  const reservationStats = {
    total: 0,
    confirmed: 0,
    pending: 0,
    canceled: 0,
  }
  const incomeStats = {
    deposits: 0,
    eventIncome: 0,
    total: 0,
  }
  const userStats = {
    total: 0,
  }
  const [areas, setAreas] = useState<any[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  // Obtener áreas comunes y reservaciones desde el endpoint real
  useEffect(() => {
    fetch("/api/areas-comunes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.areas)) {
          setAreas(data.areas)
        }
      })
      .catch(() => setAreas([]))
    // Obtener condominios
    fetch("/api/condominios")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.condominiums)) {
          setCondominios(data.condominiums)
        }
      })
      .catch(() => setCondominios([]))
    // Obtener reservaciones reales
    fetch("/api/reservaciones")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reservaciones)) {
          setReservaciones(data.reservaciones)
        }
      })
      .catch(() => setReservaciones([]))
  }, [])
  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditAreaOpen, setIsEditAreaOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<any>(null)
  const [isNewArea, setIsNewArea] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false)

  // Puedes mantener los datos simulados para las estadísticas si lo deseas

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


  // Debug: mostrar datos recibidos y filtrados
  console.log("reservaciones recibidas de la API:", reservaciones)
  const pagosFiltrados = reservaciones.filter((r: any) => r.tipo_pago === "Transferencia" && r.estado === "pendiente")
  console.log("reservaciones filtradas (transferencia y pendiente):", pagosFiltrados)
  const pendingPayments = pagosFiltrados
    .map((r: any) => {
      // Buscar nombre de área
      const area = areas.find((a: any) => a.id === r.area_comun_id)
      // Buscar nombre de usuario en reservación si existe
      let clientName = r.nombre_usuario || r.usuario_nombre || r.usuario || r.usuario_id
      // Si el backend no envía el nombre, mostrar el id
      return {
        id: r.id,
        area: area ? (area.nombre || area.name) : r.area_comun_id,
        date: r.fecha_reservacion,
        time: `${r.hora_inicio} - ${r.hora_fin}`,
        client: clientName,
        contact: r.contacto || "-", // Si tienes campo de contacto
        amount: r.monto_pago || r.monto || 0,
        reference: r.referencia_transferencia || "-", // Si tienes campo de referencia
      }
    })

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
    // Mapear propiedades para que coincidan con los campos del formulario
    setSelectedArea({
      id: area.id,
      nombre: area.nombre || area.name || "",
      descripcion: area.descripcion || area.description || "",
      monto_deposito: area.monto_deposito ?? area.deposit ?? "",
      horario_apertura: area.horario_apertura ?? "",
      horario_cierre: area.horario_cierre ?? "",
      capacidad: area.capacidad ?? area.capacity ?? "",
      costo_reservacion: area.costo_reservacion ?? "",
      activo: area.activo ?? area.isActive ?? 1,
      requiere_deposito: area.requiere_deposito ?? 0,
      tipo: area.tipo ?? "common",
      condominio_id: area.condominio_id ?? "",
    });
    setIsNewArea(false);
    setIsEditAreaOpen(true);
  }

  const handleAddArea = () => {
    setSelectedArea({
      name: "",
      deposit: "",
      operatingHours: "",
      maxDuration: "",
      capacity: "",
      maxAdvance: "",
      description: "",
      isActive: true,
    })
    setIsNewArea(true)
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
                      {reservaciones.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-6 text-gray-500">No hay reservaciones registradas.</td></tr>
                      ) : (
                        reservaciones
                          .filter(
                            (reservation: any) =>
                              (statusFilter === "all" || reservation.estado === statusFilter) &&
                              (paymentFilter === "all") // No hay campo de pago en la tabla real
                          )
                          .map((reservation: any) => {
                            // Buscar nombre de área por id
                            const area = areas.find((a: any) => a.id === reservation.area_comun_id)
                            return (
                              <tr key={reservation.id} className="border-b">
                                <td className="py-3 px-4">{reservation.id}</td>
                                <td className="py-3 px-4">{area ? area.name : reservation.area_comun_id}</td>
                                <td className="py-3 px-4">{reservation.fecha_reservacion}</td>
                                <td className="py-3 px-4">{reservation.hora_inicio} - {reservation.hora_fin}</td>
                                <td className="py-3 px-4">{reservation.usuario_id}</td>
                                <td className="py-3 px-4">-</td>
                                <td className="py-3 px-4">
                                  {reservation.estado === "confirmada" ? (
                                    <Badge className="bg-green-500">Confirmada</Badge>
                                  ) : reservation.estado === "pendiente" ? (
                                    <Badge className="bg-yellow-500">Pendiente</Badge>
                                  ) : reservation.estado === "cancelada" ? (
                                    <Badge className="bg-red-500">Cancelada</Badge>
                                  ) : (
                                    <Badge className="bg-gray-400">{reservation.estado}</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })
                      )}
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
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Configuración de áreas comunes</h3>
                    <p className="text-gray-500">Administra los parámetros de las áreas comunes</p>
                    <h4 className="text-xl font-semibold mt-6">Áreas disponibles</h4>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={handleAddArea}>
                    <span className="text-xl font-bold">+</span> Agregar nueva área
                  </Button>
                </div>

                {/* Mostrar las áreas dinámicamente */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {areas.length === 0 ? (
                    <p className="text-gray-500 col-span-full">No hay áreas registradas.</p>
                  ) : (
                    areas.map((area) => (
                      <div key={area.id} className="bg-white border rounded-lg p-6 flex flex-col shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xl font-bold">{area.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${area.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{area.isActive ? 'Habilitada' : 'Deshabilitada'}</span>
                        </div>
                        <div className="text-gray-600 mb-2">{area.description}</div>
                        <div className="mb-1"><strong>Depósito:</strong> ${area.deposit}</div>
                        <div className="mb-1"><strong>Anticipación máxima:</strong> {area.maxAdvance} días</div>
                        <div className="mb-1"><strong>Duración máxima:</strong> {area.maxDuration} horas</div>
                        <div className="mb-1"><strong>Horario:</strong> {area.operatingHours}</div>
                        <div className="mb-1"><strong>Capacidad máxima:</strong> {area.capacity} personas</div>
                        {area.simultaneousReservations !== undefined && (
                          <div className="mb-1"><strong>Reservas simultáneas:</strong> {area.simultaneousReservations}</div>
                        )}
                        <div className="mt-4 flex flex-col gap-2">
                          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => handleEditArea(area)}>
                            Editar
                          </Button>
                          <Button size="lg" className={`font-semibold ${area.isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`} onClick={() => alert((area.isActive ? 'Deshabilitar' : 'Habilitar') + ' área ' + area.name)}>
                            {area.isActive ? 'Deshabilitar' : 'Habilitar'}
                          </Button>
                          <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-red-500 flex items-center justify-center gap-2 font-semibold" onClick={() => alert('Eliminar área ' + area.name)}>
                            <span className="material-icons" style={{fontSize:'18px'}}>delete</span> Eliminar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modal de edición de área */}
        <Dialog open={isEditAreaOpen} onOpenChange={setIsEditAreaOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">
                {isNewArea ? "Agregar área común" : `Editar ${selectedArea?.name}`}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" id="area-form">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre</label>
                <input id="nombre" name="nombre" type="text" defaultValue={selectedArea?.nombre || selectedArea?.name} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" required />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="descripcion" name="descripcion" defaultValue={selectedArea?.descripcion || selectedArea?.description} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" rows={2} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capacidad" className="block text-sm font-medium mb-1">Capacidad máxima (personas)</label>
                  <input id="capacidad" name="capacidad" type="number" defaultValue={selectedArea?.capacidad || selectedArea?.capacity} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" required />
                </div>
                <div>
                  <label htmlFor="costo_reservacion" className="block text-sm font-medium mb-1">Costo reservación ($)</label>
                  <input id="costo_reservacion" name="costo_reservacion" type="number" step="0.01" defaultValue={selectedArea?.costo_reservacion || ""} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="horario_apertura" className="block text-sm font-medium mb-1">Horario apertura</label>
                  <input id="horario_apertura" name="horario_apertura" type="time" defaultValue={selectedArea?.horario_apertura || ""} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" required />
                </div>
                <div>
                  <label htmlFor="horario_cierre" className="block text-sm font-medium mb-1">Horario cierre</label>
                  <input id="horario_cierre" name="horario_cierre" type="time" defaultValue={selectedArea?.horario_cierre || ""} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="requiere_deposito" className="block text-sm font-medium mb-1">¿Requiere depósito?</label>
                  <input id="requiere_deposito" name="requiere_deposito" type="checkbox" defaultChecked={selectedArea?.requiere_deposito === 1 || selectedArea?.requiere_deposito === true} className="mr-2" />
                </div>
                <div>
                  <label htmlFor="monto_deposito" className="block text-sm font-medium mb-1">Monto depósito ($)</label>
                  <input id="monto_deposito" name="monto_deposito" type="number" step="0.01" defaultValue={selectedArea?.monto_deposito || ""} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" />
                </div>
              </div>
              {/* Select de condominio */}
              <div>
                <label htmlFor="condominio_id" className="block text-sm font-medium mb-1">Condominio</label>
                <select
                  id="condominio_id"
                  name="condominio_id"
                  defaultValue={selectedArea?.condominio_id || ""}
                  className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200"
                  required
                >
                  <option value="" disabled>Selecciona un condominio</option>
                  {condominios.map((condo) => (
                    <option key={condo.id} value={condo.id}>{condo.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="activo" className="block text-sm font-medium mb-1">¿Área activa?</label>
                  <input id="activo" name="activo" type="checkbox" defaultChecked={selectedArea?.activo === 1 || selectedArea?.activo === true || selectedArea?.isActive === true} className="mr-2" />
                </div>
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium mb-1">Tipo</label>
                <input id="tipo" name="tipo" type="text" defaultValue={selectedArea?.tipo || "common"} className="w-full rounded-lg bg-gray-100 px-4 py-2 text-base border border-gray-200" readOnly />
              </div>
            </form>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 px-6 py-2 font-semibold rounded-lg" onClick={() => setIsEditAreaOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold rounded-lg"
                onClick={async (e) => {
                  e.preventDefault();
                  const form = document.getElementById("area-form");
                  if (!form) return;
                  const fd = new FormData(form);
                  // Construir objeto con los nombres de campo que espera el backend
                  const areaData: any = {
                    nombre: fd.get("nombre") || "",
                    descripcion: fd.get("descripcion") || "",
                    monto_deposito: fd.get("monto_deposito") ? Number(fd.get("monto_deposito")) : 0,
                    horario_apertura: fd.get("horario_apertura") || "00:00",
                    horario_cierre: fd.get("horario_cierre") || "00:00",
                    capacidad: fd.get("capacidad") ? Number(fd.get("capacidad")) : 0,
                    costo_reservacion: fd.get("costo_reservacion") ? Number(fd.get("costo_reservacion")) : 0,
                    activo: fd.get("activo") === "on" ? 1 : 0,
                    requiere_deposito: fd.get("requiere_deposito") === "on" ? 1 : 0,
                    tipo: fd.get("tipo") || "common",
                    condominio_id: fd.get("condominio_id") ? Number(fd.get("condominio_id")) : null,
                  };
                  // Si es edición, agregar el id
                  if (selectedArea && selectedArea.id) {
                    (areaData as any).id = selectedArea.id;
                  }
                  console.log("areaData enviado al backend:", areaData);
                  // Validación básica
                  if (!areaData.nombre || !areaData.descripcion || !areaData.capacidad || !areaData.horario_apertura || !areaData.horario_cierre || !areaData.condominio_id) {
                    alert("Por favor completa todos los campos obligatorios.");
                    return;
                  }
                  try {
                    const res = await fetch("/api/areas-comunes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(areaData),
                    });
                    const data = await res.json();
                    if (data.success) {
                      if ((areaData as any).id) {
                        // Edición: actualizar el área en el arreglo
                        setAreas((prev) => prev.map((a) => a.id === (areaData as any).id ? { ...a, ...areaData } : a));
                      } else {
                        // Nueva: agregar al arreglo
                        setAreas((prev) => [...prev, data.area]);
                      }
                      setIsEditAreaOpen(false);
                    } else {
                      alert("Error al guardar el área: " + (data.message || "Error desconocido"));
                    }
                  } catch (err) {
                    alert("Error de red al guardar el área");
                  }
                }}
              >
                Guardar cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </AuthGuard>
  )
}
