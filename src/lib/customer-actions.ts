// src/lib/customer-actions.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc,
  updateDoc,
  increment 
} from "firebase/firestore";

/**
 * Checks if a customer exists by name (and optional email).
 * If yes -> Returns ID.
 * If no -> Creates new customer -> Returns new ID.
 */
export async function getOrCreateCustomer(
  salonId: string, 
  name: string, 
  email: string = ""
): Promise<string> {
  const customersRef = collection(db, "salons", salonId, "customers");
  
  // 1. clean the name for better matching
  const cleanName = name.trim();

  // 2. Try to find existing customer by Name
  // (In a real production app, you might prefer searching by Email if provided)
  const q = query(customersRef, where("name", "==", cleanName));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Customer found!
    const customerDoc = querySnapshot.docs[0];
    const customerId = customerDoc.id;

    // Optional: Update email if it wasn't there before but is here now
    if (email && !customerDoc.data().email) {
      await updateDoc(doc(db, "salons", salonId, "customers", customerId), {
        email: email
      });
    }

    return customerId;
  }

  // 3. Customer not found -> Create new
  const newCustomerRef = await addDoc(customersRef, {
    salonId,
    name: cleanName,
    email: email || null,
    phone: null,
    totalVisits: 0, // Will be incremented when appointment is booked
    createdAt: serverTimestamp(),
  });

  return newCustomerRef.id;
}

/**
 * Update customer stats (e.g. increment visit count)
 */
export async function incrementCustomerVisits(salonId: string, customerId: string) {
    const ref = doc(db, "salons", salonId, "customers", customerId);
    await updateDoc(ref, {
        totalVisits: increment(1),
        lastVisit: serverTimestamp()
    })
}