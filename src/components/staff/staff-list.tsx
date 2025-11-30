"use client";

import { useState } from 'react';
import { useStaff } from '@/hooks/use-app-data'; // Changed import
import { Staff } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, User as UserIcon, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function StaffForm({ staffMember, onSave }: { staffMember?: Staff | null, onSave: (staff: Staff) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    await onSave({
      id: staffMember?.id || '',
      name: data.name as string,
      email: data.email as string,
      role: data.role as 'owner' | 'staff',
      avatarUrl: staffMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`, // Dynamic avatar
      workingHours: {
          start: data.start_time as string,
          end: data.end_time as string,
      },
      active: true
    });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={staffMember?.avatarUrl} />
          <AvatarFallback><UserIcon className="h-8 w-8" /></AvatarFallback>
        </Avatar>
        <Button type="button" variant="outline" disabled>Upload Photo (Coming Soon)</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={staffMember?.name} required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" defaultValue={staffMember?.email} required />
        </div>
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue={staffMember?.role || 'staff'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Working Hours Start</Label>
          <Input id="start_time" name="start_time" type="time" defaultValue={staffMember?.workingHours?.start || '09:00'} required />
        </div>
        <div>
          <Label htmlFor="end_time">Working Hours End</Label>
          <Input id="end_time" name="end_time" type="time" defaultValue={staffMember?.workingHours?.end || '17:00'} required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Staff Member
      </Button>
    </form>
  )
}

export function StaffList() {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff(); // Use Hook
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleSave = async (staffMember: Staff) => {
    try {
      if (editingStaff && staffMember.id) {
        await updateStaff(staffMember.id, staffMember);
      } else {
        await addStaff(staffMember);
      }
      setIsFormOpen(false);
      setEditingStaff(null);
    } catch (e) {
      console.error("Error saving staff", e);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteStaff(id);
  }
  
  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStaff(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
              </DialogHeader>
              <StaffForm staffMember={editingStaff} onSave={handleSave} />
            </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staff.map((member) => (
          <Card key={member.id} className="relative">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback>{member.name ? member.name.charAt(0) : "U"}</AvatarFallback>
              </Avatar>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {member.workingHours?.start} - {member.workingHours?.end}
              </p>
              {member.role === 'owner' && <Badge variant="secondary" className="mt-2">Owner</Badge>}
            </CardContent>
            <div className="absolute top-2 right-2">
                <AlertDialog>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingStaff(member); setIsFormOpen(true); }}>
                          Edit
                      </DropdownMenuItem>
                      <AlertDialogTrigger asChild>
                         <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </AlertDialogTrigger>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {member.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}