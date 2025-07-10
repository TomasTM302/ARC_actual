"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCondominiumStore } from "@/lib/condominium-store"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function CondominiumReportsPage() {
  const { condominiums } = useCondominiumStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCondominiums = condominiums.filter((condo) =>
    condo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-black text-center">Condominios</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Buscar condominios..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredCondominiums.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron condominios</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredCondominiums.map((condo) => (
              <Link key={condo.id} href={`/mantenimiento/reportes-condominio/${condo.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="relative h-40 w-full">
                    <Image
                      src={
                        condo.id === "condo-1"
                          ? "/images/mountain-view-residence.png"
                          : condo.id === "condo-2"
                            ? "/images/modern-residential-building.png"
                            : condo.id === "condo-3"
                              ? "/images/luxury-river-condo.png"
                              : "/images/apartment-complex-garden.png"
                      }
                      alt={condo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h2 className="text-lg font-semibold">{condo.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{condo.address}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">{condo.totalUnits} unidades</span>
                      <CondominiumActivityBadge condominiumId={condo.id} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CondominiumActivityBadge({ condominiumId }: { condominiumId: string }) {
  const { getActivitiesByCondominiumId } = useCondominiumStore()
  const activities = getActivitiesByCondominiumId(condominiumId)

  const pendingActivities = activities.filter((act) => act.status !== "completed").length

  if (pendingActivities === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Al día
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      {pendingActivities} pendiente{pendingActivities !== 1 ? "s" : ""}
    </span>
  )
}
