'use client';

import React, { useState, useEffect } from 'react';
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
	searchPostsByQuery,
	deletePost,
	publishPost,
} from '@/lib/services';
import type { Post, PostStatus } from '@/types';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { toast } from 'sonner';

export default function PostsPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Debounce search query to avoid excessive filtering
	const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

	// Fetch posts on mount
	useEffect(() => {
		loadPosts();
	}, []);

	// Filter posts when status or debounced search changes
	useEffect(() => {
		let cancelled = false;

		const applyFilters = async () => {
			let result: Post[] = [];

			// Apply search filter (using debounced value)
			if (debouncedSearchQuery.trim()) {
				result = await searchPostsByQuery(debouncedSearchQuery);
			} else {
				result = [...posts];
			}

			// Apply status filter
			if (statusFilter !== 'all') {
				result = result.filter((post) => post.status === statusFilter);
			}

			// Only update state if not cancelled
			if (!cancelled) {
				setFilteredPosts(result);
			}
		};

		applyFilters();

		return () => {
			cancelled = true;
		};
	}, [posts, statusFilter, debouncedSearchQuery]);

	const loadPosts = async () => {
		setIsLoading(true);
		try {
			const allPosts = await fetchPosts();
			setPosts(allPosts);
		} catch (error) {
			console.error('Failed to load posts:', error);
			toast.error('Failed to load posts', {
				description: 'Please try refreshing the page.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = (post: Post) => {
		// Navigate to edit-post with post ID
		router.push(`/edit-post/${post.id}`);
	};

	const handleDelete = async (postId: string) => {
		try {
			await deletePost(postId);
			// Remove from local state
			setPosts((prev) => prev.filter((post) => post.id !== postId));
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

	const handlePublish = async (postId: string) => {
		try {
			await publishPost(postId);
			// Update post status in local state
			setPosts((prev) =>
				prev.map((post) =>
					post.id === postId
						? { ...post, status: 'published' as PostStatus }
						: post
				)
			);
			toast.success('Post published', {
				description: 'Your post has been successfully published.',
			});
		} catch (error) {
			console.error('Failed to publish post:', error);
			toast.error('Failed to publish post', {
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
								<SelectItem value='scheduled'>
									Scheduled
								</SelectItem>
								<SelectItem value='published'>
									Published
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
								onPublish={handlePublish}
							/>
						))}
					</div>
				)}
			</div>
		</MainLayout>
	);
}
