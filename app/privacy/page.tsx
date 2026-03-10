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
            When my kids were little, I struggled to find quality, free printable coloring pages. I created this tool to help parents and teachers get organized, easy-to-print pages for their "whole crew."
          </p>
        </section>

        <section className="mb-10 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Testing & Analytics</h2>
          <p className="mb-4 text-sm">
            I use this site as a <strong>live testing lab</strong>. I am a developer testing tools like <strong>Microsoft Clarity, PostHog, and Google Analytics</strong> to see how they work.
          </p>
          <p className="text-sm">
            I have no interest in your personal information. I don't collect names or emails. I only watch how the site performs to improve it.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Advertising</h2>
          <p className="text-sm">
            We use <strong>Google AdSense</strong>. They use cookies to show ads. You can opt-out at <a href="https://adssettings.google.com" target="_blank" className="text-blue-500 underline">Google Ads Settings</a>.
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