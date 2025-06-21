// File: layout.tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from '@/lib/constants';

const poppins = Poppins({
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
	variable: '--font-poppins',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: {
		template: `%s | Legacy Prints`,
		default: APP_NAME,
	},
	description: APP_DESCRIPTION,
	metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang='en'>
				<body className={`${poppins.variable} antialiased`}>
					<Navbar />
					{children}
					<Toaster richColors={true} />
					<Footer />
				</body>
			</html>
		</ClerkProvider>
	);
}
