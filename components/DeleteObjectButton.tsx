// File: @/components/DeleteObjectButton.tsx
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
const DeleteObject = ({ canvas }: any) => {
	const deleteSelectedObject = () => {
		if (!canvas) return;
		const obj = canvas.getActiveObject();
		if (obj) {
			canvas.remove(obj);
			canvas.discardActiveObject();
			canvas.requestRenderAll();
		} else {
			toast.error('No object selected');
		}
	};
	return (
		<Button
			onClick={deleteSelectedObject}
			variant='outline'
			className='bg-red-500 hover:bg-red-600 text-white hover:text-white cursor-pointer'
			title='Delete Selection'>
			<Trash />
		</Button>
	);
};

export default DeleteObject;
