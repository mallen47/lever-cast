'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getAllPlatforms } from '@/lib/platforms';
import type { PlatformId } from '@/types';

interface PlatformSelectorProps {
	selectedPlatforms: PlatformId[];
	onToggle: (platformId: PlatformId) => void;
}

export function PlatformSelector({
	selectedPlatforms,
	onToggle,
}: PlatformSelectorProps) {
	const platforms = getAllPlatforms();

	return (
		<div className='space-y-3'>
			<Label className='text-base font-semibold'>Select Platforms</Label>
			<div className='flex flex-wrap gap-3'>
				{platforms.map((platform) => {
					const Icon = platform.icon;
					const isSelected = selectedPlatforms.includes(platform.id);
					return (
						<Button
							key={platform.id}
							type='button'
							variant={isSelected ? 'default' : 'outline'}
							className={cn(
								'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
								isSelected
									? 'bg-accent text-accent-foreground hover:bg-accent/90'
									: 'border-border text-muted-foreground hover:text-foreground'
							)}
							onClick={() => onToggle(platform.id)}
							aria-pressed={isSelected}
							aria-label={`${
								isSelected ? 'Deselect' : 'Select'
							} ${platform.name}`}
						>
							<Icon className='h-4 w-4' />
							<span>{platform.name}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
