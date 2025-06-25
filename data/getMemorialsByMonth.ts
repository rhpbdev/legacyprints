import { db } from '@/db';
import { memorialsTable, themesTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import 'server-only';

export async function getMemorialsByMonth({
	month,
	year,
}: {
	month: number;
	year: number;
}) {
	const { userId } = await auth();

	if (!userId) {
		return null;
	}

	const earliestDate = new Date(year, month - 1, 1);
	const latestDate = new Date(year, month, 0); // grab the last day of the month

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
		.where(
			and(
				eq(memorialsTable.userId, userId),
				gte(memorialsTable.serviceDate, format(earliestDate, 'yyyy-MM-dd')),
				lte(memorialsTable.serviceDate, format(latestDate, 'yyyy-MM-dd'))
			)
		)
		.orderBy(desc(memorialsTable.createdAt))
		.leftJoin(themesTable, eq(memorialsTable.themeId, themesTable.id));

	return memorials;
}
