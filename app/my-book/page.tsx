'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'
import Header from '../../components/Header'
import { useBookStore, PageContent } from '../../store/useBookStore'
import { ArrowLeft, Printer, GripVertical } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableThumbnail } from '../../components/DraggableThumbnail'

export default function MyBookPage() {
    // 1. ALL HOOKS AT THE TOP
    const { book, removePage, setBook } = useBookStore()
    const [orderedBook, setOrderedBook] = useState<PageContent[]>([])
    const [mounted, setMounted] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // --- EFFECT: INITIAL LOAD (Runs once on mount) ---
    // --- EFFECT: INITIAL LOAD ---
    useEffect(() => {
        setMounted(true)
        const savedData = localStorage.getItem('my-coloring-book')
        let savedPages: PageContent[] = []
        let sourceUsed = "Store Only"

        if (savedData) {
            try {
                savedPages = JSON.parse(savedData)
                if (savedPages.length > 0) sourceUsed = "Merged (Store + LocalStorage)"
            } catch (e) {
                console.error("Error parsing local storage:", e)
                sourceUsed = "Error / Store Fallback"
            }
        }

        // 1. COMBINE BOTH SOURCES
        const combined = [...book, ...savedPages]

        // 2. DEDUPLICATE (Keep only unique IDs)
        const uniquePages = combined.reduce((acc: PageContent[], current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) return acc.concat([current]);
            return acc;
        }, []);

        // 3. UPDATE EVERYTHING
        setOrderedBook(uniquePages)
        setBook(uniquePages) // Sync the Header count immediately

        // 4. THE COMPLETE POSTHOG SNAPSHOT
        posthog.capture('viewed_my_book_summary', {
            page_count: uniquePages.length,
            data_source: sourceUsed,
            // The "Gold Mine" data points
            image_paths: uniquePages.map((p: PageContent) => p.thumbnailUrl),
            page_titles: uniquePages.map((p: PageContent) => p.title),
            categories_represented: [...new Set(uniquePages.map((p: PageContent) => p.category))],
            // Detailed breakdown for debugging the "Missing Images"
            count_from_store: book.length,
            count_from_localstorage: savedPages.length
        })
    }, []) // Empty array = Only runs on arrival

    // --- EFFECT: PERSISTENT SAVE ---
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('my-coloring-book', JSON.stringify(orderedBook))
        }
    }, [orderedBook, mounted])

    // --- HANDLER: DELETE ---
    const handleRemovePage = (id: string) => {
        // 1. Find the page details BEFORE we filter it out (for the log)
        const pageToRemove = orderedBook.find(p => p.id === id);

        // 2. Calculate the new list
        const newList = orderedBook.filter((page) => page.id !== id);

        // 3. Update the UI and the Store
        setOrderedBook(newList);
        setBook(newList);

        // 4. Capture everything in ONE place with all the juicy details
        if (pageToRemove) {
            posthog.capture('page_removed_from_book', {
                page_id: id,
                page_title: pageToRemove.title,
                image_url: pageToRemove.thumbnailUrl,
                category: Array.isArray(pageToRemove.category) ? pageToRemove.category[0] : pageToRemove.category,
                remaining_pages: newList.length,
                source_url: window.location.href
            });
        }
    };

    // --- HANDLER: REORDER (DRAG & DROP) ---
    function handleDragEnd(event: any) {
        const { active, over } = event

        if (active && over && active.id !== over.id) {
            const oldIndex = orderedBook.findIndex((i) => i.id === active.id)
            const newIndex = orderedBook.findIndex((i) => i.id === over.id)

            const movedPage = orderedBook[oldIndex];
            const newItems = arrayMove(orderedBook, oldIndex, newIndex);

            setOrderedBook(newItems);
            setBook(newItems);

            // --- ENHANCED TELEMETRY ---
            posthog.capture('book_pages_reordered', {
                page_id: active.id,
                page_title: movedPage?.title,

                // THE BUG HUNTERS:
                image_url: movedPage?.thumbnailUrl,
                all_current_paths: newItems.map((p: PageContent) => p.thumbnailUrl),

                // CONTEXT:
                old_position: oldIndex,
                new_position: newIndex,
                total_book_pages: newItems.length,
                category: Array.isArray(movedPage?.category) ? movedPage?.category[0] : movedPage?.category,
                source_url: window.location.href,


                // THE "MYSTERY SOLVER" DATA:
                page_count: newItems.length,
                // Capture all paths to see if the slash (/) is still there after the move
                image_paths: newItems.map((p: PageContent) => p.thumbnailUrl),
                page_titles: newItems.map((p: PageContent) => p.title),
                categories_represented: [...new Set(newItems.map((p: PageContent) => p.category))],



            });
        }
    }

    // --- HANDLER: PRINT ---
    const handleFullPrint = () => {
        posthog.capture('full_book_printed', {
            page_count: orderedBook.length,
            page_ids: orderedBook.map(p => p.id),
        })

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const imagesHtml = orderedBook.map(page => `
            <div class="page-break">
                <img src="${page.thumbnailUrl}" alt="Coloring Page" />
            </div>
        `).join('')

        printWindow.document.write(`
            <html>
                <head>
                    <title>My Coloring Book</title>
                    <style>
                        @page { size: portrait; margin: 0; }
                        body { margin: 0; padding: 0; background: white; }
                        .page-break { height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; }
                        img { max-width: 90%; max-height: 90%; object-fit: contain; }
                    </style>
                </head>
                <body>
                    ${imagesHtml}
                    <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    // 2. EARLY RETURN (Hydration Fix)
    if (!mounted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // 3. RENDER (HTML starts here)
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Header />

            <main className="max-w-3xl mx-auto px-4">
                {/* STICKY ACTION BAR */}
                <div className="sticky top-[73px] z-40 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Gallery</span>
                        </Link>

                        <button
                            onClick={handleFullPrint}
                            disabled={orderedBook.length === 0}
                            className="flex items-center gap-3 px-10 py-3 bg-green-600 text-white rounded-full font-black text-lg hover:bg-green-700 disabled:opacity-50 shadow-lg transition-transform active:scale-95 shrink-0"
                        >
                            <Printer size={22} /> Print Full Book
                        </button>
                    </div>
                </div>

                <div className="pt-8">
                    <h1 className="text-3xl font-black mb-6 tracking-tight">Arrange Your Book</h1>

                    {orderedBook.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-blue-700 shadow-sm">
                            <div className="bg-blue-600 text-white p-1 rounded-full shrink-0">
                                <GripVertical size={16} />
                            </div>
                            <p className="text-sm font-medium">
                                <strong>Pro Tip:</strong> Drag the handles on the left to change the printing order!
                            </p>
                        </div>
                    )}

                    {/* DRAGGABLE LIST */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={orderedBook.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {orderedBook.map((page) => (
                                    <DraggableThumbnail
                                        key={page.id}
                                        page={page}
                                        onRemove={handleRemovePage}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* EMPTY STATE */}
                    {orderedBook.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">
                            Go back and add some pages to get started!
                        </div>
                    )}

                    {/* PRINTING TIP FOOTER */}
                    {orderedBook.length > 0 && (
                        <div className="mt-12 pb-10 border-t border-slate-200 pt-8 text-center px-4">
                            <p className="text-sm text-slate-700 max-w-3xl mx-auto leading-relaxed">
                                <strong className="text-slate-900 font-bold">Printing Tip:</strong> Need more than one copy? <br />
                                Click "Print Full Book" and change the number of copies in the print preview window.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}