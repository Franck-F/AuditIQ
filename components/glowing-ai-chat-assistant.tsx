"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Link, Code, Mic, Send, Info, Bot, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessage(prev => prev + `\n[Fichier joint: ${file.name}]`);
      e.target.value = '';
    }
  };

  const handleLinkClick = () => {
    const url = prompt("Entrez l'URL du lien :");
    if (url) {
      setMessage(prev => prev + ` [Lien](${url})`);
    }
  };

  const handleCodeClick = () => {
    setMessage(prev => prev + "\n```\n// Votre code ici\n```\n");
  };

  const handleVoiceClick = () => {
    if ('webkitSpeechRecognition' in window) {
      if (isRecording) {
        setIsRecording(false);
        return;
      }

      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => (prev + ' ' + transcript).trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur (essayez Chrome).");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setCharCount(0);
      setIsLoading(true);

      // Create placeholder for AI message
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '', // Start empty
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversation_history: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp.toISOString()
            }))
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
          throw new Error(errorData.detail || 'Erreur lors de la communication avec l\'API');
        }

        if (!response.body) throw new Error('ReadableStream not supported');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        setIsLoading(false); // Stop loading spinner as soon as stream starts

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'sources') {
                if (data.sources && data.sources.length > 0) {
                  console.log('Sources:', data.sources);
                  // TODO: Update sources state if needed
                }
              } else if (data.type === 'chunk') {
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: msg.content + data.text }
                    : msg
                ));
              } else if (data.type === 'error') {
                console.error('Stream error:', data.error);
              }
            } catch (e) {
              console.error('Error parsing stream line:', e);
            }
          }
        }
        
      } catch (error) {
        console.error('Erreur:', error);
        // Remove the empty placeholder if it failed completely or add error message
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId && msg.content === ''
            ? { ...msg, content: "Désolé, une erreur s'est produite. Veuillez réessayer." }
            : msg
        ));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        // Check if the click is not on the floating button
        if (!event.target.closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Logo */}
      <button 
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
          isChatOpen ? 'rotate-90' : 'rotate-0'
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, oklch(0.58 0.24 340 / 0.9) 0%, oklch(0.75 0.15 195 / 0.8) 100%)',
          boxShadow: '0 0 20px oklch(0.58 0.24 340 / 0.7), 0 0 40px oklch(0.65 0.26 340 / 0.5), 0 0 60px oklch(0.58 0.24 340 / 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* 3D effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>
        
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        
        {/* AI Icon */}
        <div className="relative z-10">
        { isChatOpen ? <X /> :  <Bot className="w-8 h-8 text-white" />}
        </div>
        
        {/* Glowing animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary"></div>
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div 
          ref={chatRef}
          className="fixed inset-x-4 bottom-24 md:absolute md:inset-auto md:bottom-20 md:right-0 w-auto md:w-[380px] lg:w-[450px] max-w-full transition-all duration-300 origin-bottom md:origin-bottom-right z-50"
          style={{
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          <div className="relative flex flex-col rounded-3xl bg-card/95 border border-border shadow-2xl backdrop-blur-3xl overflow-hidden max-h-[70vh] md:max-h-[600px]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-medium text-muted-foreground">Assistant Audit-IQ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-2xl">
                  IA Audit
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl">
                  Pro
                </span>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Conversation History */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" data-lenis-prevent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Posez-moi une question sur vos audits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >


                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-primary/20 text-foreground border border-primary/30'
                              : 'bg-muted text-foreground border border-border'
                          }`}
                        >
                          <div className="text-sm leading-relaxed markdown-content">
                            {msg.role === 'user' ? (
                              <p>{msg.content}</p>
                            ) : (
                              <ReactMarkdown 

                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  a: ({node, ...props}) => <a className="text-primary underline hover:text-primary/80 font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2 text-muted-foreground" {...props} />,
                                  code: ({node, inline, className, children, ...props}: any) => {
                                    return inline ? (
                                      <code className="bg-black/20 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                                    ) : (
                                      <code className="block bg-black/20 dark:bg-white/10 p-2 rounded text-xs font-mono mb-2 overflow-x-auto" {...props}>{children}</code>
                                    )
                                  },
                                  table: ({node, ...props}) => <div className="overflow-x-auto mb-2"><table className="min-w-full divide-y divide-border" {...props} /></div>,
                                  th: ({node, ...props}) => <th className="px-2 py-1 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-black/10 dark:bg-white/5" {...props} />,
                                  td: ({node, ...props}) => <td className="px-2 py-1 text-sm border-t border-border" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground border border-border rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Actions rapides :</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setMessage("Explique-moi la métrique Demographic Parity")}
                  className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
                >
                  📊 Expliquer une métrique
                </button>
                <button 
                  onClick={() => setMessage("Comment interpréter mes résultats d'audit ?")}
                  className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
                >
                  🔍 Interpréter résultats
                </button>
                <button 
                  onClick={() => setMessage("Quelles sont les recommandations de mitigation pour mon audit ?")}
                  className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
                >
                  ⚡ Recommandations
                </button>
                <button 
                  onClick={() => setMessage("Comment être conforme à l'AI Act européen ?")}
                  className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
                >
                  🛡️ AI Act
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="relative overflow-hidden">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="w-full px-6 py-4 bg-transparent border-none outline-none resize-none text-base font-normal leading-relaxed min-h-[120px] text-zinc-100 placeholder-zinc-500 scrollbar-none"
                placeholder="Posez une question sur vos audits, les métriques de fairness, la conformité AI Act..."
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-zinc-800/5 to-transparent pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(39, 39, 42, 0.05), transparent)' }}
              ></div>
            </div>

            {/* Controls Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Attachment Group */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    {/* File Upload */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    <button 
                      onClick={handleFileUpload}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 hover:scale-105 hover:-rotate-3 transform"
                    >
                      <Paperclip className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
                        Joindre fichier
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900/95"></div>
                      </div>
                    </button>

                    {/* Link */}
                    <button 
                      onClick={handleLinkClick}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-105 hover:rotate-6 transform"
                    >
                      <Link className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
                        Lien web
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900/95"></div>
                      </div>
                    </button>

                    {/* Code */}
                    <button 
                      onClick={handleCodeClick}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-green-400 hover:bg-zinc-800/80 hover:scale-105 hover:rotate-3 transform"
                    >
                      <Code className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
                        Code source
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900/95"></div>
                      </div>
                    </button>


                  </div>

                  {/* Voice Button */}
                  <button 
                    onClick={handleVoiceClick}
                    className={`group relative p-2.5 bg-transparent border border-zinc-700/30 rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 hover:scale-110 hover:rotate-2 transform hover:border-red-500/30 ${isRecording ? 'text-red-500 border-red-500/50 animate-pulse' : ''}`}
                  >
                    <Mic className={`w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3 ${isRecording ? 'animate-bounce' : ''}`} />
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-900/95 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-700/50 backdrop-blur-sm">
                      {isRecording ? 'Écoute en cours...' : 'Saisie vocale'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900/95"></div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Character Counter */}
                  <div className="text-xs font-medium text-zinc-500">
                    <span>{charCount}</span>/<span className="text-zinc-400">{maxChars}</span>
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={handleSend}
                    className="group relative p-3 bg-gradient-to-r from-red-600 to-red-500 border-none rounded-xl cursor-pointer transition-all duration-300 text-white shadow-lg hover:from-red-500 hover:to-red-400 hover:scale-110 hover:shadow-red-500/30 hover:shadow-xl active:scale-95 transform hover:-rotate-2 hover:animate-pulse"
                    style={{
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(239, 68, 68, 0.4)',
                      animation: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.animation = 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.animation = 'none';
                    }}
                  >
                    <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-12 group-hover:scale-110" />
                    
                    {/* Animated background glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg transform scale-110"></div>
                    
                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-xs text-zinc-500 gap-6">
                <div className="flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  <span>
                    Appuyez sur <kbd className="hidden md:inline px-1.5 py-1 bg-muted border border-border rounded text-muted-foreground font-mono text-xs shadow-sm">Maj + Entrée</kbd><span className="md:hidden">Entrée</span> pour envoyer
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Tous les systèmes opérationnels</span>
                </div>
              </div>
            </div>

            {/* Floating Overlay */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent, rgba(147, 51, 234, 0.05))' 
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
        
        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.9), 0 0 50px rgba(124, 58, 237, 0.7), 0 0 70px rgba(109, 40, 217, 0.5);
        }
      `}</style>
    </div>
  );
};

export {FloatingAiAssistant};