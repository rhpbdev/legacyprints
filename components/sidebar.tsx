// File: @/components/sidebar.tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
	title?: string;
}

export function Sidebar({ title = 'Navigation' }: SidebarProps) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<aside
			className={`hidden md:flex flex-col h-screen bg-background border-r transition-width duration-200 ease-in-out ${
				collapsed ? 'w-16' : 'w-64'
			}`}>
			<header className='flex items-center justify-between p-4'>
				{!collapsed && <h2 className='text-lg font-semibold'>{title}</h2>}
				<button
					type='button'
					onClick={() => setCollapsed(!collapsed)}
					title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					className='p-2 hover:bg-muted/50 rounded'>
					{collapsed ? (
						<ChevronRight className='w-4 h-4' />
					) : (
						<ChevronLeft className='w-4 h-4' />
					)}
				</button>
			</header>

			<nav className='flex-1 overflow-auto p-2'>
				<SidebarNav isCollapsed={collapsed} />
			</nav>
		</aside>
	);
}
