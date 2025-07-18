import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 
import { stripe } from "@/lib/stripe";


export async function POST(request: NextRequest) {
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

        const {newPlan} = await request.json();
        if (!newPlan) {
            return NextResponse.json(
                { error: "New plan not specified" },
                { status: 400 }
            );
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        if (!profile.stripeSubscriptionId) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 404 }
            );
        }

        const subscriptionId = profile.stripeSubscriptionId;

        // Now update user's subscription plan
        const canceledSubscription = await stripe.subscriptions.update(
            subscriptionId, {
            items: [
                {
                    cancel_at_period_end: true, // This will cancel the subscription at the end of the current period
                
                },
            ],
        });   
        
        await prisma.profile.update({
            where: { userId: clerkUser.id },
            data: {
                subscriptionTier: null,
                stripeSubscriptionId: null,
                subscriptionActive: false
            },
        });         


        // return the full profile including subscription status
        return NextResponse.json({
            subscription: canceledSubscription
        });

    } catch (error: any) {
        console.error("Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to cancel subscription plan" },
            { status: 500 }
        );

    }
 
}