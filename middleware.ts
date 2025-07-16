import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe(.*)",
  "/api/webhook(.*)",
  "/api/subscription-status-middleware(.*)",
]);

const isSignUpRoute = createRouteMatcher([
  "/sign-up(.*)",
]);

const isMealPlannerRoute = createRouteMatcher([
  "/mealplan(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const {userId} = userAuth;
  const {pathname, origin} = req.nextUrl;

  if(pathname==="/api/subscription-status-middleware") {

     // Skip this middleware for the subscription status API route
      return NextResponse.next();
  }     

  /**
   * Checks if the request is for a public route.
   */
  if(!userId && !isPublicRoute(req)) {
    // Redirect to sign-up page if user is not authenticated and trying to access a protected route
    return NextResponse.redirect(new URL('/sign-up', origin));
  }

  /**
   * Redirect to mealplan if user is signed-in and tries to sign-up.
   */  
  if(isSignUpRoute (req) && userId) {
    // Redirect to home page if user is authenticated and trying to access the sign-up page
    return NextResponse.redirect(new URL('/mealplan', origin));
  }  
  
  /**
   * Redirect to mealplan if user is signed-in and tries to sign-up.
   */  
  if(isMealPlannerRoute (req) && userId) {
    // We will avoid Prisma in Middleware (Recommended)
    // Edge Runtime Limitations: Next.js middleware runs on Vercel's Edge runtime, which is based on Web APIs rather than Node.js APIs.
    // Browser-like Environment: The Edge runtime is similar to a browser environment, but Prisma requires Node.js-specific APIs.
    // No Database Connections: Edge functions can't maintain persistent database connections like Prisma requires.

    try {
      const profile = await fetch(`${origin}/api/subscription-status-middleware?userId=${userId}`);
      const data = await profile.json();
      if(!data.subscriptionActive) {
        // Redirect to subscribe page if user is authenticated but subscription is not active
        return NextResponse.redirect(new URL('/subscribe', origin));
      }

    } catch (error: any) {
       return NextResponse.redirect(new URL('/subscribe', origin));
    }  
  }
  // continue with the request if no conditions are met
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};