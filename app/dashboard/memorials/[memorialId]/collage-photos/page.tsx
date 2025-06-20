// File: app/dashboard/memorials/[memorialId]/collage-photos/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CollagePhotoUploads from '@/components/collage-photos';
import Link from 'next/link';
import { getMemorial } from '@/data/getMemorial';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface PageProps {
	params: Promise<{
		memorialId: string;
	}>;
}

export default async function CollagePhotosPage({ params }: PageProps) {
	const { userId } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	const { memorialId } = await params;
	const memorialIdNum = parseInt(memorialId, 10);

	if (isNaN(memorialIdNum)) {
		redirect('/dashboard/memorials');
	}

	// Fetch memorial details
	const memorial = await getMemorial(memorialIdNum);
	console.log({ memorial });

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href='/dashboard'>Dashboard</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href='/dashboard/memorials'>Memorials</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbLink asChild>
						<Link href={`/dashboard/memorials/${memorial?.id}`}>
							Edit Memorial
						</Link>
					</BreadcrumbLink>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Collage Photos</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Title */}
			<div className='mb-8 mt-4'>
				<h1 className='text-3xl font-bold text-gray-900'>
					Manage Collage Photos
				</h1>
				<p className='text-gray-600 mt-2'>{memorial?.deceasedName}</p>
			</div>

			{/* Collage Photos Manager */}
			{/* <CollagePhotosManager userId={userId} memorialId={memorialIdNum} /> */}
			<CollagePhotoUploads userId={userId} memorialId={memorialIdNum} />

			{/* Help Section */}
			<div className='mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6'>
				<h3 className='font-semibold text-blue-900 mb-2'>
					Tips for Creating a Beautiful Collage
				</h3>
				<ul className='space-y-1 text-sm text-blue-800'>
					<li>• Upload high-quality photos for the best print results</li>
					<li>• Mix portrait and landscape orientations for visual variety</li>
					<li>• Include photos from different life stages and events</li>
					<li>• Aim for 10-20 photos for a balanced collage</li>
					<li>• Consider the overall color harmony of your selection</li>
				</ul>
			</div>
		</div>
	);
}
