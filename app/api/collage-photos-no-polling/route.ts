// File: app/api/collage-photos/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { auth } from '@clerk/nextjs/server';

// Initialize ImageKit instance
const imagekit = new ImageKit({
	publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
	urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

interface ImageKitFile {
	fileId: string;
	name: string;
	filePath: string;
	url: string;
	thumbnailUrl?: string;
	createdAt: string;
	size: number;
	type: 'file' | 'folder';
}

// GET handler - List files in a folder
export async function GET(request: NextRequest) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const { searchParams } = new URL(request.url);
		const folder = searchParams.get('folder');

		if (!folder) {
			return NextResponse.json(
				{ error: 'Folder parameter is required' },
				{ status: 400 }
			);
		}

		const files = await imagekit.listFiles({
			path: folder,
			includeFolder: false,
			fileType: 'image',
		});

		// Cast and filter for files only
		const photos = (files as ImageKitFile[])
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

		return NextResponse.json({ photos });
	} catch (error) {
		console.error('Error listing files:', error);
		return NextResponse.json(
			{ error: 'Failed to list files' },
			{ status: 500 }
		);
	}
}

// DELETE handler - Delete multiple files
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
		};

		// Delay utility
		const delay = (ms: number) =>
			new Promise((resolve) => setTimeout(resolve, ms));

		// Delete files sequentially to avoid rate limits
		for (const fileId of fileIds) {
			try {
				await imagekit.deleteFile(fileId);
				results.successful.push(fileId);
				// Add 200ms delay between deletions
				await delay(200);
			} catch (error) {
				console.error(`Failed to delete file ${fileId}:`, error);
				results.failed.push({
					fileId,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
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
			{ error: 'Invalid request body' },
			{ status: 400 }
		);
	}
}

// OPTIONS handler for CORS
export async function OPTIONS() {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	return new NextResponse(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}
