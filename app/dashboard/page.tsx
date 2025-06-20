// File: dashboard/page.tsx
import RecentMemorials from './recent-memorials';

export default function DashboardPage() {
	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<h1 className='text-4xl font-semibold pb-5'>Dashboard</h1>
			<div className='w-full'>
				<RecentMemorials />
			</div>
		</div>
	);
}
