"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMantenimientoTasksStore } from "@/lib/mantenimiento-tasks-store"
import { useAuthStore } from "@/lib/auth"
import { ImagePlus, X } from "lucide-react"
import { usePathname } from "next/navigation"

interface NewReportModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCondominium?: string
}

const SECTIONS = [
  "Torre A",
  "Torre B",
  "Torre C",
  "Área Común",
  "Estacionamiento",
  "Jardines",
  "Alberca",
  "Gimnasio",
  "Salón de eventos",
]

const CONDOMINIUMS = [
  "Condominio 1-Los Arcos",
  "Condominio 2-Las Palmas",
  "Condominio 3-Vista Hermosa",
  "Condominio 4-El Mirador",
]

const CONDOMINIUM_ID_MAP: Record<string, string> = {
  "condo-1": "Condominio 1-Los Arcos",
  "condo-2": "Condominio 2-Las Palmas",
  "condo-3": "Condominio 3-Vista Hermosa",
  "condo-4": "Condominio 4-El Mirador",
}

export default function NewReportModal({ isOpen, onClose, preselectedCondominium }: NewReportModalProps) {
  const { addReport } = useMantenimientoTasksStore()
  const { user } = useAuthStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [section, setSection] = useState("")
  const [condominium, setCondominium] = useState(preselectedCondominium || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      if (preselectedCondominium) {
        const mappedCondominium = CONDOMINIUM_ID_MAP[preselectedCondominium]
        if (mappedCondominium) {
          setCondominium(mappedCondominium)
        } else if (CONDOMINIUMS.includes(preselectedCondominium)) {
          setCondominium(preselectedCondominium)
        }
      } else {
        const pathSegments = pathname.split("/")
        const condoIndex = pathSegments.findIndex((segment) => segment.startsWith("condo-"))
        if (condoIndex !== -1) {
          const condoId = pathSegments[condoIndex]
          const mappedCondominium = CONDOMINIUM_ID_MAP[condoId]
          if (mappedCondominium) {
            setCondominium(mappedCondominium)
          }
        } else {
          setCondominium("")
        }
      }
    }
  }, [preselectedCondominium, isOpen, pathname])

  useEffect(() => {
    if (!isOpen) {
      setTitle("")
      setDescription("")
      setSection("")
      setImages([])
      setPreviewImages([])
      if (!preselectedCondominium) {
        setCondominium("")
      }
    }
  }, [isOpen, preselectedCondominium])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setPreviewImages((prev) => [...prev, event.target!.result as string])
            setImages((prev) => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !user || !section || !condominium) return
    setIsSubmitting(true)
    addReport({
      title: title.trim(),
      description: description.trim(),
      auxiliarId: user.id, // puedes renombrar a mantenimientoId si lo deseas
      auxiliarName: `${user.firstName} ${user.lastName}`,
      images: images,
      status: "pending",
      section: section,
      condominium: condominium,
    })
    setIsSubmitting(false)
    setTitle("")
    setDescription("")
    setSection("")
    setCondominium(preselectedCondominium ? CONDOMINIUM_ID_MAP[preselectedCondominium] || preselectedCondominium : "")
    setImages([])
    setPreviewImages([])
    onClose()
  }

  const isCondominiumDisabled = !!preselectedCondominium || pathname.includes("/condo-")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pb-2">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-xl pr-8">Nueva Actividad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la actividad"
              required
              className="bg-gray-200 text-black text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condominium" className="text-sm">
              Condominio
            </Label>
            <select
              key={`condominium-select-${isOpen ? "open" : "closed"}`}
              id="condominium"
              value={condominium}
              onChange={(e) => setCondominium(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-base disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isCondominiumDisabled}
            >
              {!preselectedCondominium && !pathname.includes("/condo-") && (
                <option value="">Seleccionar condominio</option>
              )}
              {preselectedCondominium || pathname.includes("/condo-") ? (
                <option key={condominium} value={condominium}>
                  {condominium}
                </option>
              ) : (
                CONDOMINIUMS.map((condo) => (
                  <option key={condo} value={condo}>
                    {condo}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="section" className="text-sm">
              Sección
            </Label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black text-base"
              required
            >
              <option value="">Seleccionar sección</option>
              {SECTIONS.map((sect) => (
                <option key={sect} value={sect}>
                  {sect}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actividad o situación..."
              className="bg-gray-200 text-black min-h-[120px] text-base"
              required
            />
          </div>
          {/* Sección para subir imágenes */}
          <div className="space-y-2">
            <Label className="text-sm">Imágenes</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative w-16 h-16">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer py-3">
                <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Toca para agregar imágenes</span>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-200 text-black hover:bg-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Crear Actividad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
