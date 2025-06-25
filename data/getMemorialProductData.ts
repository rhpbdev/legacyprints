// data/getMemorialProductData.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { memorialProductsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getMemorialProductData(
	memorialId: number,
	productId: string
) {
	const { userId } = await auth();

	if (!userId) {
		return { error: 'Unauthorized' };
	}

	const result = await db
		.select()
		.from(memorialProductsTable)
		.where(
			and(
				eq(memorialProductsTable.memorialId, memorialId),
				eq(memorialProductsTable.productId, productId)
			)
		)
		.limit(1);

	if (result.length === 0) {
		return { error: 'Not found' };
	}

	return {
		saved_data: result[0].savedData,
		in_order: result[0].inOrder,
		updated_at: result[0].updatedAt,
	};
}
