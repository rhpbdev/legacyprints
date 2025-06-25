import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ContactPage = () => {
	return (
		<>
			<div className='h-[850px] flex flex-col justify-center items-center gap-4 p-6'>
				Contact page coming soon
				<Button asChild>
					<Link href={'/'}>Go Home</Link>
				</Button>
			</div>
		</>
	);
};

export default ContactPage;
