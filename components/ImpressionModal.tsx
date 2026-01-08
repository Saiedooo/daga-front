import React, { useState } from 'react';
import { Customer, User, Branch, CustomerImpression } from '../types';
import SearchableSelect from './SearchableSelect';

interface ImpressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (impression: CustomerImpression) => Promise<void>;
  customer: Customer;
  currentUser: User;
  branches: Branch[];
}

const ImpressionModal: React.FC<ImpressionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer,
  currentUser,
  branches,
}) => {
  const [productQualityRating, setProductQualityRating] = useState<
    number | null
  >(null);
  const [productQualityNotes, setProductQualityNotes] = useState('');
  const [branchExperienceRating, setBranchExperienceRating] = useState<
    number | null
  >(null);
  const [branchExperienceNotes, setBranchExperienceNotes] = useState('');
  const [discoveryChannel, setDiscoveryChannel] = useState<string>('');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [branchId, setBranchId] = useState<string>(
    customer.primaryBranchId || ''
  );
  const [visitTime, setVisitTime] = useState<string>('');
  const [relatedInvoiceIds, setRelatedInvoiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (productQualityRating === null || branchExperienceRating === null) {
      setError('يرجى تقييم جودة المنتج وتجربة الفرع');
      return;
    }

    if (!branchId) {
      setError('يرجى اختيار الفرع');
      return;
    }

    setLoading(true);
    setError('');

    const impression: CustomerImpression = {
      customer: customer.id, // ← هنا الأهم: نبعت الـ custom id (String) زي "5001"
      productQualityRating,
      productQualityNotes: productQualityNotes.trim() || undefined,
      branchExperienceRating,
      branchExperienceNotes: branchExperienceNotes.trim() || undefined,
      discoveryChannel: discoveryChannel || undefined,
      isFirstVisit,
      relatedInvoiceIds:
        relatedInvoiceIds.length > 0 ? relatedInvoiceIds : undefined,
      branchId,
      visitTime: visitTime || undefined,
      recordedByUserId: currentUser.id,
      recordedByUserName: currentUser.name,
      date: new Date().toISOString(),
    };

    try {
      await onSave(impression);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الانطباع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">
          تسجيل انطباع العميل: {customer.name}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* تقييم جودة المنتج */}
          <div>
            <label className="block text-sm font-medium mb-2">
              تقييم جودة المنتج *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setProductQualityRating(star)}
                  className={`text-3xl ${
                    star <= (productQualityRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ملاحظات جودة المنتج (اختياري)
            </label>
            <textarea
              rows={3}
              value={productQualityNotes}
              onChange={(e) => setProductQualityNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="اكتب أي ملاحظات عن جودة المنتج..."
            />
          </div>

          {/* تقييم تجربة الفرع */}
          <div>
            <label className="block text-sm font-medium mb-2">
              تقييم تجربة الفرع *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setBranchExperienceRating(star)}
                  className={`text-3xl ${
                    star <= (branchExperienceRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ملاحظات تجربة الفرع (اختياري)
            </label>
            <textarea
              rows={3}
              value={branchExperienceNotes}
              onChange={(e) => setBranchExperienceNotes(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="اكتب أي ملاحظات عن التجربة في الفرع..."
            />
          </div>

          {/* قناة الاكتشاف */}
          <div>
            <label className="block text-sm font-medium mb-1">
              كيف عرف بالمحل؟
            </label>
            <select
              value={discoveryChannel}
              onChange={(e) => setDiscoveryChannel(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- اختر --</option>
              <option value="فيسبوك">فيسبوك</option>
              <option value="واتساب">واتساب</option>
              <option value="انستاجرام">انستاجرام</option>
              <option value="تيكتوك">تيكتوك</option>
              <option value="قريب من البيت">قريب من البيت</option>
              <option value="من الأصدقاء">من الأصدقاء</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {/* زيارة أولى؟ */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isFirstVisit}
                onChange={(e) => setIsFirstVisit(e.target.checked)}
              />
              <span>هل هذه الزيارة الأولى للعميل؟</span>
            </label>
          </div>

          {/* الفرع */}
          <div>
            <label className="block text-sm font-medium mb-1">الفرع *</label>
            <SearchableSelect
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              value={branchId}
              onChange={setBranchId}
              placeholder="اختر الفرع"
            />
          </div>

          {/* وقت الزيارة */}
          <div>
            <label className="block text-sm font-medium mb-1">
              وقت الزيارة
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- اختر --</option>
              <option value="الصبح">الصبح</option>
              <option value="الظهر">الظهر</option>
              <option value="بالليل">بالليل</option>
            </select>
          </div>

          {/* أرقام الفواتير المرتبطة (اختياري) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              أرقام الفواتير المرتبطة (اختياري، افصل بفواصل)
            </label>
            <input
              type="text"
              value={relatedInvoiceIds.join(', ')}
              onChange={(e) =>
                setRelatedInvoiceIds(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              className="w-full p-2 border rounded-md"
              placeholder="مثال: WELCOME-123, INV-456"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الانطباع'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImpressionModal;
