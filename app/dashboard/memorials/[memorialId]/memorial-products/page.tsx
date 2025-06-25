// File: app/dashboard/memorials/[memorialId]/memorial-products/page.tsx
import { getMemorial } from '@/data/getMemorial';
import {
	getMemorialProducts,
	groupProductsByCategory,
} from '@/data/getMemorialProducts';
import { getTheme } from '@/data/getTheme';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { MemorialProductCard } from './memorial-product-card';
import { filterProductsByThemeType } from '@/utils/filterProductsByTheme';

export const metadata = {
	title: 'Memorial products',
	description: '',
};

interface PageProps {
	params: Promise<{
		memorialId: string;
	}>;
}

export default async function MemorialProductsPage({ params }: PageProps) {
	const { userId } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	const { memorialId } = await params;
	const memorialIdNum = parseInt(memorialId, 10);

	if (isNaN(memorialIdNum)) {
		redirect('/dashboard/memorials');
	}

	const [memorial, memorialProducts] = await Promise.all([
		getMemorial(memorialIdNum),
		getMemorialProducts(memorialIdNum),
	]);

	if (!memorial) {
		notFound();
	}

	// Get the theme to determine type
	const theme = await getTheme(memorial.themeId);

	// Filter products based on theme type
	const filteredProducts = filterProductsByThemeType(
		memorialProducts,
		theme.type
	);

	const productsByCategory = groupProductsByCategory(filteredProducts);

	return (
		<div className='container mx-auto p-6'>
			<h1 className='text-2xl font-bold mb-6'>
				Memorial Products for {memorial.deceasedName}
			</h1>

			{Object.entries(productsByCategory).map(([category, products]) => (
				<div key={category} className='mb-8'>
					<h2 className='text-xl font-semibold mb-4 capitalize'>{category}</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{products.map((memorialProduct) => (
							<MemorialProductCard
								key={memorialProduct.id}
								memorialProduct={memorialProduct}
								memorialId={memorialIdNum}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
