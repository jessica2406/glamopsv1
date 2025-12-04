import { 
  doc, 
  writeBatch, 
  collection,
  getDocs,
  query,
  limit
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User } from "firebase/auth";

export async function startInstantDemo() {
  // 1. Sign in
  const userCredential = await signInAnonymously(auth);
  const user = userCredential.user;

  // 2. SAFETY CHECK: Check if data already exists
  const servicesRef = collection(db, "salons", user.uid, "services");
  const existingData = await getDocs(query(servicesRef, limit(1)));

  if (!existingData.empty) {
    console.log("Demo data already exists for this user. Skipping setup.");
    return user; // Stop here, don't create duplicates
  }

  // 3. Only create data if it's a fresh user
  await createMockSalonData(user);

  return user;
}

async function createMockSalonData(user: User) {
  const batch = writeBatch(db);
  const salonId = user.uid;
  const salonRef = doc(db, "salons", salonId);

  // --- 1. Create Salon Doc ---
  batch.set(salonRef, {
    ownerId: user.uid,
    name: "GlamOps Demo Salon",
    slug: "demo",
    createdAt: new Date(),
    currency: "USD",
    address: "123 Fashion Ave, New York",
  });

  // --- 2. Create Services ---
  const serviceNames = [
    { name: "Silk Press", price: 85, duration: 60 },
    { name: "Balayage & Tone", price: 180, duration: 150 },
    { name: "Gel Manicure", price: 45, duration: 45 },
    { name: "Full Set Volume Lashes", price: 120, duration: 120 },
    { name: "Brow Lamination", price: 65, duration: 40 },
    { name: "Signature Facial", price: 95, duration: 60 },
  ];

  const serviceIds: string[] = [];
  serviceNames.forEach((svc) => {
    // Add to SUB-COLLECTION: salons/{uid}/services
    const ref = doc(collection(db, "salons", salonId, "services"));
    serviceIds.push(ref.id);
    batch.set(ref, { ...svc, active: true, salonId });
  });

  // --- 3. Create Staff ---
  const staffNames = ["Sarah", "Marcus", "Elena", "Jessica"];
  const staffIds: string[] = [];
  
  staffNames.forEach((name) => {
    // Add to SUB-COLLECTION: salons/{uid}/staff
    const ref = doc(collection(db, "salons", salonId, "staff"));
    staffIds.push(ref.id);
    batch.set(ref, { 
      name, 
      role: "Stylist", 
      active: true, 
      email: `${name.toLowerCase()}@demo.com`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Better avatars
      salonId 
    });
  });

  // --- 4. Create Appointments ---
  const today = new Date();
  
  for (let i = 0; i < 25; i++) {
    // Add to SUB-COLLECTION: salons/{uid}/appointments
    const ref = doc(collection(db, "salons", salonId, "appointments"));
    
    const dayOffset = Math.floor(Math.random() * 14) - 7; 
    const apptDate = new Date(today);
    apptDate.setDate(today.getDate() + dayOffset);
    apptDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

    const randomServiceIdx = Math.floor(Math.random() * serviceNames.length);
    const randomStaffIdx = Math.floor(Math.random() * staffNames.length);
    const service = serviceNames[randomServiceIdx];
    
    let status = "confirmed";
    if (dayOffset < 0) status = "completed";
    else if (Math.random() > 0.8) status = "cancelled";

    batch.set(ref, {
      clientName: `Guest Client ${i + 1}`,
      serviceId: serviceIds[randomServiceIdx],
      serviceName: service.name,
      staffId: staffIds[randomStaffIdx],
      staffName: staffNames[randomStaffIdx],
      date: apptDate,
      price: service.price,
      status: status,
      duration: service.duration,
      notes: "Demo appointment",
      salonId
    });
  }

  await batch.commit();
}