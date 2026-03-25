'use client';

import { useFormStatus } from 'react-dom';
import { Activity } from 'lucide-react';

export default function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`flex items-center gap-2 text-sm text-[#0a0a0a] px-4 py-2 rounded-lg font-medium transition-colors ${
        pending ? 'bg-gold/50 cursor-not-allowed opacity-70' : 'bg-gold hover:bg-gold-light'
      }`}
    >
      <Activity className={`w-4 h-4 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Анализ ИИ (ждите)...' : 'Обновить'}
    </button>
  );
}
