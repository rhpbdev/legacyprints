// File: utils/filterProductsByTheme.ts
import type { MemorialProduct } from '@/data/getMemorialProducts';

export function filterProductsByThemeType(
	products: MemorialProduct[],
	themeType: 'bifold' | 'trifold'
): MemorialProduct[] {
	return products.filter((product) => {
		// If it's a program product, only show if it matches the theme type
		if (product.product.productCategory.toLowerCase() === 'programs') {
			return (
				product.product.productName.toLowerCase() === themeType.toLowerCase()
			);
		}
		// Show all non-program products
		return true;
	});
}
