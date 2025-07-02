"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  onImagesChange?: (images: string[]) => void
}

export default function ImageUpload({ maxFiles = 5, maxSize = 5, onImagesChange }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Efecto para llamar a onImagesChange cuando cambien las previews
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(previews)
    }
  }, [previews, onImagesChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Check if adding these files would exceed the max number
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} imágenes`)
      return
    }

    // Check file sizes
    const oversizedFiles = selectedFiles.filter((file) => file.size > maxSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError(`Algunos archivos exceden el tamaño máximo de ${maxSize}MB`)
      return
    }

    // Clear any previous errors
    setError(null)

    // Create preview URLs
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))

    // Update state
    setFiles((prev) => [...prev, ...selectedFiles])
    setPreviews((prev) => {
      const newPreviewsValue = [...prev, ...newPreviews]
      return newPreviewsValue
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index])

    // Remove the file and preview from state
    setFiles(files.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const newPreviewsValue = prev.filter((_, i) => i !== index)
      return newPreviewsValue
    })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const droppedFiles = Array.from(e.dataTransfer.files)

    // Only process image files
    const imageFiles = droppedFiles.filter((file) => file.type.startsWith("image/"))

    // Check if adding these files would exceed the max number
    if (files.length + imageFiles.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} imágenes`)
      return
    }

    // Check file sizes
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError(`Algunos archivos exceden el tamaño máximo de ${maxSize}MB`)
      return
    }

    // Clear any previous errors
    setError(null)

    // Create preview URLs
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file))

    // Update state
    setFiles((prev) => [...prev, ...imageFiles])
    setPreviews((prev) => {
      const newPreviewsValue = [...prev, ...newPreviews]
      return newPreviewsValue
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          error ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">Arrastra y suelta imágenes aquí o</p>
          <Button
            type="button"
            className="bg-[#e8f0fe] text-[#0e2c52] hover:bg-[#d8e0ee]"
            onClick={() => fileInputRef.current?.click()}
          >
            Seleccionar archivos
          </Button>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF hasta {maxSize}MB</p>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview || "/placeholder.svg"}
                alt={`Vista previa ${index + 1}`}
                className="h-24 w-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
