'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockUser } from '@/lib/mock-data/user';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface LinkedInPreviewProps {
	content: string;
	imageUrl?: string;
	className?: string;
}

export function LinkedInPreview({
	content,
	imageUrl,
	className,
}: LinkedInPreviewProps) {
	const linkedInProfile = mockUser.platforms.linkedin;

	return (
		<Card className={cn('overflow-hidden', className)}>
			<div className='bg-white p-4 dark:bg-[#0a0a0a]'>
				{/* Profile Header */}
				<div className='mb-4 flex items-start gap-3'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground'>
						{mockUser.avatar}
					</div>
					<div className='flex-1'>
						<h3 className='font-semibold text-gray-900 dark:text-gray-100'>
							{mockUser.name}
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							{linkedInProfile?.headline}
						</p>
						<p className='text-xs text-gray-500 dark:text-gray-500'>
							Just now
						</p>
					</div>
				</div>

				{/* Content */}
				<div className='mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100'>
					{content || (
						<span className='text-muted-foreground'>
							Your formatted LinkedIn content will appear here...
						</span>
					)}
				</div>

				{/* Image Preview */}
				{imageUrl && (
					<div className='mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800'>
						<div className='flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-900'>
							<span className='text-sm text-muted-foreground'>
								Image Preview
							</span>
						</div>
					</div>
				)}

				{/* Engagement Bar */}
				<div className='flex items-center gap-6 border-t border-gray-200 pt-3 dark:border-gray-800'>
					<button
						className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'
						aria-label="Like this post"
					>
						<ThumbsUp className='h-5 w-5' />
						<span>Like</span>
					</button>
					<button
						className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'
						aria-label="Comment on this post"
					>
						<MessageCircle className='h-5 w-5' />
						<span>Comment</span>
					</button>
					<button
						className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'
						aria-label="Share this post"
					>
						<Share2 className='h-5 w-5' />
						<span>Share</span>
					</button>
				</div>
			</div>
		</Card>
	);
}
