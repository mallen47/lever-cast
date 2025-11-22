'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PostStatusBadge } from './PostStatusBadge';
import type { Post } from '@/types';
import { Edit, Trash2, ExternalLink, MoreVertical } from 'lucide-react';
import { formatPostDate } from '@/lib/utils/date';

interface PostCardProps {
	post: Post;
	onEdit?: (post: Post) => void;
	onDelete?: (postId: string) => void;
	onPublish?: (postId: string) => void;
}

const CONTENT_PREVIEW_LENGTH = 150;

export function PostCard({ post, onEdit, onDelete, onPublish }: PostCardProps) {
	const contentPreview = post.rawContent.slice(0, CONTENT_PREVIEW_LENGTH);
	const hasMoreContent = post.rawContent.length > CONTENT_PREVIEW_LENGTH;
	const platforms = Object.keys(post.platformContent);

	const handleEdit = () => {
		onEdit?.(post);
	};

	const handleDelete = () => {
		if (confirm('Are you sure you want to delete this post?')) {
			onDelete?.(post.id);
		}
	};

	const handlePublish = () => {
		onPublish?.(post.id);
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
							{post.status !== 'published' && (
								<DropdownMenuItem onClick={handlePublish}>
									<ExternalLink className='mr-2 h-4 w-4' />
									<span>Publish</span>
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
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
				{/* Content Preview */}
				<div>
					<p className='text-sm text-foreground line-clamp-3'>
						{contentPreview}
						{hasMoreContent && '...'}
					</p>
				</div>

				{/* Platform Indicators */}
				{platforms.length > 0 && (
					<div className='flex flex-wrap gap-2'>
						{platforms.map((platform) => (
							<span
								key={platform}
								className='text-xs px-2 py-1 rounded bg-muted text-muted-foreground'
							>
								{platform}
							</span>
						))}
					</div>
				)}

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
		</Card>
	);
}
