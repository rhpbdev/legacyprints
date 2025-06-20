// File: app/api/collage-photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { auth } from '@clerk/nextjs/server';
import { type ImageKitFile } from '@/types/ImageKitTypes';

// Initialize ImageKit instance
const imagekit = new ImageKit({
	publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
	urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

// Cache to store folder timestamps for optimized polling
const folderCache = new Map<string, { timestamp: number; etag: string }>();

// GET handler - List files in a folder with polling optimizations
export async function GET(request: NextRequest) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const folder = searchParams.get('folder');
		const ifNoneMatch = request.headers.get('if-none-match');

		if (!folder) {
			return NextResponse.json(
				{ error: 'Folder parameter is required' },
				{ status: 400 }
			);
		}

		// Get current timestamp for cache invalidation
		const now = Date.now();
		const cacheKey = `${userId}:${folder}`;

		// Check cache for recent requests (within last 30 seconds)
		const cached = folderCache.get(cacheKey);
		if (
			cached &&
			now - cached.timestamp < 30000 &&
			ifNoneMatch === cached.etag
		) {
			return new NextResponse(null, { status: 304 });
		}

		let retryCount = 0;
		const maxRetries = 3;
		let files: ImageKitFile[] = [];

		// Retry mechanism for ImageKit API calls
		while (retryCount < maxRetries) {
			try {
				files = (await imagekit.listFiles({
					path: folder,
					includeFolder: false,
					fileType: 'image',
					sort: 'DESC_CREATED', // Most recent first for better UX during polling
					limit: 1000, // Ensure we get all files
				})) as ImageKitFile[];
				break;
			} catch (error: unknown) {
				retryCount++;
				console.error(`ImageKit API error (attempt ${retryCount}):`, error);

				if (retryCount >= maxRetries) {
					throw error;
				}

				// Exponential backoff
				await new Promise((resolve) =>
					setTimeout(resolve, Math.pow(2, retryCount) * 1000)
				);
			}
		}

		// Filter and map files
		const photos = files
			.filter((item) => item.type === 'file')
			.map((file) => ({
				fileId: file.fileId,
				name: file.name,
				filePath: file.filePath,
				url: file.url,
				thumbnailUrl: file.thumbnailUrl || '',
				createdAt: file.createdAt,
				size: file.size,
			}));

		// Generate ETag based on file count and last modified time
		const photoCount = photos.length;
		const lastModified =
			photos.length > 0 ? photos[0].createdAt : now.toString();
		const etag = `"${photoCount}-${Buffer.from(lastModified).toString(
			'base64'
		)}"`;

		// Update cache
		folderCache.set(cacheKey, { timestamp: now, etag });

		// Clean up old cache entries (older than 5 minutes)
		for (const [key, value] of folderCache.entries()) {
			if (now - value.timestamp > 300000) {
				folderCache.delete(key);
			}
		}

		const response = NextResponse.json({
			photos,
			count: photoCount,
			timestamp: now,
		});

		// Set cache headers for client-side optimization
		response.headers.set('ETag', etag);
		response.headers.set('Cache-Control', 'no-cache, must-revalidate');
		response.headers.set('Last-Modified', new Date(lastModified).toUTCString());

		return response;
	} catch (error) {
		console.error('Error listing files:', error);
		return NextResponse.json(
			{
				error: 'Failed to list files',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

// DELETE handler - Delete multiple files with batch processing
export async function DELETE(request: NextRequest) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { fileIds } = body;

		if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
			return NextResponse.json(
				{ error: 'fileIds array is required' },
				{ status: 400 }
			);
		}

		// Validate all fileIds are strings
		if (!fileIds.every((id) => typeof id === 'string')) {
			return NextResponse.json(
				{ error: 'All fileIds must be strings' },
				{ status: 400 }
			);
		}

		const results = {
			successful: [] as string[],
			failed: [] as { fileId: string; error: string }[],
			totalRequested: fileIds.length,
		};

		// Process deletions in smaller batches to avoid rate limits
		const batchSize = 5;
		const batches = [];
		for (let i = 0; i < fileIds.length; i += batchSize) {
			batches.push(fileIds.slice(i, i + batchSize));
		}

		for (const batch of batches) {
			const batchPromises = batch.map(async (fileId: string) => {
				let retryCount = 0;
				const maxRetries = 3;

				while (retryCount < maxRetries) {
					try {
						await imagekit.deleteFile(fileId);
						results.successful.push(fileId);
						return;
					} catch (error: unknown) {
						retryCount++;
						console.error(
							`Failed to delete file ${fileId} (attempt ${retryCount}):`,
							error
						);

						if (retryCount >= maxRetries) {
							results.failed.push({
								fileId,
								error: error instanceof Error ? error.message : 'Unknown error',
							});
						} else {
							// Brief delay before retry
							await new Promise((resolve) =>
								setTimeout(resolve, 500 * retryCount)
							);
						}
					}
				}
			});

			// Wait for current batch to complete before starting next
			await Promise.all(batchPromises);

			// Brief pause between batches
			if (batches.indexOf(batch) < batches.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		// Clear relevant cache entries after successful deletions
		if (results.successful.length > 0) {
			for (const [key] of folderCache.entries()) {
				if (key.startsWith(`${userId}:`)) {
					folderCache.delete(key);
				}
			}
		}

		// Return appropriate status based on results
		if (results.failed.length === 0) {
			return NextResponse.json({
				message: `Successfully deleted ${results.successful.length} files`,
				results,
			});
		} else if (results.successful.length === 0) {
			return NextResponse.json(
				{
					error: 'Failed to delete all files',
					results,
				},
				{ status: 500 }
			);
		} else {
			return NextResponse.json(
				{
					message: `Partially successful: ${results.successful.length} deleted, ${results.failed.length} failed`,
					results,
				},
				{ status: 207 } // Multi-Status
			);
		}
	} catch (error) {
		console.error('Delete endpoint error:', error);
		return NextResponse.json(
			{
				error: 'Invalid request body',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 400 }
		);
	}
}

// OPTIONS handler for CORS
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
			'Access-Control-Allow-Headers':
				'Content-Type, Authorization, If-None-Match',
		},
	});
}
