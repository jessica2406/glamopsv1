"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { Service } from '@/types'; // Imports from your new central types file
import { useSalon } from '@/hooks/useSalon'; // <--- Use the hook for consistency

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// --- Form Component ---
function ServiceForm({ service, onSave }: { service?: Service | null, onSave: (data: any) => Promise<void> }) {
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price || 0);
  const [duration, setDuration] = useState(service?.duration || 30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        description,
        price,
        duration
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Haircut" />
      </div>
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Includes wash and blow dry..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input id="duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Service
      </Button>
    </form>
  )
}

// --- Main Component ---
export function ServicesTable() {
  const { salon } = useSalon(); // <--- Correct Hook
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // 1. Data Listener (Scoped to Salon)
  useEffect(() => {
    if (!salon) return;

    // Fetch from: salons/{salonId}/services
    const q = collection(db, "salons", salon.id, "services");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serviceData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(serviceData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [salon]);

  // 2. Add / Update Logic
  const handleSave = async (data: any) => {
    if (!salon) return;

    try {
      if (editingService && editingService.id) {
        // Update
        const docRef = doc(db, "salons", salon.id, "services", editingService.id);
        await updateDoc(docRef, data);
      } else {
        // Create
        await addDoc(collection(db, "salons", salon.id, "services"), data);
      }
      setIsFormOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    }
  };

  // 3. Delete Logic
  const handleDelete = async (id: string) => {
    if (!salon) return;
    try {
      await deleteDoc(doc(db, "salons", salon.id, "services", id));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Services</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditingService(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
            </DialogHeader>
            <ServiceForm service={editingService} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {service.description}
                        </div>
                    )}
                </TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell className="text-right">₹{Number(service.price).toFixed(2)}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingService(service); setIsFormOpen(true); }}>
                          Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {service.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No services found. Create one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}