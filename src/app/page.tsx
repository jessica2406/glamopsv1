"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startInstantDemo } from "@/lib/demo-setup";
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDemo = async () => {
    setIsLoading(true);
    try {
      await startInstantDemo();
      router.push("/demo");
    } catch (error) {
      console.error("Failed to start demo:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar Placeholder */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          GlamFlow
        </div>
        <button 
          onClick={() => router.push("/auth")}
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 lg:py-32">
        
        {/* Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          New: Instant Demo Mode
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          The operating system for <br className="hidden sm:block" />
          <span className="text-primary">modern beauty salons.</span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Manage bookings, staff, and revenue in one beautiful flow. <br className="hidden sm:block" />
          Experience the full platform right now—no credit card, no signup.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleStartDemo}
            disabled={isLoading}
            className={cn(
              "group relative inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed",
              isLoading && "cursor-wait opacity-90"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your salon...
              </>
            ) : (
              <>
                Try GlamFlow Instantly
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            See how it works in 10 seconds
          </p>
        </div>

        {/* Mockup / Visual Hint */}
        <div className="mt-16 w-full max-w-5xl rounded-xl border bg-muted/20 p-2 md:p-4 shadow-2xl opacity-90">
           <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-background shadow-sm">
             {/* This is a placeholder for a screenshot, strictly using CSS to simulate UI */}
             <div className="flex h-full w-full flex-col">
                <div className="h-14 border-b bg-card flex items-center px-4 gap-4">
                    <div className="h-2 w-24 bg-muted rounded-full"></div>
                    <div className="ml-auto h-8 w-8 bg-muted rounded-full"></div>
                </div>
                <div className="flex-1 bg-muted/10 p-6 grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                        <div className="h-32 rounded-xl bg-primary/5 border border-primary/10"></div>
                        <div className="h-48 rounded-xl bg-card border"></div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <div className="h-full rounded-xl bg-card border"></div>
                    </div>
                </div>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}