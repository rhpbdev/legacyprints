// File: data/getTheme.ts
import { db } from '@/db';
import { themesTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import 'server-only';

export async function getTheme(themeId: number) {
	const [theme] = await db
		.select()
		.from(themesTable)
		.where(and(eq(themesTable.id, themeId)));

	return theme;
}
