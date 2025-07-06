import { currentUser } from "@clerk/nextjs/server"; 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Importing prisma client to ensure it's initialized

export async function POST() {
    
    try {
        const clerkUser = await currentUser();
        
        // check if user is authenticated
        if (!clerkUser) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // check if user's email exits
        const email = clerkUser?.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 400 });
        }

        
        // Check for eixsing profile    
        const existingProfile = await prisma.profile.findUnique({
            where: {
                userId: clerkUser.id,
            },
        });

        if (existingProfile) {
            return NextResponse.json({ error: "Profile already exists" }, { status: 400 });
        }

        // create new profile
        await prisma.profile.create({
            data: {
                userId: clerkUser.id,
                email: email,
                subscriptionTier: null, // Default subscription tier
                stripeSubscriptionId: null, // Default stripe subscription ID
                subscriptionActive: false, // Default subscription status
            
            },
        });

        return NextResponse.json({ message: "Profile created successfully" }, { status: 201 });
    } catch (error) {  
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }   
}
