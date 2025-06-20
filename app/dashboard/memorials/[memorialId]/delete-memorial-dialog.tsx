// File: dashboard/memorials/[memorialId]/delete-memorial-dialog.tsx
'use client';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { deleteMemorial } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DeleteMemorialDialog({
	memorialId,
	serviceDate,
}: {
	memorialId: number;
	serviceDate: string;
}) {
	const router = useRouter();
	const handleDeleteConfirm = async () => {
		const result = await deleteMemorial(memorialId);

		if (result?.error) {
			toast.error('Error', {
				description: result.message,
			});
			return;
		}

		toast.success('Success!', {
			description: 'Memorial deleted',
		});

		const [year, month] = serviceDate.split('-');

		router.push(`/dashboard/memorials?month=${month}&year=${year}`);
	};
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant='destructive' size='icon' className='cursor-pointer'>
					<Trash2Icon />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This memorial will be permanently
						deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button onClick={handleDeleteConfirm} variant='destructive'>
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
