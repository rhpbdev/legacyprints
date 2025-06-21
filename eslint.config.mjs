import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.config({
		extends: ['next/core-web-vitals', 'next/typescript'],
		overrides: [
			{
				files: [
					'components/memorial-canvas.tsx',
					'app/dashboard/memorials/**/canvas/page.tsx',
					'app/dashboard/memorials/[memorialId]/canvas/page.tsx',
				],
				rules: {
					'@typescript-eslint/no-explicit-any': 'off',
					'prefer-const': 'off',
					'@typescript-eslint/no-unsafe-assignment': 'off',
					'@typescript-eslint/no-unused-vars': 'off',
					'@typescript-eslint/no-unsafe-member-access': 'off',
					'@typescript-eslint/no-unsafe-call': 'off',
					'@typescript-eslint/no-unsafe-return': 'off',
					'@typescript-eslint/no-unsafe-argument': 'off',
				},
			},
		],
	}),
];

export default eslintConfig;
