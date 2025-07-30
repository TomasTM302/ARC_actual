"use client"

import React from "react"

import { useState, useRef } from "react"
import { useAuthStore } from "@/lib/auth"
import { X, Bell, AlertTriangle, Wrench, Save, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

interface CreateNoticeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateNoticeModal({ isOpen, onClose }: CreateNoticeModalProps) {
  // const { addNotice } = useAppStore() // Eliminado
  const { user } = useAuthStore()
  const [condominios, setCondominios] = useState<any[]>([])
  const [selectedCondominio, setSelectedCondominio] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general", // 'general', 'emergencia', 'mantenimiento'
    fecha_expiracion: "",
  })
  // Obtener lista de condominios al abrir el modal
  React.useEffect(() => {
    if (isOpen) {
      fetch("/api/condominios")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setCondominios(data.condominiums)
        })
    }
  }, [isOpen])
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    if (id === "condominio") setSelectedCondominio(value)
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

    const uploadImage = async (): Promise<string | undefined> => {
      if (!fileInputRef.current || !fileInputRef.current.files?.[0]) return undefined;
      const file = fileInputRef.current.files[0];
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (data.success && data.url) {
          return data.url;
        } else {
          setError(data.message || "Error al subir la imagen");
          return undefined;
        }
      } catch (err) {
        setError("Error de red al subir la imagen");
        return undefined;
      }
    };

    (async () => {
      try {
        // Validar campos
        if (!formData.title.trim()) {
          throw new Error("El título es obligatorio");
        }
        if (!formData.description.trim()) {
          throw new Error("La descripción es obligatoria");
        }

        let imageUrl: string | undefined = undefined;
        if (fileInputRef.current && fileInputRef.current.files?.[0]) {
          imageUrl = await uploadImage();
        }

        // Aquí debes obtener autor_id y condominio_id según tu contexto de usuario
        // Formatear fecha de publicación para MySQL
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const fecha_publicacion = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        // Usar fecha de expiración si se seleccionó
        let fecha_expiracion = null;
        if (formData.fecha_expiracion) {
          const exp = new Date(formData.fecha_expiracion);
          fecha_expiracion = `${exp.getFullYear()}-${pad(exp.getMonth()+1)}-${pad(exp.getDate())} 23:59:59`;
        }

        // Mapear el tipo a español
        let tipoAviso = formData.type;
        if (tipoAviso === "emergency") tipoAviso = "emergencia";
        if (tipoAviso === "maintenance") tipoAviso = "mantenimiento";
        // 'general' ya está en español
        const avisoPayload = {
          titulo: formData.title,
          contenido: formData.description,
          autor_id: user?.id || null,
          condominio_id: selectedCondominio,
          fecha_publicacion,
          fecha_expiracion,
          imagen_url: imageUrl,
          importante: tipoAviso,
        };
        console.log("Payload enviado a /api/avisos:", avisoPayload);

        const res = await fetch("/api/avisos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(avisoPayload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Error al guardar el aviso");

        // Limpiar formulario y cerrar modal
        setFormData({
          title: "",
          description: "",
          type: "general",
          fecha_expiracion: "",
        });
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocurrió un error al crear el aviso");
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergencia":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "mantenimiento":
        return <Wrench className="h-5 w-5 text-yellow-500" />
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
          <label htmlFor="fecha_expiracion" className="block text-sm font-medium">Fecha de expiración (opcional)</label>
          <input
            type="date"
            id="fecha_expiracion"
            value={formData.fecha_expiracion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="condominio" className="block text-sm font-medium">Condominio</label>
          <select
            id="condominio"
            value={selectedCondominio}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b6dc7] text-gray-800"
            required
          >
            <option value="">Selecciona un condominio</option>
            {condominios.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
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
                <option value="emergencia">Emergencia</option>
                <option value="mantenimiento">Mantenimiento</option>
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
