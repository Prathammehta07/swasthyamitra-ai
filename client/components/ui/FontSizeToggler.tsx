import React, { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

export function FontSizeToggler() {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('elderly-font-size');
    if (saved === 'large') {
      setFontSize('large');
      document.documentElement.classList.add('font-large');
    }
  }, []);

  const toggleFontSize = () => {
    if (fontSize === 'normal') {
      setFontSize('large');
      localStorage.setItem('elderly-font-size', 'large');
      document.documentElement.classList.add('font-large');
    } else {
      setFontSize('normal');
      localStorage.setItem('elderly-font-size', 'normal');
      document.documentElement.classList.remove('font-large');
    }
  };

  return (
    <button 
      onClick={toggleFontSize}
      className={`h-[38px] lg:h-[44px] rounded-[10px] lg:rounded-[12px] px-3 lg:px-[18px] border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 text-xs lg:text-sm font-semibold flex items-center gap-1.5 lg:gap-2 transition-all duration-300 shadow-2xs shrink-0 active:scale-[0.98] ${fontSize === 'large' ? 'ring-2 ring-blue-500' : ''}`}
      aria-label="Toggle Font Size"
      title="Toggle Font Size"
    >
      <Type className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>
        {fontSize === 'large' ? 'Normal Text' : 'Large Text'}
      </span>
    </button>
  );
}


