// File: components/memorial-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod'; // Fixed import
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { type Themes } from '@/types/Themes';
import { useState } from 'react';
import { Image } from '@imagekit/next';

export const memorialFormSchema = z.object({
	programStyle: z.enum(['bifold', 'trifold']),
	quantity: z.coerce
		.number()
		.positive('Quantity must be greater than 0')
		.min(25, 'Minimum quantity is 25')
		.max(10000, 'Maximum quantity is 10,000')
		.refine((val) => val % 25 === 0, {
			message: 'Quantity must be in increments of 25',
		}),
	themeId: z.coerce.number().positive('Please select a program'),
	deceasedName: z
		.string()
		.min(3, 'Deceased name must contain at least 3 characters')
		.max(100, 'Deceased name must contain a maximum of 100 characters'),
	sunriseDate: z.coerce
		.date()
		.max(addDays(new Date(), 1), 'Sunrise date cannot be in the future'),
	sunsetDate: z.coerce
		.date()
		.max(addDays(new Date(), 2), 'Sunset date cannot be in the future'),
	serviceDate: z.coerce.date(),
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
	deceasedPhotoUrl: z
		.instanceof(File)
		.refine((file) => file.size >= 10_000, {
			message: 'File must be at least 10KB',
		})
		.refine((file) => file.size <= 10_000_000, {
			message: 'File must be less than 1MB',
		})
		.refine(
			(file) =>
				['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(
					file.type
				),
			{
				message: 'Please upload using either .jpg, .jpeg, .gif, or .png',
			}
		)
		.optional(),
});

type Props = {
	themes: Themes[];
	onSubmit: (
		data: z.infer<typeof memorialFormSchema>,
		file?: File
	) => Promise<void>;
	previewUrl?: string;
	defaultValues?: {
		programStyle: 'bifold' | 'trifold';
		quantity: number;
		themeId: number;
		deceasedName: string;
		sunriseDate: Date;
		sunsetDate: Date;
		serviceDate: Date;
		serviceLocation: string;
		serviceAddress: string;
		serviceTime: string;
		deceasedPhotoUrl?: File;
	};
};

export default function MemorialForm({
	themes,
	onSubmit,
	defaultValues,
	previewUrl,
}: Props) {
	const form = useForm<z.infer<typeof memorialFormSchema>>({
		resolver: zodResolver(memorialFormSchema),
		defaultValues: {
			programStyle: 'bifold',
			quantity: 150,
			themeId: 0,
			deceasedName: '',
			sunriseDate: new Date(),
			sunsetDate: new Date(),
			serviceDate: new Date(),
			serviceTime: '',
			serviceLocation: '',
			serviceAddress: '',
			deceasedPhotoUrl: undefined,
			...defaultValues,
		},
	});

	const [file, setFile] = useState<File | undefined>(undefined);
	const programStyle = form.watch('programStyle');
	const filteredThemes = themes.filter((theme) => theme.type === programStyle);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit((data) => onSubmit(data, file))}>
				<fieldset
					disabled={form.formState.isSubmitting}
					className='grid grid-cols-2 gap-y-5 gap-x-2'>
					<FormField
						control={form.control}
						name='programStyle'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Program Style</FormLabel>
									<FormControl>
										<Select
											value={field.value}
											onValueChange={(newValue) => {
												field.onChange(newValue);
												form.setValue('themeId', 0);
											}}>
											<SelectTrigger className='w-full'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='bifold'>Bifold</SelectItem>
												<SelectItem value='trifold'>Trifold</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='themeId'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Theme</FormLabel>
									<FormControl>
										<Select
											onValueChange={field.onChange}
											value={field.value.toString()}>
											<SelectTrigger className='w-full'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{filteredThemes.map((theme) => (
													<SelectItem
														key={theme.id}
														value={theme.id.toString()}>
														{theme.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='sunriseDate'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Sunrise Date</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={'outline'}
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground'
														)}>
														{field.value ? (
															format(field.value, 'PPP')
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0' align='start'>
												<Calendar
													mode='single'
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date('1900-01-01')
													}
													captionLayout='dropdown'
												/>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='sunsetDate'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Sunset Date</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={'outline'}
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground'
														)}>
														{field.value ? (
															format(field.value, 'PPP')
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0' align='start'>
												<Calendar
													mode='single'
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date('1900-01-01')
													}
													captionLayout='dropdown'
												/>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='serviceDate'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Service Date</FormLabel>
									<FormControl>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={'outline'}
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground'
														)}>
														{field.value ? (
															format(field.value, 'PPP')
														) : (
															<span>Pick a date</span>
														)}
														<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0' align='start'>
												<Calendar
													mode='single'
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < new Date('1900-01-01')}
													captionLayout='dropdown'
												/>
											</PopoverContent>
										</Popover>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='serviceTime'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Service Time</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='serviceLocation'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Service Location</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='serviceAddress'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Service Address</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='deceasedName'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Deceased Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={form.control}
						name='deceasedPhotoUrl'
						render={() => (
							<FormItem>
								<FormLabel>Cover Photo</FormLabel>
								<FormControl>
									<Input
										type='file'
										accept='image/*'
										onChange={(e) => {
											if (e.target.files?.[0]) {
												setFile(e.target.files[0]);
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</fieldset>
				<fieldset
					disabled={form.formState.isSubmitting}
					className='mt-5 grid grid-cols-2 gap-y-5 gap-x-2'>
					<FormField
						control={form.control}
						name='quantity'
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Quantity</FormLabel>
									<FormControl>
										<Input {...field} type='number' step='25' min='25' />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					{previewUrl && (
						<div className='flex flex-col items-center'>
							<Image
								src={previewUrl}
								alt='Current cover photo'
								width={96}
								height={96}
								className='object-cover rounded-lg border'
								loading='lazy'
							/>
							<figcaption className='text-xs text-muted-foreground'>
								Current Cover Photo
							</figcaption>
						</div>
					)}
				</fieldset>
				<fieldset
					disabled={form.formState.isSubmitting}
					className='mt-5 flex flex-col gap-5'>
					<Button type='submit' className='cursor-pointer'>
						Submit
					</Button>
				</fieldset>
			</form>
		</Form>
	);
}
