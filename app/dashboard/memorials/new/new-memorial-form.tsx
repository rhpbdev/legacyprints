// File: app/dashboard/memorials/new/new-memorial-form.tsx
'use client';

import MemorialForm, { memorialFormSchema } from '@/components/memorial-form';
import { Themes } from '@/types/Themes';
import { z } from 'zod';
import { createMemorial } from './actions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewMemorialForm({ themes }: { themes: Themes[] }) {
	const router = useRouter();

	const handleSubmit = async (data: z.infer<typeof memorialFormSchema>) => {
		const deceasedPhotoUrl = '';

		const result = await createMemorial({
			quantity: data.quantity,
			serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
			sunriseDate: format(data.sunriseDate, 'yyyy-MM-dd'),
			sunsetDate: format(data.sunsetDate, 'yyyy-MM-dd'),
			themeId: data.themeId,
			deceasedName: data.deceasedName,
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
