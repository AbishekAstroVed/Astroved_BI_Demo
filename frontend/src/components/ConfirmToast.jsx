import React from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Trash2 } from 'lucide-react';

/**
 * Renders a premium, glassmorphic toast-based confirmation dialog.
 * Adapts automatically to light/dark cosmic themes.
 * 
 * @param {string} message - The message details to display
 * @param {object} options - Optional overrides for title, texts, and callbacks
 */
export const confirmToast = (message, {
  title = 'Are you sure?',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'info' | 'warning'
  onConfirm = () => {},
  onCancel = () => {},
} = {}) => {
  return toast.custom((t) => (
    <div
      className={`
        ${t.visible ? 'animate-in fade-in zoom-in slide-in-from-top-4 duration-300' : 'animate-out fade-out zoom-out slide-out-to-top-4 duration-200'}
        max-w-md w-full relative shadow-2xl rounded-2xl p-6 flex gap-4 pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
      `}
    >
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        type === 'danger' 
          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
          : type === 'warning'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
      }`}>
        {type === 'danger' ? (
          <Trash2 className="w-5 h-5" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
      </div>

      <div className="relative z-10 flex-1 min-w-0 flex flex-col pt-1">
        <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className={`
              px-4 py-2 text-[13px] font-medium rounded-lg text-white transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900
              ${type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
                : type === 'warning'
                  ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: 'top-center',
  });
};

/**
 * Renders a premium, glassmorphic toast-based prompt/input dialog.
 */
export const promptToast = (message, {
  title = 'Input Required',
  confirmText = 'Submit',
  cancelText = 'Cancel',
  placeholder = '',
  defaultValue = '',
  onConfirm = () => {},
  onCancel = () => {},
} = {}) => {
  let inputValue = defaultValue;
  return toast.custom((t) => (
    <div
      className={`
        ${t.visible ? 'animate-in fade-in zoom-in slide-in-from-top-4 duration-300' : 'animate-out fade-out zoom-out slide-out-to-top-4 duration-200'}
        max-w-md w-full relative shadow-2xl rounded-2xl p-6 flex flex-col pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
      `}
    >
      <div className="relative z-10 flex flex-col min-w-0">
        <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed mb-4">
          {message}
        </p>
        
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={(e) => { inputValue = e.target.value; }}
          className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-[13px] text-slate-900 dark:text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          autoFocus
        />

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm(inputValue);
            }}
            className="px-4 py-2 text-[13px] font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: 'top-center',
  });
};

/**
 * Renders a premium, glassmorphic toast-based alert dialog (only one OK button).
 */
export const alertToast = (message, {
  title = 'System Alert',
  confirmText = 'Understood',
  type = 'info', // 'danger' | 'info' | 'warning'
  onClose = () => {},
} = {}) => {
  return toast.custom((t) => (
    <div
      className={`
        ${t.visible ? 'animate-in fade-in zoom-in slide-in-from-top-4 duration-300' : 'animate-out fade-out zoom-out slide-out-to-top-4 duration-200'}
        max-w-md w-full relative shadow-2xl rounded-2xl p-6 flex gap-4 pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
      `}
    >
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        type === 'danger' 
          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
          : type === 'warning'
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
      }`}>
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="relative z-10 flex-1 min-w-0 flex flex-col pt-1">
        <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 mt-6">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onClose) onClose();
            }}
            className={`
              px-4 py-2 text-[13px] font-medium rounded-lg text-white transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900
              ${type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
                : type === 'warning'
                  ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: 'top-center',
  });
};
