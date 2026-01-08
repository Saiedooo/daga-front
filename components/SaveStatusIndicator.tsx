import React from 'react';
import { SyncIcon, CheckIcon, WarningIcon } from './icons';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
  const messages = {
    idle: { text: '', icon: null, color: '' },
    saving: { text: 'جاري الحفظ...', icon: <SyncIcon className="w-5 h-5 animate-spin" />, color: 'text-text-secondary' },
    saved: { text: 'تم الحفظ تلقائياً', icon: <CheckIcon className="w-5 h-5" />, color: 'text-accent' },
    error: { text: 'فشل الحفظ', icon: <WarningIcon className="w-5 h-5" />, color: 'text-danger' },
  };
  
  const current = messages[status];
  
  // Don't render anything if idle, to avoid taking up space.
  if (status === 'idle') return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-opacity duration-300 ${current.color}`}>
      {current.icon}
      <span>{current.text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
