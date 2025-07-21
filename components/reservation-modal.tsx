"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { useAuthStore } from "@/lib/auth"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  areaId: string
  areaName: string
  maxPeople: number
  deposit: number
  operatingHours: string
  maxDuration: number
}

export default function ReservationModal({
  isOpen,
  onClose,
  areaId,
  areaName,
  maxPeople,
  deposit,
  operatingHours,
  maxDuration,
}: ReservationModalProps) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [date, setDate] = useState<Date>(new Date())
  const [people, setPeople] = useState<number>(4)
  const [startTime, setStartTime] = useState<string>("10:00")
  const [endTime, setEndTime] = useState<string>("14:00")
  const [paymentMethod, setPaymentMethod] = useState<"Tarjeta" | "Transferencia">("Tarjeta")

  // Calculate max reservation date (7 days from now)
  const maxDate = addDays(new Date(), 7)
  const formattedMaxDate = format(maxDate, "d 'de' MMMM 'de' yyyy", { locale: es })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2)
    } else {
      setLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const res = await fetch("/api/reservaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: user?.id,
            area_comun_id: areaId,
            fecha_reservacion: format(date, "yyyy-MM-dd"),
            hora_inicio: startTime,
            hora_fin: endTime,
            num_invitados: people,
            proposito: "Reserva de área común",
            tipo_pago: paymentMethod,
          }),
        })
        const data = await res.json()
        if (data.success) {
          setSuccess("Reserva enviada con éxito")
          setTimeout(() => {
            onClose()
            setStep(1)
            setSuccess(null)
          }, 1500)
        } else {
          setError(data.message || "Error al reservar")
        }
      } catch (err) {
        setError("Error de red o servidor")
      }
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
    setStep(1)
  }

  // Generate time options
  const generateTimeOptions = () => {
    const options = []
    // Default to 08:00 - 20:00 if operatingHours is not properly formatted
    const timeRange = operatingHours && operatingHours.includes(" - ") ? operatingHours : "08:00 - 20:00"

    const [startTimeStr, endTimeStr] = timeRange.split(" - ")

    // Parse start time
    const startParts = startTimeStr.split(":")
    const startHour = Number.parseInt(startParts[0], 10) || 8
    const startMinute = Number.parseInt(startParts[1], 10) || 0

    // Parse end time
    const endParts = endTimeStr.split(":")
    const endHour = Number.parseInt(endParts[0], 10) || 20
    const endMinute = Number.parseInt(endParts[1], 10) || 0

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip times after end hour
        if (hour === endHour && minute > endMinute) continue

        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }

    return options
  }

  const timeOptions = generateTimeOptions()

  // Generate calendar
  const renderCalendar = () => {
    const currentDate = new Date(date)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1 // Adjust for Monday start

    const monthName = format(currentDate, "MMMM yyyy", { locale: es })

    const days = []

    // Previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1)
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isDisabled: true,
      })
    }

    // Current month days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i)
      const isDisabled = currentDay < today || currentDay > maxDate

      days.push({
        date: currentDay,
        isCurrentMonth: true,
        isDisabled,
        isSelected:
          currentDay.getDate() === date.getDate() &&
          currentDay.getMonth() === date.getMonth() &&
          currentDay.getFullYear() === date.getFullYear(),
      })
    }

    // Next month days to fill the grid
    const remainingCells = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i)
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isDisabled: true,
      })
    }

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    const handlePrevMonth = () => {
      const newDate = new Date(date)
      newDate.setMonth(newDate.getMonth() - 1)
      setDate(newDate)
    }

    const handleNextMonth = () => {
      const newDate = new Date(date)
      newDate.setMonth(newDate.getMonth() + 1)
      setDate(newDate)
    }

    const handleDateClick = (day) => {
      if (!day.isDisabled) {
        setDate(day.date)
      }
    }

    return (
      <div className="w-full">
        <div className="bg-[#0e2c52] text-white rounded-t-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="text-white p-1 rounded-full hover:bg-blue-700">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-medium">{monthName}</h3>
            <button onClick={handleNextMonth} className="text-white p-1 rounded-full hover:bg-blue-700">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day, index) => (
              <div key={index} className="text-sm font-medium py-1">
                {day}
              </div>
            ))}

            {days.map((day, index) => (
              <button
                key={index}
                disabled={day.isDisabled}
                onClick={() => handleDateClick(day)}
                className={`
                  p-2 text-center rounded-md
                  ${!day.isCurrentMonth ? "text-gray-400" : "text-white"}
                  ${day.isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
                  ${day.isSelected ? "bg-blue-700" : ""}
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-white border border-t-0 rounded-b-lg">
          <p className="text-sm text-black">
            Fecha seleccionada: {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
            <p className="text-green-700 text-sm">
              No hay reservaciones para esta fecha. Horario completamente disponible.
            </p>
          </div>

          <p className="text-sm text-gray-700 mt-2">
            Puedes reservar con máximo 7 días de anticipación (hasta el {formattedMaxDate})
          </p>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-black">Reservar {areaName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 1 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-2 text-black">Selecciona la fecha y horario para tu reservación</h3>

              <div>
                <h4 className="text-base font-medium mb-2 text-black">Fecha</h4>
                {renderCalendar()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-base font-medium mb-2 text-black">Hora de inicio</h4>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] bg-white text-black"
                  >
                    {timeOptions.slice(0, -1).map((time) => (
                      <option key={time} value={time} className="text-black bg-white">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-2 text-black">Hora de fin</h4>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] bg-white text-black"
                  >
                    {timeOptions.slice(1).map((time) => (
                      <option key={time} value={time} className="text-black bg-white">
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Restrictions box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h3 className="text-blue-800 font-medium">Restricciones de horario:</h3>
                <ul className="list-disc pl-5 text-blue-700">
                  <li>Horario de operación: {operatingHours}</li>
                  <li>Duración máxima: {maxDuration} horas</li>
                </ul>
              </div>

              {/* Number of people */}
              <div>
                <h4 className="text-base font-medium mb-2 text-black">Número de personas</h4>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max={maxPeople}
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] bg-white text-black"
                  />
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  Máximo {maxPeople} personas para este {areaName.toLowerCase()}.
                </p>
              </div>

              {/* Deposit */}
              <div>
                <h4 className="text-lg font-medium mb-2 text-black">Depósito reembolsable:</h4>
                <p className="text-2xl font-bold text-[#0066cc]">${deposit}</p>
                <p className="text-sm text-gray-700 mt-1">
                  El depósito será reembolsado después de verificar el estado del área.
                </p>
              </div>

              {/* Payment method */}
              <div>
                <h4 className="text-base font-medium mb-2 text-black">Método de pago</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center text-black">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Tarjeta"}
                      onChange={() => setPaymentMethod("Tarjeta")}
                      className="mr-2"
                    />
                    Tarjeta
                  </label>
                  <label className="flex items-center text-black">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Transferencia"}
                      onChange={() => setPaymentMethod("Transferencia")}
                      className="mr-2"
                    />
                    Transferencia
                  </label>
                </div>
              </div>

              {/* Reservation details */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="text-blue-800 font-medium mb-1">Reservado por:</h4>
                <p className="text-blue-800">
                  {user?.firstName} {user?.lastName} ({user?.house})
                </p>
                <h4 className="text-blue-800 font-medium mt-2 mb-1">Contacto:</h4>
                <p className="text-blue-800">
                  {user?.email} | {user?.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-2 text-black">Confirma tu reservación</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="font-medium mb-2 text-black">Detalles de la reservación:</h4>
                <ul className="space-y-2 text-black">
                  <li>
                    <span className="font-medium">Área:</span> {areaName}
                  </li>
                  <li>
                    <span className="font-medium">Fecha:</span> {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </li>
                  <li>
                    <span className="font-medium">Horario:</span> {startTime} - {endTime}
                  </li>
                  <li>
                    <span className="font-medium">Número de personas:</span> {people}
                  </li>
                  <li>
                    <span className="font-medium">Depósito:</span> ${deposit}
                  </li>
                  <li>
                    <span className="font-medium">Método de pago:</span>{" "}
                    {paymentMethod === "Tarjeta" ? "Tarjeta" : "Transferencia"}
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-yellow-800 font-medium mb-2">Importante:</h4>
                <p className="text-yellow-800 text-sm">
                  Al confirmar esta reservación, aceptas las políticas de uso de áreas comunes y te comprometes a seguir
                  las reglas establecidas por la administración.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="destructive" onClick={handleCancel} className="text-white" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleContinue} className="bg-[#0066cc] hover:bg-[#0052a3] text-white" disabled={loading}>
            {loading ? "Procesando..." : step === 1 ? "Continuar" : "Reservar"}
          </Button>
        </DialogFooter>
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      </DialogContent>
    </Dialog>
  )
}
