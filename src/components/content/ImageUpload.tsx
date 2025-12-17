'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
	onImageChange: (file: File | null) => void;
	initialImageUrl?: string;
}

export function ImageUpload({
	onImageChange,
	initialImageUrl,
}: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [fileName, setFileName] = useState<string | null>(() => {
		// Initialize filename if we have an initial image URL
		return initialImageUrl?.startsWith('data:') ? 'Uploaded image' : null;
	});
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		initialImageUrl || null
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const initialImageUrlRef = useRef(initialImageUrl);

	// Check if URL is a blob URL (needs cleanup) vs data URL (doesn't need cleanup)
	const isBlobUrl = (url: string) => url.startsWith('blob:');

	const handleFile = (file: File) => {
		if (file && file.type.startsWith('image/')) {
			// Check file size (max 10MB)
			const maxSize = 10 * 1024 * 1024; // 10MB
			if (file.size > maxSize) {
				toast.error('Image too large', {
					description: 'Please select an image smaller than 10MB.',
				});
				return;
			}
			setFileName(file.name);
			// Create preview URL
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			onImageChange(file);
			toast.success('Image uploaded', {
				description: `${file.name} has been successfully uploaded.`,
			});
		} else {
			toast.error('Invalid file type', {
				description: 'Please select a valid image file.',
			});
		}
	};

	// Update preview URL when initialImageUrl changes (for editing existing posts)
	useEffect(() => {
		if (initialImageUrl && initialImageUrl !== initialImageUrlRef.current) {
			initialImageUrlRef.current = initialImageUrl;
			// Clean up previous blob URL if it exists
			if (previewUrl && isBlobUrl(previewUrl)) {
				URL.revokeObjectURL(previewUrl);
			}
			setPreviewUrl(initialImageUrl);
			if (initialImageUrl.startsWith('data:')) {
				setFileName('Uploaded image');
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialImageUrl]);

	// Clean up object URL on unmount or when file is removed (only for blob URLs)
	useEffect(() => {
		return () => {
			if (previewUrl && isBlobUrl(previewUrl)) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const handleRemove = () => {
		if (previewUrl && isBlobUrl(previewUrl)) {
			URL.revokeObjectURL(previewUrl);
		}
		setFileName(null);
		setPreviewUrl(null);
		onImageChange(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		toast.info('Image removed', {
			description: 'The image has been removed from your post.',
		});
	};

	// Determine if we should show the image preview
	const showImagePreview =
		(fileName && previewUrl) || (previewUrl && !fileName);

	return (
		<div className='space-y-2'>
			<label className='text-base font-semibold'>
				Upload Image (Optional)
			</label>
			<div
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				className={cn(
					'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
					dragActive
						? 'border-accent bg-accent/10'
						: 'border-border hover:border-accent/50',
					showImagePreview && 'border-solid bg-muted/50'
				)}
			>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleChange}
					className='sr-only'
					id='image-upload'
				/>
				{showImagePreview ? (
					<div className='w-full space-y-3'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								{fileName || 'Image'}
							</span>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={handleRemove}
								className='h-8 w-8 p-0'
							>
								<X className='h-4 w-4' />
							</Button>
						</div>
						<div className='relative w-full overflow-hidden rounded-lg border border-border bg-muted'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={previewUrl!}
								alt={fileName || 'Post image'}
								className='h-auto w-full object-cover'
							/>
						</div>
					</div>
				) : (
					<div
						className='flex cursor-pointer flex-col items-center w-full'
						onClick={() => {
							// Directly trigger file input click
							if (fileInputRef.current) {
								fileInputRef.current.click();
							}
						}}
					>
						<Upload className='mb-4 h-8 w-8 text-muted-foreground' />
						<p className='mb-4 text-sm font-medium'>
							Drag and drop an image here, or click to select
						</p>
						<span className='inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
							Select Image
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
