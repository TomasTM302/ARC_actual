"use client"

import { useState } from "react"
import { Plus, FileText, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthGuard from "@/components/auth-guard"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import NewPaymentAgreementModal from "@/components/new-payment-agreement-modal"

// Tipos para los convenios
interface PaymentDetail {
  id: string
  description: string
  amount: number
  paymentDate: string
  status: "pending" | "paid" | "late"
}

interface Agreement {
  id: string
  userId: string
  userName: string
  userHouse: string
  createdAt: string
  totalAmount: number
  payments: PaymentDetail[]
}

// Datos de ejemplo para convenios existentes
const mockAgreements: Agreement[] = [
  {
    id: "conv-1",
    userId: "resident-1",
    userName: "Usuario Residente",
    userHouse: "Casa 42",
    createdAt: "2023-05-15T10:30:00Z",
    totalAmount: 12000,
    payments: [
      {
        id: "pay-1-1",
        description: "Pago inicial",
        amount: 4000,
        paymentDate: "2023-06-01",
        status: "paid",
      },
      {
        id: "pay-1-2",
        description: "Segunda cuota",
        amount: 4000,
        paymentDate: "2023-07-01",
        status: "paid",
      },
      {
        id: "pay-1-3",
        description: "Cuota final",
        amount: 4000,
        paymentDate: "2023-08-01",
        status: "pending",
      },
    ],
  },
  {
    id: "conv-2",
    userId: "resident-2",
    userName: "María Rodríguez",
    userHouse: "Casa 15",
    createdAt: "2023-06-20T14:45:00Z",
    totalAmount: 8500,
    payments: [
      {
        id: "pay-2-1",
        description: "Pago inicial",
        amount: 2500,
        paymentDate: "2023-07-01",
        status: "paid",
      },
      {
        id: "pay-2-2",
        description: "Segunda cuota",
        amount: 3000,
        paymentDate: "2023-08-01",
        status: "late",
      },
      {
        id: "pay-2-3",
        description: "Cuota final",
        amount: 3000,
        paymentDate: "2023-09-01",
        status: "pending",
      },
    ],
  },
  {
    id: "conv-3",
    userId: "resident-3",
    userName: "Carlos Sánchez",
    userHouse: "Casa 78",
    createdAt: "2023-07-05T09:15:00Z",
    totalAmount: 15000,
    payments: [
      {
        id: "pay-3-1",
        description: "Primera cuota",
        amount: 5000,
        paymentDate: "2023-08-01",
        status: "paid",
      },
      {
        id: "pay-3-2",
        description: "Segunda cuota",
        amount: 5000,
        paymentDate: "2023-09-01",
        status: "pending",
      },
      {
        id: "pay-3-3",
        description: "Tercera cuota",
        amount: 5000,
        paymentDate: "2023-10-01",
        status: "pending",
      },
    ],
  },
]

export default function ConveniosPage() {
  const [agreements, setAgreements] = useState<Agreement[]>(mockAgreements)
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewAgreementModalOpen, setIsNewAgreementModalOpen] = useState(false)

  // Filtrar convenios por término de búsqueda
  const filteredAgreements = agreements.filter(
    (agreement) =>
      agreement.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.userHouse.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "late":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado"
      case "pending":
        return "Pendiente"
      case "late":
        return "Atrasado"
      default:
        return "Desconocido"
    }
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <main className="flex min-h-screen flex-col bg-[#0e2c52]">
        <section className="container mx-auto flex-1 flex flex-col items-start justify-start py-6 px-4">
          <div className="w-full mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Convenios de Pago</h1>
              <p className="text-gray-300 mt-2">Gestiona los acuerdos de pago con los residentes.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                className="bg-[#d6b15e] hover:bg-[#c4a14e] text-[#0e2c52]"
                onClick={() => setIsNewAgreementModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Convenio
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-6xl mx-auto">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre o casa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
              />
            </div>

            {filteredAgreements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No se encontraron convenios de pago.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Residente</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Casa</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Fecha de creación</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Monto total</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Pagos</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Estado</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAgreements.map((agreement) => {
                      // Calcular el estado general del convenio
                      const paidCount = agreement.payments.filter((p) => p.status === "paid").length
                      const lateCount = agreement.payments.filter((p) => p.status === "late").length
                      let status = "pending"
                      if (paidCount === agreement.payments.length) {
                        status = "paid"
                      } else if (lateCount > 0) {
                        status = "late"
                      }

                      return (
                        <tr key={agreement.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">{agreement.userName}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{agreement.userHouse}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {format(new Date(agreement.createdAt), "d MMM yyyy", { locale: es })}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">
                            ${agreement.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            {paidCount}/{agreement.payments.length}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                              {getStatusText(status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex justify-center">
                              <button
                                className="text-yellow-600 hover:text-yellow-800"
                                title="Editar"
                                onClick={() => alert(`Editar convenio ${agreement.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Modal para nuevo convenio */}
        <NewPaymentAgreementModal isOpen={isNewAgreementModalOpen} onClose={() => setIsNewAgreementModalOpen(false)} />
      </main>
    </AuthGuard>
  )
}
