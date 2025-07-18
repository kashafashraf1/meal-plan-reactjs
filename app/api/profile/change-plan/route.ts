import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 
import { stripe } from "@/lib/stripe";
import { get } from "http";
import { getPriceIDUsingPlanType } from "@/lib/plans";


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

        // Get the current subscription item from Stripe
        const subscriptionItemId = await stripe.subscriptions.retrieve(subscriptionId);
        if (!subscriptionItemId) {
            return NextResponse.json(
                { error: "Subscription item not found" },
                { status: 404 }
            );
        }

        // Now update user's subscription plan
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscriptionItemId.items.data[0].id,
                    price: getPriceIDUsingPlanType(newPlan),
                },
            ],
            proration_behavior: 'create_prorations', // helpful for prorating the charges in middle of the billing cycle
        });

        // Now udpate the user's profile with the new plan
        await prisma.profile.update({
            where: { userId: clerkUser.id },
            data: {
                subscriptionTier: newPlan,
                stripeSubscriptionId: updatedSubscription.id,
                subscriptionActive: true
            },
        }); 

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