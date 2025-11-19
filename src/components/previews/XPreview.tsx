'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface XPreviewProps {
	content: string;
	imageUrl?: string;
	className?: string;
}

export function XPreview({ content, imageUrl, className }: XPreviewProps) {
	// Mock user data for preview
	const mockUser = {
		name: 'John Entrepreneur',
		handle: '@johntech',
		avatar: 'JD',
	};

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
								{mockUser.handle}
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
					<button className='flex items-center gap-1 transition-colors hover:text-accent'>
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
						<span>0</span>
					</button>
					<button className='flex items-center gap-1 transition-colors hover:text-accent'>
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
						<span>0</span>
					</button>
					<button className='flex items-center gap-1 transition-colors hover:text-accent'>
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
								d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
							/>
						</svg>
						<span>0</span>
					</button>
					<button className='flex items-center gap-1 transition-colors hover:text-accent'>
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
					</button>
				</div>
			</div>
		</Card>
	);
}


