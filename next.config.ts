// File: next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		config.externals = config.externals || [];
		config.externals.push({
			'utf-8-validate': 'commonjs utf-8-validate',
			bufferutil: 'commonjs bufferutil',
			canvas: 'commonjs canvas',
		});

		// Uncomment to enable debugging webpack caching
		// config.infrastructureLogging = { debug: /PackFileCache/ };

		return config;
	},
};

export default nextConfig;
