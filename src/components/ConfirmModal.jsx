import React from 'react';

function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  danger = true
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-gray-800 border border-gray-700/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl flex flex-col transition-all transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl text-rose-400 shrink-0">
            ⚠️
          </div>
          <h3 className="text-xl font-extrabold text-white leading-snug">
            {title}
          </h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex justify-end items-center gap-3 mt-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold text-sm transition shadow"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm transition shadow-lg flex items-center gap-2 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
