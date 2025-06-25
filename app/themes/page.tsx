import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ThemesPage = () => {
	return (
		<>
			<div className='h-[850px] flex flex-col justify-center items-center gap-4 p-6'>
				Themes page coming soon
				<Button asChild>
					<Link href={'/'}>Go Home</Link>
				</Button>
			</div>
		</>
	);
};

export default ThemesPage;
