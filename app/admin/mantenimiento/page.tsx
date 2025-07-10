"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Save,
  DollarSign,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  Building,
  User,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth"
import { type MaintenancePriceHistory, type BankingDetails } from "@/lib/store"
import AuthGuard from "@/components/auth-guard"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MantenimientoPage() {
  const { user } = useAuthStore()

  const [maintenancePrice, setMaintenancePrice] = useState<number>(0)
  const [maintenancePriceHistory, setMaintenancePriceHistory] = useState<MaintenancePriceHistory[]>([])
  const [maintenanceDueDay, setMaintenanceDueDay] = useState<number>(10)
  const [maintenanceLatePaymentFee, setMaintenanceLatePaymentFee] = useState<number>(0)
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null)

  const [newPrice, setNewPrice] = useState<string>("")
  const [newDueDay, setNewDueDay] = useState<string>("")
  const [newLateFee, setNewLateFee] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<"price" | "dueDate" | "lateFee" | "bankDetails">("price")

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/maintenance")
      const data = await res.json()
      if (res.ok && data.success) {
        const s = data.settings
        if (s) {
          setMaintenancePrice(s.price)
          setNewPrice(String(s.price))
          setMaintenanceDueDay(s.due_day)
          setNewDueDay(String(s.due_day))
          setMaintenanceLatePaymentFee(s.late_fee)
          setNewLateFee(String(s.late_fee))
          setBankingDetails({
            bankName: s.bank_name,
            accountHolder: s.account_holder,
            clabe: s.clabe,
            updatedAt: s.updated_at,
            updatedBy: s.updated_by,
          })
        }
        setMaintenancePriceHistory(data.history)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Cargar datos iniciales desde la API
  useEffect(() => {
    fetchSettings()
  }, [])

  // Estado para los datos bancarios
  const [bankData, setBankData] = useState<
    Omit<BankingDetails, "updatedAt" | "updatedBy" | "reference" | "accountNumber">
  >({
    bankName: bankingDetails?.bankName || "",
    accountHolder: bankingDetails?.accountHolder || "",
    clabe: bankingDetails?.clabe || "",
  })

  // Cargar datos bancarios existentes
  useEffect(() => {
    if (bankingDetails) {
      setBankData({
        bankName: bankingDetails.bankName,
        accountHolder: bankingDetails.accountHolder,
        clabe: bankingDetails.clabe,
      })
    }
  }, [bankingDetails])

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validar que el precio sea un número válido
    const priceValue = Number(newPrice)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Por favor ingrese un precio válido")
      setIsSubmitting(false)
      return
    }

    try {
      if (user) {
        const res = await fetch("/api/maintenance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: priceValue, updatedBy: user.id, notes }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          await fetchSettings()
          setSuccess("Precio de mantenimiento actualizado correctamente")
          setNotes("")
        } else {
          setError(data.message || "Error al actualizar")
        }
      } else {
        setError("No se pudo identificar al usuario")
      }
    } catch (err) {
      setError("Ocurrió un error al actualizar el precio")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDueDaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validar que el día sea un número válido entre 1 y 28
    const dueDayValue = Number(newDueDay)
    if (isNaN(dueDayValue) || dueDayValue < 1 || dueDayValue > 28) {
      setError("Por favor ingrese un día válido (entre 1 y 28)")
      setIsSubmitting(false)
      return
    }

    try {
      if (user) {
        const res = await fetch("/api/maintenance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDay: dueDayValue, updatedBy: user.id, notes }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          await fetchSettings()
          setSuccess("Fecha límite de pago actualizada correctamente")
          setNotes("")
        } else {
          setError(data.message || "Error al actualizar")
        }
      } else {
        setError("No se pudo identificar al usuario")
      }
    } catch (err) {
      setError("Ocurrió un error al actualizar la fecha límite")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLateFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validar que el recargo sea un número válido
    const lateFeeValue = Number(newLateFee)
    if (isNaN(lateFeeValue) || lateFeeValue < 0) {
      setError("Por favor ingrese un recargo válido")
      setIsSubmitting(false)
      return
    }

    try {
      if (user) {
        const res = await fetch("/api/maintenance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lateFee: lateFeeValue, updatedBy: user.id, notes }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          await fetchSettings()
          setSuccess("Recargo por pago tardío actualizado correctamente")
          setNotes("")
        } else {
          setError(data.message || "Error al actualizar")
        }
      } else {
        setError("No se pudo identificar al usuario")
      }
    } catch (err) {
      setError("Ocurrió un error al actualizar el recargo")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cambios en los campos de datos bancarios
  const handleBankDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setBankData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  // Manejar envío del formulario de datos bancarios
  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar campos obligatorios
      if (!bankData.bankName.trim()) {
        throw new Error("El nombre del banco es obligatorio")
      }
      if (!bankData.accountHolder.trim()) {
        throw new Error("El nombre del titular es obligatorio")
      }
      if (!bankData.clabe.trim()) {
        throw new Error("La CLABE interbancaria es obligatoria")
      }

      // Actualizar datos bancarios
      if (user) {
        const res = await fetch("/api/maintenance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: bankData.bankName,
            accountHolder: bankData.accountHolder,
            clabe: bankData.clabe,
            updatedBy: user.id,
          }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          await fetchSettings()
          setSuccess("Datos bancarios actualizados correctamente")
        } else {
          setError(data.message || "Error al actualizar")
        }
      } else {
        setError("No se pudo identificar al usuario")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error al actualizar los datos bancarios")
      }
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para obtener el nombre del usuario que realizó el cambio
  const getUserName = (userId: string): string => {
    if (userId === user?.id) return "Tú"
    return "Administrador"
  }

  return (
    <AuthGuard requireAuth requireAdmin>
      <main className="flex min-h-screen flex-col bg-[#0e2c52]">
        <section className="container mx-auto flex-1 flex flex-col items-start justify-start py-6 px-4">
          <div className="w-full mb-8">
            <h1 className="text-3xl font-bold text-white">Cuota de Mantenimiento</h1>
            <p className="text-gray-300 mt-2">Gestiona el precio mensual de mantenimiento del residencial.</p>
          </div>

          {/* Tarjetas de información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mb-8">
            {/* Tarjeta de precio actual */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Precio Actual</h2>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#f9f1dc] rounded-full mb-4">
                    <DollarSign className="h-8 w-8 text-[#d6b15e]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">${maintenancePrice.toLocaleString()}</div>
                  <p className="text-gray-500 mt-2">por mes</p>
                </div>
              </div>
            </div>

            {/* Tarjeta de fecha límite */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Fecha Límite</h2>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#f9f1dc] rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-[#d6b15e]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">Día {maintenanceDueDay}</div>
                  <p className="text-gray-500 mt-2">de cada mes</p>
                </div>
              </div>
            </div>

            {/* Tarjeta de recargo */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recargo por Pago Tardío</h2>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#f9f1dc] rounded-full mb-4">
                    <Clock className="h-8 w-8 text-[#d6b15e]" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800">${maintenanceLatePaymentFee.toLocaleString()}</div>
                  <p className="text-gray-500 mt-2">por pago tardío</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas para editar diferentes aspectos */}
          <div className="w-full bg-white rounded-lg shadow-md overflow-hidden max-w-6xl mx-auto">
            <div className="flex flex-wrap border-b">
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "price" ? "bg-[#f9f1dc] text-[#d6b15e] border-b-2 border-[#d6b15e]" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("price")}
              >
                Precio
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "dueDate" ? "bg-[#f9f1dc] text-[#d6b15e] border-b-2 border-[#d6b15e]" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("dueDate")}
              >
                Fecha Límite
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "lateFee" ? "bg-[#f9f1dc] text-[#d6b15e] border-b-2 border-[#d6b15e]" : "text-gray-600"
                }`}
                onClick={() => setActiveTab("lateFee")}
              >
                Recargo
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "bankDetails"
                    ? "bg-[#f9f1dc] text-[#d6b15e] border-b-2 border-[#d6b15e]"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("bankDetails")}
              >
                Datos Bancarios
              </button>
            </div>

            <div className="p-6">
              {success && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
                  role="alert"
                >
                  <span className="block sm:inline">{success}</span>
                </div>
              )}

              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Formulario para actualizar precio */}
              {activeTab === "price" && (
                <form onSubmit={handlePriceSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Nuevo precio de mantenimiento
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        id="price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notas (opcional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                      placeholder="Razón del cambio de precio, detalles adicionales, etc."
                    ></textarea>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">Importante</p>
                        <p>
                          Al actualizar el precio, se notificará automáticamente a todos los residentes sobre el cambio.
                          Este cambio se aplicará a partir del próximo ciclo de facturación.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Guardando..." : "Actualizar Precio"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Formulario para actualizar fecha límite */}
              {activeTab === "dueDate" && (
                <form onSubmit={handleDueDaySubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="dueDay" className="block text-sm font-medium text-gray-700">
                      Día límite de pago (1-28)
                    </label>
                    <input
                      type="number"
                      id="dueDay"
                      value={newDueDay}
                      onChange={(e) => setNewDueDay(e.target.value)}
                      min="1"
                      max="28"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                      placeholder="Día del mes"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Seleccione un día entre 1 y 28 para evitar problemas con meses cortos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notas (opcional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                      placeholder="Razón del cambio de fecha límite, detalles adicionales, etc."
                    ></textarea>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">Importante</p>
                        <p>
                          Al actualizar la fecha límite, se notificará automáticamente a todos los residentes sobre el
                          cambio. Este cambio se aplicará a partir del próximo ciclo de facturación.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Guardando..." : "Actualizar Fecha Límite"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Formulario para actualizar recargo */}
              {activeTab === "lateFee" && (
                <form onSubmit={handleLateFeeSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="lateFee" className="block text-sm font-medium text-gray-700">
                      Recargo por pago tardío
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        id="lateFee"
                        value={newLateFee}
                        onChange={(e) => setNewLateFee(e.target.value)}
                        className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Este monto se cobrará adicionalmente si el pago se realiza después de la fecha límite.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notas (opcional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                      placeholder="Razón del cambio de recargo, detalles adicionales, etc."
                    ></textarea>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">Importante</p>
                        <p>
                          Al actualizar el recargo, se notificará automáticamente a todos los residentes sobre el
                          cambio. Este cambio se aplicará a partir del próximo ciclo de facturación.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Guardando..." : "Actualizar Recargo"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Formulario para actualizar datos bancarios - Eliminado el campo de referencia */}
              {activeTab === "bankDetails" && (
                <form onSubmit={handleBankDetailsSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                      Nombre del banco
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        id="bankName"
                        value={bankData.bankName}
                        onChange={handleBankDataChange}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                        placeholder="Ej: BBVA, Santander, Banorte"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700">
                      Nombre del titular
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        id="accountHolder"
                        value={bankData.accountHolder}
                        onChange={handleBankDataChange}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                        placeholder="Nombre completo del titular de la cuenta"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="clabe" className="block text-sm font-medium text-gray-700">
                      CLABE Interbancaria
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        id="clabe"
                        value={bankData.clabe}
                        onChange={handleBankDataChange}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                        placeholder="18 dígitos"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Información importante</p>
                        <p>
                          Estos datos bancarios serán visibles para todos los residentes en la sección de pagos. Las
                          referencias de pago se generan automáticamente para cada usuario.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Guardando..." : "Guardar Datos Bancarios"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Historial de cambios de precio */}
          <div className="w-full mt-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Historial de Cambios</h2>
                <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="text-sm">
                  {showHistory ? "Ocultar historial" : "Mostrar historial"}
                </Button>
              </div>

              {showHistory && (
                <>
                  {maintenancePriceHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No hay cambios de precio registrados.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Fecha</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Precio</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Modificado por</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Notas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {maintenancePriceHistory.map((record: MaintenancePriceHistory) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-800">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>
                                    {format(new Date(record.effectiveDate), "d MMM yyyy, HH:mm", { locale: es })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                ${record.price.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-800">{getUserName(record.createdBy)}</td>
                              <td className="py-3 px-4 text-sm text-gray-800">
                                <div className="max-w-xs truncate" title={record.notes}>
                                  {record.notes || "-"}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </AuthGuard>
  )
}
