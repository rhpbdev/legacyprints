// File: dashboard/memorials/[memorialId]/actions.ts
'use server';

import { db } from '@/db';
import { memorialsTable } from '@/db/schema';
import { memorialSchema } from '@/validation/memorialSchema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const updateMemorialSchema = memorialSchema.and(
	z.object({
		id: z.number(),
	})
);

export async function updateMemorial(data: {
	id: number;
	themeId: number;
	quantity: number;
	deceasedName: string;
	serviceDate: string;
	sunriseDate: string;
	sunsetDate: string;
	serviceLocation: string;
	serviceAddress: string;
	serviceTime: string;
	deceasedPhotoUrl: string;
}) {
	const { userId } = await auth();
	if (!userId) {
		return {
			error: 'true',
			message: 'Unauthorized',
		};
	}

	const validation = updateMemorialSchema.safeParse(data);

	if (!validation.success) {
		return {
			error: true,
			message: validation.error.issues[0].message,
		};
	}

	await db
		.update(memorialsTable)
		.set({
			quantity: data.quantity.toString(),
			deceasedName: data.deceasedName,
			sunriseDate: data.sunriseDate,
			sunsetDate: data.sunsetDate,
			serviceDate: data.serviceDate,
			serviceTime: data.serviceTime,
			serviceLocation: data.serviceLocation,
			serviceAddress: data.serviceAddress,
			themeId: data.themeId,
			deceasedPhotoUrl: data.deceasedPhotoUrl,
		})
		.where(
			and(eq(memorialsTable.id, data.id), eq(memorialsTable.userId, userId))
		);
}

export async function deleteMemorial(memorialId: number) {
	const { userId } = await auth();
	if (!userId) {
		return {
			error: true,
			message: 'Unauthorized',
		};
	}

	await db
		.delete(memorialsTable)
		.where(
			and(eq(memorialsTable.id, memorialId), eq(memorialsTable.userId, userId))
		);
}
