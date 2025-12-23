'use client';

import { LinkedInPreview } from '@/components/previews/LinkedInPreview';
import { XPreview } from '@/components/previews/XPreview';
import { getPlatformConfig } from '@/lib/platforms';
import { Textarea } from '@/components/ui/textarea';
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
	hasGenerated?: boolean;
	onEditPlatformContent?: (platformId: PlatformId, value: string) => void;
}

export function PreviewContainer({
	content,
	imageUrl,
	selectedPlatforms,
	rawContent = '',
	hasGenerated = false,
	onEditPlatformContent,
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
						// If generated, show only generated text. Otherwise, fall back to raw content.
						const platformContent = hasGenerated
							? content[platformId] ?? ''
							: content[platformId] ?? rawContent;

						const isEditable =
							hasGenerated && !!onEditPlatformContent;

						if (!PreviewComponent) return null;

						return (
							<div key={platformId} className='space-y-3'>
								<div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
									<config.icon className='h-3 w-3' />
									{config.name}
								</div>

								{isEditable && (
									<div className='space-y-2'>
										<label className='text-xs font-medium text-muted-foreground'>
											Edit generated content
										</label>
										<Textarea
											value={platformContent}
											onChange={(e) =>
												onEditPlatformContent?.(
													platformId,
													e.target.value
												)
											}
											placeholder='Edit generated content for this platform'
											className='min-h-24'
										/>
									</div>
								)}

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
