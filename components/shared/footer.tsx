import { APP_NAME } from '@/lib/constants';

const Footer = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className='flex justify-center border-t bg-slate-100 h-23'>
			<div className='p-5 flex-center'>
				{currentYear} {APP_NAME}. All Rights Reserved
			</div>
		</footer>
	);
};

export default Footer;
