import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 


export async function GET() {
    try {
        // Placeholder for subscription status logic
        // This could involve checking a database or an external service
        const clerkUser = await currentUser();
        
        if (!clerkUser?.id) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id },
            select: { subscriptionTier: true }
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        // return the full profile including subscription status
        return NextResponse.json({
            subscription: profile
        });

    } catch (error: any) {
        console.error("Error fetching subscription status:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription status" },
            { status: 500 }
        );

    }
 
}