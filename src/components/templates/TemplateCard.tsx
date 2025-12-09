'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Sparkles, Trash2 } from 'lucide-react';
import type { Template, TemplateCategory } from '@/types';
import { TEMPLATE_CATEGORY_LABELS } from '@/types/templates';
import { getPlatformConfig } from '@/lib/platforms';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
	template: Template;
	onEdit?: (template: Template) => void;
	onDelete?: (template: Template) => void;
	index?: number;
}

export function TemplateCard({ template, onEdit, onDelete, index = 0 }: TemplateCardProps) {
	const handleEdit = () => {
		onEdit?.(template);
	};

	const handleDelete = () => {
		onDelete?.(template);
	};

	/**
	 * Get the display label for a category
	 */
	const getCategoryLabel = (category: TemplateCategory): string => {
		return TEMPLATE_CATEGORY_LABELS[category] ?? category;
	};

	return (
		<Card 
			className={cn(
				'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
				'animate-in fade-in slide-in-from-bottom-4',
				template.isSystem && 'border-accent/50 bg-gradient-to-br from-card to-accent/5'
			)}
			style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
		>
			{/* Decorative gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
			
			<CardHeader className="relative">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-2">
						<div className="flex items-center gap-2">
							<CardTitle className="text-lg font-semibold tracking-tight">
								{template.name}
							</CardTitle>
							{template.isSystem && (
								<Badge variant="secondary" className="gap-1 bg-accent/20 text-accent-foreground border-accent/30">
									<Sparkles className="h-3 w-3" />
									System
								</Badge>
							)}
						</div>
						<CardDescription className="line-clamp-2">
							{template.description}
						</CardDescription>
					</div>
					
					{!template.isSystem && (
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handleEdit}
								className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
								aria-label={`Edit ${template.name} template`}
							>
								<Edit className="h-4 w-4" />
							</Button>
							{onDelete && (
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={handleDelete}
									className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-destructive"
									aria-label={`Delete ${template.name} template`}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="relative space-y-4">
				{/* Platform badges */}
				<div className="flex flex-wrap gap-2">
					{template.platformSupport.map((platformId) => {
						const platform = getPlatformConfig(platformId);
						const Icon = platform.icon;
						return (
							<Badge 
								key={platformId} 
								variant="outline"
								className="gap-1.5 py-1 px-2.5 font-normal"
							>
								<Icon className="h-3.5 w-3.5" />
								{platform.name}
							</Badge>
						);
					})}
				</div>

				{/* Preview of first platform prompt */}
				{template.platformPrompts.length > 0 && (
					<div className="rounded-lg bg-muted/50 p-3 border border-border/50">
						<p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
							Prompt Preview
						</p>
						<p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
							{template.platformPrompts[0].prompt}
						</p>
					</div>
				)}

				{/* Category badge */}
				{template.category && (
					<div className="pt-2">
						<Badge variant="secondary" className="text-xs font-normal">
							{getCategoryLabel(template.category)}
						</Badge>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

