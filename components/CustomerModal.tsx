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
  onSave: (
    customer: Partial<Customer> & {
      initialPurchaseAmount?: number;
      purchaseDescription?: string;
    }
  ) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [newCustomer, setNewCustomer] = useState<
    Partial<Customer> & {
      initialPurchaseAmount?: number;
      purchaseDescription?: string;
    }
  >({});
  const [error, setError] = useState('');

  // إعادة ضبط البيانات عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      setNewCustomer({
        name: '',
        phone: '',
        governorate: '',
        streetAddress: '',
        gender: 'male',
        initialPurchaseAmount: 0,
        purchaseDescription: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    // التحقق من الحقول الإلزامية
    if (
      !newCustomer.name?.trim() ||
      !newCustomer.phone?.trim() ||
      !newCustomer.governorate?.trim()
    ) {
      setError('الرجاء تعبئة الحقول الإلزامية: الاسم، الهاتف، والمحافظة.');
      return;
    }

    const cleanedPhone = newCustomer.phone.replace(/\s/g, '');
    if (!/^01[0-9]{9}$/.test(cleanedPhone)) {
      setError('رقم الهاتف يجب أن يكون بصيغة صحيحة (مثال: 01012345678)');
      return;
    }

    // إرسال البيانات
    onSave({
      ...newCustomer,
      phone: cleanedPhone,
      initialPurchaseAmount: newCustomer.initialPurchaseAmount || 0,
      purchaseDescription: newCustomer.purchaseDescription || '',
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
        className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:text-gray-300"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          تسجيل عميل جديد
        </h2>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-right">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 text-right">
              اسم العميل <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newCustomer.name || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              className="w-full p-3 bg-gray-800 border-2 border-purple-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 text-right">
              رقم الهاتف <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={newCustomer.phone || ''}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 text-right">
              المحافظة <span className="text-red-400">*</span>
            </label>
            <select
              value={newCustomer.governorate || ''}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  governorate: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
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
            <label className="block text-sm text-gray-300 mb-2 text-right">
              العنوان (اختياري)
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
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 text-right">
              إجمالي الشراء الأول (اختياري)
            </label>
            <input
              type="number"
              min="0"
              value={newCustomer.initialPurchaseAmount || ''}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  initialPurchaseAmount:
                    e.target.value === '' ? 0 : Number(e.target.value),
                })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 text-right">
              وصف الشراء الأول (اختياري)
            </label>
            <input
              type="text"
              value={newCustomer.purchaseDescription || ''}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  purchaseDescription: e.target.value,
                })
              }
              className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-bold text-lg"
        >
          حفظ العميل
        </button>
      </div>
    </div>
  );
};

export default CustomerModal;
