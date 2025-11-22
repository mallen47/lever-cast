'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentInput } from '@/components/content/ContentInput';
import { ImageUpload } from '@/components/content/ImageUpload';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { PreviewContainer } from '@/components/content/PreviewContainer';
import { TemplateSelector } from '@/components/content/TemplateSelector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePostEditor } from '@/hooks';

export default function EditPostPage() {
	const {
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
		isGenerating,
		error,
		setRawContent,
		setSelectedTemplate,
		togglePlatform,
		handleImageChange,
		clearError,
	} = usePostEditor();

	return (
		<MainLayout>
			<div className='container mx-auto max-w-4xl space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						New Post
					</h1>
				</div>

				{/* Error Display */}
				{error && (
					<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
						<div className='flex items-center justify-between'>
							<p className='text-sm text-destructive'>{error}</p>
							<button
								onClick={clearError}
								className='text-sm text-destructive hover:text-destructive/80'
							>
								Dismiss
							</button>
						</div>
					</div>
				)}

				<Card className='p-6'>
					<div className='space-y-8'>
						{/* Input Section */}
						<div className='space-y-8'>
							<TemplateSelector
								value={selectedTemplate}
								onValueChange={setSelectedTemplate}
							/>

							<ImageUpload onImageChange={handleImageChange} />

							<ContentInput
								value={rawContent}
								onChange={setRawContent}
							/>

							<PlatformSelector
								selectedPlatforms={selectedPlatforms}
								onToggle={togglePlatform}
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
