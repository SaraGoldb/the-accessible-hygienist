// clerkMiddleware() grants you access to user authentication state throughout your app. 
// It also allows you to protect specific routes from unauthenticated users. 
// All routes are public by default, so here we are protecting all routes except for the sign-in and sign-up pages.

// Refs: 
// - https://clerk.com/docs/nextjs/getting-started/quickstart
// - https://clerk.com/docs/reference/nextjs/clerk-middleware#protect-routes-based-on-authentication-status#protect-all-routes


import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
