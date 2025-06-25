// File: db/schema.ts
import {
	boolean,
	date,
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
	index,
} from 'drizzle-orm/pg-core';

// Define the type for the JSON data
export type ThemeData = {
	pages: Array<{
		objects: string[];
		version: string;
		background?: string;
		backgroundImage?: string;
	}>;
};

// Define type for memorial product saved data
// Adjust this based on your actual data structure
export type MemorialProductData = Record<string, unknown>;

// Alternative: If you know the structure will be more specific
// export type MemorialProductData = {
//   templateData?: Record<string, string>;
//   customizations?: {
//     colors?: string[];
//     fonts?: string[];
//     images?: string[];
//   };
//   userInputs?: Record<string, string | number | boolean>;
// };

// Define product categories enum
export const productCategories = [
	'programs',
	'cards',
	'bookmarks',
	'other',
] as const;
export type ProductCategory = (typeof productCategories)[number];

export const themesTable = pgTable('themes', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	type: text({
		enum: ['bifold', 'trifold'],
	}).notNull(),
	description: text().notNull(),
	data: jsonb('data').$type<ThemeData>().notNull(),
	isActive: boolean('is_active').default(true).notNull(),
});

export const memorialsTable = pgTable(
	'memorials',
	{
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
			.references(() => themesTable.id, { onDelete: 'restrict' })
			.notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index('memorials_user_id_idx').on(table.userId),
		themeIdIdx: index('memorials_theme_id_idx').on(table.themeId),
	})
);

export const productsTable = pgTable(
	'products',
	{
		id: uuid().defaultRandom().primaryKey(),
		productName: text('product_name').notNull(),
		productCategory: text('product_category', {
			enum: productCategories,
		}).notNull(),
		description: text().notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => ({
		categoryIdx: index('products_category_idx').on(table.productCategory),
	})
);

export const memorialProductsTable = pgTable(
	'memorial_products',
	{
		id: uuid().defaultRandom().primaryKey(),
		memorialId: integer('memorial_id')
			.references(() => memorialsTable.id, { onDelete: 'cascade' })
			.notNull(),
		productId: uuid('product_id')
			.references(() => productsTable.id, { onDelete: 'restrict' })
			.notNull(),
		savedData: jsonb('saved_data')
			.$type<MemorialProductData>()
			.default({})
			.notNull(),
		inOrder: boolean('in_order').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => ({
		memorialIdIdx: index('memorial_products_memorial_id_idx').on(
			table.memorialId
		),
		productIdIdx: index('memorial_products_product_id_idx').on(table.productId),
		// Composite index for queries filtering by memorial and in_order status
		memorialOrderIdx: index('memorial_products_memorial_order_idx').on(
			table.memorialId,
			table.inOrder
		),
	})
);

// Type exports for use in your application
export type Theme = typeof themesTable.$inferSelect;
export type NewTheme = typeof themesTable.$inferInsert;

export type Memorial = typeof memorialsTable.$inferSelect;
export type NewMemorial = typeof memorialsTable.$inferInsert;

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;

export type MemorialProduct = typeof memorialProductsTable.$inferSelect;
export type NewMemorialProduct = typeof memorialProductsTable.$inferInsert;
