'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import {
	fetchPostById,
	updatePost,
	saveDraft,
	uploadPostImage,
} from '@/lib/services';
import { toast } from 'sonner';
import type { Template } from '@/types/templates';
import type { Post } from '@/types';

export default function EditPostPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.id as string;
	const [isLoading, setIsLoading] = useState(true);
	const [post, setPost] = useState<Post | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [autoSaveTimeout, setAutoSaveTimeout] =
		useState<NodeJS.Timeout | null>(null);
	const [hasGenerated, setHasGenerated] = useState(false);

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
		setImageUrl,
		markClean,
	} = usePostEditor({
		initialContent: post?.rawContent || '',
		initialPlatforms: post
			? (Object.keys(post.platformContent) as typeof selectedPlatforms)
			: [],
		initialImageUrl: post?.imageUrl,
	});

	// Get the unsaved changes context for client-side navigation blocking
	const { setIsDirty: setContextDirty, markClean: markContextClean } =
		useUnsavedChanges();

	// Warn user if they try to leave with unsaved changes (browser-level)
	useUnsavedChangesWarning(isDirty);

	// Sync dirty state with context for client-side navigation blocking
	useEffect(() => {
		setContextDirty(isDirty);
		// Cleanup: mark as clean when component unmounts
		return () => setContextDirty(false);
	}, [isDirty, setContextDirty]);

	// Load post data
	useEffect(() => {
		const loadPost = async () => {
			try {
				setIsLoading(true);
				const postData = await fetchPostById(postId);
				if (postData) {
					setPost(postData);
					setRawContent(postData.rawContent);
					setSelectedTemplate(postData.templateId || '');
					setPlatforms(
						Object.keys(
							postData.platformContent
						) as typeof selectedPlatforms
					);
					// Set image URL if it exists
					if (postData.imageUrl) {
						setImageUrl(postData.imageUrl);
					}
					if (postData.status === 'generated') {
						setHasGenerated(true);
					}
				} else {
					toast.error('Post not found', {
						description:
							'The post you are trying to edit does not exist.',
					});
					router.push('/posts');
				}
			} catch (error) {
				console.error('Failed to load post:', error);
				toast.error('Failed to load post', {
					description:
						error instanceof Error
							? error.message
							: 'Please try again.',
				});
				router.push('/posts');
			} finally {
				setIsLoading(false);
			}
		};

		if (postId) {
			loadPost();
		}
	}, [
		postId,
		router,
		setRawContent,
		setSelectedTemplate,
		setPlatforms,
		setImageUrl,
		setHasGenerated,
	]);

	// Auto-save functionality (debounced)
	useEffect(() => {
		if (!isDirty || !postId || isLoading || isSaving) {
			return;
		}

		// Clear existing timeout
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		// Set new timeout for auto-save (30 seconds after last change)
		const timeout = setTimeout(async () => {
			await handleSaveDraft(true); // true = isAutoSave
		}, 30000);

		setAutoSaveTimeout(timeout);

		return () => {
			if (timeout) {
				clearTimeout(timeout);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		isDirty,
		postId,
		isLoading,
		isSaving,
		rawContent,
		platformContent,
		selectedPlatforms,
		selectedTemplate,
		imageUrl,
	]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (autoSaveTimeout) {
				clearTimeout(autoSaveTimeout);
			}
		};
	}, [autoSaveTimeout]);

	// Handle template selection - auto-populate platforms from template
	const handleTemplateChange = useCallback(
		(template: Template | null) => {
			if (template) {
				setPlatforms(template.platformSupport);
			} else {
				setPlatforms([]);
			}
		},
		[setPlatforms]
	);

	// Handle save draft (manual or auto-save)
	const handleSaveDraft = useCallback(
		async (isAutoSave = false) => {
			if (!postId || isSaving) return;

			try {
				setIsSaving(true);

				// If this is an existing draft, update it
				if (post && post.status === 'draft') {
					await saveDraft(postId, {
						rawContent,
						platformContent,
						templateId: selectedTemplate || null,
						imageUrl: imageUrl || null,
					});
				} else {
					// Otherwise, update the post
					await updatePost(postId, {
						rawContent,
						platformContent,
						templateId: selectedTemplate || null,
						imageUrl: imageUrl || null,
						status: 'draft',
					});
				}

				markClean();
				markContextClean();

				if (!isAutoSave) {
					toast.success('Draft saved', {
						description: 'Your changes have been saved.',
					});
				}
			} catch (error) {
				console.error('Failed to save draft:', error);
				toast.error('Failed to save draft', {
					description:
						error instanceof Error
							? error.message
							: 'Please try again.',
				});
			} finally {
				setIsSaving(false);
			}
		},
		[
			postId,
			post,
			rawContent,
			platformContent,
			selectedTemplate,
			imageUrl,
			isSaving,
			markClean,
			markContextClean,
		]
	);

	// Handle generate content (no social publish yet)
	const handlePublish = useCallback(async () => {
		if (!postId || isPublishing || hasGenerated) return;

		try {
			setIsPublishing(true);

			// First save as draft if there are unsaved changes
			if (isDirty) {
				await handleSaveDraft(true);
			}

			// Mark as generated (no social publish yet)
			await updatePost(postId, { status: 'generated' });

			markClean();
			markContextClean();
			setHasGenerated(true);

			toast.success('Post marked generated', {
				description: 'Generated content is ready to review.',
			});
		} catch (error) {
			console.error('Failed to mark generated:', error);
			toast.error('Failed to mark generated', {
				description:
					error instanceof Error
						? error.message
						: 'Please try again.',
			});
		} finally {
			setIsPublishing(false);
		}
	}, [
		postId,
		isDirty,
		isPublishing,
		hasGenerated,
		handleSaveDraft,
		markClean,
		markContextClean,
	]);

	// Handle image upload
	const handleImageUpload = useCallback(
		async (file: File | null) => {
			// Always update local preview (blob URL) for immediate feedback
			handleImageChange(file);

			if (!file) {
				setImageUrl(undefined);
				return;
			}

			// If we already have a saved post, upload to server and use returned data URL
			if (postId) {
				try {
					const result = await uploadPostImage(postId, file);
					setImageUrl(result.imageUrl);
					toast.success('Image uploaded', {
						description: 'Your image has been uploaded and saved.',
					});
				} catch (error) {
					console.error('Failed to upload image:', error);
					toast.error('Failed to upload image', {
						description:
							error instanceof Error
								? error.message
								: 'Please try again.',
					});
				}
				return;
			}

			// For unsaved posts, convert to data URL so it persists when saving draft
			const fileToDataUrl = (f: File) =>
				new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = () => reject(reader.error);
					reader.readAsDataURL(f);
				});

			try {
				const dataUrl = await fileToDataUrl(file);
				setImageUrl(dataUrl);
			} catch (error) {
				console.error('Failed to read image:', error);
				toast.error('Failed to read image', {
					description:
						error instanceof Error
							? error.message
							: 'Please try again.',
				});
			}
		},
		[postId, handleImageChange, setImageUrl]
	);

	// Show toast notification when error occurs
	useEffect(() => {
		if (error) {
			toast.error('Content generation failed', {
				description: error,
			});
		}
	}, [error]);

	if (isLoading) {
		return (
			<MainLayout>
				<div className='container mx-auto max-w-4xl space-y-6'>
					<Card className='p-6'>
						<p className='text-center text-muted-foreground'>
							Loading post...
						</p>
					</Card>
				</div>
			</MainLayout>
		);
	}

	if (!post) {
		return null;
	}

	return (
		<MainLayout>
			<div className='container mx-auto max-w-4xl space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Edit Post
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

							<ImageUpload
								onImageChange={handleImageUpload}
								initialImageUrl={post?.imageUrl}
							/>

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

						{/* Action Buttons */}
						<div className='flex justify-end gap-3'>
							<Button
								onClick={() => handleSaveDraft(false)}
								disabled={!isDirty || isSaving || isPublishing}
								variant='outline'
								size='lg'
							>
								{isSaving ? 'Saving...' : 'Save Draft'}
							</Button>
							{selectedPlatforms.length > 0 &&
								rawContent.trim() && (
									<Button
										onClick={handlePublish}
										disabled={
											isGenerating ||
											isPublishing ||
											isSaving ||
											hasGenerated
										}
										size='lg'
									>
										{isPublishing || isGenerating
											? 'Generating...'
											: hasGenerated
											? 'Publish'
											: 'Generate Content'}
									</Button>
								)}
						</div>
					</div>
				</Card>
			</div>
		</MainLayout>
	);
}
