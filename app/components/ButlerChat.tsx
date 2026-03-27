'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { experimental_useFormStatus as useFormStatus } from 'react-dom';
import { Copy, Check, Send } from 'lucide-react';

interface ButlerChatProps {
    projectId: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ButlerChat({ projectId }: ButlerChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { pending } = useFormStatus();

    // 1. Восстановление истории из localStorage при загрузке компонента
    useEffect(() => {
        const storageKey = `butler_chat_${projectId}`;
        const savedChat = localStorage.getItem(storageKey);
        if (savedChat) {
            try {
                setMessages(JSON.parse(savedChat));
            } catch (error) {
                console.error('Ошибка при чтении истории чата из памяти:', error);
            }
        }
    }, [projectId]);

    // 2. Сохранение истории в localStorage при каждом новом сообщении
    useEffect(() => {
        const storageKey = `butler_chat_${projectId}`;
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, projectId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // 3. Функция для копирования ответа Дворецкого в буфер обмена
    const handleCopy = async (content: string, index: number) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIndex(index);
            // Возвращаем иконку обратно через 2 секунды
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Не удалось скопировать текст: ', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/butler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId, message: input, history: messages }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botMessage: Message = { role: 'assistant', content: data.response };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: 'Извините, произошла ошибка при обработке вашего запроса. Возможно, пропала связь с сервером.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Блокируем форму, если идет отправка (через useFormStatus или наш локальный стейт)
    const isSubmitDisabled = pending || isLoading;

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">
                            Задайте мне вопрос о проекте, и я постараюсь помочь.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[85%] p-4 rounded-xl ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-700 text-gray-100 rounded-bl-none shadow-md'
                                }`}
                            >
                                <ReactMarkdown className="markdown-content prose prose-invert max-w-none">
                                    {msg.content}
                                </ReactMarkdown>
                                
                                {/* Кнопка Копировать (только для ответов Дворецкого) */}
                                {msg.role === 'assistant' && (
                                    <div className="mt-3 pt-3 border-t border-gray-600 flex justify-end">
                                        <button
                                            onClick={() => handleCopy(msg.content, index)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-600 text-gray-300 rounded transition-colors text-xs border border-gray-600 focus:outline-none"
                                        >
                                            {copiedIndex === index ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                                    <span className="text-green-400 font-medium tracking-wide">Скопировано</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span className="tracking-wide">Копировать</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Спросите что-нибудь..."
                    className="flex-1 p-3 rounded-l-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    disabled={isSubmitDisabled}
                />
                <button
                    type="submit"
                    className={`p-3 rounded-r-lg transition-colors duration-200 flex items-center justify-center ${
                        isSubmitDisabled 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gold-500 text-gray-900 hover:bg-gold-600'
                    }`}
                    disabled={isSubmitDisabled}
                >
                    {isSubmitDisabled ? (
                        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-400 h-6 w-6 animate-spin border-t-blue-500"></div>
                    ) : (
                        <Send className="w-5 h-5 text-current" />
                    )}
                </button>
            </form>
        </div>
    );
}
