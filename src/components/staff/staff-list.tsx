"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { Staff } from '@/types'; // Use the central types file we created
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalon } from '@/hooks/useSalon'; // Use the hook for consistency
import { StaffActions } from './staff-actions'; // <--- The component we just built

// --- Simplified Form just for "Create" ---
function CreateStaffForm({ onSave, loading }: { onSave: (data: any) => Promise<void>, loading: boolean }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await onSave({
        name: data.name as string,
        email: data.email as string,
        role: data.role as string,
        // Default avatar logic
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
        workingHours: {
            start: data.start_time as string,
            end: data.end_time as string,
        },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="Ex. Sarah Jones" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="sarah@example.com" />
        </div>
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="staff">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" name="start_time" type="time" defaultValue="09:00" required />
        </div>
        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input id="end_time" name="end_time" type="time" defaultValue="17:00" required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Staff Member
      </Button>
    </form>
  )
}

export function StaffList() {
  const { salon } = useSalon(); // Use the standardized hook
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Staff (Realtime)
  useEffect(() => {
    if (!salon) return;

    // Use the 'salons' path to match the rest of the app
    const q = collection(db, "salons", salon.id, "staff");
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setStaff(staffData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [salon]);

  // 2. Create Logic Only (Edit/Delete is handled by StaffActions)
  const handleCreate = async (data: any) => {
    if (!salon) return;
    setIsCreating(true);
    try {
      await addDoc(collection(db, "salons", salon.id, "staff"), data);
      setIsCreateOpen(false); // Close modal
    } catch (e) {
      console.error("Error creating staff", e);
      alert("Failed to create staff");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Team Members</h2>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <CreateStaffForm onSave={handleCreate} loading={isCreating} />
            </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((member) => (
          <Card key={member.id} className="relative group hover:shadow-md transition-all">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 ring-2 ring-offset-2 ring-primary/10">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
              
              <div className="mt-2 text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {member.workingHours?.start || "09:00"} - {member.workingHours?.end || "17:00"}
              </div>

              {/* The New Actions Component handles Edit & Delete */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <StaffActions staff={member} />
              </div>
              
            </CardContent>
          </Card>
        ))}
        
        {staff.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                <UserIcon className="h-10 w-10 mb-3 opacity-50" />
                <p>No staff members found.</p>
                <Button variant="link" onClick={() => setIsCreateOpen(true)}>Add your first team member</Button>
            </div>
        )}
      </div>
    </div>
  );
}