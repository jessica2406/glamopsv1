import { BookingWizard } from "@/components/booking/booking-wizard";
import { Gem } from "lucide-react";

export default function BookPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-muted p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary rounded-xl">
            <Gem className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Book an Appointment</h1>
      </div>
      <BookingWizard />
    </div>
  );
}
