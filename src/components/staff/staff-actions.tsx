"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react"
import { useSalon } from "@/hooks/useSalon"
import { db } from "@/lib/firebase"
import { doc, deleteDoc } from "firebase/firestore"
import { Staff } from "@/types"
import { EditStaffModal } from "./edit-staff-modal"

interface StaffActionsProps {
  staff: Staff
}

export function StaffActions({ staff }: StaffActionsProps) {
  const { salon } = useSalon()
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = async () => {
    if (!salon || !confirm(`Are you sure you want to remove ${staff.name}?`)) return
    
    setLoading(true)
    try {
      await deleteDoc(doc(db, "salons", salon.id, "staff", staff.id))
    } catch (error) {
      console.error(error)
      alert("Error removing staff member")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => setShowEditModal(true)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" /> Edit Details
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" /> Remove Staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The Edit Modal */}
      <EditStaffModal 
        staff={staff}
        open={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </>
  )
}