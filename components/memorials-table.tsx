// File: components/memorials-table.tsx
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRecentMemorials } from '@/data/getRecentMemorials';
import Image from 'next/image';
import numeral from 'numeral';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from './ui/button';
import { ImagesIcon, PencilIcon } from 'lucide-react';

export default async function MemorialsTable() {
	const memorials = await getRecentMemorials();

	return (
		<>
			{!memorials?.length && (
				<p className='text-center py-10 text-lg text-muted-foreground'>
					You have no memorials yet. Start by clicking &quot;Create New&quot; to
					create your first memorial.
				</p>
			)}
			{!!memorials?.length && (
				<Table className='mt-4'>
					<TableHeader>
						<TableRow className='bg-gray-50'>
							<TableHead>Date</TableHead>
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
									<Button
										asChild
										variant='ghost'
										size='icon'
										aria-label='View Memorial'>
										<Link
											href={`/dashboard/memorials/${memorial.id}`}
											title={`Edit ${memorial.deceasedName}`}
											prefetch={false}>
											<Image
												src={memorial.deceasedPhotoUrl}
												alt={memorial.deceasedName}
												width={48}
												height={48}
												className='rounded'
												loading='lazy'
											/>
										</Link>
									</Button>
								</TableCell>
								<TableCell>{memorial.deceasedName}</TableCell>
								<TableCell className='capitalize'>
									<Badge
										className={
											memorial.programType === 'bifold'
												? 'bg-lime-500 py-1'
												: 'bg-orange-500 py-1'
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
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</>
	);
}
