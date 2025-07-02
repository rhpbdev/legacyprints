import Link from 'next/link';
import { Button } from '../ui/button';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import UserDropdown from '@/app/user-dropdown';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { EllipsisVertical } from 'lucide-react';

const Navbar = () => {
	return (
		<nav className='border-b'>
			<div className='hidden container mx-auto px-6 py-4 lg:flex justify-between items-center'>
				<div className='text-2xl font-bold text-slate-800'>
					<Link href='/' prefetch={false}>
						LegacyPrints
					</Link>
				</div>
				{/* Replace with your App Name/Logo */}
				<div className='flex space-x-4'>
					<Button
						asChild
						variant='ghost'
						className='text-slate-700 hover:text-slate-900'>
						<Link href='/' prefetch={false}>
							Home
						</Link>
					</Button>
					<Button
						asChild
						variant='ghost'
						className='text-slate-700 hover:text-slate-900'>
						<Link href='/products' prefetch={false}>
							Products
						</Link>
					</Button>
					<Button
						asChild
						variant='ghost'
						className='text-slate-700 hover:text-slate-900'>
						<Link href='/themes' prefetch={false}>
							Themes
						</Link>
					</Button>
					<Button
						asChild
						variant='ghost'
						className='text-slate-700 hover:text-slate-900'>
						<Link href='/contact' prefetch={false}>
							Contact
						</Link>
					</Button>
					<SignedOut>
						<div className='flex items-center'>
							<Button
								asChild
								variant='link'
								className='text-slate-700 hover:text-slate-900 cursor-pointer'>
								<SignInButton />
							</Button>
							<Button
								asChild
								variant='link'
								className='text-slate-700 hover:text-slate-900 cursor-pointer'>
								<SignUpButton />
							</Button>
						</div>
					</SignedOut>
					<SignedIn>
						<UserDropdown />
					</SignedIn>
					<Button asChild className='bg-slate-800 hover:bg-slate-700 ml-2'>
						<Link href='/dashboard' prefetch={false}>
							Get Started
						</Link>
					</Button>
				</div>
			</div>
			<div className='lg:hidden container mx-auto px-6 py-4 flex justify-between items-center'>
				<div className='text-2xl font-bold text-slate-800'>
					<Link href='/' prefetch={false}>
						LegacyPrints
					</Link>
				</div>
				<div className='flex gap-2 items-center'>
					<SignedOut>
						<div className='flex items-center'>
							<Button asChild variant='link' className='cursor-pointer'>
								<SignInButton />
							</Button>
							<Button asChild variant='link' className='cursor-pointer'>
								<SignUpButton />
							</Button>
						</div>
					</SignedOut>
					<SignedIn>
						<UserDropdown />
					</SignedIn>
					<Sheet>
						<SheetTrigger asChild>
							<EllipsisVertical />
						</SheetTrigger>
						<SheetContent className='flex flex-col items-start'>
							<SheetHeader>
								<SheetTitle>Menu</SheetTitle>
								<SheetDescription></SheetDescription>
							</SheetHeader>
							<div className='flex flex-col gap-2'>
								<Button
									asChild
									variant='ghost'
									className='text-slate-700 hover:text-slate-900'>
									<Link href='/' prefetch={false} className='justify-start'>
										Home
									</Link>
								</Button>
								<Button
									asChild
									variant='ghost'
									className='text-slate-700 hover:text-slate-900'>
									<Link
										href='/products'
										prefetch={false}
										className='justify-start'>
										Products
									</Link>
								</Button>
								<Button
									asChild
									variant='ghost'
									className='text-slate-700 hover:text-slate-900'>
									<Link
										href='/themes'
										prefetch={false}
										className='justify-start'>
										Themes
									</Link>
								</Button>
								<Button
									asChild
									variant='ghost'
									className='text-slate-700 hover:text-slate-900'>
									<Link
										href='/contact'
										prefetch={false}
										className='justify-start'>
										Contact
									</Link>
								</Button>
							</div>
							<SheetFooter>
								<SheetClose asChild>
									<Button variant='outline'>Close</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
