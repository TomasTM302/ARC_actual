"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Bell, AlertTriangle, Wrench, Save, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

interface CreateNoticeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateNoticeModal({ isOpen, onClose }: CreateNoticeModalProps) {
  const { addNotice } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
  })
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Crear URL para previsualización
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image)
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validar campos
      if (!formData.title.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (!formData.description.trim()) {
        throw new Error("La descripción es obligatoria")
      }

      // Crear aviso
      addNotice({
        title: formData.title,
        description: formData.description,
        type: formData.type as "general" | "emergency" | "maintenance" | "pet",
        imageUrl: image || undefined,
      })

      // Limpiar formulario y cerrar modal
      setFormData({
        title: "",
        description: "",
        type: "general",
      })
      setImage(null)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Ocurrió un error al crear el aviso")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "maintenance":
        return <Wrench className="h-5 w-5 text-yellow-500" />
      case "pet":
        return <Bell className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl text-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Crear Nuevo Aviso</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">
              Tipo de aviso
            </label>
            <div className="flex items-center space-x-2">
              {getTypeIcon(formData.type)}
              <select
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
              >
                <option value="general">General</option>
                <option value="emergency">Emergencia</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7]"
              placeholder="Título del aviso"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7]"
              placeholder="Descripción detallada del aviso"
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Imagen (opcional)</label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

            {image ? (
              <div className="relative">
                <img
                  src={image || "/placeholder.svg"}
                  alt="Vista previa"
                  className="max-h-64 rounded-md object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Haz clic para subir una imagen</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 5MB</p>
              </div>
            )}
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
              {isSubmitting ? "Guardando..." : "Publicar Aviso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
