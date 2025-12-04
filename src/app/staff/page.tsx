"use client"

import { useState, useEffect } from "react";
import { useSalon } from "@/hooks/useSalon";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Loader2, Users } from "lucide-react";
import { StaffActions } from "@/components/staff/staff-actions"; 
import { Staff } from "@/types";

export default function StaffPage() {
  const { salon } = useSalon();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("Stylist");

  // 1. Fetch Staff
  useEffect(() => {
    if (!salon) return;
    const q = query(collection(db, "salons", salon.id, "staff"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Cast the data to the Staff type
      setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [salon]);

  // 2. Add Staff Function (Create Only)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon || !name) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "salons", salon.id, "staff"), {
        name,
        role,
        active: true,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        salonId: salon.id,
        createdAt: serverTimestamp()
      });
      // Reset Form
      setName("");
      setRole("Stylist");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Staff Form */}
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Add Member</CardTitle>
                <CardDescription>Create a new staff profile.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                        <Input 
                            placeholder="Name (e.g. Sarah)" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Input 
                            placeholder="Role (e.g. Stylist)" 
                            value={role} 
                            onChange={e => setRole(e.target.value)} 
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Plus className="mr-2 h-4 w-4"/>} 
                        Add to Team
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* RIGHT COLUMN: Staff List */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Team List ({staff.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {staff.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Users className="mx-auto mb-3 h-10 w-10 opacity-20" />
                            <p>No staff members found.</p>
                        </div>
                    )}
                    
                    {staff.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">{member.role}</div>
                                </div>
                            </div>
                            
                            {/* Insert the Actions Component here */}
                            <StaffActions staff={member} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}