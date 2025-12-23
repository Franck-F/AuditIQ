'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatButtonProps {
  auditId?: number
}

export function AIChatButton({ auditId }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis l'assistant Audit-IQ. Je peux vous aider à interpréter vos résultats de fairness, expliquer les métriques ou suggérer des mitigations. Comment puis-je vous aider ?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          message: input,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          audit_id: auditId
        })
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let assistantContent = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.type === 'chunk' && data.text) {
              assistantContent += data.text
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1].content = assistantContent
                return newMessages
              })
            }
          } catch (e) {
            console.error('Error parsing NDJSON line:', e)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, j'ai rencontré une erreur lors de la génération de la réponse.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[400px] h-[600px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Assistant Fairness</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Expert AI IQ</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-muted/10">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center",
                      msg.role === 'user' ? "bg-primary" : "bg-muted border"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm prose prose-invert max-w-none shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-background border rounded-tl-none text-foreground"
                    )}>
                      <ReactMarkdown className="leading-relaxed">
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length-1].role === 'user' && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="p-2 rounded-full h-8 w-8 bg-muted border flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-background border rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Posez une question sur vos résultats..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="flex-1 bg-muted/30 focus-visible:ring-primary"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 shadow-lg">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform bg-primary"
          size="icon"
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
          </div>
        </Button>
      )}
    </div>
  )
}
