// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from '@imagekit/next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		// authenticate the user. return an error if user is unauthorized.
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { token, expire, signature } = getUploadAuthParams({
			privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string, // Never expose this on client side
			publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
			// expire: 30 * 60, // Optional, controls the expiry time of the token in seconds, maximum 1 hour in the future
			// token: "random-token", // Optional, a unique token for request
		});

		return NextResponse.json({
			token,
			expire,
			signature,
			publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
		});
	} catch (error) {
		console.error('[upload-auth]', error);
		return NextResponse.json(
			{ error: 'Failed to generate authentication parameters for imagekit' },
			{ status: 500 }
		);
	}
}

export async function DELETE() {
	const { userId } = await auth();
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
	} catch (error) {
		console.error(error);
	}
}
