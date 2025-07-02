// File: @/utils/customFonts.ts
export interface CustomFont {
	name: string;
	url: string;
	weight?: string;
	style?: string;
}

// Define your custom fonts here
export const customFonts: CustomFont[] = [
	{
		name: 'Aston Script Pro Bold',
		url: '/fonts/AstonScriptProBold.woff2', // Adjust file extension as needed
		weight: 'bold',
		style: 'normal',
	},
	{
		name: 'Pinyon Script',
		url: '/fonts/PinyonScript.woff2',
		weight: 'normal',
		style: 'normal',
	},
	// Add more custom fonts as needed
];

/**
 * Load custom fonts and add them to the document
 */
export async function loadCustomFonts(): Promise<void> {
	const fontPromises = customFonts.map(async (font) => {
		try {
			const fontFace = new FontFace(font.name, `url(${font.url})`, {
				weight: font.weight || 'normal',
				style: font.style || 'normal',
			});

			await fontFace.load();
			document.fonts.add(fontFace);
			console.log(`Loaded font: ${font.name}`);
			return fontFace;
		} catch (error) {
			console.error(`Failed to load font ${font.name}:`, error);
			return null;
		}
	});

	await Promise.all(fontPromises);
}

/**
 * Check if a font is loaded
 */
export function isFontLoaded(fontName: string): boolean {
	return document.fonts.check(`16px "${fontName}"`);
}

/**
 * Get all available fonts (default + custom)
 */
export function getAllAvailableFonts(): string[] {
	const defaultFonts = [
		'Arial',
		'Georgia',
		'Times New Roman',
		'Courier New',
		'Verdana',
		'Roboto',
	];

	const customFontNames = customFonts.map((font) => font.name);

	return [...defaultFonts, ...customFontNames];
}
