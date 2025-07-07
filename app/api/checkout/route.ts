import { getPriceIDUsingPlanType } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { url } from "inspector";

export async function POST(request: NextRequest) {
    try {
        const { planType, userId, email } = await request.json();
        
        if(!planType || !userId || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const allowedPlanTypes = ["weekly", "monthly", "yearly"];
        if (!allowedPlanTypes.includes(planType)) {
            return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
        }

        // if we don't have a price ID for the plan type, we return an error
        const priceId = getPriceIDUsingPlanType(planType);
        if(!priceId) {
            return NextResponse.json({ error: "Price ID not found for the selected plan type" }, { status: 404 });
        }

        // Stripe checkout session creation
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            customer_email: email,
            metadata: { clerkUserId: userId, planType: planType },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],

        });

        return NextResponse.json({ url: stripeSession.url }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

