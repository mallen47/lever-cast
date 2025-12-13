'use client';

import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentInput } from '@/components/content/ContentInput';
import { ImageUpload } from '@/components/content/ImageUpload';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { PreviewContainer } from '@/components/content/PreviewContainer';
import { TemplateSelector } from '@/components/content/TemplateSelector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePostEditor, useUnsavedChangesWarning } from '@/hooks';
import { useUnsavedChanges } from '@/lib/providers/unsaved-changes-provider';
import { toast } from 'sonner';
import type { Template } from '@/types/templates';

export default function EditPostPage() {
	const searchParams = useSearchParams();
	const {
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
		isGenerating,
		error,
		isDirty,
		setRawContent,
		setSelectedTemplate,
		togglePlatform,
		setPlatforms,
		handleImageChange,
	} = usePostEditor();

	// Get the unsaved changes context for client-side navigation blocking
	const { setIsDirty: setContextDirty } = useUnsavedChanges();

	// Warn user if they try to leave with unsaved changes (browser-level)
	useUnsavedChangesWarning(isDirty);

	// Sync dirty state with context for client-side navigation blocking
	useEffect(() => {
		setContextDirty(isDirty);
		// Cleanup: mark as clean when component unmounts
		return () => setContextDirty(false);
	}, [isDirty, setContextDirty]);

	// Handle template selection - auto-populate platforms from template
	const handleTemplateChange = useCallback(
		(template: Template | null) => {
			if (template) {
				// Auto-select platforms from the template
				setPlatforms(template.platformSupport);
			} else {
				// Clear platforms if no template selected
				setPlatforms([]);
			}
		},
		[setPlatforms]
	);

	// Handle template query parameter
	useEffect(() => {
		const templateId = searchParams.get('template');
		if (templateId && templateId !== selectedTemplate) {
			setSelectedTemplate(templateId);
		}
	}, [searchParams, selectedTemplate, setSelectedTemplate]);

	// Show toast notification when error occurs
	useEffect(() => {
		if (error) {
			toast.error('Content generation failed', {
				description: error,
			});
		}
	}, [error]);

	return (
		<MainLayout>
			<div className='container mx-auto max-w-4xl space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						New Post
					</h1>
				</div>

				<Card className='p-6'>
					<div className='space-y-8'>
						{/* Input Section */}
						<div className='space-y-8'>
							<TemplateSelector
								value={selectedTemplate}
								onValueChange={setSelectedTemplate}
								onTemplateChange={handleTemplateChange}
							/>

							<ImageUpload onImageChange={handleImageChange} />

							<ContentInput
								value={rawContent}
								onChange={setRawContent}
							/>

							<PlatformSelector
								selectedPlatforms={selectedPlatforms}
								onToggle={togglePlatform}
								disabled={!selectedTemplate}
							/>
						</div>

						{/* Preview Section */}
						{(selectedPlatforms.length > 0 || imageUrl) && (
							<Card className='p-6'>
								{isGenerating && (
									<div className='mb-4 text-sm text-muted-foreground'>
										Generating preview...
									</div>
								)}
								<PreviewContainer
									content={platformContent}
									imageUrl={imageUrl}
									selectedPlatforms={selectedPlatforms}
									rawContent={rawContent}
								/>
							</Card>
						)}

						{/* Publish Button */}
						{selectedPlatforms.length > 0 && rawContent.trim() && (
							<div className='flex justify-end'>
								<Button
									onClick={() => {
										// TODO: Implement publish functionality
										console.log('Publishing post...', {
											rawContent,
											platformContent,
											selectedPlatforms,
											selectedTemplate,
											imageUrl,
										});
										toast.success('Post published', {
											description: `Your post has been published to ${
												selectedPlatforms.length
											} platform${
												selectedPlatforms.length > 1
													? 's'
													: ''
											}.`,
										});
									}}
									disabled={isGenerating}
									size='lg'
								>
									Publish
								</Button>
							</div>
						)}
					</div>
				</Card>
			</div>
		</MainLayout>
	);
}
