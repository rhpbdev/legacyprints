import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ArrowRight,
	Download,
	Palette, // Keep Palette as it's used
	LayoutTemplate, // Keep LayoutTemplate as it's used
	Star, // Keep Star as it's used
	// Removed FileText, Heart, MessageSquare, Share2, Users as they are not used in this file
} from 'lucide-react';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link';

const HomePage = () => {
	return (
		<>
			{/* Hero Section */}
			<section className='pt-32 pb-32 px-6 md:pt-48 md:px-16 bg-gradient-to-br from-slate-50 to-slate-200'>
				<div className='container mx-auto flex flex-col items-center text-center max-w-4xl gap-y-8'>
					<h1 className='text-5xl md:text-6xl font-bold leading-tight'>
						Create Beautiful & Lasting Memorial Tributes
					</h1>
					<p className='text-lg md:text-xl text-slate-700 max-w-2xl'>
						Effortlessly design and personalize funeral programs, registry
						books, thank you cards, and more with our intuitive templates. Honor
						their memory with a tribute as unique as their life.
					</p>
					<div className='flex flex-col sm:flex-row gap-4 mt-6'>
						<Button
							asChild
							size='lg'
							className='bg-slate-800 hover:bg-slate-700 text-white px-8 py-6 text-lg'>
							<Link href='/dashboard' prefetch={false}>
								Get Started <ArrowRight className='ml-2 h-5 w-5' />
							</Link>
						</Button>
						<Button
							size='lg'
							variant='outline'
							className='border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg'>
							How It Works
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id='features' className='py-24 px-6 md:px-16 bg-white'>
				<div className='container mx-auto text-center max-w-5xl'>
					<h2 className='text-4xl font-bold mb-6 text-slate-800'>
						Why Choose Us?
					</h2>
					<p className='text-lg text-slate-600 mb-16 max-w-3xl mx-auto'>
						We provide the tools you need to create dignified and personalized
						tributes during a difficult time, focusing on ease of use, quality,
						and compassionate design.
					</p>
					<div className='grid md:grid-cols-3 gap-8'>
						<Card className='shadow-lg hover:shadow-xl transition-shadow duration-300'>
							<CardHeader className='items-center'>
								<div className='p-4 bg-slate-100 rounded-full mb-4'>
									<Palette className='h-10 w-10 text-slate-700' />
								</div>
								<CardTitle className='text-2xl font-semibold'>
									Easy Customization
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-slate-600'>
									Personalize every detail with our user-friendly editor. No
									design skills needed. Change text, photos, colors, and layouts
									with ease.
								</p>
							</CardContent>
						</Card>
						<Card className='shadow-lg hover:shadow-xl transition-shadow duration-300'>
							<CardHeader className='items-center'>
								<div className='p-4 bg-slate-100 rounded-full mb-4'>
									<LayoutTemplate className='h-10 w-10 text-slate-700' />
								</div>
								<CardTitle className='text-2xl font-semibold'>
									Elegant Templates
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-slate-600'>
									Choose from a wide variety of professionally designed
									templates for funeral programs, prayer cards, and more,
									suitable for any style.
								</p>
							</CardContent>
						</Card>
						<Card className='shadow-lg hover:shadow-xl transition-shadow duration-300'>
							<CardHeader className='items-center'>
								<div className='p-4 bg-slate-100 rounded-full mb-4'>
									<Download className='h-10 w-10 text-slate-700' />
								</div>
								<CardTitle className='text-2xl font-semibold'>
									Print or Share Digitally
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-slate-600'>
									Download high-resolution files for printing at home or with a
									professional printer, or share digitally with family and
									friends.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section id='how-it-works' className='py-24 px-6 md:px-16 bg-slate-50'>
				<div className='container mx-auto text-center max-w-5xl'>
					<h2 className='text-4xl font-bold mb-6 text-slate-800'>
						Create in 3 Simple Steps
					</h2>
					<p className='text-lg text-slate-600 mb-16 max-w-3xl mx-auto'>
						Designing a meaningful tribute is straightforward and stress-free
						with our guided process.
					</p>
					<div className='grid md:grid-cols-3 gap-8 text-left'>
						<div className='flex flex-col items-center text-center p-6'>
							<div className='relative mb-4'>
								<div className='p-6 bg-slate-800 text-white rounded-full text-2xl font-bold w-16 h-16 flex items-center justify-center'>
									1
								</div>
							</div>
							<h3 className='text-2xl font-semibold mb-2'>Select a Template</h3>
							<p className='text-slate-600'>
								Browse our collection of beautifully crafted templates. Find the
								perfect style to honor your loved one.
							</p>
						</div>
						<div className='flex flex-col items-center text-center p-6'>
							<div className='relative mb-4'>
								<div className='p-6 bg-slate-800 text-white rounded-full text-2xl font-bold w-16 h-16 flex items-center justify-center'>
									2
								</div>
							</div>
							<h3 className='text-2xl font-semibold mb-2'>
								Personalize Details
							</h3>
							<p className='text-slate-600'>
								Add photos, obituary text, service details, and special memories
								using our intuitive online editor.
							</p>
						</div>
						<div className='flex flex-col items-center text-center p-6'>
							<div className='relative mb-4'>
								<div className='p-6 bg-slate-800 text-white rounded-full text-2xl font-bold w-16 h-16 flex items-center justify-center'>
									3
								</div>
							</div>
							<h3 className='text-2xl font-semibold mb-2'>Download & Print</h3>
							<p className='text-slate-600'>
								Once you&apos;re satisfied, download your design as a
								print-ready PDF or share it digitally with ease.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Templates Showcase Section */}
			<section id='templates' className='py-24 px-6 md:px-16 bg-white'>
				<div className='container mx-auto text-center max-w-6xl'>
					<h2 className='text-4xl font-bold mb-6 text-slate-800'>
						Our Template Collection
					</h2>
					<p className='text-lg text-slate-600 mb-16 max-w-3xl mx-auto'>
						Find the perfect way to tell their story. Our templates cater to
						diverse needs, from classic bifold and trifold programs to memorial
						cards and more.
					</p>
					<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{[
							{
								title: 'Classic Bifold Programs',
								description:
									'Timeless and elegant, perfect for traditional services. Ample space for photos and text.',
							},
							{
								title: 'Modern Trifold Programs',
								description:
									'Contemporary designs with flexible layouts for a comprehensive tribute.',
							},
							{
								title: 'Memorial Registry Books',
								description:
									'Beautifully designed guest books to capture cherished memories and condolences.',
							},
							{
								title: 'Thank You Cards',
								description:
									'Express gratitude with personalized cards that match your chosen program theme.',
							},
							{
								title: 'Prayer Cards',
								description:
									'Small, shareable keepsakes featuring a photo, prayer, or special verse.',
							},
							{
								title: 'Digital Memorials',
								description:
									'Easily shareable online tributes accessible to friends and family anywhere.',
							},
						].map((template) => (
							<Card
								key={template.title}
								className='overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col'>
								<div className='w-full h-48 bg-slate-200 flex items-center justify-center relative'>
									<Image
										src='/images/placeholder.webp'
										alt={template.title}
										width={150}
										height={100}
										className='transition-transform duration-300 ease-in-out group-hover:scale-105'
										loading='lazy'
									/>
								</div>
								<CardHeader>
									<CardTitle className='text-xl font-semibold'>
										{template.title}
									</CardTitle>
								</CardHeader>
								<CardContent className='flex-grow'>
									<p className='text-slate-600 text-sm'>
										{template.description}
									</p>
								</CardContent>
								<CardFooter>
									<Button
										variant='outline'
										className='w-full border-slate-700 text-slate-700 hover:bg-slate-700 hover:text-white'>
										View Details
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
					<Button
						size='lg'
						className='mt-12 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 text-lg'>
						Browse All Templates <ArrowRight className='ml-2 h-5 w-5' />
					</Button>
				</div>
			</section>

			{/* Testimonials Section */}
			<section id='testimonials' className='py-24 px-6 md:px-16 bg-slate-50'>
				<div className='container mx-auto text-center max-w-5xl'>
					<h2 className='text-4xl font-bold mb-6 text-slate-800'>
						Kind Words From Our Users
					</h2>
					<p className='text-lg text-slate-600 mb-16 max-w-3xl mx-auto'>
						Hear how we&apos;ve helped families create meaningful tributes
						during their time of need.
					</p>
					<div className='grid md:grid-cols-2 gap-8'>
						<Card className='bg-white shadow-lg'>
							<CardHeader>
								<div className='flex items-center mb-2'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className='h-5 w-5 text-yellow-400 fill-yellow-400'
										/>
									))}
								</div>
								<CardTitle className='text-xl font-semibold'>
									&quot;So Easy and Beautiful&quot;
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-slate-600 italic'>
									&quot;During such a difficult time, this site made creating a
									beautiful program for my father&apos;s service so much easier.
									The templates were lovely and easy to customize. Thank
									you!&quot;
								</p>
							</CardContent>
							<CardFooter>
								<p className='text-sm text-slate-500'>- Sarah M.</p>
							</CardFooter>
						</Card>
						<Card className='bg-white shadow-lg'>
							<CardHeader>
								<div className='flex items-center mb-2'>
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className='h-5 w-5 text-yellow-400 fill-yellow-400'
										/>
									))}
								</div>
								<CardTitle className='text-xl font-semibold'>
									&quot;Exactly What We Needed&quot;
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-slate-600 italic'>
									&quot;We were overwhelmed, and your platform provided a
									straightforward way to create a dignified registry book. The
									quality was excellent, and we received many compliments.&quot;
								</p>
							</CardContent>
							<CardFooter>
								<p className='text-sm text-slate-500'>- John B.</p>
							</CardFooter>
						</Card>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className='py-24 px-6 md:px-16 bg-slate-800 text-white'>
				<div className='container mx-auto text-center max-w-3xl'>
					<h2 className='text-4xl font-bold mb-6'>
						Ready to Create a Lasting Tribute?
					</h2>
					<p className='text-lg text-slate-300 mb-10'>
						Begin designing a beautiful memorial for your loved one today. Our
						tools and templates are here to support you every step of the way.
					</p>
					<Button
						size='lg'
						className='bg-white text-slate-800 hover:bg-slate-200 px-10 py-6 text-xl font-semibold'>
						Get Started Now
					</Button>
				</div>
			</section>
		</>
	);
};

export default HomePage;
