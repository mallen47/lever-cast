'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
	// Mock user data for preview
	const mockUser = {
		name: 'John Entrepreneur',
		headline: 'Founder & CEO | Tech Enthusiast',
		avatar: 'JD',
	};

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
							{mockUser.headline}
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
					<button className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'>
						<svg
							className='h-5 w-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
							/>
						</svg>
						<span>Like</span>
					</button>
					<button className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'>
						<svg
							className='h-5 w-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
							/>
						</svg>
						<span>Comment</span>
					</button>
					<button className='flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-accent dark:text-gray-400'>
						<svg
							className='h-5 w-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M8.684 13.342c-.371 0-.713.107-1.005.3m1.005-.3L5.5 15.5m1.005-.3c.371-.371.713-.371 1.005 0m0 0L8.684 13.342m0 0L5.5 10.5m3.184 2.842L12 10.5m-3.316 2.842c.371.371.713.371 1.005 0M12 10.5l3.316 2.842c.371.371.713.371 1.005 0M12 10.5V8.5m0 2l-3.316 2.842M12 10.5l3.316 2.842M12 8.5c.371 0 .713.107 1.005.3m-1.005-.3L15.5 10.5m-1.005-.3c-.371-.371-.713-.371-1.005 0m0 0L12 8.5m0 0L8.684 10.342'
							/>
						</svg>
						<span>Share</span>
					</button>
				</div>
			</div>
		</Card>
	);
}

