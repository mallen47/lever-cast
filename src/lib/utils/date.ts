/**
 * Date utility functions
 */

/**
 * Format a date as a relative time string (e.g., "2h ago", "Just now")
 * Falls back to absolute date for dates older than 7 days
 * Accepts both Date objects and date strings
 */
export function formatPostDate(date: Date | string): string {
	// Convert string to Date if needed
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	
	// Validate date
	if (isNaN(dateObj.getTime())) {
		return 'Invalid date';
	}

	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return dateObj.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	});
}
