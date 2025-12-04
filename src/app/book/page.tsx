"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Calendar, CheckCircle } from "lucide-react"

// This page grabs the slug from the URL: /book/glam-salon
export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [salon, setSalon] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [booked, setBooked] = useState(false)

  // Fetch Salon by SLUG (Public Read)
  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        // 1. Find the salon that matches this slug
        const q = query(collection(db, "salons"), where("slug", "==", params.slug))
        const snapshot = await getDocs(q)
        
        if (snapshot.empty) {
          setLoading(false)
          return
        }

        const salonDoc = snapshot.docs[0]
        const salonData = { id: salonDoc.id, ...salonDoc.data() }
        setSalon(salonData)

        // 2. Fetch that salon's services
        const servicesRef = collection(db, "salons", salonDoc.id, "services")
        const servicesSnap = await getDocs(servicesRef)
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        
      } catch (error) {
        console.error("Error fetching salon", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSalonData()
  }, [params.slug])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!salon) return <div className="flex h-screen items-center justify-center">Salon not found</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center border-b bg-white">
            <h1 className="text-2xl font-bold">{salon.name}</h1>
            <p className="text-muted-foreground">Book an appointment</p>
        </CardHeader>
        <CardContent className="p-6">
            {!booked ? (
                <div className="space-y-4">
                    <h3 className="font-medium mb-2">Select a Service:</h3>
                    <div className="grid gap-3">
                        {services.length === 0 && <p>No services available online.</p>}
                        {services.map(svc => (
                            <div key={svc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                <div>
                                    <div className="font-medium">{svc.name}</div>
                                    <div className="text-sm text-muted-foreground">{svc.duration} mins</div>
                                </div>
                                <div className="font-bold">${svc.price}</div>
                            </div>
                        ))}
                    </div>
                    {/* Simplified for demo - In real life, clicking a service would open a time picker */}
                    <Button className="w-full mt-4" disabled={services.length === 0}>
                        Continue to Time Selection
                    </Button>
                </div>
            ) : (
                <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Booking Confirmed!</h2>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}