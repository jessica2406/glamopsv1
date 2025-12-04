import { NextRequest, NextResponse } from "next/server";
import { firestore } from "../../../lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "../../../lib/session";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    // console.log("🔍 API: /api/my-appointments HIT"); // Optional: Comment out to reduce noise

    try {
        const email = req.cookies.get(SESSION_COOKIE_NAME)?.value;
        
        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

        const salonQuery = await firestore.collection("salons")
            .where("slug", "==", slug)
            .limit(1)
            .get();

        if (salonQuery.empty) return NextResponse.json({ error: "Salon not found" }, { status: 404 });

        const salonId = salonQuery.docs[0].id;
        const appointmentsRef = firestore.collection("salons").doc(salonId).collection("appointments");
        
        // ⚡ OPTIMIZED: We know the field is 'clientEmail', so we search ONLY that.
        const snapshot = await appointmentsRef
            .where("clientEmail", "==", email) 
            .orderBy("date", "desc") // Re-enabled ordering now that we know the specific field
            .get();

        console.log(`✅ Found ${snapshot.size} appointments for ${email}`);

        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate ? data.date.toDate().toISOString() : (data.date || new Date().toISOString()),
            };
        });

        return NextResponse.json({ appointments });

    } catch (error: any) {
        console.error("🔥 API ERROR:", error);
        
        // Helper for "Missing Index" error
        if (error.code === 9 || error.message?.includes("index")) {
             return NextResponse.json({ 
                error: "Database Index Required", 
                details: "Check server logs for the creation link." 
             }, { status: 500 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}