// File: components/memorial-product-card.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateMemorialProductOrder } from '@/app/dashboard/memorials/[memorialId]/actions';
import type { MemorialProduct } from '@/data/getMemorialProducts';

interface MemorialProductCardProps {
	memorialProduct: MemorialProduct;
	memorialId: number;
}

export function MemorialProductCard({
	memorialProduct,
	memorialId,
}: MemorialProductCardProps) {
	const router = useRouter();
	const [inOrder, setInOrder] = useState(memorialProduct.inOrder);
	const [isPending, startTransition] = useTransition();

	const handleProductClick = () => {
		// Navigate to canvas page for customization
		router.push(
			`/dashboard/memorials/${memorialId}/canvas?product=${memorialProduct.product.id}`
		);
	};

	const handleInOrderChange = (checked: boolean) => {
		// Optimistically update the UI
		setInOrder(checked);

		startTransition(async () => {
			try {
				const result = await updateMemorialProductOrder(
					memorialProduct.id,
					checked
				);

				if (result.error) {
					throw new Error(result.message || 'Failed to update order status');
				}

				toast.success(
					`${memorialProduct.product.productName} ${
						checked ? 'added to' : 'removed from'
					} order`
				);
			} catch (error) {
				console.error('Error updating order status:', error);
				toast.error('Failed to update order status');
				// Revert the switch state on error
				setInOrder(!checked);
			}
		});
	};

	const hasCustomization =
		memorialProduct.savedData &&
		Object.keys(memorialProduct.savedData).length > 0;

	return (
		<div className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6'>
			<div className='flex flex-col'>
				<h3 className='text-lg font-semibold mb-2'>
					{memorialProduct.product.productName}
				</h3>
				<p className='text-gray-600 text-sm mb-4'>
					{memorialProduct.product.description}
				</p>

				<div className='flex items-center gap-2 mb-4'>
					<Switch
						checked={inOrder}
						onCheckedChange={handleInOrderChange}
						disabled={isPending}
						id={`in-order-${memorialProduct.id}`}
						aria-label={`Include ${memorialProduct.product.productName} in order`}
					/>
					<label
						htmlFor={`in-order-${memorialProduct.id}`}
						className='text-sm text-gray-600 cursor-pointer'>
						Include in order
					</label>
				</div>

				<div className='mt-auto'>
					<Button
						className='w-full'
						onClick={handleProductClick}
						disabled={!inOrder}
						variant={hasCustomization ? 'default' : 'outline'}>
						{hasCustomization ? 'Edit' : 'Create'}{' '}
						{memorialProduct.product.productName}
					</Button>
				</div>

				{hasCustomization && (
					<p className='text-xs text-gray-500 mt-2 text-center'>
						Last updated:{' '}
						{new Date(memorialProduct.updatedAt).toLocaleDateString()}
					</p>
				)}
			</div>
		</div>
	);
}
