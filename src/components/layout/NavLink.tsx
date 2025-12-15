'use client';

import React from 'react';
import Link from 'next/link';
import { useUnsavedChanges } from '@/lib/providers/unsaved-changes-provider';

interface NavLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * A navigation link that checks for unsaved changes before navigating.
 * If there are unsaved changes, it shows a confirmation modal.
 */
export function NavLink({ href, children, className }: NavLinkProps) {
	const { isDirty, navigateTo } = useUnsavedChanges();

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (isDirty) {
			e.preventDefault();
			navigateTo(href);
		}
		// If not dirty, let the default Link behavior handle navigation
	};

	return (
		<Link href={href} className={className} onClick={handleClick}>
			{children}
		</Link>
	);
}

