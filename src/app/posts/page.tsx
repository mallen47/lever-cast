'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostCard } from '@/components/posts/PostCard';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
	fetchPosts,
	POSTS_SWR_KEY,
	deletePost,
	updatePost,
} from '@/lib/services';
import type { Post, PostStatus } from '@/types';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { toast } from 'sonner';
import useSWR from 'swr';

export default function PostsPage() {
	const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	// Debounce search query to avoid excessive filtering
	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

	const {
		data: posts = [],
		isLoading,
		error,
		mutate,
	} = useSWR<Post[]>(POSTS_SWR_KEY, fetchPosts, {
		dedupingInterval: 30_000,
		revalidateOnFocus: false,
		keepPreviousData: true,
	});

	useEffect(() => {
		if (error) {
			console.error('Failed to load posts:', error);
			toast.error('Failed to load posts', {
				description: 'Please try refreshing the page.',
			});
		}
	}, [error]);

	const filteredPosts = useMemo(() => {
		const lowerQuery = debouncedSearchQuery.trim().toLowerCase();
		let result = posts;

		if (lowerQuery) {
			result = result.filter(
				(post) =>
					post.rawContent.toLowerCase().includes(lowerQuery) ||
					Object.values(post.platformContent).some((content) =>
						content.toLowerCase().includes(lowerQuery)
					)
			);
		}

		if (statusFilter !== 'all') {
			result = result.filter((post) => post.status === statusFilter);
		}

		return result;
	}, [posts, statusFilter, debouncedSearchQuery]);

	const handleEdit = (post: Post) => {
		// Navigate to edit-post with post ID
		router.push(`/edit-post/${post.id}`);
	};

	const handleDelete = async (postId: string) => {
		try {
			await deletePost(postId);
			await mutate(
				(prev) =>
					prev ? prev.filter((post) => post.id !== postId) : prev,
				{ revalidate: false }
			);
			toast.success('Post deleted', {
				description: 'The post has been successfully deleted.',
			});
		} catch (error) {
			console.error('Failed to delete post:', error);
			toast.error('Failed to delete post', {
				description: 'Please try again later.',
			});
		}
	};

	return (
		<MainLayout>
			<div className='container mx-auto max-w-6xl space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>
						Recent Posts
					</h1>
					<p className='mt-2 text-muted-foreground'>
						View and manage all your created content.
					</p>
				</div>

				{/* Filters and Search */}
				<Card className='p-6'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						<div className='relative flex-1 max-w-md'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								type='text'
								placeholder='Search posts...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-9'
							/>
						</div>

						<Select
							value={statusFilter}
							onValueChange={(value) =>
								setStatusFilter(value as PostStatus | 'all')
							}
						>
							<SelectTrigger className='w-full sm:w-[180px]'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='draft'>Draft</SelectItem>
								<SelectItem value='generated'>
									Generated
								</SelectItem>
								<SelectItem value='scheduled'>
									Scheduled
								</SelectItem>
								<SelectItem value='failed'>Failed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</Card>

				{/* Posts List */}
				{isLoading ? (
					<Card className='p-6'>
						<p className='text-center text-muted-foreground'>
							Loading posts...
						</p>
					</Card>
				) : filteredPosts.length === 0 ? (
					<Card className='p-6'>
						<p className='text-center text-muted-foreground'>
							{debouncedSearchQuery || statusFilter !== 'all'
								? 'No posts match your filters.'
								: 'No posts yet. Create your first post!'}
						</p>
					</Card>
				) : (
					<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{filteredPosts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								onEdit={() => handleEdit(post)}
								onDelete={handleDelete}
							/>
						))}
					</div>
				)}
			</div>
		</MainLayout>
	);
}
