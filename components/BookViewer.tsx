'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen, Menu, X } from 'lucide-react'
import { useBookStore } from '@/store/bookStore'
import { cn } from '@/lib/utils'

export function BookViewer() {
  const {
    book,
    currentChapter,
    currentPage,
    isLoading,
    nextPage,
    prevPage,
    setCurrentChapter,
    setCurrentPage,
  } = useBookStore()

  const [showSidebar, setShowSidebar] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5dc]">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 animate-pulse text-amber-700" />
          <p className="mt-4 text-lg text-amber-800">Loading your book...</p>
        </div>
      </div>
    )
  }

  if (!book || book.chapters.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5dc]">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-amber-700" />
          <p className="mt-4 text-lg text-amber-800">Your book is empty</p>
          <p className="text-sm text-amber-600">
            Add some text to get started
          </p>
        </div>
      </div>
    )
  }

  const chapter = book.chapters[currentChapter]
  const page = chapter.pages[currentPage]

  return (
    <div className="flex h-screen bg-[#f5f5dc]">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 z-50 h-full w-80 bg-[#e8e4d9] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-amber-800/20 p-4">
              <h2 className="text-lg font-bold text-amber-900">{book.title}</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="rounded-full p-2 hover:bg-amber-800/10"
              >
                <X className="h-5 w-5 text-amber-800" />
              </button>
            </div>
            <div className="h-[calc(100vh-80px)] overflow-y-auto p-4">
              {book.chapters.map((ch, chIndex) => (
                <div key={ch.title} className="mb-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-amber-800">
                    {ch.title}
                  </h3>
                  <div className="space-y-1">
                    {ch.pages.map((p, pIndex) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCurrentChapter(chIndex)
                          setCurrentPage(pIndex)
                          setShowSidebar(false)
                        }}
                        className={cn(
                          'w-full rounded px-3 py-2 text-left text-sm transition-colors',
                          chIndex === currentChapter && pIndex === currentPage
                            ? 'bg-amber-800 text-white'
                            : 'hover:bg-amber-800/10 text-amber-900'
                        )}
                      >
                        Page {p.pageNumber}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-amber-800/20 bg-[#e8e4d9] px-6 py-4">
          <button
            onClick={() => setShowSidebar(true)}
            className="rounded-full p-2 hover:bg-amber-800/10"
          >
            <Menu className="h-6 w-6 text-amber-800" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-serif font-bold text-amber-900">
              {chapter.title}
            </h1>
            <p className="text-sm text-amber-700">
              Page {page.pageNumber} of {book.totalPages}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden p-8">
          <motion.div
            key={page.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto h-full max-w-3xl overflow-y-auto rounded-lg bg-[#fffef0] p-12 shadow-xl"
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent 95%, rgba(139, 69, 19, 0.03) 95%)',
              backgroundSize: '20px 100%',
            }}
          >
            <div className="prose prose-amber max-w-none">
              <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                {page.content}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-amber-800/20 bg-[#e8e4d9] px-8 py-4">
          <button
            onClick={prevPage}
            disabled={currentChapter === 0 && currentPage === 0}
            className="flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-3 text-white transition-colors hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {book.chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentChapter(idx)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  idx === currentChapter
                    ? 'w-8 bg-amber-800'
                    : 'bg-amber-800/30 hover:bg-amber-800/50'
                )}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={
              currentChapter === book.chapters.length - 1 &&
              currentPage === chapter.pages.length - 1
            }
            className="flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-3 text-white transition-colors hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
