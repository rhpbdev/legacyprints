// File: app/dashboard/memorials/new/actions.ts
'use server';

import { db } from '@/db';
import { memorialsTable } from '@/db/schema';
import { memorialSchema } from '@/validation/memorialSchema';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';

export const createMemorial = async (data: {
	quantity: number;
	deceasedName: string;
	sunriseDate: string;
	sunsetDate: string;
	serviceDate: string;
	serviceTime: string;
	serviceLocation: string;
	serviceAddress: string;
	themeId: number;
	deceasedPhotoUrl: string;
}) => {
	const { userId } = await auth();

	if (!userId) {
		return { error: true, message: 'Unauthorized' };
	}

	const validation = memorialSchema.safeParse(data);

	if (!validation.success) {
		return {
			error: true,
			message: validation.error.issues[0].message,
		};
	}

	// insert validated data into the database. destructure the memorial data.
	const [memorial] = await db
		.insert(memorialsTable)
		.values({
			userId,
			quantity: data.quantity.toString(),
			deceasedName: data.deceasedName,
			sunriseDate: data.sunriseDate,
			sunsetDate: data.sunsetDate,
			serviceDate: data.serviceDate,
			serviceTime: data.serviceTime,
			serviceLocation: data.serviceLocation,
			serviceAddress: data.serviceAddress,
			themeId: data.themeId,
			deceasedPhotoUrl: data.deceasedPhotoUrl || '', // placeholder for file upload
		})
		.returning();

	return {
		id: memorial.id,
	};
};

// Only update the deceasedPhotoUrl column
const updatePhotoSchema = z.object({
	id: z.number().positive(),
	deceasedPhotoUrl: z.string().url(),
});

export async function updateMemorialPhoto(
	data: z.infer<typeof updatePhotoSchema>
) {
	const { userId } = await auth();
	if (!userId) return { error: true, message: 'Unauthorized' };

	const parsed = updatePhotoSchema.safeParse(data);
	if (!parsed.success) {
		return { error: true, message: parsed.error.issues[0].message };
	}
	const { id, deceasedPhotoUrl } = parsed.data;

	try {
		await db
			.update(memorialsTable)
			.set({ deceasedPhotoUrl })
			.where(and(eq(memorialsTable.id, id), eq(memorialsTable.userId, userId)));
		return { id };
	} catch (error: unknown) {
		console.error('updateMemorialPhoto error:', error);
		// narrow down to get a message
		const message =
			error instanceof Error ? error.message : 'An unexpected error occurred';
		return { error: true, message };
	}
}
