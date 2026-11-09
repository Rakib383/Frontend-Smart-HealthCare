"use client"

import {
  queryRagAction,
} from "@/app/_actions/rag.action"
import { Button } from "@/components/ui/button"
import {
  Bot,
  LoaderCircle,
  MessageCircle,
  ShieldCheck,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { FormEvent, useEffect, useRef, useState } from "react"

type ChatMessage = {
  id: number
  role: "assistant" | "user"
  content: string
  sources?: string
}

const suggestedQueries = [
  "Neurologist in Dhaka",
  "Find a cardiologist",
  "How do I book an appointment?",
]

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hi! I’m your Healora assistant. Ask me about doctors, specialties, or using the platform.",
    },
  ])
  const nextMessageId = useRef(1)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      inputRef.current?.focus()
    }
  }, [isOpen, messages, isSending])

  useEffect(() => {
    const openAssistant = () => setIsOpen(true)
    window.addEventListener("healora:open-assistant", openAssistant)

    return () =>
      window.removeEventListener("healora:open-assistant", openAssistant)
  }, [])

  const appendMessage = (
    message: Omit<ChatMessage, "id">,
  ) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      { ...message, id: nextMessageId.current++ },
    ])
  }

  const submitQuery = async (value: string) => {
    const trimmedQuery = value.trim()
    if (!trimmedQuery || isSending) return

    appendMessage({ role: "user", content: trimmedQuery })
    setQuery("")
    setIsSending(true)

    try {
      const result = await queryRagAction(trimmedQuery)
      if (result.success) {
        appendMessage({
          role: "assistant",
          content: result.answer,
          sources: result.sources,
        })
      } else {
        appendMessage({ role: "assistant", content: result.error })
      }
    } catch (error) {
      console.error("AI assistant query failed:", error)
      appendMessage({
        role: "assistant",
        content: "I couldn’t reach the assistant. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitQuery(query)
  }

  return (
    <div className="fixed bottom-4 right-4 z-60 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          aria-label="AI Assistant chat"
          className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
        >
          <header className="flex items-center justify-between gap-3 bg-teal-800 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">AI Health Assistant</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-teal-100">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  Ready to help
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close AI assistant"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user"
                      ? "rounded-br-md bg-teal-700 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources ? (
                    <p className="mt-2 border-t border-slate-200/70 pt-1.5 text-xs text-slate-500">
                      match: {message.sources}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-slate-500">Try asking:</p>
                {suggestedQueries.map((suggestedQuery) => (
                  <button
                    key={suggestedQuery}
                    type="button"
                    disabled={isSending}
                    onClick={() => void submitQuery(suggestedQuery)}
                    className="block rounded-full border border-teal-100 bg-white px-3 py-1.5 text-left text-xs font-medium text-teal-800 transition-colors hover:bg-teal-50 disabled:opacity-50"
                  >
                    {suggestedQuery}
                  </button>
                ))}
              </div>
            )}

            {isSending && (
              <div className="flex justify-start" role="status">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label className="sr-only" htmlFor="ai-assistant-query">
                Ask the AI assistant
              </label>
              <input
                ref={inputRef}
                id="ai-assistant-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about doctors or care..."
                autoComplete="off"
                disabled={isSending}
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={!query.trim() || isSending}
                className="size-11 rounded-xl bg-teal-700 text-white hover:bg-teal-800"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <ShieldCheck className="size-3" aria-hidden="true" />
              AI responses may not replace professional medical advice.
            </p>
          </div>
        </section>
      ) : null}

      <Button
        type="button"
        size="lg"
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="size-14 rounded-full bg-teal-700 text-white shadow-lg shadow-teal-900/25 transition-transform hover:scale-105 hover:bg-teal-800 [&_svg:not([class*='size-'])]:size-6"
      >
        {isOpen ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <>
            <MessageCircle className="size-6" aria-hidden="true" />
            <Sparkles
              className="absolute right-2 top-2 size-3.5 text-teal-100"
              aria-hidden="true"
            />
          </>
        )}
      </Button>
    </div>
  )
}

export default AIAssistantWidget
