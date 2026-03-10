'use client'
import { useState } from 'react' // New: we need this for the buttons
import posthog from 'posthog-js'
import Header from '../components/Header'
import ThumbnailCard from '../components/ThumbnailCard'
import { coloringPages } from '../data/coloringPages'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')

  // This logic figures out which unique categories exist in your data
  // 1. Get all the categories from your data
  const allFoundCategories = [...new Set(coloringPages.flatMap(p => p.category))]

  // 2. Define the order you WANT (St. Patricks Day first!)
  const priorityOrder = ['All', 'St. Patricks Day', 'Easter', 'Spring', 'Fantasy', 'Buildings', 'Vehicles', 'Sports']

  // 3. Combine them: Priority ones first, then any others we found in the data
  const categories = [
    ...priorityOrder, 
    ...allFoundCategories.filter(cat => !priorityOrder.includes(cat))
  ]

  // This filters the list based on your button click
  const filteredPages = activeCategory === 'All' 
    ? coloringPages 
    : coloringPages.filter(page => page.category.includes(activeCategory))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
            Choose Your <span className="text-blue-600">Coloring Pages</span>
          </h1>
          <div className="max-w-7xl mx-auto px-4">
 

{/* --- COMPACT ONE-LINE BANNER --- */}
<div className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 my-4 shadow-sm inline-flex items-center gap-2 max-w-full">
  <span className="text-xl shrink-0">💡</span>
  <p className="text-gray-800 text-sm md:text-base leading-none">
    <strong>Have more than one artist?</strong>{" "}
    <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
      Skip the manual sorting:
    </span>{" "}
    <span className="md:whitespace-nowrap">
      Create a coloring book to get presorted pages straight off the printer.
    </span>
  </p>
</div>

  {/* Your coloring pages grid starts here... */}
</div>
          
          {/* CATEGORY FILTER BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  posthog.capture('category_filtered', {
                    category: cat,
                    results_count: cat === 'All' ? coloringPages.length : coloringPages.filter(p => p.category.includes(cat)).length,
                  })
                }}
                className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPages.map((item) => (
            <ThumbnailCard key={item.id} page={item} />
          ))}
        </div>
      </main>
    </div>
  )
}