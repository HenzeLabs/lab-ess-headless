import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-indigo-500 to-orange-500 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-white">
            INSIGHTS FOR BUYERS
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            The AmScope Tax – Why Cheap Microscopes Cost More
          </h2>
          <p className="text-lg text-white">
            Learn how hidden costs in low-quality microscopes add up, and why
            investing in lab-tested equipment saves money long term.
          </p>
        </div>

        {/* Right Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 mt-8 md:mt-0">
          <Link
            href="https://labessentials.com/blogs/news/the-amscope-tax-why-cheap-microscopes-cost-more"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 hover:text-white transition-colors duration-300 w-full sm:w-auto"
          >
            Read the Guide
          </Link>
          <Link
            href="/collections/microscopes"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-800 bg-white hover:bg-indigo-600 hover:text-white transition-colors duration-300 w-full sm:w-auto"
          >
            Shop Reliable Microscopes
          </Link>
        </div>
      </div>
    </section>
  );
}
