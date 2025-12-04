"use client";

import { useState, use } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FindBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error();
      // Success → redirect to OTP verify UI
      window.location.href = `/book/${slug}/verify?email=${encodeURIComponent(email)}`;
    } catch {
      alert("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Link href={`/book/${slug}`} className="text-sm text-muted-foreground flex items-center mb-2 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Booking
          </Link>
          <CardTitle className="text-xl">Find My Appointment</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendOTP} className="flex gap-2 mb-6">
            <Input
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
