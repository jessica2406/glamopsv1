"use client";

import { useEffect, useState, use } from "react"; // <--- using `use()`
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Service, Staff } from "@/types";
import Link from "next/link";

// Accept params as a Promise
export default function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using use()
  const { slug } = use(params);

  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch salon by slug
        const q = query(collection(db, "salons"), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError(true);
          setLoading(false);
          return;
        }

        const salonDoc = snapshot.docs[0];
        const salonId = salonDoc.id;

        setSalon({ id: salonId, ...salonDoc.data() });

        // Fetch services
        const servicesSnap = await getDocs(collection(db, "salons", salonId, "services"));
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));

        // Fetch staff
        const staffSnap = await getDocs(collection(db, "salons", salonId, "staff"));
        setStaffList(staffSnap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));

      } catch (err) {
        console.error("Error fetching booking data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error screen
  if (error || !salon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Salon Not Found</h1>
        <p className="text-muted-foreground">
          The URL you entered is incorrect or the salon no longer exists.
        </p>
      </div>
    );
  }

  // MAIN PAGE
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {salon.name}
        </h1>
        <p className="text-slate-500">Book your next experience</p>
      </div>

      {/* ⭐ ADD THIS BLOCK (as you asked) */}
      <div className="mb-6 flex justify-end w-full max-w-3xl">
        <Link
          href={`/book/${slug}/find`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Already booked? Find your appointment &rarr;
        </Link>
      </div>

      {/* BOOKING WIZARD */}
      <BookingWizard
        salonId={salon.id}
        services={services}
        staffList={staffList}
        salonSlug={slug}
      />

      <div className="mt-8 text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-primary">GlamOps</span>
      </div>
    </div>
  );
}
