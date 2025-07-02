"use client"
import Link from "next/link"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Calendar, ArrowLeft, Building, Info, Copy, Check } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/lib/auth"
import { useFinesStore } from "@/lib/fines-store"

// Definir la interfaz PaymentBreakdown
interface PaymentBreakdown {
  maintenance?: number
  surcharges?: number
  fines?: { id: string; description: string; amount: number }[]
  agreements?: { id: string; description: string; amount: number }[]
  advancePayments?: { month: number; year: number; amount: number }[]
}

export default function PagoMantenimientoPage() {
  // Obtener el precio de mantenimiento, fecha límite, recargo y datos bancarios del store
  const {
    maintenancePrice,
    maintenanceDueDay,
    maintenanceLatePaymentFee,
    bankingDetails,
    addMaintenancePayment,
    addNotice,
    getMaintenancePaymentsByMonth,
  } = useAppStore()
  const { user } = useAuthStore()
  const { getPendingFinesByUser } = useFinesStore()

  const [showLatePaymentInfo, setShowLatePaymentInfo] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showTicket, setShowTicket] = useState(false)

  // Modificar el estado para los pagos seleccionados para incluir multas y convenios individuales
  const [selectedPayments, setSelectedPayments] = useState({
    maintenance: true,
    fines: {} as Record<string, boolean>, // Cambio para seleccionar multas individuales
    agreements: {} as Record<string, boolean>, // Cambio para seleccionar convenios individuales
  })

  // Estado para pagos adelantados
  const [advanceMonths, setAdvanceMonths] = useState<number>(0)

  // Obtener multas pendientes del usuario actual (memoized to prevent infinite loops)
  const userFines = useMemo(() => {
    return user ? getPendingFinesByUser(user.id) : []
  }, [user, getPendingFinesByUser])

  // Calcular meses disponibles para adelantar (hasta 12 meses)
  const getAvailableAdvanceMonths = () => {
    const months = []
    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      const month = futureDate.getMonth() + 1
      const year = futureDate.getFullYear()

      // Verificar si ya existe un pago para este mes
      const monthPayments = getMaintenancePaymentsByMonth(month, year)
      const userMonthPayment = monthPayments.find(
        (payment) => payment.userId === user?.id && payment.status === "completed",
      )

      if (!userMonthPayment) {
        months.push({
          value: i,
          label: `${futureDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`,
          month,
          year,
        })
      }
    }
    return months
  }

  const availableAdvanceMonths = getAvailableAdvanceMonths()

  // Datos de ejemplo para convenios (mantenemos estos como ejemplo)
  const userAgreements = [
    { id: "agreement-1", description: "Convenio de pago - Cuota 2/5", amount: 1200, dueDate: "2023-08-20" },
    { id: "agreement-2", description: "Convenio de pago - Cuota 3/5", amount: 1200, dueDate: "2023-09-20" },
  ]

  // Inicializar el estado de selección de multas y convenios
  useEffect(() => {
    const finesState = {} as Record<string, boolean>
    const agreementsState = {} as Record<string, boolean>

    // Inicializar todas las multas como no seleccionadas
    userFines.forEach((fine) => {
      finesState[fine.id] = false
    })

    // Inicializar todos los convenios como no seleccionadas
    userAgreements.forEach((agreement) => {
      agreementsState[agreement.id] = false
    })

    // Only update if the keys have actually changed
    setSelectedPayments((prev) => {
      const currentFineKeys = Object.keys(prev.fines).sort()
      const newFineKeys = Object.keys(finesState).sort()
      const currentAgreementKeys = Object.keys(prev.agreements).sort()
      const newAgreementKeys = Object.keys(agreementsState).sort()

      const finesChanged = JSON.stringify(currentFineKeys) !== JSON.stringify(newFineKeys)
      const agreementsChanged = JSON.stringify(currentAgreementKeys) !== JSON.stringify(newAgreementKeys)

      if (finesChanged || agreementsChanged) {
        return {
          ...prev,
          fines: finesState,
          agreements: agreementsState,
        }
      }

      return prev
    })
  }, [userFines, userAgreements])

  // Verificar si ya se pagó el mes actual revisando la tabla de pagos
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const currentMonthPayments = getMaintenancePaymentsByMonth(currentMonth, currentYear)
  const userCurrentMonthPayment = currentMonthPayments.find(
    (payment) => payment.userId === user?.id && payment.status === "completed",
  )
  const hasCurrentMonthPayment = !!userCurrentMonthPayment

  // Determinar si aplicar recargo basado en fecha límite y si no ha pagado
  const today = new Date()
  const currentDay = today.getDate()
  const isLate = currentDay > maintenanceDueDay && !hasCurrentMonthPayment

  // Calcular el monto a pagar basado en las selecciones
  const maintenanceAmount = selectedPayments.maintenance
    ? isLate
      ? maintenancePrice + maintenanceLatePaymentFee
      : maintenancePrice
    : 0

  // Calcular monto de pagos adelantados
  const advancePaymentAmount = advanceMonths * maintenancePrice

  // Calcular el monto de multas seleccionadas
  const finesAmount = userFines.reduce((sum, fine) => {
    if (selectedPayments.fines[fine.id]) {
      // Si la multa está vencida, usar el monto con recargo
      return sum + (fine.status === "overdue" ? fine.amount + fine.lateFee : fine.amount)
    }
    return sum
  }, 0)

  // Calcular el monto de convenios seleccionados
  const agreementsAmount = userAgreements.reduce((sum, agreement) => {
    return sum + (selectedPayments.agreements[agreement.id] ? agreement.amount : 0)
  }, 0)

  const totalAmount = maintenanceAmount + finesAmount + agreementsAmount + advancePaymentAmount

  // Función para manejar la selección de todas las multas
  const handleSelectAllFines = (checked: boolean) => {
    const newFinesState = { ...selectedPayments.fines }
    userFines.forEach((fine) => {
      newFinesState[fine.id] = checked
    })

    setSelectedPayments((prev) => ({
      ...prev,
      fines: newFinesState,
    }))
  }

  // Función para manejar la selección de todos los convenios
  const handleSelectAllAgreements = (checked: boolean) => {
    const newAgreementsState = { ...selectedPayments.agreements }
    userAgreements.forEach((agreement) => {
      newAgreementsState[agreement.id] = checked
    })

    setSelectedPayments((prev) => ({
      ...prev,
      agreements: newAgreementsState,
    }))
  }

  // Función para manejar la selección de una multa individual
  const handleSelectFine = (fineId: string, checked: boolean) => {
    setSelectedPayments((prev) => ({
      ...prev,
      fines: {
        ...prev.fines,
        [fineId]: checked,
      },
    }))
  }

  // Función para manejar la selección de un convenio individual
  const handleSelectAgreement = (agreementId: string, checked: boolean) => {
    setSelectedPayments((prev) => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [agreementId]: checked,
      },
    }))
  }

  // Versión simplificada de la función generateReference()
  const generateReference = () => {
    if (!user) return "REF-INVALIDA"

    // Extraer solo los números de la casa (o usar los últimos 2-3 caracteres si no hay números)
    const houseMatch = user.house.match(/\d+/)
    const houseNum = houseMatch ? houseMatch[0] : user.house.slice(-2)

    // Crear un código simple para el tipo de pago
    let typeCode = ""
    if (selectedPayments.maintenance) typeCode += "M"

    // Contar cuántas multas y convenios están seleccionados
    const finesCount = Object.values(selectedPayments.fines).filter(Boolean).length
    const agreementsCount = Object.values(selectedPayments.agreements).filter(Boolean).length

    if (finesCount > 0) typeCode += "F"
    if (agreementsCount > 0) typeCode += "C"

    // Generar un número aleatorio de 3 dígitos para hacer la referencia única
    const randomNum = Math.floor(Math.random() * 900) + 100

    // Formato final: CASA-TIPO-RANDOM
    // Ejemplo: 42-MFC-123
    return `${houseNum}-${typeCode}-${randomNum}`
  }

  const reference = generateReference()

  // Función para copiar la referencia al portapapeles
  const copyReference = () => {
    navigator.clipboard.writeText(reference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert("Error: Usuario no encontrado")
      return
    }

    // Crear el desglose del pago basado en las selecciones
    const breakdown: PaymentBreakdown = {}

    if (selectedPayments.maintenance) {
      breakdown.maintenance = maintenancePrice
      if (isLate) {
        breakdown.surcharges = maintenanceLatePaymentFee
      }
    }

    // Agregar multas seleccionadas
    const selectedFines = userFines.filter((fine) => selectedPayments.fines[fine.id])
    if (selectedFines.length > 0) {
      breakdown.fines = selectedFines.map((fine) => ({
        id: fine.id,
        description: fine.reason,
        amount: fine.status === "overdue" ? fine.amount + fine.lateFee : fine.amount,
      }))
    }

    // Agregar convenios seleccionados
    const selectedAgreements = userAgreements.filter((agreement) => selectedPayments.agreements[agreement.id])
    if (selectedAgreements.length > 0) {
      breakdown.agreements = selectedAgreements.map((agreement) => ({
        id: agreement.id,
        description: agreement.description,
        amount: agreement.amount,
      }))
    }

    // Agregar pagos adelantados si se seleccionaron
    if (advanceMonths > 0) {
      const advancePayments = []
      for (let i = 1; i <= advanceMonths; i++) {
        const futureDate = new Date()
        futureDate.setMonth(futureDate.getMonth() + i)
        advancePayments.push({
          month: futureDate.getMonth() + 1,
          year: futureDate.getFullYear(),
          amount: maintenancePrice,
        })
      }
      breakdown.advancePayments = advancePayments
    }

    // Crear información del residente
    const residentInfo = {
      name: user.name,
      street: user.house.includes("Paseo") ? "Paseo del Cedro" : "Calle Principal", // Extraer calle del house
      houseNumber: user.house.match(/\d+/)?.[0] || user.house,
      phone: user.phone || "",
      email: user.email || "",
    }

    // Crear el pago
    const paymentId = addMaintenancePayment({
      userId: user.id,
      userName: user.name,
      residentInfo: residentInfo,
      amount: totalAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentMethod as "transfer" | "credit_card",
      status: paymentMethod === "credit_card" ? "completed" : "pending", // Tarjeta se acredita automáticamente
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      notes: paymentMethod === "transfer" ? `Referencia: ${reference}` : "Pago procesado automáticamente",
      breakdown: breakdown,
      residentStatus: "Ordinario",
      comments: paymentMethod === "transfer" ? "Pendiente de verificación" : "Procesado automáticamente",
    })

    if (paymentMethod === "transfer") {
      setShowTicket(true)
      // Crear notificación para administradores
      addNotice({
        title: "Nuevo pago pendiente de verificación",
        description: `${user.name} ha enviado un pago por transferencia de $${totalAmount.toLocaleString()}. Referencia: ${reference}`,
        type: "maintenance",
      })
    } else {
      // Pago con tarjeta - procesado automáticamente
      alert("¡Pago procesado exitosamente! Su pago ha sido acreditado automáticamente.")
      // Crear notificación de confirmación
      addNotice({
        title: "Pago procesado exitosamente",
        description: `Pago de $${totalAmount.toLocaleString()} procesado automáticamente para ${user.name}`,
        type: "maintenance",
      })
      // Redirigir al inicio
      window.location.href = "/"
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0e2c52] pb-20">
      <header className="container mx-auto py-4 px-4 max-w-7xl">
        <Link href="/" className="flex items-center text-white hover:text-gray-200">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver al inicio
        </Link>
      </header>
      <section className="container mx-auto flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-800 mx-auto">
          <h2 className="text-xl font-semibold mb-4">Información de Pago</h2>

          {/* Información de fecha límite */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-start">
            <Calendar className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Fecha límite de pago:</span> Día {maintenanceDueDay} de cada mes
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Los pagos realizados después de esta fecha tendrán un recargo de $
                {maintenanceLatePaymentFee.toLocaleString()}
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handlePaymentSubmit}>
            <div className="space-y-2">
              <label htmlFor="property" className="block text-sm font-medium">
                Propiedad
              </label>
              <select
                id="property"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9eff] text-gray-800"
                defaultValue={user?.house || ""}
              >
                <option value={user?.house || ""}>{user?.house || "Seleccionar propiedad"}</option>
              </select>
            </div>

            {/* Selección de pagos */}
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-sm border-b pb-2 mb-2">Seleccione lo que desea pagar:</h3>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="maintenance"
                  checked={selectedPayments.maintenance}
                  onCheckedChange={(checked) =>
                    setSelectedPayments({ ...selectedPayments, maintenance: checked === true })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="maintenance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mantenimiento mensual
                  </label>
                  <p className="text-xs text-muted-foreground">
                    ${maintenancePrice.toLocaleString()}
                    {isLate && (
                      <span className="text-red-500"> + ${maintenanceLatePaymentFee.toLocaleString()} (recargo)</span>
                    )}
                  </p>
                </div>
              </div>

              {userFines.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Multas pendientes</h4>
                    <div className="flex items-center">
                      <Checkbox
                        id="select-all-fines"
                        checked={
                          Object.values(selectedPayments.fines).every((v) => v === true) &&
                          Object.keys(selectedPayments.fines).length > 0
                        }
                        onCheckedChange={(checked) => handleSelectAllFines(checked === true)}
                      />
                      <label htmlFor="select-all-fines" className="ml-2 text-xs text-gray-600">
                        Seleccionar todas
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 pl-2">
                    {userFines.map((fine) => (
                      <div key={fine.id} className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
                        <Checkbox
                          id={fine.id}
                          checked={selectedPayments.fines[fine.id] || false}
                          onCheckedChange={(checked) => handleSelectFine(fine.id, checked === true)}
                        />
                        <div className="grid gap-0.5 leading-none flex-1">
                          <div className="flex justify-between items-center">
                            <label
                              htmlFor={fine.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {fine.reason}
                            </label>
                            <div className="text-right">
                              {fine.status === "overdue" ? (
                                <div>
                                  <span className="line-through text-gray-500 text-xs">
                                    ${fine.amount.toLocaleString()}
                                  </span>
                                  <span className="block font-semibold text-red-600 text-sm">
                                    ${(fine.amount + fine.lateFee).toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold">${fine.amount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              Vencimiento: {new Date(fine.dueDate).toLocaleDateString()}
                            </p>
                            {fine.status === "overdue" && (
                              <span className="text-xs text-red-600 font-medium">VENCIDA</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userAgreements.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Convenios de pago</h4>
                    <div className="flex items-center">
                      <Checkbox
                        id="select-all-agreements"
                        checked={
                          Object.values(selectedPayments.agreements).every((v) => v === true) &&
                          Object.keys(selectedPayments.agreements).length > 0
                        }
                        onCheckedChange={(checked) => handleSelectAllAgreements(checked === true)}
                      />
                      <label htmlFor="select-all-agreements" className="ml-2 text-xs text-gray-600">
                        Seleccionar todas
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 pl-2">
                    {userAgreements.map((agreement) => (
                      <div key={agreement.id} className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
                        <Checkbox
                          id={agreement.id}
                          checked={selectedPayments.agreements[agreement.id] || false}
                          onCheckedChange={(checked) => handleSelectAgreement(agreement.id, checked === true)}
                        />
                        <div className="grid gap-0.5 leading-none flex-1">
                          <div className="flex justify-between items-center">
                            <label
                              htmlFor={agreement.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {agreement.description}
                            </label>
                            <span className="text-sm font-semibold">${agreement.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500">Vencimiento: {agreement.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sección de pagos adelantados */}
            <div className="mt-4 border-t pt-3">
              <h4 className="text-sm font-medium mb-3">Adelantar pagos de meses siguientes</h4>

              {availableAdvanceMonths.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="advance-months" className="text-sm font-medium">
                      Meses a adelantar:
                    </label>
                    <select
                      id="advance-months"
                      value={advanceMonths}
                      onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9eff] text-gray-800"
                    >
                      <option value={0}>Seleccionar cantidad</option>
                      {availableAdvanceMonths.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.value} mes{month.value > 1 ? "es" : ""} (hasta {month.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  {advanceMonths > 0 && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Pagos adelantados:</span> {advanceMonths} mes
                        {advanceMonths > 1 ? "es" : ""}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Monto: ${(advanceMonths * maintenancePrice).toLocaleString()}
                      </p>
                      <div className="mt-2 text-xs text-green-600">
                        <p className="font-medium">Meses que se pagarán:</p>
                        {Array.from({ length: advanceMonths }, (_, i) => {
                          const futureDate = new Date()
                          futureDate.setMonth(futureDate.getMonth() + i + 1)
                          return (
                            <span key={i} className="inline-block mr-2">
                              • {futureDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    No hay meses disponibles para adelantar. Todos los pagos futuros ya están al corriente.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium">
                Monto a pagar
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  value={totalAmount}
                  readOnly
                  className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9eff] bg-gray-50 text-gray-800"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Total a pagar</p>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setShowLatePaymentInfo(!showLatePaymentInfo)}
                >
                  Ver desglose
                </button>
              </div>

              {/* Actualizar la sección de desglose para mostrar solo los elementos seleccionados */}
              {showLatePaymentInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedPayments.maintenance && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span>Cuota de mantenimiento:</span>
                        <span>${maintenancePrice.toLocaleString()}</span>
                      </div>
                      {isLate && (
                        <div className="flex justify-between text-red-600">
                          <span>Recargo por pago tardío:</span>
                          <span>${maintenanceLatePaymentFee.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  {userFines.map(
                    (fine) =>
                      selectedPayments.fines[fine.id] && (
                        <div key={fine.id} className="flex justify-between mb-1">
                          <span>Multa: {fine.reason}</span>
                          <span>
                            ${(fine.status === "overdue" ? fine.amount + fine.lateFee : fine.amount).toLocaleString()}
                          </span>
                        </div>
                      ),
                  )}

                  {userAgreements.map(
                    (agreement) =>
                      selectedPayments.agreements[agreement.id] && (
                        <div key={agreement.id} className="flex justify-between mb-1">
                          <span>{agreement.description}</span>
                          <span>${agreement.amount.toLocaleString()}</span>
                        </div>
                      ),
                  )}

                  {advanceMonths > 0 && (
                    <div className="flex justify-between mb-1 text-green-600">
                      <span>
                        Pagos adelantados ({advanceMonths} mes{advanceMonths > 1 ? "es" : ""}):
                      </span>
                      <span>${(advanceMonths * maintenancePrice).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 mt-2 pt-2 font-medium flex justify-between">
                    <span>Total:</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {isLate && selectedPayments.maintenance && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Pago con recargo</p>
                    <p>
                      Se ha aplicado un recargo de ${maintenanceLatePaymentFee.toLocaleString()} por pago después del
                      día límite.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="payment-method" className="block text-sm font-medium">
                Método de pago
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value)
                  setShowBankDetails(e.target.value === "transfer")
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a9eff] text-gray-800"
              >
                <option value="">Seleccionar método de pago</option>
                <option value="card">Tarjeta de crédito/débito</option>
                <option value="transfer">Transferencia bancaria</option>
              </select>
            </div>

            {/* Mostrar datos bancarios si se selecciona transferencia */}
            {showBankDetails && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-600" />
                  Datos para transferencia
                </h3>

                {bankingDetails ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Banco</p>
                      <p className="font-medium">{bankingDetails.bankName}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Titular</p>
                      <p className="font-medium">{bankingDetails.accountHolder}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">CLABE</p>
                      <p className="font-medium">{bankingDetails.clabe}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500">Referencia</p>
                        <button
                          type="button"
                          onClick={copyReference}
                          className="text-xs text-blue-600 flex items-center"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-medium bg-blue-50 p-2 rounded mt-1 text-center">{reference}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Esta referencia incluye información sobre su pago. Por favor úsela exactamente como se muestra.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">No hay datos bancarios disponibles</p>
                        <p className="text-xs text-red-700 mt-1">
                          Por favor contacte a la administración para obtener los datos bancarios actualizados.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bankingDetails && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Una vez realizada la transferencia, por favor envíe el comprobante de pago a la administración
                      para registrar su pago. Incluya la referencia en el concepto de la transferencia.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full bg-[#4a9eff] hover:bg-[#3b8de0] text-white"
              disabled={!paymentMethod}
              onClick={handlePaymentSubmit}
            >
              {paymentMethod === "transfer" ? "Confirmar pago por transferencia" : "Continuar con el pago"}
            </Button>
          </form>
          {showTicket && paymentMethod === "transfer" && (
            <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-center mb-4">Ticket de Pago</h3>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-center font-medium">
                    Por favor realiza tu transferencia con los siguientes datos:
                  </p>
                </div>

                {bankingDetails ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Banco</p>
                      <p className="font-medium">{bankingDetails.bankName}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Titular</p>
                      <p className="font-medium">{bankingDetails.accountHolder}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">CLABE</p>
                      <p className="font-medium">{bankingDetails.clabe}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-gray-500 text-sm">Monto a transferir</p>
                      <p className="font-bold text-lg">${totalAmount.toLocaleString()}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-sm">Referencia (incluir en concepto)</p>
                        <button
                          type="button"
                          onClick={copyReference}
                          className="text-xs text-blue-600 flex items-center"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-medium bg-blue-50 p-2 rounded mt-1 text-center">{reference}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">No hay datos bancarios disponibles</p>
                        <p className="text-xs text-red-700 mt-1">
                          Por favor contacte a la administración para obtener los datos bancarios actualizados.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 bg-yellow-50 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Una vez realizada la transferencia, por favor envía el comprobante de pago a la administración para
                    registrar tu pago. Tu pago será procesado en un plazo de 24-48 horas hábiles.
                  </p>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={() => setShowTicket(false)}>
                  Volver
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
