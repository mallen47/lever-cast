'use client';

import { cn } from '@/lib/utils';
import type { PostStatus } from '@/types';

interface PostStatusBadgeProps {
	status: PostStatus;
	className?: string;
}

const statusConfig: Record<PostStatus, { label: string; className: string }> = {
	draft: {
		label: 'Draft',
		className: 'bg-muted text-muted-foreground',
	},
	generated: {
		label: 'Generated',
		className:
			'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-300',
	},
	scheduled: {
		label: 'Scheduled',
		className:
			'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
	},
	published: {
		label: 'Published',
		className:
			'bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400',
	},
	failed: {
		label: 'Failed',
		className: 'bg-destructive/10 text-destructive',
	},
};

export function PostStatusBadge({ status, className }: PostStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
				config.className,
				className
			)}
		>
			{config.label}
		</span>
	);
}
