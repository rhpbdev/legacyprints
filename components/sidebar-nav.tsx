'use client';

import Link from 'next/link';
import { Home, Palette, Upload, Image, Plus } from 'lucide-react';

// Sidebar navigation items
const navItems = [
	{ name: 'Home', href: '/dashboard', icon: Home },
	{ name: 'Memorials', href: '/dashboard/memorials', icon: Palette },
	{ name: 'Upload Pictures', href: '/dashboard/upload', icon: Upload },
	{ name: 'Photo Library', href: '/dashboard/photos', icon: Image },
	{ name: 'New Memorial', href: '/dashboard/memorials/new', icon: Plus },
];

interface SidebarNavProps {
	isCollapsed?: boolean;
}

export function SidebarNav({ isCollapsed = false }: SidebarNavProps) {
	return (
		<nav aria-label='Sidebar Navigation'>
			<ul className='flex flex-col space-y-2'>
				{navItems.map(({ name, href, icon: Icon }) => (
					<li key={href}>
						<Link
							href={href}
							className='flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 hover:bg-muted/50'
							title={isCollapsed ? name : undefined}
							prefetch={false}>
							<Icon className='h-6 w-6 shrink-0' />
							{!isCollapsed && <span className='text-sm ml-1'>{name}</span>}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
