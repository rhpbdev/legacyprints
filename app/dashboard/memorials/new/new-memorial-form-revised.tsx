// File: app/dashboard/memorials/new/new-memorial-form.tsx
'use client';

import MemorialForm, { memorialFormSchema } from '@/components/memorial-form';
import { type Themes } from '@/types/Themes';
import { z } from 'zod';
import { createMemorial, updateMemorialPhoto } from './actions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { upload } from '@imagekit/next';
import { useAuth } from '@clerk/nextjs';

export default function NewMemorialForm({ themes }: { themes: Themes[] }) {
	const router = useRouter();
	const { userId } = useAuth();

	if (!userId) {
		toast.error('Error', {
			description: 'You must be logged in to create a memorial.',
		});
		return null;
	}

	const handleSubmit = async (
		data: z.infer<typeof memorialFormSchema>,
		file?: File
	) => {
		if (!file) {
			toast.error('Error', {
				description: 'Please upload a photo of the deceased.',
			});
			return;
		}

		try {
			// Step 1: Create memorial first (with empty photo URL)
			const memorialResult = await createMemorial({
				quantity: data.quantity,
				themeId: data.themeId,
				deceasedName: data.deceasedName,
				serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
				sunriseDate: format(data.sunriseDate, 'yyyy-MM-dd'),
				sunsetDate: format(data.sunsetDate, 'yyyy-MM-dd'),
				serviceTime: data.serviceTime,
				serviceLocation: data.serviceLocation,
				serviceAddress: data.serviceAddress,
				deceasedPhotoUrl: '', // Empty initially
			});

			if ('error' in memorialResult && memorialResult.error) {
				toast.error('Error', {
					description: memorialResult.message,
				});
				return;
			}

			// Check if id exists (TypeScript type guard)
			if (!('id' in memorialResult) || !memorialResult.id) {
				toast.error('Error', {
					description: 'Failed to create memorial',
				});
				return;
			}

			// Step 2: Now we have the memorial ID, upload the photo
			const folderPath = `${userId}/${memorialResult.id}/cover-photo`;

			const authRes = await fetch('/api/upload-auth');
			const auth = await authRes.json();

			const uploaded = await upload({
				file,
				folder: folderPath,
				fileName: `cover-${Date.now()}-${file.name}`,
				...auth,
			});

			if (!uploaded.url) {
				toast.error('Image upload failed: No URL returned.');
				// Note: Memorial is created but without photo
				return;
			}

			// Step 3: Update the memorial with the photo URL
			const updateResult = await updateMemorialPhoto({
				id: memorialResult.id,
				deceasedPhotoUrl: uploaded.url,
			});

			if (updateResult.error) {
				toast.error('Error updating photo', {
					description: updateResult.message,
				});
				return;
			}

			toast.success('Success', {
				description: `Memorial for ${data.deceasedName} created successfully`,
			});

			router.push(
				`/dashboard/memorials?month=${
					data.serviceDate.getMonth() + 1
				}&year=${data.serviceDate.getFullYear()}`
			);
		} catch (error) {
			console.error('Error creating memorial:', error);
			toast.error('An unexpected error occurred. Please try again.');
		}
	};

	return <MemorialForm onSubmit={handleSubmit} themes={themes} />;
}
