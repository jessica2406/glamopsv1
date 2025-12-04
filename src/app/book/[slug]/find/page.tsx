"use client"

import { useState, use } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Search, Calendar, ChevronRight, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function FindBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setSearched(false)
    setBookings([])

    try {
      // 1. Get Salon ID
      const salonQ = query(collection(db, "salons"), where("slug", "==", slug))
      const salonSnap = await getDocs(salonQ)
      
      if (salonSnap.empty) {
        alert("Salon not found")
        setLoading(false)
        return
      }
      const salonId = salonSnap.docs[0].id

      // 2. Query appointments by email
      // (status filtering moved to JS to avoid Firestore index issues)
      const apptQ = query(
        collection(db, "salons", salonId, "appointments"),
        where("clientEmail", "==", email)
      )

      const apptSnap = await getDocs(apptQ)

      // Filter cancelled in JS
      const found = apptSnap.docs
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
          }
        })
        .filter((a: any) => a.status !== "cancelled")

      // Sort by soonest first
      found.sort((a: any, b: any) => a.date - b.date)

      setBookings(found)
      setSearched(true)

    } catch (err) {
      console.error(err)
      alert("Error finding bookings. Ensure email is correct.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Link 
            href={`/book/${slug}`} 
            className="text-sm text-muted-foreground flex items-center mb-2 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Booking
          </Link>
          <CardTitle className="text-xl">Find My Appointment</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input 
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {searched && bookings.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No active bookings found for this email.
            </div>
          )}

          <div className="space-y-3">
            {bookings.map(appt => (
              <Link 
                key={appt.id} 
                href={`/book/${slug}/appointment/${appt.id}`}
              >
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-100 transition bg-white cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{appt.serviceName}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(appt.date, "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
