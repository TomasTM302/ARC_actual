"use client"

import { useState } from "react"
import { useAppStore, type MaintenancePayment } from "@/lib/store"
import { Check, Clock, X, AlertCircle, Eye, Download } from "lucide-react"
import { PaymentActionModal } from "@/components/payment-action-modal"

export default function AdminPaymentsPage() {
  const { maintenancePayments } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [selectedPayment, setSelectedPayment] = useState<MaintenancePayment | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grouped" | "detailed">("grouped")

  // Filtrar pagos
  const filteredPayments = maintenancePayments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.residentInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.residentInfo?.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.residentInfo?.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesYear = filterYear === "" || filterYear === "all" || payment.year.toString() === filterYear
    const matchesMonth = filterMonth === "" || filterMonth === "all" || payment.month.toString() === filterMonth
    const matchesStatus = filterStatus === "" || filterStatus === "all" || payment.status === filterStatus

    return matchesSearch && matchesYear && matchesMonth && matchesStatus
  })

  // Agrupar pagos por usuario para vista agrupada
  const paymentsByUser = filteredPayments.reduce(
    (acc, payment) => {
      if (!acc[payment.userId]) {
        acc[payment.userId] = {
          userId: payment.userId,
          userName: payment.userName,
          payments: [],
        }
      }
      acc[payment.userId].payments.push(payment)
      return acc
    },
    {} as Record<string, { userId: string; userName: string; payments: typeof filteredPayments }>,
  )

  // Obtener años únicos para el filtro
  const uniqueYears = Array.from(new Set(maintenancePayments.map((payment) => payment.year.toString()))).sort(
    (a, b) => Number.parseInt(b) - Number.parseInt(a),
  )

  // Obtener meses únicos para el filtro
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Función para obtener el nombre del mes
  const getMonthName = (month) => {
    return months.find((m) => m.value === month.toString())?.label || ""
  }

  // Función para obtener el color y el icono según el estado
  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          label: "Pagado",
          icon: <Check className="h-4 w-4 mr-1" />,
        }
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          label: "Pendiente",
          icon: <Clock className="h-4 w-4 mr-1" />,
        }
      case "rejected":
        return {
          color: "bg-red-100 text-red-800",
          label: "Rechazado",
          icon: <X className="h-4 w-4 mr-1" />,
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Desconocido",
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
        }
    }
  }

  // Función para obtener el nombre del método de pago
  const getPaymentMethodName = (method) => {
    switch (method) {
      case "transfer":
        return "Transferencia"
      case "credit_card":
        return "Tarjeta de Crédito"
      default:
        return "Otro"
    }
  }

  // Función para abrir el modal de acción
  const handleOpenActionModal = (payment) => {
    setSelectedPayment(payment)
    setIsActionModalOpen(true)
  }

  // Función para exportar tabla detallada a CSV
  const exportToCSV = () => {
    const headers = [
      "NOMBRE",
      "CALLE",
      "N°",
      "FORMA DE PAGO",
      "FECHA",
      "CUOTA MENSUAL",
      "RECARGO",
      "CUOTA ADELANTADA",
      "MULTAS",
      "EVENTOS",
      "CUOTA EXTRAORDINARIA",
      "CONVENIOS",
      "TAG",
      "MONTO CUOTA RECUPERADA",
      "N° CUOTA RECUPERADA",
      "PAGO ANUALIDAD",
      "TOTAL",
      "ESTADO DEL COLONO",
      "COMENTARIOS",
      "CLAVE DE RASTREO",
    ]

    const csvData = filteredPayments.map((payment) => {
      const breakdown = payment.breakdown || {}
      return [
        payment.residentInfo?.name || payment.userName,
        payment.residentInfo?.street || "",
        payment.residentInfo?.houseNumber || "",
        getPaymentMethodName(payment.paymentMethod),
        formatDate(payment.paymentDate),
        breakdown.maintenance || 0,
        breakdown.surcharges || 0,
        breakdown.advancePayments?.reduce((sum, item) => sum + item.amount, 0) || 0,
        breakdown.fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0,
        breakdown.events?.reduce((sum, event) => sum + event.amount, 0) || 0,
        breakdown.others?.reduce((sum, item) => sum + item.amount, 0) || 0,
        breakdown.agreements?.reduce((sum, agreement) => sum + agreement.amount, 0) || 0,
        "", // TAG
        breakdown.recoveredPayments?.reduce((sum, item) => sum + item.amount, 0) || 0,
        breakdown.recoveredPayments?.length || 0,
        0, // PAGO ANUALIDAD
        payment.amount,
        payment.residentStatus || "Ordinario",
        payment.comments || "",
        payment.trackingKey || "",
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pagos_detallados_${filterMonth || "todos"}_${filterYear}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administración de Pagos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === "grouped" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Vista Agrupada
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                viewMode === "detailed" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Tabla Detallada
            </button>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre/dirección
            </label>
            <input
              type="text"
              id="search"
              className="w-full p-2 border rounded-md"
              placeholder="Nombre del residente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              id="year"
              className="w-full p-2 border rounded-md"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">Todos los años</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              id="month"
              className="w-full p-2 border rounded-md"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="all">Todos los meses</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              className="w-full p-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Pagado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vista Agrupada */}
      {viewMode === "grouped" && (
        <div className="space-y-6">
          {Object.values(paymentsByUser).length > 0 ? (
            Object.values(paymentsByUser).map((user) => (
              <div key={user.userId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="text-lg font-semibold">{user.userName}</h2>
                </div>

                <div className="divide-y">
                  {user.payments
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment) => {
                      const statusInfo = getStatusInfo(payment.status)

                      return (
                        <div key={payment.id} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-2 md:mb-0">
                              <div className="flex items-center">
                                <span className="font-medium">
                                  Pago de {getMonthName(payment.month)} {payment.year}
                                </span>
                                <span
                                  className={`ml-2 px-2 py-1 rounded-full text-xs flex items-center ${statusInfo.color}`}
                                >
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="mr-4">Fecha: {formatDate(payment.paymentDate)}</span>
                                <span>Método: {getPaymentMethodName(payment.paymentMethod)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="text-lg font-bold">${payment.amount.toLocaleString()}</div>

                              {payment.status === "pending" && (
                                <button
                                  onClick={() => handleOpenActionModal(payment)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Procesar
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenActionModal(payment)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Ver detalles"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </div>

                          {/* Notas del pago */}
                          {payment.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notas:</span> {payment.notes}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">No se encontraron pagos que coincidan con los filtros aplicados.</p>
            </div>
          )}
        </div>
      )}

      {/* Tabla Detallada */}
      {viewMode === "detailed" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calle
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pago
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuota Mensual
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recargo
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Multas
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Convenios
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado del Colono
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave de Rastreo
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment) => {
                      const statusInfo = getStatusInfo(payment.status)
                      const breakdown = payment.breakdown || {}

                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.residentInfo?.name || payment.userName}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.residentInfo?.street || ""}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.residentInfo?.houseNumber || ""}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getPaymentMethodName(payment.paymentMethod)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(breakdown.maintenance || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(breakdown.surcharges || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(breakdown.fines?.reduce((sum, fine) => sum + fine.amount, 0) || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            $
                            {(
                              breakdown.agreements?.reduce((sum, agreement) => sum + agreement.amount, 0) || 0
                            ).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${payment.amount.toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.residentStatus || "Ordinario"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {payment.trackingKey || "N/A"}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {payment.status === "pending" && (
                                <button
                                  onClick={() => handleOpenActionModal(payment)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Procesar
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenActionModal(payment)}
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Ver detalles"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                ) : (
                  <tr>
                    <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron pagos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para procesar pagos */}
      {selectedPayment && (
        <PaymentActionModal
          payment={selectedPayment}
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false)
            setSelectedPayment(null)
          }}
        />
      )}
    </div>
  )
}
