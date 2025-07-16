import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {prisma} from "@/lib/prisma"

// Add this buffer parsing function
const buffer = (readable: ReadableStream) => {
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    readable
      .getReader()
      .read()
      .then(({ value, done }) => {
        if (done) resolve(Buffer.concat(chunks));
        chunks.push(Buffer.from(value));
        resolve(Buffer.concat(chunks));
      });
  });
};

export async function POST(request: NextRequest) {
    const body = await buffer(request.body!);
    const sig = request.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("Stripe webhook secret is not set");
    }
    let event: Stripe.Event;
    
    try { 
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            webhookSecret
        );
        console.log("Webhook verified");
    } catch (error: any) {
        console.error("Webhook signature verification failed:", error.message);
        return NextResponse.json(
            { error: `Webhook Error: ${error.message}` },
            { status: 400 },
    )}

    console.log("event type is " + event.type)

    try {
        switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutSessionCompleted(session);
            break;
        case "invoice.payment_failed":
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaymentFailed(invoice);
            break;
        case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            await handleCustomerSubscriptionDeleted(subscription);
            break;
            
        default:
            return NextResponse.json(
                { error: `Unhandled event type: ${event.type}` },
                { status: 400 }
            );
        }
        
    } catch (error: any) {
        console.error("Error handling Stripe webhook event:", error.message);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

    return NextResponse.json({});
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.clerkUserId;
    const subscriptionId = session.subscription as string;

    if (!userId || !subscriptionId) {
        console.error("Missing userId or subscriptionId in session metadata");
        return;
    }

    // Update the user's subscription status in database    

    try {
        await prisma.profile.update({
            where: { userId },
            data: {
                stripeSubscriptionId: subscriptionId,
                subscriptionActive: true,
                subscriptionTier: session.metadata?.planType || null,
            },
        });
    } catch (error: any) {
        console.error(error.message);
    }

} 

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log("Invoice payment failed:", invoice.id);
    const subId = invoice.subscription as string;

    if (!subId) {
        console.error("No subscription ID found in invoice");
        return;
    }   

    let userId: string | undefined

    try {
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subId }, 
            select: { userId: true },
        });     

        if(!profile?.userId) {
            console.error("Profile not found for subscription ID:", subId);
            return;
        }

        userId = profile.userId;
    } catch (error: any) {   
        console.error("Error fetching profile for failed payment:", error.message);
        return NextResponse.json(
            { error: "Failed to fetch profile for payment failure" },
            { status: 500 }
        );
    }

    // if found userId, update the profile to mark subscription as inactive due to payment failure
    try {
        
        await prisma.profile.update({
            where: { userId: userId },
            data: {
                subscriptionActive: false,
            },
        });
        console.log(`Subscription for user ${userId} marked as inactive due to payment failure.`);
    } catch (error: any) {
        console.error("Error updating profile for failed payment:", error.message);
    }

}

async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {
    
    const subId = subscription.id as string;

    if (!subId) {
        console.error("No subscription ID found in invoice");
        return;
    }   

    let userId: string | undefined

    try {
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subId }, 
            select: { userId: true },
        });     

        if(!profile?.userId) {
            console.error("Profile not found for subscription ID:", subId);
            return;
        }

        userId = profile.userId;
    } catch (error: any) {   
        console.error("Error fetching profile for failed payment:", error.message);
        return NextResponse.json(
            { error: "Failed to fetch profile for payment failure" },
            { status: 500 }
        );
    }

    // if found userId, update the profile to mark subscription as inactive due to payment failure
    try {
        
        await prisma.profile.update({
            where: { userId: userId },
            data: {
                subscriptionActive: false,
                stripeSubscriptionId: null,
                subscriptionTier: null, // Clear the subscription tier
            },
        });
    } catch (error: any) {
        console.error(error.message);
    }

}