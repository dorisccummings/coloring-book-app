'use client'
import Link from 'next/link'
import { useBookStore } from '../store/useBookStore'
import { Printer, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

export default function Header() {
    // This talks to the store to see how many pages you've picked
    const bookCount = useBookStore((state) => state.book.length)
    const pathname = usePathname()
    const isMyBookPage = pathname === '/my-book'

    return (
        <header className="sticky top-0 z-50 p-4 bg-white border-b shadow-sm flex justify-between items-center text-black">
            {/* Clicking the Logo takes you back to the Main Gallery */}
            <Link href="/">
                <div className="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tight cursor-pointer">
                    <BookOpen className="text-orange-500" />
                    Print &<span className="text-orange-500">Color</span>
                </div>
            </Link>

            {/* Clicking this button takes you to your Drag & Drop "My Book" page */}
            {!isMyBookPage && (
    <Link href="/my-book">
        <button 
            onClick={() => {
                posthog.capture('navigated_to_my_book', {
                    current_book_count: bookCount,
                    entry_point: 'header_button',
                    timestamp: new Date().toISOString()
                });
            }}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-full transition-all shadow-md active:scale-95"
        >
            <Printer size={20} />
            My Coloring Book ({bookCount})
        </button>
    </Link>
)}
        </header>
    )
}