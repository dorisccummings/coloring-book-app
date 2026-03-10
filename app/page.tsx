'use client'
import { useState } from 'react' // New: we need this for the buttons
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
          
          {/* CATEGORY FILTER BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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