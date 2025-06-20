// File: dashboard/recent-memorials.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Link from 'next/link';

import MemorialsTable from '@/components/memorials-table';

export default function RecentMemorials() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex justify-between'>
					<span>Recent Memorials</span>
					<div className='flex gap-2'>
						<Button asChild variant='outline'>
							<Link href='/dashboard/memorials'>View All</Link>
						</Button>
						<Button asChild>
							<Link href='/dashboard/memorials/new'>Create New</Link>
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<MemorialsTable />
			</CardContent>
		</Card>
	);
}
