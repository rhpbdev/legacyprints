import { db } from '@/db';
import { memorialsTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import 'server-only';

export async function getMemorialsYearsRange() {
	const { userId } = await auth();
	if (!userId) {
		return [];
	}

	const [earliestmemorial] = await db
		.select()
		.from(memorialsTable)
		.where(eq(memorialsTable.userId, userId))
		.orderBy(asc(memorialsTable.serviceDate))
		.limit(1);

	const today = new Date();
	const currentYear = today.getFullYear();
	const earliestYear = earliestmemorial
		? new Date(earliestmemorial.serviceDate).getFullYear()
		: currentYear;

	const years = Array.from({ length: currentYear - earliestYear + 1 }).map(
		(_, i) => currentYear - i
	);

	return years;
}
