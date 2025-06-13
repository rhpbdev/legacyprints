// File: app/dashboard/memorials/new/actions.ts
'use server';

import { db } from '@/db';
import { memorialsTable } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { addDays, subYears } from 'date-fns';
import { z } from 'zod';

const memorialSchema = z.object({
	deceasedName: z
		.string()
		.min(3, 'Deceased name must contain at least 3 characters')
		.max(100, 'Deceased name must contain a maximum of 100 characters'),
	deceasedPhotoUrl: z.string().optional().default(''), // URL string instead of File
	quantity: z
		.number()
		.positive('Quantity must be greater than 0')
		.min(25, 'Minimum quantity is 25')
		.max(10000, 'Maximum quantity is 10,000')
		.refine((val) => val % 25 === 0, {
			message: 'Quantity must be in increments of 25',
		}),
	themeId: z.number().positive('Theme ID is invalid'),
	sunriseDate: z.coerce
		.date()
		.min(subYears(new Date(), 100))
		.max(addDays(new Date(), 1), 'Sunrise date cannot be in the future'),
	sunsetDate: z.coerce
		.date()
		.min(subYears(new Date(), 100))
		.max(addDays(new Date(), 1), 'Sunset date cannot be in the future'),
	serviceDate: z.coerce.date().min(subYears(new Date(), 100)),
	serviceTime: z
		.string()
		.min(3, 'Service time must contain at least 3 characters')
		.max(50, 'Service time must contain a maximum of 50 characters'),
	serviceLocation: z
		.string()
		.min(3, 'Service location must contain at least 3 characters')
		.max(300, 'Service location must contain a maximum of 300 characters'),
	serviceAddress: z
		.string()
		.min(3, 'Service address must contain at least 3 characters')
		.max(300, 'Service address must contain a maximum of 300 characters'),
});

export const createMemorial = async (data: {
	quantity: number;
	deceasedName: string;
	sunriseDate: string;
	sunsetDate: string;
	serviceDate: string;
	serviceTime: string;
	serviceLocation: string;
	serviceAddress: string;
	themeId: number;
	deceasedPhotoUrl: string;
}) => {
	const { userId } = await auth();

	if (!userId) {
		return { error: true, message: 'Unauthorized' };
	}

	const validation = memorialSchema.safeParse(data);

	if (!validation.success) {
		return {
			error: true,
			message: validation.error.issues[0].message,
		};
	}

	// insert validated data into the database. destructure the memorial data.
	const [memorial] = await db
		.insert(memorialsTable)
		.values({
			userId,
			quantity: data.quantity.toString(),
			deceasedName: data.deceasedName,
			sunriseDate: data.sunriseDate,
			sunsetDate: data.sunsetDate,
			serviceDate: data.serviceDate,
			serviceTime: data.serviceTime,
			serviceLocation: data.serviceLocation,
			serviceAddress: data.serviceAddress,
			themeId: data.themeId,
			deceasedPhotoUrl: data.deceasedPhotoUrl || '', // placeholder for file upload
		})
		.returning();

	return {
		id: memorial.id,
	};
};
