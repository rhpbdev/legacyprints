// File: app/dashboard/memorials/[memorialId]/page.tsx
import { MemorialCanvas } from '@/components/memorial-canvas';
import { getMemorial } from '@/data/getMemorial';
import { getTheme } from '@/data/getTheme';
import { notFound } from 'next/navigation';

// Option 1: Define the Theme type structure
type ThemeData = {
	pages: {
		objects: string[];
		version: string;
		background?: string;
		backgroundImage?: string;
	}[];
};

type Theme = {
	id: number;
	name: string;
	type: 'bifold' | 'trifold';
	description: string;
	data: ThemeData;
	isActive: boolean;
};

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ memorialId: string }>;
}) {
	const paramsValues = await params;
	const memorialId = Number(paramsValues.memorialId);
	console.log(memorialId);

	if (isNaN(memorialId)) {
		notFound();
	}

	const memorial = await getMemorial(memorialId);
	const theme = memorial?.themeId;
	const themeId = Number(theme);
	const themes = await getTheme(themeId);
	const themeData = themes.data;
	console.log(themeData);

	if (!memorial) {
		notFound();
	}

	// Option 1: Type assertion
	const typedTheme = themes as Theme;

	return (
		<>
			<MemorialCanvas memorial={memorial} theme={typedTheme} currentPage={0} />
		</>
	);
}

// Alternative solutions (choose one):

// Option 2: Cast the entire themes object
// <MemorialCanvas memorial={memorial} theme={themes as any} currentPage={0} />

// Option 3: Create a new properly typed object
// const properTheme: Theme = {
// 	...themes,
// 	data: themes.data as ThemeData,
// };
// <MemorialCanvas memorial={memorial} theme={properTheme} currentPage={0} />

// Option 4: Just cast the data property
// const properTheme = {
// 	...themes,
// 	data: themes.data as ThemeData,
// };
// <MemorialCanvas memorial={memorial} theme={properTheme} currentPage={0} />
