'use client';

import { useState } from 'react';

export interface QuizOption {
  label: string;
  map_to: string;
  image?: string;
}

export interface QuizQuestionProps {
  id: string;
  label: string;
  type: 'multi_image_select' | 'toggle' | 'boolean' | 'slider' | 'single_select' | 'range_slider' | 'checkbox_list';
  options?: QuizOption[];
  min?: number;
  max?: number;
  value: any;
  onChange: (value: any) => void;
}

export default function QuizQuestion({
  id: _id,
  label,
  type,
  options = [],
  min = 0,
  max = 100,
  value,
  onChange,
}: QuizQuestionProps) {
  const [sliderValue, setSliderValue] = useState(value || min);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  // Multi-image select (q1)
  if (type === 'multi_image_select') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = value === option.map_to;
            return (
              <button
                key={option.label}
                onClick={() => onChange(option.map_to)}
                className={`group relative overflow-hidden rounded-2xl border-3 p-6 transition-all duration-300 ${
                  isSelected
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10 shadow-xl scale-105'
                    : 'border-border/50 bg-white hover:border-[hsl(var(--brand))]/50 hover:shadow-lg hover:scale-102'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white'
                      : 'bg-[hsl(var(--muted))] text-muted-foreground group-hover:bg-[hsl(var(--brand))]/20'
                  }`}>
                    {option.map_to === 'Compound' && (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )}
                    {option.map_to === 'Stereo' && (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {option.map_to === 'Inverted' && (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    )}
                    {option.map_to === 'Digital' && (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold transition-colors ${
                      isSelected ? 'text-[hsl(var(--brand))]' : 'text-foreground'
                    }`}>
                      {option.label}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[hsl(var(--brand))] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Toggle (q2)
  if (type === 'toggle') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="flex justify-center gap-4">
          {options.map((option) => {
            const isSelected = value === option.map_to;
            return (
              <button
                key={option.label}
                onClick={() => onChange(option.map_to)}
                className={`relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white shadow-xl scale-110'
                    : 'bg-white border-2 border-border/50 text-foreground hover:border-[hsl(var(--brand))]/50 hover:scale-105'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Boolean (q3)
  if (type === 'boolean') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onChange(true)}
            className={`relative px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              value === true
                ? 'bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white shadow-xl scale-110'
                : 'bg-white border-2 border-border/50 text-foreground hover:border-[hsl(var(--brand))]/50 hover:scale-105'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChange(false)}
            className={`relative px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              value === false
                ? 'bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white shadow-xl scale-110'
                : 'bg-white border-2 border-border/50 text-foreground hover:border-[hsl(var(--brand))]/50 hover:scale-105'
            }`}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  // Slider (q4)
  if (type === 'slider') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white px-8 py-4 rounded-2xl shadow-xl">
              <span className="text-4xl font-bold">{sliderValue}x</span>
            </div>
          </div>
          <div className="relative pt-8">
            <input
              type="range"
              min={min}
              max={max}
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-3 bg-[hsl(var(--muted))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[hsl(var(--brand))] [&::-webkit-slider-thumb]:to-[hsl(var(--brand-dark))] [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-[hsl(var(--brand))] [&::-moz-range-thumb]:to-[hsl(var(--brand-dark))] [&::-moz-range-thumb]:shadow-xl [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-0"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{min}x</span>
              <span>{max}x</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single select (q5)
  if (type === 'single_select') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {options.map((option) => {
            const isSelected = value === option.map_to;
            return (
              <button
                key={option.label}
                onClick={() => onChange(option.map_to)}
                className={`group relative overflow-hidden rounded-2xl border-3 p-6 transition-all duration-300 ${
                  isSelected
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10 shadow-xl scale-105'
                    : 'border-border/50 bg-white hover:border-[hsl(var(--brand))]/50 hover:shadow-lg hover:scale-102'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white'
                      : 'bg-[hsl(var(--muted))] text-muted-foreground group-hover:bg-[hsl(var(--brand))]/20'
                  }`}>
                    {option.map_to === 'Education' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    {option.map_to === 'Clinical' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {option.map_to === 'Research' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                  <p className={`font-semibold text-center transition-colors ${
                    isSelected ? 'text-[hsl(var(--brand))]' : 'text-foreground'
                  }`}>
                    {option.label}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[hsl(var(--brand))] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Range slider (q6)
  if (type === 'range_slider') {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white px-8 py-4 rounded-2xl shadow-xl">
              <span className="text-sm font-semibold">Up to</span>
              <span className="text-4xl font-bold">${sliderValue}</span>
            </div>
          </div>
          <div className="relative pt-8">
            <input
              type="range"
              min={min}
              max={max}
              step={50}
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-3 bg-[hsl(var(--muted))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[hsl(var(--brand))] [&::-webkit-slider-thumb]:to-[hsl(var(--brand-dark))] [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-[hsl(var(--brand))] [&::-moz-range-thumb]:to-[hsl(var(--brand-dark))] [&::-moz-range-thumb]:shadow-xl [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-0"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${min}</span>
              <span>${max}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkbox list (q7)
  if (type === 'checkbox_list') {
    const selectedItems = value || [];

    const toggleItem = (item: string) => {
      if (selectedItems.includes(item)) {
        onChange(selectedItems.filter((i: string) => i !== item));
      } else {
        onChange([...selectedItems, item]);
      }
    };

    return (
      <div className="space-y-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center">{label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto">
          {options.map((option) => {
            const optionLabel = typeof option === 'string' ? option : option.label;
            const isSelected = selectedItems.includes(optionLabel);
            return (
              <button
                key={optionLabel}
                onClick={() => toggleItem(optionLabel)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10'
                    : 'border-border/50 bg-white hover:border-[hsl(var(--brand))]/50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-[hsl(var(--brand))] border-[hsl(var(--brand))]'
                    : 'border-border/50'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${isSelected ? 'text-[hsl(var(--brand))]' : 'text-foreground'}`}>
                  {optionLabel}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {selectedItems.length === 0 ? 'Select any that apply' : `${selectedItems.length} selected`}
        </p>
      </div>
    );
  }

  return null;
}
