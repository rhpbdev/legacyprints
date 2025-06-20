// File: app/api/cover-photo/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface ImageKitFile {
	fileId: string;
	name: string;
	filePath: string;
}

interface ImageKitResponse {
	files?: ImageKitFile[];
}

interface BatchDeleteResponse {
	successfullyDeletedFileIds?: string[];
}

export async function DELETE(req: Request): Promise<NextResponse> {
	// Authenticate user
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Parse folder query param
	const url = new URL(req.url);
	const folder = url.searchParams.get('folder');
	if (!folder) {
		return NextResponse.json(
			{ error: 'Missing folder query parameter' },
			{ status: 400 }
		);
	}

	// Ensure user can only delete their own folder
	if (!folder.startsWith(`${userId}/`)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	// ImageKit REST API basic auth
	const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

	if (!privateKey) {
		console.error('Missing IMAGEKIT_PRIVATE_KEY');
		return NextResponse.json(
			{ error: 'Server misconfiguration' },
			{ status: 500 }
		);
	}

	const authHeader =
		'Basic ' + Buffer.from(privateKey + ':').toString('base64');

	try {
		console.log('Delete request for folder:', folder);

		// Try to search files by path using ImageKit's search parameters
		const searchPath = folder;
		const apiUrl = `https://api.imagekit.io/v1/files?path=${encodeURIComponent(
			searchPath
		)}&limit=1000`;

		console.log('API URL:', apiUrl);

		const filesRes = await fetch(apiUrl, {
			headers: {
				Accept: 'application/json',
				Authorization: authHeader,
			},
		});

		console.log('API Response status:', filesRes.status, filesRes.statusText);

		if (!filesRes.ok) {
			const err = await filesRes.text();
			console.error('Error fetching files:', err);

			// If path search fails, try without path parameter
			console.log('Trying alternative approach - fetching all files...');

			const allFilesRes = await fetch(
				'https://api.imagekit.io/v1/files?limit=1000',
				{
					headers: {
						Accept: 'application/json',
						Authorization: authHeader,
					},
				}
			);

			if (!allFilesRes.ok) {
				const allErr = await allFilesRes.text();
				return NextResponse.json(
					{ error: 'Failed to fetch files', details: allErr },
					{ status: 502 }
				);
			}

			const allData = (await allFilesRes.json()) as
				| ImageKitResponse
				| ImageKitFile[];
			const allFiles: ImageKitFile[] = Array.isArray(allData)
				? allData
				: allData.files || [];

			console.log(`📁 Total files in account: ${allFiles.length}`);

			// Try multiple path formats for matching
			const pathVariations = [
				folder, // userId/memorialId/cover-photo
				`/${folder}`, // /userId/memorialId/cover-photo
				`${folder}/`, // userId/memorialId/cover-photo/
				`/${folder}/`, // /userId/memorialId/cover-photo/
			];

			console.log('Searching with path variations:', pathVariations);

			// Debug: Log first 10 file paths to understand the structure
			console.log('Sample file paths from ImageKit:');
			allFiles.slice(0, 10).forEach((file, index) => {
				if (file.filePath) {
					console.log(
						`  ${index + 1}. "${file.filePath}" (name: ${file.name})`
					);
				}
			});

			// Find files that match any of our path variations
			const targetFiles = allFiles.filter((file) => {
				if (!file.filePath) return false;

				// Check if the file path includes our folder path in any variation
				const matches = pathVariations.some((pathVar) => {
					// Check both exact folder match and as a parent folder
					return (
						file.filePath === pathVar ||
						file.filePath.startsWith(pathVar + '/') ||
						file.filePath.includes('/' + folder + '/') ||
						(file.filePath.includes(folder) &&
							file.filePath.includes('cover-photo'))
					);
				});

				if (file.filePath.includes(userId)) {
					console.log(`🔎 File with user ID ${userId}:`, {
						name: file.name,
						filePath: file.filePath,
						matches: matches,
					});
				}

				return matches;
			});

			return await deleteFiles(targetFiles, folder, authHeader);
		}

		// If path search worked, use those results
		const data = (await filesRes.json()) as ImageKitResponse | ImageKitFile[];
		const files: ImageKitFile[] = Array.isArray(data) ? data : data.files || [];

		console.log(`Found ${files.length} files via path search`);

		return await deleteFiles(files, folder, authHeader);
	} catch (error) {
		console.error('Error in cover-photo DELETE:', error);
		return NextResponse.json(
			{
				error: 'Internal error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

async function deleteFiles(
	files: ImageKitFile[],
	folder: string,
	authHeader: string
): Promise<NextResponse> {
	if (files.length === 0) {
		return NextResponse.json({
			success: true,
			message: `No files found in folder ${folder}`,
			deletedCount: 0,
		});
	}

	console.log(`Preparing to delete ${files.length} files`);

	// Log files to be deleted
	files.forEach((file) => {
		console.log(`  - ${file.name} (${file.filePath})`);
	});

	// Extract file IDs for batch deletion
	const fileIds = files.map((file) => file.fileId);

	// Use ImageKit's batch delete API
	const batchDeleteRes = await fetch(
		'https://api.imagekit.io/v1/files/batch/deleteByFileIds',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: authHeader,
			},
			body: JSON.stringify({ fileIds }),
		}
	);

	if (!batchDeleteRes.ok) {
		const errorText = await batchDeleteRes.text();
		console.error('Batch delete failed:', errorText);
		return NextResponse.json(
			{ error: 'Batch delete failed', details: errorText },
			{ status: 502 }
		);
	}

	const batchResult = (await batchDeleteRes.json()) as BatchDeleteResponse;
	console.log('✅ Batch delete result:', batchResult);

	const successfulDeletions =
		batchResult.successfullyDeletedFileIds?.length || fileIds.length;

	return NextResponse.json({
		success: true,
		message: `Successfully deleted ${successfulDeletions} files from folder ${folder}`,
		deletedCount: successfulDeletions,
		deletedFiles: files.map((f) => ({
			name: f.name,
			fileId: f.fileId,
			filePath: f.filePath,
		})),
	});
}
