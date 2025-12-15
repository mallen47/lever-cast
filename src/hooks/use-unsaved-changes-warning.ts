import { useEffect } from 'react';

/**
 * Hook to warn users when they try to leave the page with unsaved changes.
 *
 * Handles:
 * - Browser refresh/close (beforeunload event)
 * - Browser back/forward navigation
 *
 * Note: In Next.js App Router, there's no built-in way to intercept
 * client-side navigation. This hook handles browser-level navigation only.
 *
 * @param isDirty - Whether there are unsaved changes
 * @param message - Optional custom message (browsers may ignore this)
 */
export function useUnsavedChangesWarning(
	isDirty: boolean,
	message: string = 'You have unsaved changes. Are you sure you want to leave?'
): void {
	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isDirty) return;

			// Standard way to show confirmation dialog
			event.preventDefault();
			// For older browsers, setting returnValue is required
			event.returnValue = message;
			return message;
		};

		// Add event listener when dirty
		if (isDirty) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		}

		// Cleanup
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [isDirty, message]);
}

