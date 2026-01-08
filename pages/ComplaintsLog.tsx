import React, { useMemo, useState } from 'react';
import {
  Complaint,
  User,
  Customer,
  Product,
  SystemSettings,
  ComplaintStatus,
} from '../types';
import StatusBadge from '../components/StatusBadge';
import { PlusIcon, TrashIcon } from '../components/icons';
import ComplaintModal from '../components/ComplaintModal';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import ActionInputModal from '../components/ActionInputModal';

interface ComplaintsLogProps {
  complaints: Complaint[];
  users: User[];
  customers: Customer[];
  products?: Product[];
  currentUser: User;
  systemSettings: SystemSettings;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
  onViewCustomer?: (customerId: string) => void;
  onRefresh?: () => Promise<void> | void;
}

const PAGE_SIZE = 20; // عدد الشكاوى في الصفحة الواحدة

const ComplaintsLog: React.FC<ComplaintsLogProps> = ({
  complaints,
  users,
  customers,
  products = [],
  currentUser,
  systemSettings,
  showNotification,
  onViewCustomer,
  onRefresh,
}) => {
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    type: '',
    dateOpened: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(
    null
  );
  const [actionInput, setActionInput] = useState<{
    complaintId: string;
    newStatus: ComplaintStatus;
    logMessageTemplate: string;
    title: string;
    prompt: string;
  } | null>(null);

  const [deletingComplaintId, setDeletingComplaintId] = useState<string | null>(
    null
  );

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        return (
          (!filters.status || c.status === filters.status) &&
          (!filters.assignedTo || c.assignedTo === filters.assignedTo) &&
          (!filters.type || c.type === filters.type) &&
          (!filters.dateOpened || c.dateOpened?.startsWith(filters.dateOpened))
        );
      })
      .sort((a, b) => {
        const dateA = a.dateOpened ? new Date(a.dateOpened).getTime() : 0;
        const dateB = b.dateOpened ? new Date(b.dateOpened).getTime() : 0;
        return dateB - dateA;
      });
  }, [complaints, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشكوى نهائيًا؟')) {
      return;
    }

    try {
      await window.electron.complaint.delete(complaintId);
      showNotification('تم حذف الشكوى بنجاح', 'success');
      await onRefresh?.();
    } catch (e: any) {
      showNotification(e?.message || 'فشل حذف الشكوى', 'error');
    }
    setDeletingComplaintId(null);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveComplaint = async (complaintData: Partial<Complaint>) => {
    try {
      const payload = {
        ...complaintData,
        complaintText: complaintData.description,
        dateOpened: new Date().toISOString(),
      };

      if (!payload.customerId || !payload.type || !payload.description) {
        showNotification('الرجاء تعبئة الحقول الإلزامية', 'error');
        return;
      }

      if (payload.customerId && !payload.customerName) {
        const customer = customers.find((c) => c.id === payload.customerId);
        if (customer) {
          payload.customerName = customer.name;
          payload.customerPhone = customer.phone;
          payload.customerEmail = customer.email || '';
        }
      }

      await window.electron.complaint.create(payload);
      showNotification('تم إضافة الشكوى بنجاح', 'success');
      handleCloseModal();
      await onRefresh?.();
    } catch (e: any) {
      showNotification(e?.message || 'فشل في إضافة الشكوى', 'error');
    }
  };

  const handleAction = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    logAction: string
  ) => {
    try {
      const complaint = complaints.find((c) => c.complaintId === complaintId);
      if (!complaint) return;

      const updated = {
        status: newStatus,
        log: [
          ...(complaint.log || []),
          {
            user: currentUser.name || 'Unknown',
            date: new Date().toISOString(),
            action: logAction,
          },
        ],
        version: complaint.version,
      };

      await window.electron.complaint.update(complaintId, updated);
      showNotification(`تم تحديث الحالة إلى "${newStatus}"`, 'success');
      await onRefresh?.();
      setViewingComplaint(null);
    } catch (e: any) {
      showNotification(e.message || 'فشل التحديث', 'error');
    }
  };

  const handleOpenActionInput = (
    complaintId: string,
    newStatus: ComplaintStatus,
    logMessageTemplate: string,
    title: string,
    prompt: string
  ) => {
    setActionInput({
      complaintId,
      newStatus,
      logMessageTemplate,
      title,
      prompt,
    });
  };

  const handleConfirmActionInput = (note: string) => {
    if (actionInput && note.trim()) {
      const logAction = actionInput.logMessageTemplate.replace(
        '%s',
        note.trim()
      );
      handleAction(actionInput.complaintId, actionInput.newStatus, logAction);
      setActionInput(null);
    }
  };

  const handleAddLog = async (complaintId: string, note: string) => {
    try {
      const complaint = complaints.find((c) => c.complaintId === complaintId);
      if (!complaint) return;

      const newLog = [
        ...(complaint.log || []),
        {
          user: currentUser.name || 'Unknown',
          date: new Date().toISOString(),
          action: note,
        },
      ];

      await window.electron.complaint.update(complaintId, {
        log: newLog,
        version: complaint.version,
      });
      showNotification('تم إضافة الملاحظة بنجاح', 'success');
      await onRefresh?.();
    } catch (e: any) {
      showNotification('فشل إضافة الملاحظة', 'error');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          سجل الشكاوى ({filteredComplaints.length})
        </h1>
        <button
          onClick={handleOpenModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          شكوى جديدة
        </button>
      </div>

      {/* الفلاتر */}
      <div className="bg-surface p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* نفس الفلاتر */}
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">العميل</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">المسؤول</th>
              <th className="p-4">تفاصيل</th>
              <th className="p-4">حذف</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.map((c) => (
              <tr key={c.complaintId} className="border-b hover:bg-gray-50">
                <td
                  className="p-4 font-bold text-primary cursor-pointer"
                  onClick={() => setViewingComplaint(c)}
                >
                  {c.customerName}
                </td>
                <td className="p-4 text-sm">{c.type}</td>
                <td className="p-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-4 text-sm">
                  {users.find((u) => u.id === c.assignedTo)?.name || 'غير معين'}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingComplaint(c);
                    }}
                    className="text-primary underline"
                  >
                    عرض التفاصيل
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingComplaintId(c.complaintId);
                      handleDeleteComplaint(c.complaintId);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="حذف الشكوى"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedComplaints.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  لا توجد شكاوى مطابقة للفلاتر
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            الأولى
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            السابق
          </button>

          <span className="px-4 py-1">
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            التالي
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            الأخيرة
          </button>
        </div>
      )}

      {/* المودالات */}
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveComplaint}
        customers={customers}
        products={products}
        complaintTypes={systemSettings?.complaintTypes ?? []}
      />

      <ComplaintDetailModal
        complaint={viewingComplaint}
        isOpen={!!viewingComplaint}
        onClose={() => setViewingComplaint(null)}
        onAddLog={handleAddLog}
        onAction={handleAction}
        onActionWithInput={handleOpenActionInput}
        users={users}
        currentUser={currentUser}
        products={products}
        onViewCustomer={onViewCustomer}
      />

      <ActionInputModal
        isOpen={!!actionInput}
        onClose={() => setActionInput(null)}
        onSubmit={handleConfirmActionInput}
        title={actionInput?.title || ''}
        prompt={actionInput?.prompt || ''}
      />
    </div>
  );
};

export default ComplaintsLog;
