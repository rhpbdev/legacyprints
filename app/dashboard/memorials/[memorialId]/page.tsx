// File: dashboard/memorials/[memorialId]/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getThemes } from '@/data/getThemes';
import EditMemorialForm from './edit-memorial-form';
// import EditMemorialFormRevised from './edit-memorial-form-revised';
import { getMemorial } from '@/data/getMemorial';
import { notFound } from 'next/navigation';
import DeleteMemorialDialog from './delete-memorial-dialog';
import Link from 'next/link';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export const metadata = {
	title: 'Edit Memorial',
	description: '',
};

export default async function EditMemorialPage({
	params,
}: {
	params: Promise<{ memorialId: string }>;
}) {
	const paramsValues = await params;
	const memorialId = Number(paramsValues.memorialId);

	if (isNaN(memorialId)) {
		notFound();
	}
	const themes = await getThemes();
	const memorial = await getMemorial(memorialId);

	if (!memorial) {
		notFound();
	}

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
						<BreadcrumbLink asChild>
							<Link href='/dashboard/memorials' prefetch={false}>
								Memorials
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Edit Memorial</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card className='max-w-screen-md mt-4'>
				<CardHeader>
					<CardTitle className='flex justify-between'>
						<span>Edit Memorial for {memorial.deceasedName}</span>
						<DeleteMemorialDialog
							memorialId={memorial.id}
							serviceDate={memorial.serviceDate}
						/>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<EditMemorialForm memorial={memorial} themes={themes} />
					<Button asChild variant={'outline'} className='w-full mt-2'>
						<Link href='/dashboard' prefetch={false}>
							Manage Collage Photos
						</Link>
					</Button>
					<Button asChild variant={'outline'} className='w-full mt-2'>
						<Link
							href={`/dashboard/memorials/${memorial.id}/canvas`}
							prefetch={false}>
							Customize Canvas
						</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
