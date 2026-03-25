'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ButlerChat({ projectId, hasFileTree }: { projectId: string, hasFileTree: boolean }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: hasFileTree 
        ? 'Синьор, я изучил структуру файлов этого проекта. Готов выдавать прямые ссылки на код. Что ищем?' 
        : 'Синьор, у меня пока нет карты файлов этого проекта. Нажмите кнопку "Обновить" в Техпаспорте, чтобы я просканировал кладовку.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Этот блок автоматически обновляет чат, когда сканирование (Обновить) завершается
  useEffect(() => {
    if (hasFileTree && messages.length === 1 && messages[0].content.includes('пока нет карты')) {
      setMessages([{
        role: 'assistant',
        content: 'Синьор, сканирование завершено! Я вижу все файлы. Жду ваших указаний.'
      }]);
    }
  }, [hasFileTree, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/butler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: userMessage,
          history: messages.slice(1)
        })
      });

      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Простите, синьор, произошла ошибка связи с сервером.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Критическая ошибка канала связи.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-full bg-[#0a0a0a] border border-gold/20 rounded-2xl overflow-hidden relative">
      <div className="p-4 border-b border-gold/10 bg-[#111] flex items-center gap-3 shrink-0">
        <div className="p-2 bg-gold/10 rounded-full">
          <Bot className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="font-medium text-gold-light">Дворецкий</h3>
          <p className="text-xs text-gray-500 font-light">Анализатор архитектуры</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                <Bot className="w-4 h-4 text-gold" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-light leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#1a150b] border border-gold/30 text-[#e8d4a6] rounded-tr-none' 
                : 'bg-[#111] border border-gray-800 text-gray-300 rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div className="markdown-container prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({node, ...props}) => <code className="bg-black text-gold/80 px-1 py-0.5 rounded text-xs font-mono border border-gold/10" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-black p-3 rounded-lg border border-gray-800 text-gray-300 overflow-x-auto text-xs my-2" {...props} />,
                      a: ({node, ...props}) => <a className="text-gold hover:text-gold-light underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                <Bot className="w-4 h-4 text-gold" />
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-2xl rounded-tl-none p-4 flex items-center">
                <Loader2 className="w-4 h-4 text-gold animate-spin" />
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#111] border-t border-gold/10 shrink-0">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Что ищем, синьор?..." 
            className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-gold/50 rounded-full pl-5 pr-12 py-3 outline-none text-gray-200 text-sm font-light transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-gold hover:text-gold-light disabled:opacity-30 transition-colors bg-[#111] rounded-full"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
