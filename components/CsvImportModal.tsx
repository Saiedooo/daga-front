import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { CloseIcon } from './icons';

const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحيرة',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'الشرقية',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'الفيوم',
  'بني سويف',
  'قليوبية',
  'دمياط',
];

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  customers: Customer[];
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
}) => {
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const customerNumbers = customers.map((c) => {
        const match = c.id.match(/^CUST-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxId =
        customerNumbers.length > 0 ? Math.max(...customerNumbers) : 0;
      const nextId = `CUST-${(maxId + 1).toString().padStart(4, '0')}`;

      setNewCustomer({
        id: nextId,
        name: '',
        phone: '',
        governorate: '',
        streetAddress: '',
        gender: 'male',
      });
      setError('');
    }
  }, [isOpen, customers]);

  const handleSave = () => {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.governorate) {
      setError('الرجاء تعبئة الحقول الإلزامية: الاسم، الهاتف، والمحافظة.');
      return;
    }

    const cleanedPhone = newCustomer.phone.replace(/\s/g, '');
    if (!/^01[0-9]{9}$/.test(cleanedPhone)) {
      setError('رقم الهاتف يجب أن يكون بصيغة صحيحة (مثال: 01012345678)');
      return;
    }

    if (customers.some((c) => c.id === newCustomer.id)) {
      setError('كود العميل مستخدم بالفعل.');
      return;
    }

    onSave({
      ...newCustomer,
      phone: cleanedPhone,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:text-gray-300"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-white text-center">
            تسجيل عميل جديد
          </h2>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-right">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              كود العميل{' '}
              <span className="text-gray-500 text-xs">(يمكن تعديله)</span>
            </label>
            <input
              type="text"
              value={newCustomer.id || ''}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  id: e.target.value.toUpperCase(),
                })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              اسم العميل بالكامل <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newCustomer.name || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              placeholder="محمد أحمد علي"
              className="w-full p-3 bg-gray-800 border-2 border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              رقم الهاتف <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={newCustomer.phone || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
              placeholder="01012345678"
              className="w-full p-3 pr-12 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              المحافظة <span className="text-red-400">*</span>
            </label>
            <select
              value={newCustomer.governorate || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, governorate: e.target.value })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600 appearance-none"
            >
              <option value="">اختر المحافظة</option>
              {EGYPTIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              الجنس
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setNewCustomer({ ...newCustomer, gender: 'male' })
                }
                className={`flex-1 p-3 rounded-lg font-medium ${
                  newCustomer.gender === 'male'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewCustomer({ ...newCustomer, gender: 'female' })
                }
                className={`flex-1 p-3 rounded-lg font-medium ${
                  newCustomer.gender === 'female'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                أنثى
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
              العنوان بالتفصيل (اختياري)
            </label>
            <textarea
              rows={3}
              value={newCustomer.streetAddress || ''}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  streetAddress: e.target.value,
                })
              }
              placeholder="الشارع، المنطقة، علامة مميزة..."
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
          >
            حفظ بيانات العميل
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
