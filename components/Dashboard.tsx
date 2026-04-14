'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import { useBookStore } from '@/store/bookStore'
import { BookViewer } from './BookViewer'
import { TextInput } from './TextInput'

export default function Dashboard() {
  const { book, fetchBook, clearBook, isLoading } = useBookStore()

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-800/20 bg-[#e8e4d9] px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-800 p-2">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">AI SmartBook</h1>
              <p className="text-sm text-amber-700">
                Intelligent content organization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {book && book.totalPages > 0 && (
              <>
                <span className="text-sm text-amber-700">
                  {book.totalPages} pages • {book.chapters.length} chapters
                </span>
                <button
                  onClick={clearBook}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border-2 border-red-700 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-700 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Book
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel - Book Viewer */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl bg-white shadow-xl"
              style={{ height: 'calc(100vh - 180px)' }}
            >
              <BookViewer />
            </motion.div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            {/* Add Content Card */}
            <TextInput />

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-[#e8e4d9] p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-bold text-amber-900">
                Book Statistics
              </h3>
              {book ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Total Pages</span>
                    <span className="font-bold text-amber-900">
                      {book.totalPages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Chapters</span>
                    <span className="font-bold text-amber-900">
                      {book.chapters.length}
                    </span>
                  </div>
                  <div className="border-t border-amber-800/20 pt-3">
                    <p className="mb-2 text-sm font-semibold text-amber-800">
                      Chapter Breakdown:
                    </p>
                    <div className="space-y-1">
                      {book.chapters.map((ch) => (
                        <div
                          key={ch.title}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-amber-700 truncate">
                            {ch.title}
                          </span>
                          <span className="text-amber-900">
                            {ch.pages.length} pages
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-amber-700">No content yet</p>
              )}
            </motion.div>

            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-gradient-to-br from-amber-800 to-amber-900 p-6 text-white shadow-lg"
            >
              <div className="mb-3 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <h3 className="text-lg font-bold">How it Works</h3>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-sm text-amber-100">
                <li>Enter your text in the input box</li>
                <li>AI analyzes the content and context</li>
                <li>Smart placement in appropriate chapter</li>
                <li>View your organized book instantly</li>
              </ol>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
