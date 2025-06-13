import { db } from '@/db';
import { themesTable } from '@/db/schema';
import 'server-only';

export async function getThemes() {
	const themes = await db.select().from(themesTable);
	return themes;
}
