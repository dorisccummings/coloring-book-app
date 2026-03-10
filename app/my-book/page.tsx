'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'
import Header from '../../components/Header'
import { useBookStore } from '../../store/useBookStore'
import { ArrowLeft, Printer, GripVertical } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableThumbnail } from '../../components/DraggableThumbnail'

export default function MyBookPage() {
    // 1. ALL HOOKS MUST BE AT THE TOP (Rules of Hooks)
    const { book, removePage } = useBookStore()
    const [orderedBook, setOrderedBook] = useState<any[]>([])
    const [mounted, setMounted] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // --- EFFECT: LOAD DATA (Hydration Fix) ---
    useEffect(() => {
        setMounted(true)
        
        // Check localStorage first for the saved arrangement
        const savedData = localStorage.getItem('my-coloring-book')
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                if (parsedData.length > 0) {
                    setOrderedBook(parsedData)
                    return 
                }
            } catch (e) {
                console.error("Error loading saved book:", e)
            }
        }
        
        // Fallback to the global store if no local storage exists
        setOrderedBook(book)
    }, [book])

    // --- EFFECT: SAVE DATA ---
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('my-coloring-book', JSON.stringify(orderedBook))
        }
    }, [orderedBook, mounted])

    // 2. EARLY RETURN (Only after hooks are defined)
    if (!mounted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // 3. HANDLERS
    function handleDragEnd(event: any) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setOrderedBook((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)
                
                posthog.capture('book_reordered', {
                    page_id: active.id,
                    old_position: oldIndex,
                    new_position: newIndex,
                    book_size: items.length,
                })
                
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

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
                        .page-break { 
                            height: 100vh; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            page-break-after: always; 
                        }
                        img { max-width: 90%; max-height: 90%; object-fit: contain; }
                    </style>
                </head>
                <body>
                    ${imagesHtml}
                    <script>
                        window.onload = () => { 
                            setTimeout(() => {
                                window.print(); 
                                window.close(); 
                            }, 500); 
                        }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    // 4. RENDER
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Header />
            
            <main className="max-w-3xl mx-auto px-4">
                {/* --- STICKY ACTION BAR --- */}
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

                {/* --- CONTENT PADDING --- */}
                <div className="pt-8">
                    <h1 className="text-3xl font-black mb-6 tracking-tight">Arrange Your Book</h1>
                    
                    {/* INSTRUCTION BANNER */}
                    {orderedBook.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-blue-700 shadow-sm">
                            <div className="bg-blue-600 text-white p-1 rounded-full shrink-0">
                                <GripVertical size={16} />
                            </div>
                            <p className="text-sm font-medium">
                                <strong>Pro Tip:</strong> Grab the handles on the left to drag and change the order of your coloring book!
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
                                        onRemove={removePage} 
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
                            <p className="text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed">
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