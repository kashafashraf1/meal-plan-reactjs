import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe(.*)",
]);

const isSignUpRoute = createRouteMatcher([
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const {userId} = userAuth;
  const {pathname, origin} = req.nextUrl;
  console.log("Middleware info:", userId, pathname, origin);

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