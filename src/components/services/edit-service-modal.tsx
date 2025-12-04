"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Pencil } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSalon } from "@/hooks/useSalon"

interface EditServiceModalProps {
  service: { id: string, name: string, price: number, duration: number }
}

export function EditServiceModal({ service }: EditServiceModalProps) {
  const { salon } = useSalon()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(service.name)
  const [price, setPrice] = useState(service.price.toString())
  const [duration, setDuration] = useState(service.duration.toString())

  const handleUpdate = async () => {
    if (!salon) return
    setLoading(true)
    try {
      const ref = doc(db, "salons", salon.id, "services", service.id)
      await updateDoc(ref, {
        name,
        price: parseFloat(price),
        duration: parseInt(duration)
      })
      setOpen(false)
    } catch (error) {
      console.error(error)
      alert("Failed to update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <div className="flex gap-2">
                <Input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
                <Input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleUpdate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}