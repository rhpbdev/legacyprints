// File: app/dashboard/memorials/new/new-memorial-form.tsx
// old form not in use
'use client';

import MemorialForm, { memorialFormSchema } from '@/components/memorial-form';
import { type Themes } from '@/types/Themes';
import { z } from 'zod';
import { createMemorial } from './actions';
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
		let deceasedPhotoUrl = '';

		if (!file) {
			toast.error('Error', {
				description: 'Please upload a photo of the deceased.',
			});
			return;
		}

		try {
			const authRes = await fetch('/api/upload-auth');
			const auth = await authRes.json();

			const uploaded = await upload({
				file,
				fileName: `${userId}-${Date.now()}-${file.name}`,
				...auth,
			});

			if (!uploaded.url) {
				toast.error('Image upload failed: No URL returned.');
				return;
			}

			deceasedPhotoUrl = uploaded.url;
		} catch (error) {
			console.error('Image upload failed:', error);
			toast.error('Image upload failed. Please try again.');
			return;
		}

		const result = await createMemorial({
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

		if (result.error) {
			toast.error('Error', {
				description: result.message,
			});
			return;
		}

		toast.success('Success', {
			description: `Memorial for ${data.deceasedName} created successfully`,
		});

		// new Date("2025-01-01")
		// new Date(2025, 0, 1)

		// router.push('/dashboard/memorials');
		router.push(
			`/dashboard/memorials?month=${
				data.serviceDate.getMonth() + 1
			}&year=${data.serviceDate.getFullYear()}`
		);

		console.log(result.id);
	};
	return <MemorialForm onSubmit={handleSubmit} themes={themes} />;
}
