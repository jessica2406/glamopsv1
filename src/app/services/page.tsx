"use client";

import { useState, useEffect } from "react";
import { useSalon } from "@/hooks/useSalon";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditServiceModal } from "@/components/services/edit-service-modal";
import { Trash2, Plus, Loader2, Scissors } from "lucide-react";

export default function ServicesPage() {
  const { salon, user } = useSalon();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");

  // 1. REALTIME LISTENER
  useEffect(() => {
    if (!salon) return;

    // Listen to: salons/{salonId}/services
    const q = query(collection(db, "salons", salon.id, "services"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [salon]);

  // 2. ADD SERVICE
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon || !name) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "salons", salon.id, "services"), {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        active: true,
        salonId: salon.id,
        createdAt: serverTimestamp(),
      });
      setName("");
      setPrice(""); // Reset form
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. DELETE SERVICE
  const handleDelete = async (id: string) => {
    if (confirm("Delete this service?")) {
      await deleteDoc(doc(db, "salons", salon!.id, "services", id));
    }
  };

  if (loading) return <div className="p-10">Loading services...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Menu</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add Service</CardTitle>
            <CardDescription>Create a new service offering.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                placeholder="Name (e.g. Silk Press)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Price ($)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Mins"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Save Service
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIST SECTION */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Services ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-dashed border rounded-md">
                <Scissors className="mx-auto h-8 w-8 mb-2 opacity-50" />
                No services added yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((svc) => (
                    <TableRow key={svc.id}>
                      <TableCell className="font-medium">{svc.name}</TableCell>
                      <TableCell>{svc.duration} mins</TableCell>
                      <TableCell>${svc.price}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(svc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {/* EDIT BUTTON */}
                          <EditServiceModal service={svc} />

                          {/* DELETE BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(svc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
