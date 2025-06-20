import { addDays, subYears } from 'date-fns';
import { z } from 'zod';

export const memorialSchema = z.object({
	deceasedName: z
		.string()
		.min(3, 'Deceased name must contain at least 3 characters')
		.max(100, 'Deceased name must contain a maximum of 100 characters'),
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
		.max(addDays(new Date(), 2), 'Sunset date cannot be in the future'),
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
	deceasedPhotoUrl: z.string().optional().default(''), // URL string instead of File
});
