import { Sidebar } from '@/components/sidebar';
import { ImageKitProvider } from '@imagekit/next';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<main className='flex'>
				<Sidebar />
				<div className='flex-1 overflow-auto'>
					<ImageKitProvider urlEndpoint='https://ik.imagekit.io/rhpbdev'>
						{children}
					</ImageKitProvider>
				</div>
			</main>
		</>
	);
}
