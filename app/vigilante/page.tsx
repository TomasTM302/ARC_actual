"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth"
import { QrScanner } from "@/components/qr-scanner"
import { ScanBarcode, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useEntryHistoryStore } from "@/lib/entry-history-store"

interface QrData {
  [key: string]: string
}

export default function VigilanteDashboardPage() {
  const { user } = useAuthStore()
  const { addEntry } = useEntryHistoryStore()
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [scannedData, setScannedData] = useState<QrData | null>(null)

  const parseQrData = (data: string): QrData => {
    // Parse the QR data which is in format "KEY: Value\nKEY: Value"
    const lines = data.split("\n")
    const parsedData: QrData = {}

    lines.forEach((line) => {
      const colonIndex = line.indexOf(":")
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        parsedData[key] = value
      }
    })

    return parsedData
  }

  const handleScan = (data: string) => {
    if (data) {
      try {
        const parsedData = parseQrData(data)
        setScannedData(parsedData)
        setShowModal(true)
        setIsScanning(false)
        setScanError(null)

        // Registrar la entrada en el historial
        if (parsedData.NOMBRE || parsedData.NOMBRE) {
          addEntry({
            visitorName: parsedData.NOMBRE || "Visitante",
            destination: parsedData.DIRECCIÓN || parsedData.DIRECCION || "No especificado",
            companions:
              parsedData.ACOMPAÑANTES || parsedData.ACOMPANANTES
                ? Number.parseInt(parsedData.ACOMPAÑANTES || parsedData.ACOMPANANTES, 10)
                : 0,
            phoneNumber: parsedData.TELÉFONO || parsedData.TELEFONO,
          })
        }
      } catch (error) {
        console.error("Error parsing QR data:", error)
        setScanError("Error al procesar los datos del código QR")
        setIsScanning(false)
      }
    }
  }

  const handleError = (err: any) => {
    console.error("QR Scanner error in vigilante page:", err)
    setScanError(typeof err === "string" ? err : "Error al escanear el código QR. Por favor, intente de nuevo.")
    setIsScanning(false)
  }

  const startScanning = () => {
    setIsScanning(true)
    setScannedData(null)
    setScanError(null)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  // Function to get a friendly label for the QR data keys
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      NOMBRE: "Nombre",
      TELÉFONO: "Teléfono",
      TELEFONO: "Teléfono",
      FECHA: "Fecha de visita",
      HORA: "Hora de entrada",
      DIRECCIÓN: "Destino",
      DIRECCION: "Destino",
      ACOMPAÑANTES: "Acompañantes",
      ACOMPANANTES: "Acompañantes",
    }
    return labels[key] || key
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ScanBarcode className="h-6 w-6 mr-2 text-[#3b6dc7]" />
          <h2 className="text-2xl font-semibold">Escanear QR</h2>
        </div>
      </div>

      {!isScanning && !scanError && (
        <div className="text-center py-8">
          <div className="mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-[#3b6dc7] opacity-70" />
            <p className="text-lg mb-2">Bienvenido, {user?.firstName || "Vigilante"}</p>
            <p className="text-gray-600">Escanee códigos QR de visitantes para verificar su acceso</p>
          </div>

          <Button
            className="w-full max-w-md bg-[#3b6dc7] hover:bg-[#2d5db3] text-white py-6 text-lg"
            onClick={startScanning}
          >
            <ScanBarcode className="mr-2 h-6 w-6" />
            Escanear Código QR
          </Button>
        </div>
      )}

      {isScanning && (
        <div className="bg-white rounded-lg p-4 w-full text-gray-800 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Escanear Código QR</h2>
          <div className="relative">
            <QrScanner onScan={handleScan} onError={handleError} />
            <Button
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setIsScanning(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {scanError && (
        <div className="bg-white rounded-lg p-6 w-full text-gray-800 mb-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p className="font-bold">Error al escanear</p>
            <span className="block sm:inline">{scanError}</span>
            <p className="mt-2 text-sm">
              Asegúrese de que su cámara esté habilitada y que el código QR esté bien iluminado y enfocado.
            </p>
          </div>
          <Button className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white" onClick={startScanning}>
            Intentar de nuevo
          </Button>
        </div>
      )}

      {/* Modal para mostrar los datos del QR */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Información del Visitante</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </DialogHeader>

          {scannedData && (
            <div className="space-y-4 py-2">
              {Object.entries(scannedData).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500">{getFieldLabel(key)}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  className="w-full bg-[#3b6dc7] hover:bg-[#2d5db3] text-white"
                  onClick={() => {
                    closeModal()
                    startScanning()
                  }}
                >
                  <ScanBarcode className="mr-2 h-4 w-4" />
                  Escanear otro código
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
