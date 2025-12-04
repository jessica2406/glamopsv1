"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, XCircle, CheckCircle, Loader2, Edit } from "lucide-react"
import { useSalon } from "@/hooks/useSalon"
import { db } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Appointment } from "@/types"
import { EditAppointmentModal } from "./edit-appointment-modal"

// CHANGE: We now need the full object to pass to the Edit Modal
interface AppointmentActionsProps {
  appointment: Appointment
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
  const { salon } = useSalon()
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleUpdateStatus = async (newStatus: string) => {
    if (!salon) return
    setLoading(true)
    try {
      await updateDoc(doc(db, "salons", salon.id, "appointments", appointment.id), {
        status: newStatus
      })
    } catch (error) {
      console.error(error)
      alert("Error updating status")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!salon || !confirm("Are you sure you want to delete this permanently?")) return
    setLoading(true)
    try {
      await deleteDoc(doc(db, "salons", salon.id, "appointments", appointment.id))
    } catch (error) {
      console.error(error)
      alert("Error deleting")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-8 w-8 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border shadow-md z-50">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {/* NEW: Edit Button */}
          <DropdownMenuItem onClick={() => setShowEditModal(true)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" /> Edit / Reschedule
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {appointment.status !== 'confirmed' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus('confirmed')} className="cursor-pointer">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Confirm
              </DropdownMenuItem>
          )}
          
          {appointment.status !== 'completed' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus('completed')} className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" /> Mark Completed
              </DropdownMenuItem>
          )}

          {appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={() => handleUpdateStatus('cancelled')} className="cursor-pointer">
                <XCircle className="mr-2 h-4 w-4 text-orange-600" /> Cancel Booking
              </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Record
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The Modal Component */}
      <EditAppointmentModal 
        appointment={appointment}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  )
}