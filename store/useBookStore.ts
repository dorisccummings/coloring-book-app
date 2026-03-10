import { create } from 'zustand'

// This defines WHAT a coloring page is
export interface PageContent {
  id: string
  title: string
  category: string[]
  thumbnailUrl: string
}

interface BookState {
  book: PageContent[]
  addPage: (page: PageContent) => void
  removePage: (id: string) => void
}

// This creates the actual store to hold your choices
export const useBookStore = create<BookState>((set) => ({
  book: [],
  addPage: (page) => set((state) => ({ 
    book: state.book.some(p => p.id === page.id) ? state.book : [...state.book, page] 
  })),
  removePage: (id) => set((state) => ({ 
    book: state.book.filter((page) => page.id !== id) 
  })),
}))