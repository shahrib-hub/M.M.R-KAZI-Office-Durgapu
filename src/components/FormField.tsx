import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  isUnderlined?: boolean;
  onToggleUnderline?: (name: string) => void;
  isTextArea?: boolean;
  rows?: number;
  className?: string;
}

export default function FormField({
  label, name, value, onChange, type = "text", required = true,
  isUnderlined, onToggleUnderline, isTextArea = false, rows = 2, className = ""
}: FormFieldProps) {
  return (
    <div className={`${isTextArea ? "md:col-span-2" : ""} ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {onToggleUnderline && (
          <button
            type="button"
            onClick={() => onToggleUnderline(name)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-serif italic transition-colors ${isUnderlined ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 underline font-bold' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
            title="Toggle Underline"
          >
            U
          </button>
        )}
      </div>
      {isTextArea ? (
        <textarea 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
          rows={rows} 
          required={required} 
        />
      ) : (
        <input 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
          required={required} 
        />
      )}
    </div>
  );
}
