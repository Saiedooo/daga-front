import React, { useState, useMemo } from 'react';
import {
  DailyFeedbackTask,
  DailyFeedbackStatus,
  Customer,
  User,
  Branch,
  CustomerImpression,
} from '../types';
import { PlusIcon, FeedbackIcon, TrashIcon } from '../components/icons';
import ImpressionModal from '../components/ImpressionModal';
import AddFeedbackTasksModal from '../components/AddFeedbackTasksModal';

interface DailyFeedbackPageProps {
  tasks: DailyFeedbackTask[];
  customers: Customer[];
  currentUser: User;
  branches: Branch[];
  onViewCustomer: (customerId: string) => void;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
  onRefresh?: () => void;
}

const DailyFeedbackPage: React.FC<DailyFeedbackPageProps> = ({
  tasks,
  customers,
  currentUser,
  branches,
  onViewCustomer,
  showNotification,
  onRefresh,
}) => {
  const [isImpressionModalOpen, setImpressionModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [taskToEvaluate, setTaskToEvaluate] =
    useState<DailyFeedbackTask | null>(null);

  const pendingTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status === DailyFeedbackStatus.Pending)
      .sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
  }, [tasks]);

  const existingTaskInvoiceIds = useMemo(() => {
    return new Set(tasks.map((task) => task.invoiceId));
  }, [tasks]);

  const handleStartEvaluation = (task: DailyFeedbackTask) => {
    const customer = customers.find((c) => c.id === task.customerId);
    if (customer) {
      setTaskToEvaluate(task);
      setImpressionModalOpen(true);
    } else {
      showNotification('لم يتم العثور على العميل المرتبط بالمهمة.', 'error');
    }
  };

  const handleDeleteTask = async (task: DailyFeedbackTask) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف مهمة التقييم للفاتورة ${task.invoiceId}؟`
      )
    ) {
      return;
    }

    try {
      await window.electron.dailyFeedbackTask.delete(task.invoiceId);
      showNotification('تم حذف المهمة بنجاح!', 'success');
      onRefresh?.();
    } catch (e: any) {
      showNotification(e.message || 'فشل في حذف المهمة', 'error');
    }
  };

  const handleSaveAndCloseImpression = async (
    impression: CustomerImpression
  ) => {
    try {
      // هنا بتكمل الكود اللي عندك للحفظ (مش موجود في الكود اللي بعته، فسيبه زي ما هو)
      // مثال:
      // await api.post('/daily-feedback', { ...impression, taskId: taskToEvaluate?.id });

      showNotification('تم حفظ التقييم بنجاح', 'success');
      onRefresh?.();
    } catch (err) {
      showNotification('حدث خطأ أثناء حفظ التقييم', 'error');
    } finally {
      setImpressionModalOpen(false);
      setTaskToEvaluate(null);
    }
  };

  const handleAddTasks = async (newTasks: DailyFeedbackTask[]) => {
    try {
      // هنا كمان بتكمل الكود اللي عندك
      // مثال:
      // await api.post('/api/v1/daily-feedback-tasks/bulk', { tasks: newTasks });

      showNotification('تم إضافة المهام بنجاح', 'success');
      onRefresh?.();
    } catch (err) {
      showNotification('حدث خطأ أثناء إضافة المهام', 'error');
    } finally {
      setAddModalOpen(false);
    }
  };

  return (
    <div className="pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">
          التقييمات اليومية
        </h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center bg-primary text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة فواتير لليوم
        </button>
      </div>

      <p className="text-text-secondary mb-6">
        هذه قائمة بالعملاء الذين قاموا بعمليات شراء حديثة وينتظرون التواصل معهم
        لأخذ انطباعهم عن الخدمة والمنتج.
      </p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">العميل</th>
                <th className="px-6 py-4 font-semibold">رقم الفاتورة</th>
                <th className="px-6 py-4 font-semibold">تاريخ الفاتورة</th>
                <th className="px-6 py-4 font-semibold">الإجراء</th>
                <th className="px-6 py-4 font-semibold">حذف</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    لا توجد مهام تقييم معلقة. عظيم!
                  </td>
                </tr>
              ) : (
                pendingTasks.map((task) => (
                  <tr
                    key={task.id || task.invoiceId}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewCustomer(task.customerId)}
                        className="text-primary hover:underline font-medium"
                      >
                        {task.customerName}
                      </button>
                    </td>
                    <td className="px-6 py-4">{task.invoiceId}</td>
                    <td className="px-6 py-4">
                      {new Date(task.invoiceDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStartEvaluation(task)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <FeedbackIcon className="w-5 h-5" />
                        قيم الآن
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <TrashIcon className="w-5 h-5" />
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* المودالات */}
      {taskToEvaluate && (
        <ImpressionModal
          isOpen={isImpressionModalOpen}
          onClose={() => setImpressionModalOpen(false)}
          onSave={handleSaveAndCloseImpression}
          customer={customers.find((c) => c.id === taskToEvaluate.customerId)!}
          currentUser={currentUser}
          branches={branches}
        />
      )}

      <AddFeedbackTasksModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddTasks}
        customers={customers}
        existingTaskInvoiceIds={existingTaskInvoiceIds}
      />
    </div>
  );
};

export default DailyFeedbackPage;
