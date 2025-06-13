import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Palette, Upload, Image, Plus } from 'lucide-react';

const toolbarItems = [
	{ name: 'Home', href: '/dashboard', icon: Home },
	{ name: 'Memorials', href: '/dashboard/memorials', icon: Palette },
	{ name: 'Change Theme', href: '/dashboard/themes', icon: Palette },
	{ name: 'Upload Pictures', href: '/dashboard/upload', icon: Upload },
	{ name: 'Photo Library', href: '/dashboard/photos', icon: Image },
	{ name: 'New Memorial', href: '/dashboard/memorials/new', icon: Plus },
];

interface SidebarNavProps {
	isCollapsed?: boolean;
}

export function SidebarNav({ isCollapsed = false }: SidebarNavProps) {
	const pathname = usePathname();

	return (
		<>
			{toolbarItems.map((item) => (
				<Link
					key={item.name}
					href={item.href}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
						pathname === item.href
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted/50'
					}`}
					title={isCollapsed ? item.name : undefined}>
					<item.icon className='h-4 w-4 shrink-0' />
					<span
						className={`text-sm transition-all duration-200 ${
							isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
						}`}>
						{item.name}
					</span>
				</Link>
			))}
		</>
	);
}
