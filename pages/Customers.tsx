import React, { useState, useMemo, useEffect } from 'react';
import { Customer, User } from '../types';
import { PlusIcon, StarIcon, TrashIcon } from '../components/icons';
import { Upload } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import ClassificationBadge from '../components/ClassificationBadge';
import SmartImportModal from '../components/SmartImportModal';

interface CustomersProps {
  customers: Customer[];
  onViewCustomer: (customerId: string) => void;
  currentUser: User;
  logUserAction: (details: string) => void;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
  onRefresh?: () => void;
}

const Customers: React.FC<CustomersProps> = ({
  customers: initialCustomers,
  onViewCustomer,
  currentUser,
  logUserAction,
  showNotification,
  onRefresh,
}) => {
  const [localCustomers, setLocalCustomers] =
    useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // تحديث العملاء المحليين عند تغيير العملاء الخارجيين
  useEffect(() => {
    setLocalCustomers(initialCustomers);
  }, [initialCustomers]);

  // تصفية العملاء بناءً على البحث
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return localCustomers;

    const lowerSearch = searchTerm.toLowerCase().trim();

    return localCustomers.filter((c) => {
      return (
        c.id.toLowerCase().includes(lowerSearch) ||
        c.name.toLowerCase().includes(lowerSearch) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    });
  }, [localCustomers, searchTerm]);

  // إضافة عميل جديد
  const handleSaveCustomer = async (
    customerData: Partial<Customer> & {
      initialPurchaseAmount?: number;
      purchaseDescription?: string;
    }
  ) => {
    const {
      initialPurchaseAmount = 0,
      purchaseDescription,
      ...rest
    } = customerData;

    try {
      console.log('🟢 Creating customer with data:', rest);
      const response = await window.electron.customer.create(rest);
      const createdCustomer = response?.data;

      console.log('🟢 Customer creation response:', response);

      if (!createdCustomer || !createdCustomer.id) {
        throw new Error('لم يتم إرجاع بيانات العميل من الخادم');
      }

      const customerId = createdCustomer.id;

      // إنشاء فاتورة شراء أولي إذا كان هناك مبلغ
      if (initialPurchaseAmount > 0) {
        try {
          await fetch('/api/v1/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: customerId,
              totalPrice: initialPurchaseAmount,
              products: [
                {
                  productName: purchaseDescription || 'شراء أولي',
                  price: initialPurchaseAmount,
                  quantity: 1,
                },
              ],
              invoiceDate: new Date().toISOString(),
            }),
          });
        } catch (invoiceError) {
          console.error('🟡 Error creating invoice:', invoiceError);
          // نستمر حتى لو فشلت الفاتورة
        }
      }

      const earnedPoints = initialPurchaseAmount >= 2000 ? 50 : 0;

      // تحديث بيانات العميل بالنقاط
      await window.electron.customer.update(customerId, {
        totalPurchases: initialPurchaseAmount,
        purchaseCount: initialPurchaseAmount > 0 ? 1 : 0,
        lastPurchaseDate:
          initialPurchaseAmount > 0 ? new Date().toISOString() : null,
        points: (createdCustomer.points || 0) + earnedPoints,
        totalPointsEarned:
          (createdCustomer.totalPointsEarned || 0) + earnedPoints,
      });

      showNotification('تم إضافة العميل بنجاح', 'success');
      logUserAction(`إضافة عميل: ${createdCustomer.name}`);

      // إعادة تحميل البيانات
      if (onRefresh) {
        onRefresh();
      } else {
        // إضافة العميل مباشرة إلى القائمة المحلية
        setLocalCustomers((prev) => [
          ...prev,
          {
            ...createdCustomer,
            totalPurchases: initialPurchaseAmount,
            purchaseCount: initialPurchaseAmount > 0 ? 1 : 0,
            lastPurchaseDate:
              initialPurchaseAmount > 0 ? new Date().toISOString() : null,
            points: (createdCustomer.points || 0) + earnedPoints,
          },
        ]);
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('🔴 Error creating customer:', error);
      showNotification(error.message || 'حدث خطأ أثناء إضافة العميل', 'error');
    }
  };

  // دالة الحذف المعدلة - بدون findCustomerById
  const handleDeleteCustomer = async (customerId: string) => {
    console.log('🟢 DELETE STARTED for customer:', customerId);

    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    if (deletingIds.has(customerId)) return;

    try {
      setDeletingIds((prev) => new Set(prev).add(customerId));

      // حفظ العميل قبل الحذف (للتراجع إذا لزم)
      const customerToDelete = localCustomers.find((c) => c.id === customerId);

      // حذف فوري من الواجهة
      setLocalCustomers((prev) => prev.filter((c) => c.id !== customerId));

      // محاولة الحذف من الخادم
      console.log('🟢 Calling API delete for:', customerId);
      const result = await window.electron.customer.delete(customerId);
      console.log('🟢 API delete result:', result);

      if (result?.success === true) {
        showNotification('تم حذف العميل بنجاح', 'success');
        logUserAction(`حذف عميل: ${customerId}`);

        // إعادة تحميل البيانات للتأكد
        if (onRefresh) {
          onRefresh();
        }
      } else {
        // إذا فشل الحذف من الخادم، نعيد العميل للقائمة
        if (customerToDelete) {
          setLocalCustomers((prev) =>
            [...prev, customerToDelete].sort((a, b) => a.id.localeCompare(b.id))
          );
        }
        throw new Error(result?.message || 'فشل حذف العميل من الخادم');
      }
    } catch (e: any) {
      console.error('🔴 Delete error:', e);
      showNotification(e.message || 'فشل حذف العميل', 'error');
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(customerId);
        return newSet;
      });
    }
  };

  // تصدير CSV
  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/v1/customers/export-csv');
      if (!res.ok) throw new Error('فشل في تحميل الملف');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'عملاء_ومشترياتهم.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('تم تصدير العملاء بنجاح', 'success');
      logUserAction('تصدير قائمة العملاء كـ CSV');
    } catch (err: any) {
      showNotification('فشل تصدير العملاء: ' + (err.message || ''), 'error');
    }
  };

  // استيراد CSV
  const handleImportCSV = async (parsedData: any[]) => {
    try {
      const res = await fetch('/api/v1/customers/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData }),
      });

      const result = await res.json();

      if (result.success) {
        showNotification(
          `تم الاستيراد بنجاح!\nأُنشئ ${result.results.createdCustomers} عميل جديد\nأُنشئت ${result.results.createdInvoices} فاتورة`,
          'success'
        );
        logUserAction(
          `استيراد عملاء من CSV: ${result.results.createdCustomers} عميل جديد`
        );

        if (onRefresh) {
          onRefresh();
        }

        setIsImportModalOpen(false);
      } else {
        throw new Error(result.message || 'فشل في الاستيراد');
      }
    } catch (err: any) {
      showNotification(
        'فشل استيراد العملاء: ' + (err.message || 'خطأ غير معروف'),
        'error'
      );
    }
  };

  return (
    <div className="pb-10" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة العملاء</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all duration-200"
          >
            <PlusIcon className="w-6 h-6" />
            إضافة عميل
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-300 shadow-md transition-all duration-200"
          >
            <Upload className="w-6 h-6" />
            استيراد CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-300 shadow-md transition-all duration-200"
          >
            <StarIcon className="w-6 h-6" />
            تصدير CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          placeholder="بحث بالكود أو الاسم أو الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-700">الكود</th>
                <th className="p-4 font-semibold text-gray-700">الاسم</th>
                <th className="p-4 font-semibold text-gray-700">التصنيف</th>
                <th className="p-4 font-semibold text-gray-700">النقاط</th>
                <th className="p-4 font-semibold text-gray-700">الهاتف</th>
                <th className="p-4 font-semibold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    {searchTerm.trim()
                      ? 'لا يوجد عملاء مطابقين للبحث'
                      : 'لا يوجد عملاء'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4 font-mono">{customer.id}</td>
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4">
                      <ClassificationBadge
                        classification={customer.classification || 'غير محدد'}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end items-center">
                        {customer.points > 0 && (
                          <StarIcon className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-medium">{customer.points}</span>
                      </div>
                    </td>
                    <td className="p-4">{customer.phone || 'لا يوجد'}</td>
                    <td className="p-4">
                      <div className="flex gap-4 justify-end">
                        <button
                          onClick={() => onViewCustomer(customer.id)}
                          className="text-primary hover:text-blue-700 hover:underline font-medium transition-colors duration-200 px-2 py-1 rounded"
                          disabled={deletingIds.has(customer.id)}
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors duration-200"
                          disabled={deletingIds.has(customer.id)}
                          title="حذف العميل"
                        >
                          {deletingIds.has(customer.id) ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <SmartImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
        showNotification={showNotification}
      />
    </div>
  );
};

export default Customers;
