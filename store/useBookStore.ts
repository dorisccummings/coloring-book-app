import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  setBook: (newBook: PageContent[]) => void 
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      book: [],
      
      addPage: (page) => set((state) => ({ 
        book: state.book.some(p => p.id === page.id) 
          ? state.book 
          : [...state.book, page] 
      })),

      removePage: (id) => set((state) => ({ 
        book: state.book.filter((p) => p.id !== id) 
      })),

      // This is the function that will fix your Header count sync issue!
      setBook: (newBook) => set({ book: newBook }), 
    }),
    {
      name: 'coloring-book-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
)