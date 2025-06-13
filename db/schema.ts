// File: db/schema.ts
import {
	boolean,
	date,
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
} from 'drizzle-orm/pg-core';

export const themesTable = pgTable('themes', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	type: text({
		enum: ['bifold', 'trifold'],
	}).notNull(),
	description: text().notNull(),
	data: jsonb().notNull(),
	isActive: boolean('is_active').default(true).notNull(),
});

export const memorialsTable = pgTable('memorials', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: text('user_id').notNull(),
	deceasedName: text('deceased_name').notNull(),
	deceasedPhotoUrl: text('deceased_photo_url').notNull(),
	quantity: numeric().notNull(),
	sunriseDate: date('sunrise_date').notNull(),
	sunsetDate: date('sunset_date').notNull(),
	serviceDate: date('service_date').notNull(),
	serviceTime: text('service_time').notNull(),
	serviceLocation: text('service_location').notNull(),
	serviceAddress: text('service_address').notNull(),
	themeId: integer('theme_id')
		.references(() => themesTable.id)
		.notNull(),
});
