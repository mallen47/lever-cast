'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentInput } from '@/components/content/ContentInput';
import { ImageUpload } from '@/components/content/ImageUpload';
import { PlatformSelector } from '@/components/content/PlatformSelector';
import { PreviewContainer } from '@/components/content/PreviewContainer';
import { TemplateSelector } from '@/components/content/TemplateSelector';
import { Card } from '@/components/ui/card';
import { generateFormattedContent } from '@/lib/mock-data/generateContent';

export default function EditPostPage() {
	const [rawContent, setRawContent] = useState('');
	const [selectedTemplate, setSelectedTemplate] = useState<string>('');
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
		'linkedin',
		'x',
	]);
	const [linkedInContent, setLinkedInContent] = useState('');
	const [xContent, setXContent] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | undefined>();

	const togglePlatform = (platformId: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platformId)
				? prev.filter((platform) => platform !== platformId)
				: [...prev, platformId]
		);
	};

	const handleGenerate = async () => {
		if (!rawContent.trim()) return;

		setIsGenerating(true);
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const formatted = generateFormattedContent(rawContent);
		setLinkedInContent(formatted.linkedin);
		setXContent(formatted.x);
		setIsGenerating(false);
	};

	const handleImageChange = (file: File | null) => {
		if (file) {
			// Create a local URL for preview (mock - no actual upload)
			const url = URL.createObjectURL(file);
			setImageUrl(url);
		} else {
			setImageUrl(undefined);
		}
	};

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

								<ContentInput
									value={rawContent}
									onChange={setRawContent}
									onGenerate={handleGenerate}
									isGenerating={isGenerating}
								/>

								<ImageUpload
									onImageChange={handleImageChange}
								/>
							</div>
						</Card>
					</div>

					{/* Right Column - Preview */}
					<div className='space-y-6'>
						{(linkedInContent || xContent) && (
							<Card className='p-6'>
								<PreviewContainer
									linkedInContent={linkedInContent}
									xContent={xContent}
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
