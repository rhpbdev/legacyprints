import { Sidebar } from '@/components/sidebar';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<main className='flex'>
				<Sidebar />
				<div className='flex-1 overflow-auto'>{children}</div>
			</main>
		</>
	);
}
