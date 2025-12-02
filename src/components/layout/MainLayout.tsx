'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

export function MainLayout({ children }: { children: React.ReactNode }) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	return (
		<div className='flex h-screen overflow-hidden bg-background'>
			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
			/>
			<div className='flex flex-1 flex-col overflow-hidden'>
				{/* Header */}
				<header className='flex h-16 items-center justify-between border-b border-border bg-background px-6'>
					<div className='flex-1' />
					<div className='flex items-center gap-4'>
						<ThemeToggle />
						<UserButton afterSignOutUrl='/' />
					</div>
				</header>
				{/* Main content */}
				<main className='flex-1 overflow-y-auto p-6'>{children}</main>
			</div>
		</div>
	);
}
