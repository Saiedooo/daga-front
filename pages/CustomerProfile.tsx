import React, { useState } from 'react';
import {
  Customer,
  Complaint,
  OrderStatus,
  CustomerClassification,
  CustomerLogEntry,
  User,
  SystemSettings,
  CustomerImpression,
  Branch,
  UserRole,
} from '../types';
import {
  ArrowRightIcon,
  TicketIcon,
  FeedbackIcon,
  StarIcon as StarIconFilled,
  BranchIcon,
} from '../components/icons';
import StatusBadge from '../components/StatusBadge';
import VoucherModal from '../components/VoucherModal';
import ImpressionModal from '../components/ImpressionModal';

interface CustomerProfileProps {
  customer: Customer;
  complaints: Complaint[];
  branches: Branch[];
  onBack: () => void;
  onUpdateCustomer: (
    customer: Partial<Customer> & { version: number },
    actionDetail: string
  ) => void;
  onSaveImpression: (
    customerId: string,
    impression: CustomerImpression
  ) => void;
  systemSettings: SystemSettings;
  currentUser: User;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

const KpiCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-surface p-4 rounded-lg shadow-md">
    <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
    <div className="mt-2">{children}</div>
  </div>
);

const ActionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-surface p-4 rounded-lg shadow-sm border border-border flex flex-col h-full">
    <h4 className="text-md font-semibold text-text-primary mb-3">{title}</h4>
    <div className="flex-grow">{children}</div>
  </div>
);

// حل المشكلة: fallback للـ classification لو undefined
const classificationStyles: Record<
  CustomerClassification | 'default',
  { bg: string; border: string; text: string }
> = {
  Bronze: {
    bg: 'bg-badge-warning-bg',
    border: 'border-warning',
    text: 'text-badge-warning-text',
  },
  Silver: {
    bg: 'bg-badge-muted-bg',
    border: 'border-badge-muted-text',
    text: 'text-badge-muted-text',
  },
  Gold: {
    bg: 'bg-badge-gold-bg',
    border: 'border-badge-gold-text',
    text: 'text-badge-gold-text',
  },
  Platinum: {
    bg: 'bg-badge-info-bg',
    border: 'border-info',
    text: 'text-badge-info-text',
  },
  default: {
    bg: 'bg-gray-200',
    border: 'border-gray-400',
    text: 'text-gray-700',
  },
};

const StarRatingDisplay: React.FC<{ rating: number | null }> = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <StarIconFilled
        key={i}
        className={`w-5 h-5 ${
          i < (rating || 0) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))}
  </div>
);

const ImpressionCard: React.FC<{
  impression: CustomerImpression;
  branchName?: string;
}> = ({ impression, branchName }) => {
  return (
    <div className="bg-surface rounded-lg shadow-md p-4 border-l-4 border-info">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-text-primary">
            انطباع مسجل في{' '}
            <span className="text-primary">{branchName || 'فرع غير محدد'}</span>{' '}
            بواسطة: {impression.recordedByUserName}
          </p>
          <p className="text-xs text-text-secondary">
            {new Date(impression.date).toLocaleString('ar-EG', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
            {impression.visitTime && ` (وقت الزيارة: ${impression.visitTime})`}
          </p>
        </div>
        {impression.relatedInvoiceIds &&
          impression.relatedInvoiceIds.length > 0 && (
            <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">
              مرتبط بـ {impression.relatedInvoiceIds.join(', ')}
            </span>
          )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-semibold mb-1">المنتج والخامات</h5>
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={impression.productQualityRating} />
            <span>({impression.productQualityRating}/5)</span>
          </div>
          {impression.productQualityNotes && (
            <p className="text-xs text-text-secondary mt-1 bg-gray-50 p-2 rounded">
              {impression.productQualityNotes}
            </p>
          )}
        </div>
        <div>
          <h5 className="font-semibold mb-1">معاملة الفرع</h5>
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={impression.branchExperienceRating} />
            <span>({impression.branchExperienceRating}/5)</span>
          </div>
          {impression.branchExperienceNotes && (
            <p className="text-xs text-text-secondary mt-1 bg-gray-50 p-2 rounded">
              {impression.branchExperienceNotes}
            </p>
          )}
        </div>
        <div>
          <h5 className="font-semibold mb-1">كيف عرفت ضجة؟</h5>
          <p className="text-text-primary">{impression.discoveryChannel}</p>
        </div>
        <div>
          <h5 className="font-semibold mb-1">هل كانت أول زيارة؟</h5>
          <p className="text-text-primary">
            {impression.isFirstVisit ? 'نعم' : 'لا'}
          </p>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'bg-badge-success-bg text-badge-success-text';
    case OrderStatus.Shipped:
      return 'bg-badge-info-bg text-badge-info-text';
    case OrderStatus.Processing:
      return 'bg-badge-warning-bg text-badge-warning-text';
    case OrderStatus.Cancelled:
      return 'bg-badge-danger-bg text-badge-danger-text';
    default:
      return 'bg-badge-muted-bg text-badge-muted-text';
  }
};

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  complaints,
  branches,
  onBack,
  onUpdateCustomer,
  onSaveImpression,
  systemSettings,
  currentUser,
  showNotification,
}) => {
  const [manualPoints, setManualPoints] = useState<number>(0);
  const [manualReason, setManualReason] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [generatedVoucher, setGeneratedVoucher] = useState<any>(null);
  const [isImpressionModalOpen, setIsImpressionModalOpen] = useState(false);

  const handleGrantPoints = () => {
    if (manualPoints > 0 && manualReason) {
      const updatedCustomer: Partial<Customer> = {
        points: customer.points + manualPoints,
        totalPointsEarned: customer.totalPointsEarned + manualPoints,
      };
      onUpdateCustomer(
        updatedCustomer as any,
        `منح ${manualPoints} نقطة لسبب: ${manualReason}`
      );
      showNotification(`تم إضافة ${manualPoints} نقطة بنجاح.`, 'success');
      setManualPoints(0);
      setManualReason('');
    }
  };

  const handleDeductPoints = () => {
    if (manualPoints > 0 && manualReason) {
      if (customer.points < manualPoints) {
        showNotification('النقاط المتاحة غير كافية.', 'error');
        return;
      }
      const updatedCustomer: Partial<Customer> = {
        points: customer.points - manualPoints,
        totalPointsUsed: customer.totalPointsUsed + manualPoints,
      };
      onUpdateCustomer(
        updatedCustomer as any,
        `خصم ${manualPoints} نقطة لسبب: ${manualReason}`
      );
      showNotification(`تم خصم ${manualPoints} نقطة بنجاح.`, 'success');
      setManualPoints(0);
      setManualReason('');
    }
  };

  const handleGenerateVoucher = () => {
    if (pointsToRedeem <= 0 || pointsToRedeem > customer.points) {
      showNotification('عدد النقاط غير صحيح أو غير كافي.', 'error');
      return;
    }

    const discountValue = pointsToRedeem * systemSettings.pointValue;
    const issueDate = new Date();
    const voucherCode = `VCHR-${Date.now()}`;

    const newLogEntry: CustomerLogEntry = {
      invoiceId: voucherCode,
      date: issueDate.toISOString(),
      details: `إصدار قسيمة خصم بقيمة ${discountValue} جنيه`,
      status: OrderStatus.Delivered,
      feedback: null,
      pointsChange: -pointsToRedeem,
      amount: 0,
    };

    const updatedCustomer: Partial<Customer> = {
      points: customer.points - pointsToRedeem,
      totalPointsUsed: customer.totalPointsUsed + pointsToRedeem,
      log: [newLogEntry, ...(customer.log || [])],
    };

    const expiryDate = new Date(issueDate);
    expiryDate.setDate(issueDate.getDate() + 30);

    const voucherData = {
      customerName: customer.name,
      amount: discountValue,
      code: voucherCode,
      issueDate: issueDate.toLocaleDateString('ar-EG'),
      expiryDate: expiryDate.toLocaleDateString('ar-EG'),
    };

    setGeneratedVoucher(voucherData);
    onUpdateCustomer(
      updatedCustomer as any,
      `إصدار قسيمة خصم بقيمة ${discountValue} جنيه`
    );
    showNotification(`تم إصدار قسيمة بقيمة ${discountValue} جنيه.`, 'success');
    setPointsToRedeem(0);
  };

  const handleSaveImpression = (impression: CustomerImpression) => {
    const updatedCustomer: Partial<Customer> = {
      impressions: [...(customer.impressions || []), impression],
    };
    onUpdateCustomer(updatedCustomer as any, 'تسجيل انطباع جديد');
    onSaveImpression(customer.id, impression);
    setIsImpressionModalOpen(false);
  };

  // حل المشكلة: fallback لو classification مش موجود
  const styles =
    classificationStyles[customer.classification] ||
    classificationStyles.default;

  const canPerformActions = currentUser.role !== UserRole.Moderator;
  const primaryBranchName = customer.primaryBranchId
    ? branches.find((b) => b.id === customer.primaryBranchId)?.name ||
      'غير محدد'
    : 'غير محدد';

  return (
    <div className="p-4">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 rounded-lg border-r-8 ${styles.bg} ${styles.border}`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <h1 className={`text-2xl md:text-3xl font-bold ${styles.text}`}>
              {customer.name}
            </h1>
            <span className="text-lg font-mono text-text-secondary">
              ({customer.id})
            </span>
          </div>
          {customer.hasBadReputation && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              سيء السمعة
            </span>
          )}
          {customer.source === 'Facebook' && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              عميل صفحة
            </span>
          )}
        </div>
        <button
          onClick={onBack}
          className="flex items-center text-link font-semibold hover:underline self-end sm:self-auto"
        >
          <span>الرجوع إلى القائمة</span>
          <ArrowRightIcon className="w-5 h-5 mr-2" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="معلومات الاتصال">
          <p className="font-semibold text-text-primary">{customer.phone}</p>
          <p className="text-xs text-text-secondary">
            {customer.governorate}
            {customer.streetAddress ? `, ${customer.streetAddress}` : ''}
          </p>
        </KpiCard>
        <KpiCard title="الفرع الأساسي">
          <div className="flex items-center gap-2">
            <BranchIcon className="w-6 h-6 text-primary" />
            <p className="text-xl font-bold text-text-primary">
              {primaryBranchName}
            </p>
          </div>
        </KpiCard>
        <KpiCard title="ملخص النقاط">
          <p className="text-2xl font-bold text-accent">
            {customer.points.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">
            المكتسبة: {customer.totalPointsEarned.toLocaleString()} | المستخدمة:{' '}
            {customer.totalPointsUsed.toLocaleString()}
          </p>
        </KpiCard>
        <KpiCard title="إجمالي الإنفاق">
          <p className="text-2xl font-bold text-text-primary">
            {customer.totalPurchases.toLocaleString()}{' '}
            <span className="text-sm">جنيه</span>
          </p>
          <p className="text-xs text-text-secondary">
            في {customer.purchaseCount} عمليات شراء
          </p>
        </KpiCard>
      </div>

      {/* Manual Actions */}
      {canPerformActions && (
        <div className="bg-background-muted p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            إجراءات يدوية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard title="إدارة النقاط اليدوية">
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <input
                  type="number"
                  placeholder="عدد النقاط"
                  value={manualPoints || ''}
                  onChange={(e) => setManualPoints(Number(e.target.value))}
                  min="0"
                  className="w-full p-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="السبب"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full p-2 border border-border rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGrantPoints}
                  className="w-full bg-accent text-white px-4 py-2 rounded-md hover:bg-green-600 text-sm"
                >
                  منح نقاط
                </button>
                <button
                  onClick={handleDeductPoints}
                  className="w-full bg-danger text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  خصم نقاط
                </button>
              </div>
            </ActionCard>

            <ActionCard title="إصدار قسيمة خصم">
              <p className="text-xs text-text-secondary mb-2">
                (1 نقطة = {systemSettings.pointValue.toLocaleString('ar-EG')}{' '}
                جنيه)
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="number"
                  placeholder="عدد النقاط"
                  value={pointsToRedeem || ''}
                  onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded-md"
                  max={customer.points}
                  min="0"
                />
                <div className="w-full p-2 bg-background-muted rounded-md text-center font-bold">
                  {(pointsToRedeem * systemSettings.pointValue).toLocaleString(
                    'ar-EG'
                  )}{' '}
                  جنيه
                </div>
              </div>
              <button
                onClick={handleGenerateVoucher}
                className="mt-2 w-full bg-accent2 text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center justify-center gap-2"
                disabled={
                  pointsToRedeem <= 0 || pointsToRedeem > customer.points
                }
              >
                <TicketIcon className="w-5 h-5" />
                إصدار وطباعة القسيمة
              </button>
            </ActionCard>

            <ActionCard title="انطباع العميل">
              <p className="text-xs text-text-secondary mb-2">
                تسجيل رأي العميل بعد التواصل معه.
              </p>
              <button
                onClick={() => setIsImpressionModalOpen(true)}
                className="w-full bg-info text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center justify-center gap-2"
              >
                <FeedbackIcon className="w-5 h-5" />
                تسجيل انطباع جديد
              </button>
            </ActionCard>
          </div>
        </div>
      )}

      {/* سجل الفواتير والمشتريات */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-text-primary mb-4">
          سجل الفواتير والمشتريات
        </h3>
        <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-right text-text-secondary">
            <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
              <tr>
                <th className="px-6 py-3">رقم الفاتورة</th>
                <th className="px-6 py-3">التاريخ</th>
                <th className="px-6 py-3">التفاصيل</th>
                <th className="px-6 py-3">القيمة</th>
                <th className="px-6 py-3">حالة الطلب</th>
                <th className="px-6 py-3">التقييم</th>
                <th className="px-6 py-3">تغيير النقاط</th>
              </tr>
            </thead>
            <tbody>
              {(customer.log || []).length > 0 ? (
                customer.log.map((log, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b border-border hover:bg-background-muted"
                  >
                    <td className="px-6 py-4 font-medium text-link">
                      {log.invoiceId || 'غير متوفر'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(log.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">{log.details || '-'}</td>
                    <td className="px-6 py-4">
                      {log.amount ? `${log.amount.toLocaleString()} جنيه` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.feedback ? (
                        <StarRatingDisplay rating={log.feedback} />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        log.pointsChange >= 0 ? 'text-accent' : 'text-danger'
                      }`}
                    >
                      {log.pointsChange >= 0
                        ? `+${log.pointsChange}`
                        : log.pointsChange}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-text-secondary"
                  >
                    لا توجد فواتير أو مشتريات مسجلة لهذا العميل.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل انطباعات العميل */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-text-primary mb-4">
          سجل انطباعات العميل
        </h3>
        <div className="space-y-4">
          {(customer.impressions || []).length > 0 ? (
            customer.impressions.map((impression) => {
              const branchName = branches.find(
                (b) => b.id === impression.branchId
              )?.name;
              return (
                <ImpressionCard
                  key={impression.id || Math.random()}
                  impression={impression}
                  branchName={branchName}
                />
              );
            })
          ) : (
            <div className="bg-surface rounded-lg shadow-md p-6 text-center text-text-secondary">
              لا توجد انطباعات مسجلة لهذا العميل.
            </div>
          )}
        </div>
      </div>

      {/* سجل شكاوى العميل */}
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-4">
          سجل شكاوى العميل
        </h3>
        <div className="bg-surface rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-right text-text-secondary">
            <thead className="text-xs text-table-header-text uppercase bg-table-header-bg">
              <tr>
                <th className="px-6 py-3">تاريخ الشكوى</th>
                <th className="px-6 py-3">نوع الشكوى</th>
                <th className="px-6 py-3">وصف المشكلة</th>
                <th className="px-6 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr
                    key={c.complaintId}
                    className="bg-white border-b border-border hover:bg-background-muted"
                  >
                    <td className="px-6 py-4">
                      {new Date(c.dateOpened).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {c.type}
                    </td>
                    <td className="px-6 py-4">{c.description}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-text-secondary"
                  >
                    لا توجد شكاوى مسجلة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VoucherModal
        isOpen={!!generatedVoucher}
        onClose={() => setGeneratedVoucher(null)}
        voucherData={generatedVoucher}
        companyName={systemSettings.companyName}
        companyLogo={systemSettings.companyLogo}
      />
      <ImpressionModal
        isOpen={isImpressionModalOpen}
        onClose={() => setIsImpressionModalOpen(false)}
        onSave={handleSaveImpression}
        customer={customer}
        currentUser={currentUser}
        branches={branches}
      />
    </div>
  );
};

export default CustomerProfile;
