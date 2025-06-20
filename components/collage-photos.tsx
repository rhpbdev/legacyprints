// File: components/collage-photos.tsx
'use client';

import {
	ImageKitAbortError,
	ImageKitInvalidRequestError,
	ImageKitServerError,
	ImageKitUploadNetworkError,
	upload,
	Image,
} from '@imagekit/next';
import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
	userId: string;
	memorialId: number;
}

interface CollagePhoto {
	fileId: string;
	name: string;
	filePath: string;
	url: string;
	thumbnailUrl: string;
	createdAt: string;
	size: number;
}

export default function CollagePhotoUploads({ userId, memorialId }: Props) {
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState('');
	const [collagePhotos, setCollagePhotos] = useState<CollagePhoto[]>([]);
	const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
	const [isDeleting, setIsDeleting] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const lastOperationRef = useRef<string | null>(null);

	const fetchPhotos = useCallback(async (): Promise<CollagePhoto[]> => {
		try {
			const folder = encodeURIComponent(
				`${userId}/${memorialId}/collage-photos`
			);
			const url = `/api/collage-photos?folder=${folder}&t=${Date.now()}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				cache: 'no-store',
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch photos: ${response.status}`);
			}

			const data = await response.json();
			return (data.photos ?? []) as CollagePhoto[];
		} catch (error) {
			console.error('Error fetching photos:', error);
			throw error;
		}
	}, [userId, memorialId]);

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		lastOperationRef.current = null;
	}, []);

	// Start polling for photo updates
	const startPolling = useCallback(
		(operation: string, expectedCount?: number) => {
			lastOperationRef.current = operation;
			let attempts = 0;
			const maxAttempts = 15; // Poll for up to 30 seconds (15 attempts * 2 seconds)

			const poll = async () => {
				attempts++;
				try {
					const photos = await fetchPhotos();

					// Check if operation completed based on expected outcome
					let operationComplete = false;

					if (operation === 'delete' && expectedCount !== undefined) {
						operationComplete = photos.length === expectedCount;
					} else if (operation === 'upload' && expectedCount !== undefined) {
						operationComplete = photos.length >= expectedCount;
					} else {
						// Generic refresh - just update
						operationComplete = true;
					}

					setCollagePhotos(photos);

					if (operationComplete || attempts >= maxAttempts) {
						stopPolling();
						if (operationComplete) {
							console.log(`Polling complete: ${operation} operation verified`);
						} else {
							console.log(
								`Polling stopped: max attempts reached for ${operation}`
							);
						}
					}
				} catch (error) {
					console.error('Polling error:', error);
					if (attempts >= maxAttempts) {
						stopPolling();
					}
				}
			};

			// Start immediate poll, then continue every 2 seconds
			poll();
			pollingIntervalRef.current = setInterval(poll, 2000);
		},
		[fetchPhotos, stopPolling]
	);

	// Initial load
	useEffect(() => {
		const loadInitialPhotos = async () => {
			setIsLoadingPhotos(true);
			try {
				const photos = await fetchPhotos();
				setCollagePhotos(photos);
			} catch (error) {
				console.error('Failed to load initial photos:', error);
			} finally {
				setIsLoadingPhotos(false);
			}
		};

		loadInitialPhotos();

		// Cleanup on unmount
		return () => stopPolling();
	}, [fetchPhotos, stopPolling]);

	const authenticator = async () => {
		try {
			const response = await fetch('/api/upload-auth');
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Request failed with status ${response.status}: ${errorText}`
				);
			}

			const data = await response.json();
			const { signature, expire, token, publicKey } = data;
			return { signature, expire, token, publicKey };
		} catch (error) {
			console.error('Authentication error:', error);
			throw new Error('Authentication request failed');
		}
	};

	const handleUpload = async () => {
		const fileInput = fileInputRef.current;
		if (!fileInput?.files?.length) {
			alert('Please select a file to upload');
			return;
		}

		const selectedFiles = Array.from(fileInput.files);
		const currentPhotoCount = collagePhotos.length;

		setIsUploading(true);
		setProgress(0);
		setUploadStatus('Authenticating...');

		abortControllerRef.current = new AbortController();

		let successCount = 0;
		let failedCount = 0;

		try {
			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				setUploadStatus(
					`Uploading ${i + 1} of ${selectedFiles.length}: ${file.name}`
				);

				try {
					const authParams = await authenticator();

					await upload({
						...authParams,
						file,
						folder: `${userId}/${memorialId}/collage-photos`,
						fileName: file.name,
						onProgress: (event) => {
							const fileProgress = event.loaded / event.total;
							const overallProgress =
								((i + fileProgress) / selectedFiles.length) * 100;
							setProgress(overallProgress);
						},
						abortSignal: abortControllerRef.current.signal,
					});

					successCount++;
				} catch (error) {
					failedCount++;
					handleUploadError(error);
				}
			}

			if (successCount > 0) {
				setUploadStatus(
					`Upload completed! ${successCount} succeeded${
						failedCount > 0 ? `, ${failedCount} failed` : ''
					}`
				);

				// Start polling to verify uploads
				const expectedCount = currentPhotoCount + successCount;
				startPolling('upload', expectedCount);
			} else {
				setUploadStatus('All uploads failed. Please try again.');
			}
		} catch (authError) {
			console.error('Failed to authenticate for upload:', authError);
			setUploadStatus('Authentication failed. Please try again.');
		} finally {
			setIsUploading(false);
			if (fileInput) fileInput.value = '';
		}
	};

	const handleUploadError = (error: unknown) => {
		if (error instanceof ImageKitAbortError) {
			console.error('Upload aborted:', error.reason);
			setUploadStatus('Upload cancelled');
		} else if (error instanceof ImageKitInvalidRequestError) {
			console.error('Invalid request:', error.message);
			setUploadStatus(`Invalid request: ${error.message}`);
		} else if (error instanceof ImageKitUploadNetworkError) {
			console.error('Network error:', error.message);
			setUploadStatus('Network error. Please check your connection.');
		} else if (error instanceof ImageKitServerError) {
			console.error('Server error:', error.message);
			setUploadStatus('Server error. Please try again later.');
		} else {
			console.error('Upload error:', error);
			setUploadStatus('Upload failed. Please try again.');
		}
	};

	const cancelUpload = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setIsUploading(false);
			setUploadStatus('Upload cancelled');
		}
	};

	const togglePhotoSelection = (fileId: string) => {
		const newSelected = new Set(selectedPhotos);
		if (newSelected.has(fileId)) {
			newSelected.delete(fileId);
		} else {
			newSelected.add(fileId);
		}
		setSelectedPhotos(newSelected);
	};

	const selectAll = () => {
		const allPhotoIds = new Set(collagePhotos.map((photo) => photo.fileId));
		setSelectedPhotos(allPhotoIds);
	};

	const deselectAll = () => {
		setSelectedPhotos(new Set());
	};

	const deleteSelectedPhotos = async () => {
		if (selectedPhotos.size === 0) {
			alert('No photos selected');
			return;
		}

		const confirmMsg =
			selectedPhotos.size === 1
				? 'Delete this photo?'
				: `Delete ${selectedPhotos.size} photos?`;

		if (!confirm(confirmMsg)) return;

		const currentPhotoCount = collagePhotos.length;
		const deleteCount = selectedPhotos.size;

		setIsDeleting(true);
		setUploadStatus('Deleting photos...');

		try {
			const fileIds = Array.from(selectedPhotos);

			const response = await fetch('/api/collage-photos', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ fileIds }),
			});

			if (!response.ok) {
				throw new Error(`Failed to delete photos: ${response.status}`);
			}

			setUploadStatus(`Deleted ${fileIds.length} photo(s)`);
			setSelectedPhotos(new Set());

			// Start polling to verify deletions
			const expectedCount = currentPhotoCount - deleteCount;
			startPolling('delete', expectedCount);
		} catch (error) {
			console.error('Delete error:', error);
			setUploadStatus('Failed to delete photos');
		} finally {
			setIsDeleting(false);
		}
	};

	const deleteAllPhotos = async () => {
		if (collagePhotos.length === 0) {
			alert('No photos to delete');
			return;
		}

		if (
			!confirm(
				`Delete all ${collagePhotos.length} photos? This cannot be undone.`
			)
		) {
			return;
		}

		setIsDeleting(true);
		setUploadStatus('Deleting all photos...');

		try {
			const fileIds = collagePhotos.map((photo) => photo.fileId);

			const response = await fetch('/api/collage-photos', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ fileIds }),
			});

			if (!response.ok) {
				throw new Error(`Failed to delete photos: ${response.status}`);
			}

			setUploadStatus('All photos deleted');
			setSelectedPhotos(new Set());

			// Start polling to verify all deletions
			startPolling('delete', 0);
		} catch (error) {
			console.error('Delete error:', error);
			setUploadStatus('Failed to delete photos');
		} finally {
			setIsDeleting(false);
		}
	};

	const manualRefresh = () => {
		startPolling('refresh');
	};

	return (
		<div className='container mx-auto p-5'>
			<div className='mb-4'>
				<input
					type='file'
					ref={fileInputRef}
					className='w-full p-2 border border-gray-300 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100'
					multiple
					accept='image/*'
				/>
			</div>

			<div className='flex gap-2'>
				<button
					type='button'
					onClick={handleUpload}
					disabled={isUploading}
					className={`flex-1 py-3 px-4 rounded text-sm font-medium transition-colors ${
						isUploading
							? 'bg-gray-400 cursor-not-allowed text-white'
							: 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
					}`}>
					{isUploading ? 'Uploading...' : 'Upload Files'}
				</button>

				{isUploading && (
					<button
						type='button'
						onClick={cancelUpload}
						className='py-3 px-4 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors'>
						Cancel
					</button>
				)}
			</div>

			{isUploading && (
				<div className='mt-4'>
					<div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
						<div
							className='bg-blue-600 h-full transition-all duration-300 ease-out'
							style={{ width: `${progress}%` }}
						/>
					</div>
					<div className='mt-2 text-xs text-gray-600 text-center'>
						{Math.round(progress)}%
					</div>
				</div>
			)}

			{uploadStatus && (
				<div
					className={`mt-3 p-2 text-xs text-center rounded ${
						uploadStatus.includes('completed') ||
						uploadStatus.includes('succeeded')
							? 'text-green-700 bg-green-50'
							: uploadStatus.includes('failed') ||
							  uploadStatus.includes('error')
							? 'text-red-700 bg-red-50'
							: 'text-gray-600 bg-gray-50'
					}`}>
					{uploadStatus}
				</div>
			)}

			{/* Display existing photos */}
			<div className='mt-8'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-lg font-medium text-gray-700'>
						Collage Photos ({collagePhotos.length})
						{selectedPhotos.size > 0 && (
							<span className='text-sm text-blue-600 ml-2'>
								({selectedPhotos.size} selected)
							</span>
						)}
						{pollingIntervalRef.current && (
							<span className='text-xs text-orange-600 ml-2'>(syncing...)</span>
						)}
					</h3>
					<button
						onClick={manualRefresh}
						disabled={isLoadingPhotos || !!pollingIntervalRef.current}
						className='text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400'>
						{isLoadingPhotos || pollingIntervalRef.current
							? 'Syncing...'
							: 'Refresh'}
					</button>
				</div>

				{collagePhotos.length > 0 && (
					<div className='mb-4 flex flex-wrap gap-2'>
						<button
							onClick={
								selectedPhotos.size === collagePhotos.length
									? deselectAll
									: selectAll
							}
							className='text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50'>
							{selectedPhotos.size === collagePhotos.length
								? 'Deselect All'
								: 'Select All'}
						</button>

						{selectedPhotos.size > 0 && (
							<button
								onClick={deleteSelectedPhotos}
								disabled={isDeleting}
								className='text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400'>
								Delete Selected ({selectedPhotos.size})
							</button>
						)}

						<button
							onClick={deleteAllPhotos}
							disabled={isDeleting}
							className='text-sm px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:border-gray-400 disabled:text-gray-400'>
							Delete All
						</button>
					</div>
				)}

				{collagePhotos.length > 0 ? (
					<div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
						{collagePhotos.map((photo) => (
							<div
								key={photo.fileId}
								className={`relative group cursor-pointer ${
									selectedPhotos.has(photo.fileId) ? 'ring-2 ring-blue-500' : ''
								}`}
								onClick={() => togglePhotoSelection(photo.fileId)}>
								<div className='border border-gray-200 rounded-lg overflow-hidden'>
									<div className='absolute top-2 left-2 z-10'>
										<div
											className={`w-5 h-5 border-2 rounded ${
												selectedPhotos.has(photo.fileId)
													? 'bg-blue-500 border-blue-500'
													: 'bg-white border-gray-300'
											}`}>
											{selectedPhotos.has(photo.fileId) && (
												<svg
													className='w-3 h-3 text-white mx-auto mt-0.5'
													fill='currentColor'
													viewBox='0 0 20 20'>
													<path
														fillRule='evenodd'
														d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
														clipRule='evenodd'
													/>
												</svg>
											)}
										</div>
									</div>

									<Image
										urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
										src={photo.filePath}
										width={300}
										height={200}
										alt={photo.name}
										className='w-full h-40 object-cover'
										loading='lazy'
										transformation={[
											{
												height: '200',
												width: '300',
												crop: 'at_max',
											},
										]}
									/>
								</div>
								<p className='text-xs text-gray-500 mt-1 truncate'>
									{photo.name}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className='text-gray-500 text-center py-8'>
						No photos uploaded yet
					</p>
				)}
			</div>
		</div>
	);
}
