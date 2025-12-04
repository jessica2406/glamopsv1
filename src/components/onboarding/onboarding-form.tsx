"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2 } from "lucide-react"

// --- FIX 1: Import matches your filename 'useAuth.ts' ---
// Ensure your file is at: src/hooks/useAuth.ts
import { useAuth } from "@/hooks/useAuth" 
import { signInWithGoogle } from "@/lib/auth-actions"
import { createRealSalon } from "@/lib/salon-actions"

export function OnboardingForm() {
  const router = useRouter()
  
  // --- FIX 2: Actually use the hook here ---
  // We rename 'user' to 'currentUser' so it matches the rest of your logic
  const { user: currentUser, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [salonName, setSalonName] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [bufferTime, setBufferTime] = useState("10")

  // --- REMOVED: The manual useEffect and useState for auth are no longer needed ---

  const handleSetup = async () => {
    setLoading(true)
    try {
      let user = currentUser

      // 1. If user is anonymous or not logged in, force Google Sign In
      if (!user || user.isAnonymous) {
        user = await signInWithGoogle()
        if (!user) {
            setLoading(false)
            return // User cancelled login
        }
      }

      // 2. Validate Input
      if (!salonName) {
        alert("Please enter a salon name")
        setLoading(false)
        return
      }

      // 3. Create Database Record
      await createRealSalon(user, {
        name: salonName,
        currency,
        bufferTime,
        // Placeholder logo logic
        logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${salonName}` 
      })

      // 4. Redirect to Dashboard
      router.push("/dashboard")
      
    } catch (error) {
      console.error(error)
      alert("Something went wrong setting up your salon.")
    } finally {
      setLoading(false)
    }
  }

  // Prevent flash of content while checking auth
  if (authLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle>Let's set up your salon</CardTitle>
        <CardDescription>
            {currentUser && !currentUser.isAnonymous 
                ? `Logged in as ${currentUser.email}` 
                : "We'll ask you to sign in with Google to save your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="salon-name">Salon Name</Label>
          <Input 
            id="salon-name" 
            placeholder="e.g., The Glam Room" 
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Salon Logo (Auto-generated for now)</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
               {salonName ? (
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${salonName}`} alt="Logo" />
               ) : (
                   <Upload className="w-6 h-6 text-muted-foreground" />
               )}
            </div>
            <div className="text-sm text-muted-foreground">
                Logo upload will be enabled after setup.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="buffer-time">Default Buffer Time</Label>
                <Select value={bufferTime} onValueChange={setBufferTime}>
                    <SelectTrigger id="buffer-time">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSetup} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentUser && !currentUser.isAnonymous ? "Complete Setup" : "Sign In & Complete Setup"}
        </Button>
      </CardFooter>
    </Card>
  )
}