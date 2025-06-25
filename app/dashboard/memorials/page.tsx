import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMemorialsByMonth } from '@/data/getMemorialsByMonth';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { z } from 'zod';
import { Image } from '@imagekit/next';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ImagesIcon, PencilIcon, ShoppingCartIcon } from 'lucide-react';
import numeral from 'numeral';
import { Badge } from '@/components/ui/badge';
import Filters from './filters';
import { getMemorialsYearsRange } from '@/data/getMemorialsYearsRange';

export const metadata = {
	title: 'Memorials',
	description: '',
};

const today = new Date();

const searchSchema = z.object({
	year: z.coerce
		.number()
		.min(today.getFullYear() - 100)
		.max(today.getFullYear() + 1)
		.catch(today.getFullYear()),
	month: z.coerce
		.number()
		.min(1)
		.max(12)
		.catch(today.getMonth() + 1),
});

export default async function MemorialsPage({
	searchParams,
}: {
	searchParams: Promise<{ year?: string; month?: string }>;
}) {
	const searchParamsValues = await searchParams;

	const { month, year } = searchSchema.parse(searchParamsValues);

	const selectedDate = new Date(year, month - 1, 1);

	const memorials = await getMemorialsByMonth({
		month,
		year,
	});

	const yearsRange = await getMemorialsYearsRange();

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href='/dashboard' prefetch={false}>
								Dashboard
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Memorials</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card className='mt-4'>
				<CardHeader>
					<CardTitle className='flex flex-col gap-4 sm:flex-row sm:justify-between'>
						<span>{format(selectedDate, 'MMM yyyy')} Memorials</span>
						<div>
							<Filters year={year} month={month} yearsRange={yearsRange} />
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href='/dashboard/memorials/new' prefetch={false}>
							New Memorial
						</Link>
					</Button>
					{!memorials?.length && (
						<p className='text-center py-10 text-lg text-muted-foreground'>
							There are no memorials for this month
						</p>
					)}
					{
						!!memorials?.length && (
							<Table className='mt-4'>
								<TableHeader>
									<TableRow className='bg-gray-50'>
										<TableHead>Service Date</TableHead>
										<TableHead>Cover</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Program</TableHead>
										<TableHead>Theme</TableHead>
										<TableHead>Qauntity</TableHead>
										<TableHead />
									</TableRow>
								</TableHeader>
								<TableBody>
									{memorials.map((memorial) => (
										<TableRow key={memorial.id}>
											<TableCell>
												{format(parseISO(memorial.serviceDate), 'MMMM d, yyyy')}
											</TableCell>
											<TableCell>
												<Link
													href={`/dashboard/memorials/${memorial.id}`}
													title={`Edit ${memorial.deceasedName}`}
													prefetch={false}>
													<Image
														src={memorial.deceasedPhotoUrl}
														alt={memorial.deceasedName}
														width={48}
														height={48}
														className='w-12 h-12 object-cover rounded'
													/>
												</Link>
											</TableCell>
											<TableCell>{memorial.deceasedName}</TableCell>
											<TableCell className='capitalize'>
												<Badge
													className={
														memorial.programType === 'bifold'
															? 'bg-lime-500'
															: 'bg-orange-500'
													}>
													{memorial.programType}
												</Badge>
											</TableCell>
											<TableCell>{memorial.theme}</TableCell>
											<TableCell>
												{numeral(memorial.quantity).format('0,0[.]00')}
											</TableCell>
											<TableCell className='text-right inline-flex gap-1'>
												<Button
													variant={'outline'}
													size={'icon'}
													aria-label='Edit Memorial'
													asChild>
													<Link
														href={`/dashboard/memorials/${memorial.id}`}
														title={`Edit ${memorial.deceasedName}`}
														className='text-blue-500 hover:text-blue-600'
														prefetch={false}>
														<PencilIcon />
													</Link>
												</Button>
												<Button
													variant={'outline'}
													size={'icon'}
													aria-label='Edit Memorial'
													asChild>
													<Link
														href={`/dashboard/memorials/${memorial.id}/collage-photos`}
														title={'Manage collage photos'}
														className='text-blue-500 hover:text-blue-600'
														prefetch={false}>
														<ImagesIcon />
													</Link>
												</Button>
												<Button
													size={'icon'}
													aria-label='Manage memorial products'
													asChild>
													<Link
														href={`/dashboard/memorials/${memorial.id}/memorial-products`}
														title={'Manage memorial products'}
														className='bg-slate-800 hover:bg-slate-700'
														prefetch={false}>
														<ShoppingCartIcon />
													</Link>
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)

						// memorials.map((memorial) => (
						// 	<Card key={memorial.id} className='text-center'>
						// 		<CardHeader>
						// 			<CardTitle>
						// 				<h2>{memorial.deceasedName}</h2>
						// 			</CardTitle>
						// 		</CardHeader>
						// 		<CardContent>
						// 			<div className='mb-4 flex justify-center'>
						// 				<Image
						// 					src={memorial.deceasedPhotoUrl || '/globe.svg'}
						// 					alt={memorial.deceasedName}
						// 					width={150}
						// 					height={150}
						// 					className='object-cover h-[150px] rounded'
						// 				/>
						// 			</div>
						// 			<div>
						// 				<p className='text-sm text-muted-foreground'>
						// 					{memorial.serviceDate} at {memorial.serviceTime}
						// 				</p>
						// 				<p>
						// 					<strong>{memorial.serviceLocation}</strong>
						// 				</p>
						// 				<p>{memorial.serviceAddress}</p>
						// 			</div>
						// 		</CardContent>
						// 	</Card>
						// ))
					}
				</CardContent>
			</Card>
		</div>
	);
}
