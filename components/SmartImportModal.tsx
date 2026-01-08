// src/components/SmartImportModal.tsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  showNotification,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewData([]);
      setFullData([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      showNotification('يرجى اختيار ملف CSV فقط', 'error');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        if (rows.length < 2) {
          showNotification('الملف فارغ أو لا يحتوي على بيانات', 'error');
          setIsParsing(false);
          return;
        }

        const headers = rows[0] as string[];
        const dataRows = rows
          .slice(1)
          .filter((row) => row.some((cell) => cell !== '' && cell !== null));

        const mappedData = dataRows.map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            const rawValue = (row[index] || '').toString().trim();
            const value = rawValue === '' ? null : rawValue;

            if (
              header.includes('كود العميل') ||
              header.includes('كود') ||
              header.includes('Code')
            ) {
              obj['كود العميل'] = value;
            } else if (
              header.includes('اسم العميل') ||
              header.includes('الاسم') ||
              header.includes('Name')
            ) {
              obj['اسم العميل'] = value;
            } else if (
              header.includes('رقم الهاتف') ||
              header.includes('تليفون') ||
              header.includes('موبايل') ||
              header.includes('Phone')
            ) {
              obj['رقم الهاتف'] = value;
            } else if (
              header.includes('رقم الفاتورة') ||
              header.includes('الفاتورة') ||
              header.includes('Invoice')
            ) {
              obj['رقم الفاتورة'] = value;
            } else if (
              header.includes('التاريخ') ||
              header.includes('تاريخ') ||
              header.includes('Date')
            ) {
              obj['تاريخ الفاتورة'] = value;
            } else if (
              header.includes('المبلغ') ||
              header.includes('الإجمالي') ||
              header.includes('اجمالي') ||
              header.includes('Total')
            ) {
              obj['المبلغ الإجمالي'] = value;
            } else if (
              header.includes('المدفوع') ||
              header.includes('مدفوع') ||
              header.includes('Paid')
            ) {
              obj['المدفوع'] = value;
            } else if (
              header.includes('المتبقي') ||
              header.includes('الباقي') ||
              header.includes('متبقي') ||
              header.includes('Remaining')
            ) {
              obj['المتبقي'] = value;
            } else if (
              header.includes('المحافظة') ||
              header.includes('محافظة') ||
              header.includes('Governorate')
            ) {
              obj['المحافظة'] = value;
            } else if (
              header.includes('العنوان') ||
              header.includes('عنوان') ||
              header.includes('Address')
            ) {
              obj['العنوان'] = value;
            } else {
              // نحتفظ بأي عمود إضافي كما هو (مفيد للـ backend)
              obj[header.trim()] = value;
            }
          });
          return obj;
        });

        setFullData(mappedData);
        setPreviewData(mappedData.slice(0, 10));
        setIsParsing(false);
        showNotification(
          `تم تحليل الملف بنجاح: ${mappedData.length} صف من البيانات`,
          'success'
        );
      },
      error: (error) => {
        showNotification('خطأ في قراءة الملف: ' + error.message, 'error');
        setIsParsing(false);
      },
      header: false,
      skipEmptyLines: true,
      encoding: 'UTF-8',
    });
  };

  const handleImport = () => {
    if (fullData.length === 0) {
      showNotification('لا توجد بيانات للاستيراد', 'error');
      return;
    }
    onImport(fullData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-background-muted rounded-2xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
          استيراد البيانات الذكي
        </h2>

        <div className="mb-8">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-lg file:mr-6 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-lg file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-800 rounded-xl">
            <p className="text-text-secondary text-lg">
              الملف المختار: <strong className="text-white">{file.name}</strong>
            </p>
          </div>
        )}

        {isParsing && (
          <div className="text-center my-8">
            <p className="text-2xl text-primary font-semibold">
              جاري تحليل الملف...
            </p>
          </div>
        )}

        {previewData.length > 0 && (
          <>
            <h3 className="text-2xl font-semibold mb-6 text-text-primary">
              معاينة البيانات (أول 10 صفوف فقط):
            </h3>

            <div className="overflow-x-auto bg-surface rounded-2xl shadow-inner border border-gray-700">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-table-header-bg sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-right font-bold">
                      كود العميل
                    </th>
                    <th className="px-4 py-4 text-right font-bold">
                      اسم العميل
                    </th>
                    <th className="px-4 py-4 text-right font-bold">
                      رقم الهاتف
                    </th>
                    <th className="px-4 py-4 text-right font-bold">المحافظة</th>
                    <th className="px-4 py-4 text-right font-bold">العنوان</th>
                    <th className="px-4 py-4 text-right font-bold">
                      رقم الفاتورة
                    </th>
                    <th className="px-4 py-4 text-right font-bold">
                      تاريخ الفاتورة
                    </th>
                    <th className="px-4 py-4 text-right font-bold">
                      المبلغ الإجمالي
                    </th>
                    <th className="px-4 py-4 text-right font-bold">المدفوع</th>
                    <th className="px-4 py-4 text-right font-bold">المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-700 hover:bg-gray-800 transition"
                    >
                      <td className="px-4 py-3">{row['كود العميل'] || '-'}</td>
                      <td className="px-4 py-3 font-medium">
                        {row['اسم العميل'] || '-'}
                      </td>
                      <td className="px-4 py-3">{row['رقم الهاتف'] || '-'}</td>
                      <td className="px-4 py-3">{row['المحافظة'] || '-'}</td>
                      <td className="px-4 py-3">{row['العنوان'] || '-'}</td>
                      <td className="px-4 py-3">
                        {row['رقم الفاتورة'] || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {row['تاريخ الفاتورة'] || '-'}
                      </td>
                      <td className="px-4 py-3 text-green-400 font-medium">
                        {row['المبلغ الإجمالي'] || '-'}
                      </td>
                      <td className="px-4 py-3 text-blue-400">
                        {row['المدفوع'] || '-'}
                      </td>
                      <td className="px-4 py-3 text-yellow-400">
                        {row['المتبقي'] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-10">
              <p className="text-lg text-text-secondary">
                إجمالي الصفوف المكتشفة:{' '}
                <strong className="text-white">{fullData.length}</strong>
              </p>

              <div className="flex gap-6">
                <button
                  onClick={onClose}
                  className="px-10 py-4 bg-gray-600 text-white text-lg rounded-2xl hover:bg-gray-700 transition font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleImport}
                  className="px-10 py-4 bg-primary text-white text-lg rounded-2xl hover:bg-blue-700 transition font-bold shadow-lg"
                >
                  تأكيد الاستيراد ({fullData.length} صف)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartImportModal;
