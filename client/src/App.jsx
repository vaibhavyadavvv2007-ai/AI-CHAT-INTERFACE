import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)

  const handlechange = (e) => {
    setInput(e.target.value)
  }

  const handleclick = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const trimmedMessage = input.trim()
    if (!trimmedMessage) {
      setIsLoading(false)
      return
    }

    const userMessage = { role: 'user', content: trimmedMessage }
    const assistantMessage = { role: 'assistant', content: '' }
    const nextChatMessages = [...chatMessages, userMessage, assistantMessage]
    const historyChatId = activeChatId ?? Date.now()

    setChatMessages(nextChatMessages)
    setHasStartedChat(true)
    setInput('')
    let assistantContent = ''
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        assistantContent += decoder.decode(value, { stream: true })
        setChatMessages((prevMessages) => {
          const nextMessages = [...prevMessages]
          const assistantIndex = nextMessages.length - 1
          if (assistantIndex >= 0 && nextMessages[assistantIndex].role === 'assistant') {
            nextMessages[assistantIndex] = {
              ...nextMessages[assistantIndex],
              content: assistantContent,
            }
          }
          return nextMessages
        })
      }

      assistantContent += decoder.decode()
      setChatMessages((prevMessages) => {
        const nextMessages = [...prevMessages]
        const assistantIndex = nextMessages.length - 1
        if (assistantIndex >= 0 && nextMessages[assistantIndex].role === 'assistant') {
          nextMessages[assistantIndex] = {
            ...nextMessages[assistantIndex],
            content: assistantContent,
          }
        }
        return nextMessages
      })

      setChatHistory((prevHistory) => {
        const completedMessages = [...chatMessages, userMessage, { role: 'assistant', content: assistantContent }]
        const existingChatIndex = prevHistory.findIndex((chat) => chat.id === historyChatId)

        if (existingChatIndex === -1) {
          return [
            {
              id: historyChatId,
              title: trimmedMessage,
              messages: completedMessages,
            },
            ...prevHistory,
          ]
        }

        const updatedHistory = [...prevHistory]
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          messages: completedMessages,
        }
        return updatedHistory
      })

      if (activeChatId == null) {
        setActiveChatId(historyChatId)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setChatMessages((prevMessages) => {
        const nextMessages = [...prevMessages]
        const assistantIndex = nextMessages.length - 1
        if (assistantIndex >= 0 && nextMessages[assistantIndex].role === 'assistant' && !nextMessages[assistantIndex].content) {
          nextMessages.pop()
        }
        return nextMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-[#1a1a2e] text-white">
      <div className="flex h-full w-full">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#11111f] p-4 md:flex">
          <button
            className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
            onClick={() => {
              setHasStartedChat(false)
              setChatMessages([])
              setInput('')
              setActiveChatId(null)
            }}
            type="button"
          >
            + New Chat
          </button>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1 scroll-smooth">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                  chat.id === activeChatId
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => {
                  setChatMessages(chat.messages)
                  setHasStartedChat(true)
                  setInput('')
                  setActiveChatId(chat.id)
                }}
                type="button"
              >
                {chat.title}
              </button>
            ))}
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col bg-[#1a1a2e]">
          <button
            className="absolute left-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-[#11111f] text-white shadow-lg transition hover:bg-white/10 md:hidden"
            onClick={() => setIsSidebarOpen((open) => !open)}
            type="button"
            aria-label="Open sidebar"
            aria-expanded={isSidebarOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 6H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 18H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {isSidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}

          <aside
            className={`fixed left-0 top-0 z-40 h-full w-72 border-r border-white/10 bg-[#11111f] p-4 shadow-2xl transition-transform duration-200 md:hidden ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <button
              className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
              onClick={() => {
                setHasStartedChat(false)
                setChatMessages([])
                setInput('')
                setActiveChatId(null)
                setIsSidebarOpen(false)
              }}
              type="button"
            >
              + New Chat
            </button>

            <div className="flex h-[calc(100%-4rem)] flex-col space-y-2 overflow-y-auto pr-1 scroll-smooth">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                    chat.id === activeChatId
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => {
                    setChatMessages(chat.messages)
                    setHasStartedChat(true)
                    setInput('')
                    setActiveChatId(chat.id)
                    setIsSidebarOpen(false)
                  }}
                  type="button"
                >
                  {chat.title}
                </button>
              ))}
            </div>
          </aside>

          <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 pb-28 pt-16 md:px-8 md:pt-8">
            {!hasStartedChat ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Ask our AI anything
                </h1>
                <p className="mt-3 max-w-xl text-sm text-gray-400 md:text-base">
                  Start a chat, keep the thread in the sidebar, and jump back into any conversation.
                </p>

                <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
                    onClick={() => setInput('What is Claude AI?')}
                    type="button"
                  >
                    What is Claude AI?
                  </button>
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
                    onClick={() => setInput('Tell me something about the AI market.')}
                    type="button"
                  >
                    Tell me something about the AI market.
                  </button>
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
                    onClick={() => setInput('Describe about RAG systems.')}
                    type="button"
                  >
                    Describe about RAG systems.
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="mx-auto flex max-w-3xl flex-col gap-4 py-6">
                  {chatMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg md:max-w-[70%] ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                            : 'rounded-bl-md border border-white/10 bg-[#2b2b3d] text-gray-100'
                        }`}
                      >
                        {message.role === 'assistant' && isLoading && !message.content ? (
                          <span className="inline-flex items-center gap-2" aria-hidden="true">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-gray-500 [animation-delay:300ms]" />
                          </span>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#1a1a2e]/95 px-4 py-4 backdrop-blur md:left-72"
            aria-label="Ask me anything about your projects"
            onSubmit={handleclick}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-[#24243a] p-2 shadow-2xl">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500"
                type="text"
                name="message"
                value={input}
                onChange={handlechange}
                placeholder="Ask me anything about your projects"
                aria-label="Ask me anything about your projects"
              />
              <button
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 active:scale-95"
                type="submit"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path d="M2.5 11.5L21 2.5L14.5 21L11 13.5L2.5 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M11 13.5L21 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default App
