import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PageContent {
  id: string
  title: string
  thumbnailUrl: string
  category: string | string[]
  altText?: string
}

interface BookState {
  book: PageContent[]
  addPage: (page: PageContent) => void
  removePage: (id: string) => void
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      book: [],
      addPage: (page) => set((state) => ({ 
        // Prevents adding the same page twice
        book: state.book.some(p => p.id === page.id) 
          ? state.book 
          : [...state.book, page] 
      })),
      removePage: (id) => set((state) => ({ 
        book: state.book.filter((p) => p.id !== id) 
      })),
    }),
    {
      name: 'coloring-book-storage', // This saves it to your browser's memory
    }
  )
)