import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId },
            select: { subscriptionActive: true }
        });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }   
        return NextResponse.json({ subscriptionActive: profile?.subscriptionActive }, { status: 200 });
    }

    catch (error) {
        console.error("Error fetching subscription status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}