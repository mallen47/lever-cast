'use client';

import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { XPreview } from '@/components/previews/XPreview';
import { getPlatformConfig } from '@/lib/platforms';
import { PLATFORMS, type PlatformContent, type PlatformId } from '@/types';
import type { ComponentType } from 'react';

interface PreviewProps {
	content: string;
	imageUrl?: string;
}

// Preview component registry - add new platforms here
const PREVIEW_COMPONENTS: Record<PlatformId, ComponentType<PreviewProps>> = {
	[PLATFORMS.LINKEDIN]: LinkedInPreview,
	[PLATFORMS.X]: XPreview,
};

interface PreviewContainerProps {
	content: PlatformContent;
	imageUrl?: string;
	selectedPlatforms: PlatformId[];
	rawContent?: string;
}

export function PreviewContainer({
	content,
	imageUrl,
	selectedPlatforms,
	rawContent = '',
}: PreviewContainerProps) {
	const hasSelection = selectedPlatforms.length > 0;

	return (
		<div className='space-y-4'>
			<h2 className='text-lg font-semibold'>Preview</h2>
			{hasSelection ? (
				<div className='grid gap-6 md:grid-cols-2'>
					{selectedPlatforms.map((platformId) => {
						const PreviewComponent = PREVIEW_COMPONENTS[platformId];
						const config = getPlatformConfig(platformId);
						// Use formatted content if available, otherwise fall back to raw content
						const platformContent =
							content[platformId] ?? rawContent;

						if (!PreviewComponent) return null;

						return (
							<div key={platformId} className='space-y-2'>
								<div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
									<config.icon className='h-3 w-3' />
									{config.name}
								</div>
								<PreviewComponent
									content={platformContent}
									imageUrl={imageUrl}
								/>
							</div>
						);
					})}
				</div>
			) : (
				<p className='text-sm text-muted-foreground'>
					Select at least one platform to see the preview.
				</p>
			)}
		</div>
	);
}
