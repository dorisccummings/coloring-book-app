'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'
import Header from '../../components/Header'
import { useBookStore } from '../../store/useBookStore'
// ADD 'GripVertical' TO THIS LINE:
import { ArrowLeft, Printer, GripVertical } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableThumbnail } from '../../components/DraggableThumbnail'

export default function MyBookPage() {
    const { book, removePage } = useBookStore()
    const [orderedBook, setOrderedBook] = useState(book)

    // Syncs the draggable list with the store
    useEffect(() => {
        setOrderedBook(book)
    }, [book])

    // --- 1. THE LOADER: Pulls the book from the user's computer on load ---
    useEffect(() => {
        const savedData = localStorage.getItem('my-coloring-book');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Only set the book if there's actually something in it
                if (parsedData.length > 0) {
                    setOrderedBook(parsedData);
                }
            } catch (error) {
                console.error("Could not load your saved book:", error);
            }
        }
    }, []);

    // --- 2. THE SAVER: Remembers the book every time a page is added/moved ---
    useEffect(() => {
        // We save the book to the computer's memory so it survives a refresh
        localStorage.setItem('my-coloring-book', JSON.stringify(book));
    }, [book]);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    function handleDragEnd(event: any) {
        const { active, over } = event
        if (active.id !== over.id) {
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
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Generates ONLY the images
        const imagesHtml = orderedBook.map(page => `
      <div class="page-break">
        <img src="${page.thumbnailUrl}" />
      </div>
    `).join('');

        printWindow.document.write(`
      <html>
        <head>
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
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
        printWindow.document.close();
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Header />
            <main className="max-w-3xl mx-auto px-4">
                {/* --- Make Print button sticky --- */}
                <div className="sticky top-[73px] z-40 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Gallery</span>
                        </Link>
                        <button
                            onClick={handleFullPrint}
                            disabled={orderedBook.length === 0}
                            className="flex items-center gap-2 px-10 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg transition-transform active:scale-95"
                        >
                            <Printer size={20} /> Print Full Book
                        </button>
                    </div>
                </div>
                <div className="mb-8" />

                <h1 className="text-3xl font-black mb-6">Arrange Your Book</h1>
                {/* INSTRUCTION BANNER */}
                {orderedBook.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-blue-700">
                        <div className="bg-blue-600 text-white p-1 rounded-full">
                            <GripVertical size={16} />
                        </div>
                        <p className="text-sm font-medium">
                            <strong>Pro Tip:</strong> Grab the handles on the left to drag and change the order of your coloring book!
                        </p>
                    </div>
                )}

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderedBook.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            {orderedBook.map((page) => (
                                <DraggableThumbnail key={page.id} page={page} onRemove={removePage} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {orderedBook.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">
                        Go back and add some pages to get started!
                    </div>
                )}

                {orderedBook.length > 0 && (
                    <div className="mt-8 pb-10 border-t border-slate-100 pt-8 text-center">
                        <p className="text-sm text-slate-700 max-w-3x1 mx-auto leading-relaxed">
                            <strong>Need more than one copy?</strong> Click "Print Full Book,"
                            then change the number of copies in the print preview window.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}