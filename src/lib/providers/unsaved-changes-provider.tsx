'use client';

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesContextType {
	/** Whether there are unsaved changes */
	isDirty: boolean;
	/** Set the dirty state */
	setIsDirty: (dirty: boolean) => void;
	/** Attempt navigation - shows modal if dirty, otherwise navigates */
	navigateTo: (href: string) => void;
	/** Mark as clean (after saving) */
	markClean: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(
	null
);

export function useUnsavedChanges() {
	const context = useContext(UnsavedChangesContext);
	if (!context) {
		throw new Error(
			'useUnsavedChanges must be used within UnsavedChangesProvider'
		);
	}
	return context;
}

interface UnsavedChangesProviderProps {
	children: React.ReactNode;
}

export function UnsavedChangesProvider({
	children,
}: UnsavedChangesProviderProps) {
	const router = useRouter();
	const [isDirty, setIsDirty] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [pendingHref, setPendingHref] = useState<string | null>(null);

	const navigateTo = useCallback(
		(href: string) => {
			if (isDirty) {
				// Show confirmation modal
				setPendingHref(href);
				setShowModal(true);
			} else {
				// Navigate immediately
				router.push(href);
			}
		},
		[isDirty, router]
	);

	const handleDiscard = useCallback(() => {
		setShowModal(false);
		setIsDirty(false);
		if (pendingHref) {
			router.push(pendingHref);
			setPendingHref(null);
		}
	}, [pendingHref, router]);

	const handleCancel = useCallback(() => {
		setShowModal(false);
		setPendingHref(null);
	}, []);

	const markClean = useCallback(() => {
		setIsDirty(false);
	}, []);

	const value = useMemo(
		() => ({
			isDirty,
			setIsDirty,
			navigateTo,
			markClean,
		}),
		[isDirty, navigateTo, markClean]
	);

	return (
		<UnsavedChangesContext.Provider value={value}>
			{children}

			{/* Unsaved Changes Confirmation Modal */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className='sm:max-w-[425px]' showCloseButton={false}>
					<DialogHeader>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10'>
								<AlertTriangle className='h-5 w-5 text-amber-500' />
							</div>
							<div className='flex-1'>
								<DialogTitle>Unsaved Changes</DialogTitle>
								<DialogDescription className='mt-2'>
									You have unsaved changes that will be lost if
									you leave this page.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
					<DialogFooter className='gap-3'>
						<Button variant='outline' onClick={handleCancel}>
							Stay on Page
						</Button>
						<Button variant='destructive' onClick={handleDiscard}>
							Discard Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</UnsavedChangesContext.Provider>
	);
}

