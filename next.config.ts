import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
				port: '',
				// only anything under /rhpbdev/…
				pathname: '/rhpbdev/**',
			},
		],
	},
};

export default nextConfig;
