'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { useBookStore } from '@/store/bookStore'

export function TextInput() {
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const addPage = useBookStore((state) => state.addPage)
  const fetchBook = useBookStore((state) => state.fetchBook)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      })

      if (!response.ok) throw new Error('Failed to process text')

      const data = await response.json()
      addPage(data.page)
      setText('')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      
      // Refresh book data
      await fetchBook()
    } catch (error) {
      console.error('Error processing text:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[#e8e4d9] p-6 shadow-lg"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-700" />
        <h2 className="text-lg font-bold text-amber-900">Add Content</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here... The AI will intelligently place it in your book."
            className="min-h-[160px] w-full resize-none rounded-lg border-2 border-amber-800/20 bg-[#fffef0] p-4 font-serif text-gray-800 placeholder:text-gray-400 focus:border-amber-800 focus:outline-none"
            disabled={isProcessing}
          />
          <div className="absolute bottom-3 right-3 text-xs text-amber-700">
            {text.length} characters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-amber-700">
            {showSuccess && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-green-700"
              >
                <Sparkles className="h-4 w-4" />
                Added successfully!
              </motion.span>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isProcessing}
            className="flex items-center gap-2 rounded-lg bg-amber-800 px-6 py-3 font-semibold text-white transition-all hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Add to Book
              </>
            )}
          </button>
        </div>
      </form>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-lg bg-amber-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-800" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-800 [animation-delay:0.1s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-amber-800 [animation-delay:0.2s]" />
            </div>
            <p className="text-sm text-amber-800">
              AI is analyzing your text and determining the best placement...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
