import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export interface SalonOnboardingData {
  name: string;
  currency: string;
  bufferTime: string;
  // In a real app, you'd handle the logo file upload to Firebase Storage here
  logoUrl?: string; 
}

export async function createRealSalon(user: User, data: SalonOnboardingData) {
  const salonId = user.uid; // CRITICAL: Tying Salon ID to User ID
  const salonRef = doc(db, "salons", salonId);

  try {
    await setDoc(salonRef, {
      ownerId: user.uid,
      name: data.name,
      // Create a URL-friendly slug (simplified version)
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      currency: data.currency,
      defaultBuffer: parseInt(data.bufferTime),
      logoUrl: data.logoUrl || null,
      type: "real", // This flag distinguishes it from demo
      createdAt: serverTimestamp(),
      subscriptionStatus: "trial", // Default them to a trial
      address: "Pending Address Setup", // You can add address to the form if needed
    });
    
    // Note: We deliberately DO NOT create mock appointments/staff here.
    // Real salons start empty.
    
    return true;
  } catch (error) {
    console.error("Error creating real salon:", error);
    throw error;
  }
}