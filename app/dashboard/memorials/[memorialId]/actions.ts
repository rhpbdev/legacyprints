// File: dashboard/memorials/[memorialId]/actions.ts
'use server';

import { db } from '@/db';
import { memorialProductsTable, memorialsTable } from '@/db/schema';
import { memorialSchema } from '@/validation/memorialSchema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
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
			updatedAt: new Date(),
		})
		.where(
			and(eq(memorialsTable.id, data.id), eq(memorialsTable.userId, userId))
		);
}

export async function updateMemorialProductOrder(
	memorialProductId: string,
	inOrder: boolean
) {
	const { userId } = await auth();

	if (!userId) {
		return {
			error: true,
			message: 'Unauthorized',
		};
	}

	try {
		await db
			.update(memorialProductsTable)
			.set({
				inOrder,
				updatedAt: new Date(),
			})
			.where(eq(memorialProductsTable.id, memorialProductId));

		// Revalidate the cache
		revalidateTag('memorial-products');

		return {
			error: false,
		};
	} catch (error) {
		console.error('Error updating memorial product order:', error);
		return {
			error: true,
			message: 'Failed to update order status',
		};
	}
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
