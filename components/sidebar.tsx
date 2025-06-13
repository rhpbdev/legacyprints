'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
	title?: string;
}

export function Sidebar({ title = 'Dashboard' }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleSidebar = () => {
		setIsCollapsed((prev) => !prev);
	};

	return (
		<div
			className={`hidden md:flex flex-col h-screen border-r bg-background transition-all duration-200 ease-in-out relative ${
				isCollapsed ? 'w-16' : 'w-64'
			}`}>
			<div className='p-3 flex items-center justify-between relative'>
				<h2
					className={`text-lg font-semibold transition-all duration-200 ${
						isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
					}`}>
					{title}
				</h2>
				<div className='relative z-10'>
					<button
						type='button'
						onClick={toggleSidebar}
						className='inline-flex items-center justify-center size-9 rounded-md hover:bg-muted/50 transition-colors'
						title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
						{isCollapsed ? (
							<ChevronRight className='h-4 w-4' />
						) : (
							<ChevronLeft className='h-4 w-4' />
						)}
					</button>
				</div>
			</div>
			<nav className='flex-1 px-2 py-3 space-y-1'>
				<SidebarNav isCollapsed={isCollapsed} />
			</nav>
		</div>
	);
}
