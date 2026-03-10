import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] text-gray-700 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12 leading-relaxed">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 mb-10 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> 
          Back to Coloring Pages
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy & Purpose</h1>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Why This Site Exists</h2>
          <p className="mb-4">
            When my kids were little, I struggled to find quality, free printable coloring pages. I created this tool to help parents and teachers get organized, easy-to-print pages for the young artists in their lives.
          </p>
        </section>

        {/* Analytics Section - Simplified and quiet */}
        <section className="mb-10 p-6 rounded-2xl bg-white/40 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Analytics & Testing</h2>
          <p className="mb-4 text-sm">
            In addition to helping parents, I use this site as a <strong>live testing lab</strong>. I am a developer interested in how behavior analytics tools work so I can better understand which ones to recommend to others.
          </p>
          <p className="text-sm">
            <strong>I am not interested in your personal information.</strong> I do not collect names, emails, or identifying data. I only look at how the site is used to see how these tools perform in a real-world setting. <br />
            </p>
            <p className="text-sm">
            Current tools: <span className="font-medium">Google Analytics, Microsoft Clarity, and PostHog.</span> 
            <span className="italic block mt-1 text-gray-400 text-xs">*Note: Other similar tools may be tested here in the future.*</span>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Advertising</h2>
          <p className="text-sm">
            To help keep this resource free and cover hosting costs, we show ads via <strong>Google AdSense</strong>. Google uses cookies to serve ads based on your visit to this site. You can manage your ad preferences or opt-out at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Ads Settings</a>.
          </p>
        </section>

        <footer className="text-xs text-gray-400 mt-16 border-t pt-8 text-center">
          Created by <strong>Doris C. Cummings</strong>.
          <br />
          &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}