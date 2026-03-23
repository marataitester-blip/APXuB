'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticateAction } from '../actions';
import { Lock } from 'lucide-react';

// Компонент «Стелс-кнопки» (Черная звезда в космосе)
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <div className="relative group w-full">
      {/* Гравитационное искажение (еле заметная тень вокруг), 
         которое проявляется при наведении.
      */}
      <div className="absolute -inset-1 rounded-2xl bg-gold/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 group-active:duration-300"></div>
      
      <button
        type="submit"
        disabled={pending}
        className={`
          relative w-full h-14 rounded-2xl font-medium text-lg
          ${/* Кнопка абсолютно черная, без контуров */''}
          bg-black 
          ${/* Тусклый, переливчатый текст */''}
          text-gold-light/30 hover:text-gold-light/60 
          transition-all duration-1000 
          active:scale-[0.98] active:duration-100
          disabled:opacity-20
          group
        `}
      >
        <span className="relative z-10 tracking-widest">
          {pending ? '...' : 'ОТКРЫТЬ'}
        </span>
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, action] = useFormState(authenticateAction, undefined);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setPin(value);
  };

  useEffect(() => {
    // Автоматический фокус для моментального ввода
    inputRef.current?.focus();
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 antialiased selection:bg-gold/10">
      <div className="w-full max-w-sm flex flex-col items-center gap-12">
        
        {/* Тусклая, "призрачная" надпись */}
        <header className="text-center opacity-10 flex flex-col items-center gap-2">
          <Lock className="w-8 h-8 text-gold/60" />
          <h1 className="text-5xl font-light text-gold tracking-[0.2em] font-mono">APXuB</h1>
          <p className="text-sm text-gold-light/70 font-light mt-1">Доступ ограничен</p>
        </header>

        <form action={action} className="w-full flex flex-col items-center gap-12">
          
          {/* Визуальные «дырочки» */}
          <div 
            className="flex gap-4 cursor-text" 
            onClick={() => inputRef.current?.focus()}
            aria-hidden="true"
          >
            {[...Array(6)].map((_, index) => {
              const isFilled = index < pin.length;
              return (
                <div 
                  key={index} 
                  className={`
                    w-12 h-16 rounded-xl border flex items-center justify-center 
                    transition-all duration-300 
                    ${isFilled ? 'border-gold bg-gold/5' : 'border-gold/10 bg-[#111]'}
                    ${/* Пустые ячейки почти сливаются с фоном */''}
                    ${!isFilled ? 'border-none bg-[#050505]' : ''}
                  `}
                >
                  {isFilled && (
                    <div className="w-3 h-3 bg-gold rounded-full animate-popIn"></div>
                  )}
                </div>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="tel"
            name="pin"
            value={pin}
            onChange={handlePinChange}
            pattern="[0-9]*"
            inputMode="numeric"
            className="absolute opacity-0 w-0 h-0"
            maxLength={6}
            required
            autoComplete="one-time-code"
          />

          <div className="w-full space-y-4">
            <SubmitButton />
            
            {state?.error && (
              <p className="text-center text-red-500/50 text-sm font-light bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                {state.error}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
