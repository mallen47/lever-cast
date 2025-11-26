'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
	onImageChange: (file: File | null) => void;
}

export function ImageUpload({ onImageChange }: ImageUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	// Clean up object URL on unmount or when file is removed
	useEffect(() => {
		return () => {
			if (previewUrl) {
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
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const handleRemove = () => {
		if (previewUrl) {
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
					fileName && 'border-solid bg-muted/50'
				)}
			>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleChange}
					className='hidden'
					id='image-upload'
				/>
				{fileName && previewUrl ? (
					<div className='w-full space-y-3'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								{fileName}
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
							<img
								src={previewUrl}
								alt={fileName}
								className='h-auto w-full object-cover'
							/>
						</div>
					</div>
				) : (
					<>
						<Upload className='mb-4 h-8 w-8 text-muted-foreground' />
						<p className='mb-4 text-sm font-medium'>
							Drag and drop an image here, or click to select
						</p>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => fileInputRef.current?.click()}
						>
							Select Image
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
