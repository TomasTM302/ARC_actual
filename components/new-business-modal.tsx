"use client"

import type React from "react"

import { useState } from "react"
import { X, Save, Store, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth"
import { useAppStore } from "@/lib/store"

interface NewBusinessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewBusinessModal({ isOpen, onClose }: NewBusinessModalProps) {
  const { user } = useAuthStore()
  const { addNearbyBusiness } = useAppStore()

  const [formData, setFormData] = useState({
    name: "",
    category: "restaurant",
    address: "",
    phone: "",
    websiteUrl: "",
    schedule: "",
    description: "",
    imageUrl: "/placeholder.svg?height=200&width=200",
    discount: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validate form
    if (!formData.name) {
      setError("Por favor ingrese el nombre del comercio")
      setIsSubmitting(false)
      return
    }

    if (!formData.address) {
      setError("Por favor ingrese la dirección del comercio")
      setIsSubmitting(false)
      return
    }

    // In a real app, you would save the data to your backend here
    const newBusiness = {
      id: `business-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || "unknown",
    }

    addNearbyBusiness(newBusiness)

    // Show success message
    setSuccess("Comercio creado exitosamente")
    setIsSubmitting(false)

    // Reset form and close modal after delay
    setTimeout(() => {
      onClose()

      // Reset form after the modal is closed
      setFormData({
        name: "",
        category: "restaurant",
        address: "",
        phone: "",
        websiteUrl: "",
        schedule: "",
        description: "",
        imageUrl: "/placeholder.svg?height=200&width=200",
        discount: "",
      })
      setSuccess(null)
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl text-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Nuevo Comercio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre del comercio
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                placeholder="Ej: Restaurante El Buen Sabor"
                required
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                required
              >
                <option value="restaurant">Restaurante</option>
                <option value="supermarket">Supermercado</option>
                <option value="pharmacy">Farmacia</option>
                <option value="bakery">Panadería</option>
                <option value="cafe">Café</option>
                <option value="gym">Gimnasio</option>
                <option value="beauty">Salón de belleza</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                placeholder="Ej: Calle Principal #123"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                placeholder="Ej: (123) 456-7890"
              />
            </div>

            {/* Sitio web */}
            <div className="space-y-2">
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                Sitio web
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="url"
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                  placeholder="https://www.ejemplo.com"
                />
              </div>
            </div>

            {/* Horario */}
            <div className="space-y-2">
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                Horario
              </label>
              <input
                type="text"
                id="schedule"
                value={formData.schedule}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
                placeholder="Ej: Lun-Vie: 9am-6pm, Sáb: 10am-2pm"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
              placeholder="Describa brevemente el comercio y sus servicios"
            ></textarea>
          </div>

          {/* Descuento para residentes */}
          <div className="space-y-2">
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
              Descuento para residentes (opcional)
            </label>
            <input
              type="text"
              id="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
              placeholder="Ej: 10% presentando credencial de residente"
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Imagen (por implementar)</label>
            <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              <Store className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">La funcionalidad para subir imágenes se implementará próximamente</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#3b6dc7] hover:bg-[#2d5db3] text-white" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Guardando..." : "Guardar Comercio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
