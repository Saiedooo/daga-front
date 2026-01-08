import React, { useState, useMemo } from 'react';
import { DailyInquiry, User } from '../types';
import { PlusIcon } from '../components/icons';

interface DailyInquiriesPageProps {
  inquiries: DailyInquiry[];
  currentUser: User;
  logUserAction: (details: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRefresh?: () => void;
}

const DailyInquiriesPage: React.FC<DailyInquiriesPageProps> = ({ inquiries, currentUser, logUserAction, showNotification, onRefresh }) => {
  const [newInquiry, setNewInquiry] = useState({ product: '', governorate: '' });
  const [error, setError] = useState('');

  const handleAddInquiry = async () => {
    if (!newInquiry.product && !newInquiry.governorate) {
      setError('يرجى تعبئة حقل المنتج أو المحافظة على الأقل.');
      return;
    }

    const inquiry: Partial<DailyInquiry> = {
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
      productInquiry: newInquiry.product,
      customerGovernorate: newInquiry.governorate,
    };

    try {
        await window.electron.dailyInquiry.create(inquiry);
        logUserAction(`تسجيل استفسار عن منتج: "${inquiry.productInquiry}" من محافظة ${inquiry.customerGovernorate}.`);
        showNotification('تم تسجيل الاستفسار بنجاح.', 'success');
        setNewInquiry({ product: '', governorate: '' });
        setError('');
        onRefresh?.();
    } catch(e: any) {
        showNotification(e.message || "فشل حفظ الاستفسار", 'error');
    }
  };
  
  const inquiriesByDate = useMemo(() => {
    return inquiries.reduce((acc: Record<string, DailyInquiry[]>, inquiry) => {
        const date = new Date(inquiry.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(inquiry);
        return acc;
    }, {});
  }, [inquiries]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">سجل الاستفسارات اليومية</h1>

      <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">تسجيل استفسار جديد</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">المنتج الذي تم السؤال عنه</label>
            <input
              type="text"
              placeholder="مثال: حذاء رياضي موديل X"
              value={newInquiry.product}
              onChange={(e) => setNewInquiry({ ...newInquiry, product: e.target.value })}
              className="w-full p-2 border border-border rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">محافظة العميل</label>
            <input
              type="text"
              placeholder="مثال: القاهرة"
              value={newInquiry.governorate}
              onChange={(e) => setNewInquiry({ ...newInquiry, governorate: e.target.value })}
              className="w-full p-2 border border-border rounded-md shadow-sm"
            />
          </div>
        </div>
        <button onClick={handleAddInquiry} className="mt-4 flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800">
          <PlusIcon className="w-5 h-5 ml-2" />
          <span>إضافة للسجل</span>
        </button>
      </div>

      <div className="space-y-6">
        {(Object.entries(inquiriesByDate) as [string, DailyInquiry[]][]).sort((a: [string, DailyInquiry[]], b: [string, DailyInquiry[]]) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()).map(([date, dateInquiries]) => (
            <div key={date}>
                <h3 className="text-lg font-bold text-text-primary mb-3 sticky top-0 bg-background py-2">{date}</h3>
                <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm text-right text-text-secondary">
                        <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
                            <tr>
                            <th scope="col" className="px-6 py-3">الوقت</th>
                            <th scope="col" className="px-6 py-3">المنتج</th>
                            <th scope="col" className="px-6 py-3">المحافظة</th>
                            <th scope="col" className="px-6 py-3">الموظف المسؤول</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dateInquiries.map((inquiry) => (
                            <tr key={inquiry.id} className="bg-white border-b border-border hover:bg-background-muted">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(inquiry.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-6 py-4 font-medium text-text-primary">{inquiry.productInquiry}</td>
                                <td className="px-6 py-4">{inquiry.customerGovernorate}</td>
                                <td className="px-6 py-4">{inquiry.userName}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ))}
         {inquiries.length === 0 && <p className="text-center p-4 bg-surface rounded-lg shadow-md">لا توجد استفسارات مسجلة بعد.</p>}
      </div>
    </div>
  );
};

export default DailyInquiriesPage;