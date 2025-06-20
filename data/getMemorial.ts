import { db } from '@/db';
import { memorialsTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import 'server-only';

export async function getMemorial(memorialId: number) {
	const { userId } = await auth();
	if (!userId) {
		return null;
	}

	const [memorial] = await db
		.select()
		.from(memorialsTable)
		.where(
			and(eq(memorialsTable.id, memorialId), eq(memorialsTable.userId, userId))
		);

	return memorial;
}
