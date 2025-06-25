import { db } from '@/db';
import { memorialsTable, themesTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import 'server-only';

export async function getRecentMemorials() {
	const { userId } = await auth();
	if (!userId) {
		return [];
	}

	const memorials = await db
		.select({
			id: memorialsTable.id,
			deceasedName: memorialsTable.deceasedName,
			quantity: memorialsTable.quantity,
			serviceDate: memorialsTable.serviceDate,
			deceasedPhotoUrl: memorialsTable.deceasedPhotoUrl,
			createdAt: memorialsTable.createdAt,
			updatedAt: memorialsTable.updatedAt,
			theme: themesTable.name,
			programType: themesTable.type,
		})
		.from(memorialsTable)
		.where(eq(memorialsTable.userId, userId))
		.orderBy(desc(memorialsTable.createdAt))
		.limit(8)
		.leftJoin(themesTable, eq(memorialsTable.themeId, themesTable.id));

	return memorials;
}
