'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { PostStatusBadge } from './PostStatusBadge';
import type { Post, PlatformId } from '@/types';
import { Edit, Trash2, MoreVertical, Type } from 'lucide-react';
import { formatPostDate } from '@/lib/utils/date';
import { getPlatformConfig } from '@/lib/platforms';
import { cn } from '@/lib/utils';

interface PostCardProps {
	post: Post;
	onEdit?: (post: Post) => void;
	onDelete?: (postId: string) => void;
}

const CONTENT_PREVIEW_LENGTH = 150;

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Get platforms that have content
	const availablePlatforms = useMemo(() => {
		return Object.keys(post.platformContent).filter(
			(p) => !!post.platformContent[p as PlatformId]
		) as PlatformId[];
	}, [post.platformContent]);

	// Track the active platform for preview
	const [activePlatform, setActivePlatform] = useState<PlatformId | 'raw'>(
		availablePlatforms.length > 0 ? availablePlatforms[0] : 'raw'
	);

	const previewSource = useMemo(() => {
		if (activePlatform === 'raw') {
			return post.rawContent;
		}
		return post.platformContent[activePlatform] ?? post.rawContent;
	}, [activePlatform, post.platformContent, post.rawContent]);

	const contentPreview = previewSource.slice(0, CONTENT_PREVIEW_LENGTH);
	const hasMoreContent = previewSource.length > CONTENT_PREVIEW_LENGTH;

	const handleEdit = () => {
		onEdit?.(post);
	};

	const handleDeleteClick = () => {
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = () => {
		onDelete?.(post.id);
	};

	return (
		<Card>
			<CardHeader>
				<div className='flex items-start justify-between gap-4'>
					<div className='flex-1 space-y-2'>
						<div className='flex items-center gap-2'>
							<PostStatusBadge status={post.status} />
							<span className='text-xs text-muted-foreground'>
								{formatPostDate(post.createdAt)}
							</span>
						</div>
						{post.templateId && (
							<span className='text-xs text-muted-foreground'>
								Template: {post.templateId}
							</span>
						)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								className='h-8 w-8 p-0'
								aria-label='Post actions menu'
							>
								<MoreVertical className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={handleEdit}>
								<Edit className='mr-2 h-4 w-4' />
								<span>Edit</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDeleteClick}
								className='text-destructive focus:text-destructive'
							>
								<Trash2 className='mr-2 h-4 w-4' />
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Platform Switcher */}
				{(availablePlatforms.length > 0 || post.rawContent) && (
					<div className='flex items-center gap-1 p-1 bg-muted/50 rounded-md w-fit'>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setActivePlatform('raw');
							}}
							className={cn(
								'flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium transition-colors',
								activePlatform === 'raw'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
							title='Raw Content'
						>
							<Type className='h-3.5 w-3.5' />
							<span className='sr-only sm:not-sr-only'>Raw</span>
						</button>
						{availablePlatforms.map((platformId) => {
							const config = getPlatformConfig(platformId);
							if (!config) return null;
							const Icon = config.icon;
							return (
								<button
									key={platformId}
									onClick={(e) => {
										e.stopPropagation();
										setActivePlatform(platformId);
									}}
									className={cn(
										'flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium transition-colors',
										activePlatform === platformId
											? 'bg-background text-foreground shadow-sm'
											: 'text-muted-foreground hover:text-foreground'
									)}
									title={config.name}
								>
									<Icon className='h-3.5 w-3.5' />
									<span className='sr-only sm:not-sr-only'>
										{config.name}
									</span>
								</button>
							);
						})}
					</div>
				)}

				{/* Content Preview */}
				<div className='min-h-[4.5rem]'>
					<p className='text-sm text-foreground line-clamp-3'>
						{contentPreview}
						{hasMoreContent && '...'}
					</p>
				</div>

				{/* Image Preview */}
				{post.imageUrl && (
					<div className='relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={post.imageUrl}
							alt='Post preview'
							className='h-full w-full object-cover'
						/>
					</div>
				)}
			</CardContent>

			<ConfirmationModal
				open={showDeleteModal}
				onOpenChange={setShowDeleteModal}
				title='Delete Post'
				description='Are you sure you want to delete this post? This action cannot be undone.'
				confirmText='Delete'
				cancelText='Cancel'
				variant='destructive'
				onConfirm={handleDeleteConfirm}
			/>
		</Card>
	);
}
