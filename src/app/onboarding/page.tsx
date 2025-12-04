import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Gem } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary rounded-xl">
            <Gem className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Welcome to GlamOps</h1>
      </div>
      <OnboardingForm />
    </div>
  );
}
