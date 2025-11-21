'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ContentInput } from '@/components/content/ContentInput';
import { ImageUpload } from '@/components/content/ImageUpload';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { PreviewContainer } from '@/components/content/PreviewContainer';
import { TemplateSelector } from '@/components/content/TemplateSelector';
import { Card } from '@/components/ui/card';
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
		generateContent,
		clearError,
	} = usePostEditor();

	return (
		<MainLayout>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						New Post
					</h1>
					<p className='mt-2 text-muted-foreground'>
						Enter your content ideas and generate platform-specific
						formats.
					</p>
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

				<div className='grid gap-6 lg:grid-cols-2'>
					{/* Left Column - Input */}
					<div>
						<Card className='p-6'>
							<div className='space-y-6'>
								<PlatformSelector
									selectedPlatforms={selectedPlatforms}
									onToggle={togglePlatform}
								/>

								<TemplateSelector
									value={selectedTemplate}
									onValueChange={setSelectedTemplate}
								/>

								<ImageUpload
									onImageChange={handleImageChange}
								/>

								<ContentInput
									value={rawContent}
									onChange={setRawContent}
									onGenerate={generateContent}
									isGenerating={isGenerating}
								/>
							</div>
						</Card>
					</div>

					{/* Right Column - Preview */}
					<div className='space-y-6'>
						{(Object.keys(platformContent).length > 0 || imageUrl) && (
							<Card className='p-6'>
								<PreviewContainer
									content={platformContent}
									imageUrl={imageUrl}
									selectedPlatforms={selectedPlatforms}
								/>
							</Card>
						)}
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
