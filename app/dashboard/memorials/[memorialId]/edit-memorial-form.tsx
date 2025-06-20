// File: dashboard/memorials/[memorialId]/edit-memorial-form.tsx
'use client';

import MemorialForm, { memorialFormSchema } from '@/components/memorial-form';
import { type Themes } from '@/types/Themes';
import { z } from 'zod';
import { updateMemorial } from './actions';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { upload } from '@imagekit/next';
import { useAuth } from '@clerk/nextjs';
import { deleteCoverPhotos } from '@/lib/imagekit-utils';
// import { useState } from 'react';

export default function EditMemorialForm({
	themes,
	memorial,
}: {
	themes: Themes[];
	memorial: {
		id: number;
		themeId: number;
		quantity: string;
		deceasedName: string;
		serviceDate: string;
		sunriseDate: string;
		sunsetDate: string;
		serviceLocation: string;
		serviceAddress: string;
		serviceTime: string;
		deceasedPhotoUrl: string;
	};
}) {
	const router = useRouter();
	const { userId } = useAuth();
	// const [isDeleting, setIsDeleting] = useState(false);

	if (!userId) {
		toast.error('Error', {
			description: 'You must be logged in to create a memorial.',
		});
		return null;
	}

	// const clearCoverPhotos = async () => {
	// 	if (!userId) {
	// 		console.error('No userId available');
	// 		return;
	// 	}

	// 	console.log('Starting clearCoverPhotos for:', {
	// 		userId,
	// 		memorialId: memorial.id,
	// 	});
	// 	setIsDeleting(true);

	// 	try {
	// 		const result = await deleteCoverPhotos(userId, memorial.id);
	// 		console.log('Delete successful:', result);
	// 		toast.success(
	// 			`Success! ${result.message || 'All cover photos deleted successfully'}`
	// 		);
	// 	} catch (error) {
	// 		console.error('Delete failed:', error);
	// 		toast.error(
	// 			`Failed to delete cover photos: ${
	// 				error instanceof Error ? error.message : 'Unknown error'
	// 			}`
	// 		);
	// 	} finally {
	// 		setIsDeleting(false);
	// 	}
	// };

	const handleSubmit = async (
		data: z.infer<typeof memorialFormSchema>,
		file?: File
	) => {
		let deceasedPhotoUrl = memorial.deceasedPhotoUrl; // Use existing photo as default

		// If uploading a new image, optionally clear existing ones first
		if (file) {
			try {
				console.log('Starting file upload for memorial:', memorial.id);

				// Optional: Delete existing cover photos before uploading new one
				// Uncomment the next line if you want to auto-delete old photos
				await deleteCoverPhotos(userId, memorial.id);

				const authRes = await fetch('/api/upload-auth');
				if (!authRes.ok) {
					throw new Error(`Auth request failed: ${authRes.status}`);
				}
				const auth = await authRes.json();

				const uploaded = await upload({
					file,
					folder: `${userId}/${memorial.id}/cover-photo`,
					fileName: `${userId}-${Date.now()}-${file.name}`,
					...auth,
				});

				if (!uploaded.url) {
					toast.error('Image upload failed: No URL returned.');
					return;
				}

				console.log('Upload successful:', uploaded.url);
				deceasedPhotoUrl = uploaded.url;
			} catch (error) {
				console.error('Image upload failed:', error);
				toast.error(
					`Image upload failed: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				);
				return;
			}
		}

		console.log('Updating memorial with data:', { ...data, deceasedPhotoUrl });

		const result = await updateMemorial({
			id: memorial.id,
			quantity: data.quantity,
			themeId: data.themeId,
			deceasedName: data.deceasedName,
			serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
			sunriseDate: format(data.sunriseDate, 'yyyy-MM-dd'),
			sunsetDate: format(data.sunsetDate, 'yyyy-MM-dd'),
			serviceTime: data.serviceTime,
			serviceLocation: data.serviceLocation,
			serviceAddress: data.serviceAddress,
			deceasedPhotoUrl,
		});

		if (result?.error) {
			console.error('Memorial update failed:', result);
			toast.error('Error', {
				description: result.message,
			});
			return;
		}

		toast.success('Success', {
			description: `Memorial for ${data.deceasedName} updated successfully`,
		});

		router.push(
			`/dashboard/memorials?month=${
				data.serviceDate.getMonth() + 1
			}&year=${data.serviceDate.getFullYear()}`
		);
	};

	return (
		<div>
			{/* <button
				type='button'
				onClick={clearCoverPhotos}
				disabled={isDeleting}
				className='mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'>
				{isDeleting ? 'Deleting...' : 'Clear All Cover Photos'}
			</button> */}

			<MemorialForm
				defaultValues={{
					quantity: Number(memorial.quantity),
					themeId: memorial.themeId,
					deceasedName: memorial.deceasedName,
					serviceDate: parseISO(memorial.serviceDate),
					sunriseDate: parseISO(memorial.sunriseDate),
					sunsetDate: parseISO(memorial.sunsetDate),
					serviceTime: memorial.serviceTime,
					serviceLocation: memorial.serviceLocation,
					serviceAddress: memorial.serviceAddress,
					programStyle:
						themes.find((theme) => theme.id === memorial.themeId)?.type ??
						'bifold',
					// Don't include deceasedPhotoUrl in defaultValues since it should be a File, not a string
				}}
				onSubmit={handleSubmit}
				themes={themes}
				previewUrl={memorial.deceasedPhotoUrl}
			/>
		</div>
	);
}
