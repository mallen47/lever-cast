'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockUser } from '@/lib/mock-data/user';
import { MessageCircle, Repeat2, Heart, Share } from 'lucide-react';

interface XPreviewProps {
	content: string;
	imageUrl?: string;
	className?: string;
}

export function XPreview({ content, imageUrl, className }: XPreviewProps) {
	const xProfile = mockUser.platforms.x;

	return (
		<Card className={cn('overflow-hidden', className)}>
			<div className='bg-white p-4 dark:bg-black'>
				{/* Profile Header */}
				<div className='mb-3 flex items-start gap-3'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground'>
						{mockUser.avatar}
					</div>
					<div className='flex-1'>
						<div className='flex items-center gap-2'>
							<h3 className='font-semibold text-gray-900 dark:text-white'>
								{mockUser.name}
							</h3>
							<span className='text-sm text-gray-500 dark:text-gray-500'>
								{xProfile?.handle}
							</span>
							<span className='text-sm text-gray-500 dark:text-gray-500'>
								·
							</span>
							<span className='text-sm text-gray-500 dark:text-gray-500'>
								Just now
							</span>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className='mb-3 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900 dark:text-white'>
					{content || (
						<span className='text-muted-foreground'>
							Your formatted X content will appear here...
						</span>
					)}
				</div>

				{/* Image Preview */}
				{imageUrl && (
					<div className='mb-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800'>
						<div className='flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-900'>
							<span className='text-sm text-muted-foreground'>
								Image Preview
							</span>
						</div>
					</div>
				)}

				{/* Engagement Metrics */}
				<div className='flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500'>
					<button
						className='flex items-center gap-1 transition-colors hover:text-accent'
						aria-label="Reply to this post"
					>
						<MessageCircle className='h-5 w-5' />
						<span>0</span>
					</button>
					<button
						className='flex items-center gap-1 transition-colors hover:text-accent'
						aria-label="Repost this"
					>
						<Repeat2 className='h-5 w-5' />
						<span>0</span>
					</button>
					<button
						className='flex items-center gap-1 transition-colors hover:text-accent'
						aria-label="Like this post"
					>
						<Heart className='h-5 w-5' />
						<span>0</span>
					</button>
					<button
						className='flex items-center gap-1 transition-colors hover:text-accent'
						aria-label="Share this post"
					>
						<Share className='h-5 w-5' />
					</button>
				</div>
			</div>
		</Card>
	);
}
