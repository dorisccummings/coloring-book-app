'use client'
import posthog from 'posthog-js'
import { PageContent, useBookStore } from '../store/useBookStore'
import { PlusCircle, CheckCircle2, Printer } from 'lucide-react'

export default function ThumbnailCard({ page }: { page: PageContent }) {
  const { book, addPage, removePage } = useBookStore()
  const isInBook = book.some((p) => p.id === page.id)

  const handlePrint = () => {
    posthog.capture('single_page_printed', {
      page_id: page.id,
      page_title: page.title,
      // THE BUG FINDER: Was the path '/images/...' or just 'images/...'?
      image_url: page.thumbnailUrl,
      // THE CONTEXT: Were they on the /all page or a category page?
      source_url: window.location.href,
      // THE DATA: The raw category list (helps check case-sensitivity)
      category_source: page.category,
      category: Array.isArray(page.category) ? page.category[0] : page.category,
    })
    const printWindow = window.open('', '_blank', 'width=800,height=1000');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${page.title}</title>
            <style>
              /* This is the magic line that forces Portrait mode */
              @page { 
                size: portrait; 
                margin: 0; 
              }
              
              body { 
                margin: 0; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                width: 100vw;
                background: white; 
              }
              
              img { 
                /* 90% width ensures it fits within the printer's physical margins */
                max-width: 90%; 
                max-height: 95%; 
                object-fit: contain; 
              }
            </style>
          </head>
          <body>
            <img src="${page.thumbnailUrl}" onload="window.print();window.close();">
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white flex flex-col group">

      {/* ON-SCREEN "PAPER" VIEW (Centered with Whitespace) */}
      <div className="aspect-3/4 bg-white p-8 border-b flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.thumbnailUrl}
          alt={page.title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 truncate">{page.title}</h3>
          <span className="text-[10px] uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
            {Array.isArray(page.category) ? page.category[0] : page.category}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Printer size={18} /> Print Single Page
          </button>

          {/* Toggle Book Button */}
          <button
            onClick={() => {

              if (isInBook) {
                removePage(page.id)
                posthog.capture('page_removed_from_book', {
                  page_id: page.id,
                  page_title: page.title,
                  category: Array.isArray(page.category) ? page.category[0] : page.category,
                  category_source: page.category, // Helps find the "All vs Easter" bug
                  image_url: page.thumbnailUrl,   // Check this in PostHog to see if it's broken
                  source_url: window.location.href // Tells us if they were on /spring or /all
                })
              } else {
                addPage(page)
                posthog.capture('page_added_to_book', {
                  page_id: page.id,
                  page_title: page.title,
                  category: Array.isArray(page.category) ? page.category[0] : page.category,
                  category_source: page.category, // Helps find the "All vs Easter" bug
                  image_url: page.thumbnailUrl,   // Check this in PostHog to see if it's broken
                  source_url: window.location.href // Tells us if they were on /spring or /all
                })
              }
            }}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium transition-colors ${isInBook ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isInBook ? <><CheckCircle2 size={18} /> Added</> : <><PlusCircle size={18} /> Add to Coloring Book</>}
          </button>
        </div>
      </div>
    </div>
  )
}