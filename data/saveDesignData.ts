// data/saveDesignData.ts
'use server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { memorialProductsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Define specific types for Fabric.js objects
interface FabricObject {
	type: string;
	version: string;
	originX: string;
	originY: string;
	left: number;
	top: number;
	width: number;
	height: number;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	angle?: number;
	scaleX?: number;
	scaleY?: number;
	opacity?: number;
	visible?: boolean;
	backgroundColor?: string;
	// Add other common Fabric.js object properties as needed
	[key: string]: unknown; // For any additional properties
}

interface DesignData {
	version: string;
	objects: FabricObject[];
	background?: string;
	backgroundImage?: string;
	width?: number;
	height?: number;
	// Add other known canvas properties
	[key: string]: unknown; // For any additional properties
}

// Define the shape of memorial product data from your schema
type MemorialProductData = DesignData | Record<string, unknown>;

interface SaveDesignResult {
	success: boolean;
	error?: string;
	data?: {
		id: string; // Changed from number to string
		memorialId: number;
		productId: string;
		savedData: MemorialProductData;
		inOrder: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
}

export async function saveDesignData(
	memorialId: number,
	productId: string,
	designData: DesignData
): Promise<SaveDesignResult> {
	try {
		// Authenticate user
		const { userId } = await auth();

		if (!userId) {
			return {
				success: false,
				error: 'User not authenticated',
			};
		}

		// Validate input
		if (!memorialId || !productId || !designData) {
			return {
				success: false,
				error: 'Missing required data',
			};
		}

		// Update the memorial product with design data using memorial_id and product_id
		const result = await db
			.update(memorialProductsTable)
			.set({
				savedData: designData,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(memorialProductsTable.memorialId, memorialId),
					eq(memorialProductsTable.productId, productId)
				)
			)
			.returning();

		if (result.length === 0) {
			return {
				success: false,
				error: 'Memorial product not found or user not authorized',
			};
		}

		return {
			success: true,
			data: result[0],
		};
	} catch (error) {
		console.error('Error saving design data:', error);

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
