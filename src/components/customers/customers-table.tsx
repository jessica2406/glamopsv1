"use client";

import { useState, useEffect } from 'react';
import { useSalon } from "@/hooks/useSalon"; // Use your hook
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export function CustomersTable() {
  const { salon } = useSalon();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!salon) return;

    const fetchCustomers = async () => {
      // Logic: In this simple schema, "Customers" are unique names found in "Appointments"
      // In a more complex app, you would have a dedicated 'customers' collection.
      const querySnapshot = await getDocs(collection(db, "salons", salon.id, "appointments"));
      
      const customerMap = new Map();

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const name = data.clientName;
        
        if (!customerMap.has(name)) {
            customerMap.set(name, {
                id: name, // Using name as ID for now
                name: name,
                email: "N/A", // We don't capture email in appointments yet
                totalAppointments: 0,
                lastVisit: new Date(0) // Epoch
            });
        }

        const customer = customerMap.get(name);
        customer.totalAppointments += 1;
        
        const apptDate = data.date.toDate();
        if (apptDate > customer.lastVisit) {
            customer.lastVisit = apptDate;
        }
      });

      setCustomers(Array.from(customerMap.values()));
      setLoading(false);
    };

    fetchCustomers();
  }, [salon]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && customers.length === 0) return <div>Loading clients...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customers ({customers.length})</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="w-full sm:w-1/3 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Total Visits</TableHead>
              <TableHead>Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                        No customers found.
                    </TableCell>
                </TableRow>
            ) : (
                filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-center">{customer.totalAppointments}</TableCell>
                    <TableCell>
                        {customer.lastVisit.getTime() > 0 
                            ? format(customer.lastVisit, 'MMM d, yyyy') 
                            : 'N/A'}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}