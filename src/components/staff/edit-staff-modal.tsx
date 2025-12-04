"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSalon } from "@/hooks/useSalon"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import { Staff } from "@/types" // Ensure this exists in your types file

interface EditStaffModalProps {
  staff: Staff | null
  open: boolean
  onClose: () => void
}

export function EditStaffModal({ staff, open, onClose }: EditStaffModalProps) {
  const { salon } = useSalon()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  // Pre-fill form when staff changes
  useEffect(() => {
    if (staff) {
      setName(staff.name)
      setRole(staff.role)
    }
  }, [staff])

  const handleUpdate = async () => {
    if (!staff || !salon) return
    setLoading(true)

    try {
      const staffRef = doc(db, "salons", salon.id, "staff", staff.id)
      await updateDoc(staffRef, {
        name,
        role
      })
      onClose()
    } catch (error) {
      console.error("Error updating staff:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}