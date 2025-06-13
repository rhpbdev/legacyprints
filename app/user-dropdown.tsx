'use client';

import { UserButton } from '@clerk/nextjs';
import { BookUserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
	const router = useRouter();
	return (
		<UserButton
			showName
			appearance={{
				elements: {
					userButtonOuterIdentifier: {
						color: 'white',
						'@media (max-width: 640px)': {
							display: 'none',
						},
					},
				},
			}}>
			<UserButton.MenuItems>
				<UserButton.Action
					label='Dashboard'
					labelIcon={<BookUserIcon size={16} />}
					onClick={() => {
						router.push('/dashboard');
					}}
				/>
			</UserButton.MenuItems>
		</UserButton>
	);
}
