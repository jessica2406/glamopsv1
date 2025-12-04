import { NextRequest, NextResponse } from "next/server";
import { firestore } from "../../../lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "../../../lib/session";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        // 1. AUTH: Verify Cookie
        const email = req.cookies.get(SESSION_COOKIE_NAME)?.value;
        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. VALIDATION: Get Inputs
        const body = await req.json();
        const { slug, appointmentId, action, newDate } = body;

        if (!slug || !appointmentId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. LOOKUP: Find Salon and Appointment
        const salonQuery = await firestore.collection("salons").where("slug", "==", slug).limit(1).get();
        if (salonQuery.empty) return NextResponse.json({ error: "Salon not found" }, { status: 404 });
        
        const salonId = salonQuery.docs[0].id;
        const apptRef = firestore.collection("salons").doc(salonId).collection("appointments").doc(appointmentId);
        const apptSnap = await apptRef.get();

        if (!apptSnap.exists) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

        // 4. AUTHORIZATION: Verify Ownership
        const data = apptSnap.data();
        const ownerEmail = data?.email || data?.clientEmail || "";

        if (ownerEmail !== email) {
            console.error(`⛔ Access Denied: ${email} tried to modify ${ownerEmail}'s appointment`);
            return NextResponse.json({ error: "Forbidden: You do not own this appointment" }, { status: 403 });
        }

        // 5. EXECUTE ACTION
        if (action === "reschedule") {
            if (!newDate) return NextResponse.json({ error: "New date required" }, { status: 400 });
            
            await apptRef.update({
                date: new Date(newDate),
                status: "confirmed" // Re-confirm if it was cancelled
            });
            return NextResponse.json({ success: true, message: "Rescheduled successfully" });
        } 
        
        else if (action === "cancel") {
            await apptRef.update({
                status: "cancelled"
            });
            return NextResponse.json({ success: true, message: "Appointment cancelled" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("🔥 Action API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}