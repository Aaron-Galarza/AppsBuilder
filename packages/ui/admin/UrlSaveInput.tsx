'use client';

import { useState } from 'react';

export interface UrlSaveInputProps {
  initial?: string;
  onSave: (value: string) => void;
  placeholder?: string;
  cta: string;
}

/** Input de URL con botón de guardado (usado para banner y otros assets) */
export function UrlSaveInput({ initial = '', onSave, placeholder, cta }: UrlSaveInputProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-neutral-600"
      />
      <button
        onClick={() => value.trim() && onSave(value.trim())}
        className="shrink-0 rounded-md bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
      >
        {cta}
      </button>
    </div>
  );
}