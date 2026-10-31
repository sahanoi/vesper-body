'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface LuxurySelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  className?: string;
  placeholder?: string;
}

export function LuxurySelect({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Seçiniz...',
}: LuxurySelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
          open
            ? 'border-[var(--accent-primary)] bg-[var(--bg-elevated)] ring-2 ring-[var(--accent-primary)]/15'
            : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--accent-primary)]/60'
        }`}
      >
        <span className="truncate text-[var(--text-primary)] font-semibold">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${
            open ? 'rotate-180 text-[var(--accent-primary)]' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 min-w-[220px] mt-1.5 p-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl z-50 space-y-0.5 max-h-72 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-white font-semibold shadow-xs'
                    : 'text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

