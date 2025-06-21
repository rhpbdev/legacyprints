// File: app/dashboard/memorials/new/page.tsx
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getThemes } from '@/data/getThemes';
import Link from 'next/link';
import NewMemorialForm from './new-memorial-form-revised';

export const metadata = {
	title: 'New Memorial',
	description: '',
};

export default async function NewMemorialPage() {
	const themes = await getThemes();
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
						<BreadcrumbPage>New Memorial</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card className='mt-4 max-w-screen-md'>
				<CardHeader>
					<CardTitle>New Memorial</CardTitle>
				</CardHeader>
				<CardContent>
					{/* <NewMemorialForm themes={themes} /> */}
					<NewMemorialForm themes={themes} />
				</CardContent>
			</Card>
		</div>
	);
}
