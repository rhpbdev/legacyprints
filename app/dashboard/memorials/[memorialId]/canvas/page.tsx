// app/dashboard/memorials/[memorialId]/canvas/page.tsx
import Canvas from '@/components/canvas';
import { getMemorial } from '@/data/getMemorial';
import { getTheme } from '@/data/getTheme';
import { notFound } from 'next/navigation';

export default async function CanvasPage({
	params,
	searchParams,
}: {
	params: Promise<{ memorialId: string }>;
	searchParams: Promise<{ product?: string }>;
}) {
	const paramsValues = await params;
	const searchParamsValues = await searchParams;
	console.log('params', paramsValues);
	console.log('search params', searchParamsValues);
	const memorialId = Number(paramsValues.memorialId);
	const memorialProductsId = searchParamsValues.product?.toString();
	console.log(memorialProductsId);

	const memorial = await getMemorial(memorialId);

	if (!memorial) {
		notFound();
	}

	// Get theme ID from memorial
	const themeId = Number(memorial.themeId);

	// Fetch the theme data
	const themeResponse = await getTheme(themeId);
	const theme = themeResponse; // Assuming getTheme returns the theme object directly

	// console.log('Theme data:', theme);

	if (!theme) {
		notFound();
	}

	return (
		<div>
			{/* <h1>Memorial Canvas - {memorial.deceasedName || 'Name not found'}</h1>
			<p>
				Theme: {theme.name} ({theme.type})
			</p> */}
			<Canvas memorial={memorial} theme={theme} />
		</div>
	);
}
