"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { saveAs } from "file-saver"
import { getBase64Image } from "@/lib/base64"

interface Invitado {
  id: number
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  direccion: string
  localidad: string
  provincia: string
  codigo_postal: string
  pais: string
  empresa: string
  cargo: string
  acreditacion: string
  fecha_alta: string
  observaciones: string
}

const InvitadosPage = () => {
  const [invitados, setInvitados] = useState<Invitado[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Invitado | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedInvitados, setSelectedInvitados] = useState<number[]>([])
  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    const fetchInvitados = async () => {
      try {
        const response = await fetch("/api/invitados")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Invitado[] = await response.json()
        setInvitados(data)
      } catch (error) {
        console.error("Could not fetch invitados:", error)
      }
    }

    fetchInvitados()
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1) // Reset to the first page when searching
  }

  const handleSort = (column: keyof Invitado) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredInvitados = invitados.filter((invitado) =>
    Object.values(invitado).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const sortedInvitados = [...filteredInvitados].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    } else {
      return 0
    }
  })

  const indexOfLastInvitado = currentPage * itemsPerPage
  const indexOfFirstInvitado = indexOfLastInvitado - itemsPerPage
  const currentInvitados = sortedInvitados.slice(indexOfFirstInvitado, indexOfLastInvitado)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(filteredInvitados.length / itemsPerPage); i++) {
    pageNumbers.push(i)
  }

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number.parseInt(event.target.value, 10))
    setCurrentPage(1) // Reset to the first page when items per page changes
  }

  const toggleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedInvitados(currentInvitados.map((invitado) => invitado.id))
    } else {
      setSelectedInvitados([])
    }
  }

  const toggleInvitadoSelection = (id: number) => {
    if (selectedInvitados.includes(id)) {
      setSelectedInvitados(selectedInvitados.filter((invitadoId) => invitadoId !== id))
      setSelectAll(false)
    } else {
      setSelectedInvitados([...selectedInvitados, id])
      if (selectedInvitados.length === currentInvitados.length - 1) {
        setSelectAll(true)
      }
    }
  }

  const isInvitadoSelected = (id: number) => selectedInvitados.includes(id)

  const generatePdf = async () => {
    if (selectedInvitados.length === 0) {
      alert("Por favor, seleccione al menos un invitado.")
      return
    }

    const doc = new jsPDF()

    // Cargar el logo como base64
    const logoBase64 = await getBase64Image(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arcos-logo-gold-SmYxo3YbzpR6cSrez7b5uPEi6BQn5m.png",
    )

    // Agregar el logo al PDF
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 10, 10, 50, 15) // Ajusta las coordenadas y dimensiones según sea necesario
    }

    doc.setFontSize(18)
    doc.text("Lista de Invitados", 105, 30, { align: "center" })

    const tableColumn = ["Nombre", "Apellido", "DNI", "Email", "Empresa"]
    const tableRows: string[][] = []

    selectedInvitados.forEach((id) => {
      const invitado = invitados.find((inv) => inv.id === id)
      if (invitado) {
        const invitadoData = [invitado.nombre, invitado.apellido, invitado.dni, invitado.email, invitado.empresa]
        tableRows.push(invitadoData)
      }
    })
    ;(doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    })

    doc.save("invitados.pdf")
  }

  const generateCsv = () => {
    if (selectedInvitados.length === 0) {
      alert("Por favor, seleccione al menos un invitado.")
      return
    }

    const header = [
      "Nombre",
      "Apellido",
      "DNI",
      "Email",
      "Telefono",
      "Direccion",
      "Localidad",
      "Provincia",
      "Codigo Postal",
      "Pais",
      "Empresa",
      "Cargo",
      "Acreditacion",
      "Fecha Alta",
      "Observaciones",
    ]
    const csvRows = [header.join(",")]

    selectedInvitados.forEach((id) => {
      const invitado = invitados.find((inv) => inv.id === id)
      if (invitado) {
        const values = [
          invitado.nombre,
          invitado.apellido,
          invitado.dni,
          invitado.email,
          invitado.telefono,
          invitado.direccion,
          invitado.localidad,
          invitado.provincia,
          invitado.codigo_postal,
          invitado.pais,
          invitado.empresa,
          invitado.cargo,
          invitado.acreditacion,
          invitado.fecha_alta,
          invitado.observaciones,
        ]
        const row = values.map((value) => `"${value}"`).join(",")
        csvRows.push(row)
      }
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "invitados.csv")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Invitados</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={searchTerm}
          onChange={handleSearch}
        />

        <div>
          <label htmlFor="itemsPerPage" className="mr-2">
            Mostrar:
          </label>
          <select
            id="itemsPerPage"
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={generatePdf}
        >
          Generar PDF
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={generateCsv}
        >
          Generar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md" ref={tableRef}>
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("nombre")}>
                Nombre {sortColumn === "nombre" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("apellido")}>
                Apellido {sortColumn === "apellido" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("dni")}>
                DNI {sortColumn === "dni" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("email")}>
                Email {sortColumn === "email" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("telefono")}>
                Teléfono {sortColumn === "telefono" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("empresa")}>
                Empresa {sortColumn === "empresa" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort("cargo")}>
                Cargo {sortColumn === "cargo" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentInvitados.map((invitado) => (
              <tr key={invitado.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={isInvitadoSelected(invitado.id)}
                    onChange={() => toggleInvitadoSelection(invitado.id)}
                  />
                </td>
                <td className="py-2 px-4 border-b">{invitado.nombre}</td>
                <td className="py-2 px-4 border-b">{invitado.apellido}</td>
                <td className="py-2 px-4 border-b">{invitado.dni}</td>
                <td className="py-2 px-4 border-b">{invitado.email}</td>
                <td className="py-2 px-4 border-b">{invitado.telefono}</td>
                <td className="py-2 px-4 border-b">{invitado.empresa}</td>
                <td className="py-2 px-4 border-b">{invitado.cargo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p>
          Mostrando {indexOfFirstInvitado + 1} - {Math.min(indexOfLastInvitado, filteredInvitados.length)} de{" "}
          {filteredInvitados.length}
        </p>

        <div className="flex">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          >
            Anterior
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`py-2 px-4 ${currentPage === number ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"} font-bold`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredInvitados.length / itemsPerPage)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvitadosPage
