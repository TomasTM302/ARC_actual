"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAdminTasksStore } from "@/lib/admin-tasks-store"
import { useAuthStore } from "@/lib/auth"
import { useCondominiumStore } from "@/lib/condominium-store"

interface NewAdminTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

// Lista de departamentos disponibles
const DEPARTMENTS = [
  "Accesos y eventos",
  "Cobranza",
  "Finanzas",
  "Diseño",
  "Dirección general",
  "Coordinador",
  "Atención al cliente",
  "Jurídico",
  "Mantenimiento",
]

// Lista de categorías disponibles
const CATEGORIES = [
  "Reportes",
  "Reuniones",
  "Eventos",
  "Documentación",
  "Proyectos",
  "Seguimiento",
  "Capacitación",
  "Otros",
]

export default function NewAdminTaskModal({ isOpen, onClose }: NewAdminTaskModalProps) {
  const { addTask } = useAdminTasksStore()
  const { user, users } = useAuthStore()
  const { condominiums } = useCondominiumStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignedTo, setAssignedTo] = useState("")
  const [department, setDepartment] = useState("")
  const [category, setCategory] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [condominiumId, setCondominiumId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obtener solo usuarios administrativos
  const adminUsers = users.filter((user) => user.role === "admin")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !assignedTo || !user) return

    setIsSubmitting(true)

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "pending",
      assignedTo,
      assignedBy: user.id,
      department: department || "Sin departamento",
      category: category || "Sin categoría",
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      condominiumId: condominiumId || null,
    })

    setIsSubmitting(false)
    setTitle("")
    setDescription("")
    setPriority("medium")
    setAssignedTo("")
    setDepartment("")
    setCategory("")
    setDueDate("")
    setCondominiumId("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[650px] max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">Nueva Tarea Administrativa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              required
              className="bg-gray-200 text-black p-3 text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="description" className="text-lg">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada de la tarea..."
              className="bg-gray-200 text-black min-h-[120px] p-3 text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-lg">Prioridad</Label>
            <div className="flex space-x-4">
              <div
                className={`flex-1 p-4 rounded-md cursor-pointer flex items-center justify-center text-lg font-medium ${
                  priority === "low" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setPriority("low")}
              >
                Baja
              </div>
              <div
                className={`flex-1 p-4 rounded-md cursor-pointer flex items-center justify-center text-lg font-medium ${
                  priority === "medium" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setPriority("medium")}
              >
                Media
              </div>
              <div
                className={`flex-1 p-4 rounded-md cursor-pointer flex items-center justify-center text-lg font-medium ${
                  priority === "high" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setPriority("high")}
              >
                Alta
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="department" className="text-lg">
              Departamento (opcional)
            </Label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-lg"
            >
              <option value="">Seleccionar departamento (opcional)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="condominium" className="text-lg">
              Condominio
            </Label>
            <select
              id="condominium"
              value={condominiumId}
              onChange={(e) => setCondominiumId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-lg"
              required
            >
              <option value="">Seleccionar condominio</option>
              {condominiums.map((condo) => (
                <option key={condo.id} value={condo.id}>
                  {condo.name}
                </option>
              ))}
            </select>
            {condominiums.length === 0 && (
              <p className="text-red-500 text-sm">No hay condominios disponibles. Debes crear condominios primero.</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="category" className="text-lg">
              Categoría (opcional)
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-lg"
            >
              <option value="">Seleccionar categoría (opcional)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="dueDate" className="text-lg">
              Fecha límite
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-gray-200 text-black p-3 text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="assignedTo" className="text-lg">
              Asignar a Administrador
            </Label>
            <select
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-lg"
              required
            >
              <option value="">Seleccionar administrador</option>
              {adminUsers.length > 0 ? (
                adminUsers.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.firstName} {admin.lastName} - Admin
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hay administradores disponibles
                </option>
              )}
            </select>
            {adminUsers.length === 0 && (
              <p className="text-red-500 text-sm">
                No hay usuarios con rol de administrador disponibles. Debes crear usuarios administradores primero.
              </p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-200 text-black hover:bg-gray-300 text-lg p-6 h-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg p-6 h-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
