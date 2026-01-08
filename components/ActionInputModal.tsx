import React, { useState } from 'react';

interface ActionInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  title: string;
  prompt: string;
}

const ActionInputModal: React.FC<ActionInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  prompt,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-text-secondary mb-4">{prompt}</p>
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          autoFocus
        />
        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button
            onClick={() => {
              setInputText('');
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionInputModal;
