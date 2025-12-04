import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    // This will open the popup to sign in
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
}