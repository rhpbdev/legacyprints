// File: data/getMemorialProducts.ts
import { db } from '@/db';
import {
	memorialProductsTable,
	productsTable,
	memorialsTable,
} from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import 'server-only';

// Direct query - used internally
async function getMemorialProductsQuery(memorialId: number, userId: string) {
	// Verify ownership and get products in a single query
	// Alternative: Select only what you need without the memorial field
	const results = await db
		.select({
			// Memorial product fields
			id: memorialProductsTable.id,
			memorialId: memorialProductsTable.memorialId,
			productId: memorialProductsTable.productId,
			savedData: memorialProductsTable.savedData,
			inOrder: memorialProductsTable.inOrder,
			createdAt: memorialProductsTable.createdAt,
			updatedAt: memorialProductsTable.updatedAt,
			// Product fields
			product: {
				id: productsTable.id,
				productName: productsTable.productName,
				productCategory: productsTable.productCategory,
				description: productsTable.description,
			},
		})
		.from(memorialProductsTable)
		.innerJoin(
			productsTable,
			eq(memorialProductsTable.productId, productsTable.id)
		)
		.innerJoin(
			memorialsTable,
			and(
				eq(memorialProductsTable.memorialId, memorialsTable.id),
				eq(memorialsTable.userId, userId)
			)
		)
		.where(eq(memorialProductsTable.memorialId, memorialId));

	return results;
}

// Cached version - revalidates on memorial product updates
const getCachedMemorialProducts = unstable_cache(
	getMemorialProductsQuery,
	['memorial-products'],
	{
		revalidate: 3600, // Cache for 1 hour
		tags: ['memorial-products'],
	}
);

// Main export - handles auth and caching
export async function getMemorialProducts(memorialId: number) {
	const { userId } = await auth();
	if (!userId) {
		return [];
	}

	const products = await getCachedMemorialProducts(memorialId, userId);

	// Sort products by name only
	return products.sort((a, b) => {
		// Optional: Ensure "programs" category always comes first
		if (
			a.product.productCategory === 'programs' &&
			b.product.productCategory !== 'programs'
		)
			return -1;
		if (
			a.product.productCategory !== 'programs' &&
			b.product.productCategory === 'programs'
		)
			return 1;

		// Then sort by product name
		return a.product.productName.localeCompare(b.product.productName);
	});
}

// Type exports for better DX
export type MemorialProduct = Awaited<
	ReturnType<typeof getMemorialProducts>
>[0];
export type ProductInfo = MemorialProduct['product'];

// Utility function to check if any products are in order
export function hasProductsInOrder(products: MemorialProduct[]): boolean {
	return products.some((p) => p.inOrder);
}

// Utility function to group products by category
export function groupProductsByCategory(products: MemorialProduct[]) {
	return products.reduce((acc, product) => {
		const category = product.product.productCategory;
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(product);
		return acc;
	}, {} as Record<string, MemorialProduct[]>);
}
