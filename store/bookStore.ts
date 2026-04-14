import { create } from 'zustand'
import { Book, Page, Chapter } from '@/types'

interface BookState {
  book: Book | null
  currentChapter: number
  currentPage: number
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchBook: () => Promise<void>
  setCurrentChapter: (index: number) => void
  setCurrentPage: (index: number) => void
  nextPage: () => void
  prevPage: () => void
  clearBook: () => Promise<void>
  addPage: (page: Page) => void
}

export const useBookStore = create<BookState>((set, get) => ({
  book: null,
  currentChapter: 0,
  currentPage: 0,
  isLoading: false,
  error: null,

  fetchBook: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/book')
      if (!response.ok) throw new Error('Failed to fetch book')
      const book = await response.json()
      set({ book, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setCurrentChapter: (index) => {
    set({ currentChapter: index, currentPage: 0 })
  },

  setCurrentPage: (index) => {
    set({ currentPage: index })
  },

  nextPage: () => {
    const { book, currentChapter, currentPage } = get()
    if (!book) return

    const currentChapterData = book.chapters[currentChapter]
    if (currentPage < currentChapterData.pages.length - 1) {
      set({ currentPage: currentPage + 1 })
    } else if (currentChapter < book.chapters.length - 1) {
      set({ currentChapter: currentChapter + 1, currentPage: 0 })
    }
  },

  prevPage: () => {
    const { book, currentChapter, currentPage } = get()
    if (!book) return

    if (currentPage > 0) {
      set({ currentPage: currentPage - 1 })
    } else if (currentChapter > 0) {
      const prevChapter = book.chapters[currentChapter - 1]
      set({
        currentChapter: currentChapter - 1,
        currentPage: prevChapter.pages.length - 1,
      })
    }
  },

  clearBook: async () => {
    set({ isLoading: true })
    try {
      await fetch('/api/book', { method: 'DELETE' })
      set({ book: null, currentChapter: 0, currentPage: 0, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addPage: (page) => {
    const { book } = get()
    if (!book) {
      // Create new book with first page
      set({
        book: {
          title: 'My AI Book',
          chapters: [{ title: page.chapterTitle, pages: [page] }],
          totalPages: 1,
        },
      })
      return
    }

    // Find or create chapter
    const chapterIndex = book.chapters.findIndex(
      (ch) => ch.title === page.chapterTitle
    )

    if (chapterIndex >= 0) {
      book.chapters[chapterIndex].pages.push(page)
    } else {
      book.chapters.push({ title: page.chapterTitle, pages: [page] })
    }

    set({
      book: {
        ...book,
        totalPages: book.totalPages + 1,
      },
    })
  },
}))
