import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// create routes that should always be public
const isPublicRoute = createRouteMatcher([
	'/',
	'/products',
	'/themes',
	'/contact',
	'/sign-in(.*)',
	'/sign-up(.*)',
]);

// the most common property you can access is request(req)
export default clerkMiddleware(async (auth, request) => {
	// extract something from the auth request
	const user = auth(); // don't use await here: using await here sometimes causes issues
	const userId = (await user).userId; // we have to await the user object to get the userId
	const url = new URL(request.url);

	// if the user is signed in, and the route is public, redirect to the dashboard
	// user can access the
	if (userId && isPublicRoute(request) && url.pathname !== '/') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	// protect non-public routes
	if (!isPublicRoute(request)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
