'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors px-3 py-2 rounded-lg hover:bg-gold/10 border border-transparent hover:border-gold/30"
      title="Копировать текст паспорта"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Скопировано!' : 'Копировать'}
    </button>
  );
}
