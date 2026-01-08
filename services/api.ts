// src/lib/api.ts

const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment
  ? '/api' // Vite proxy في التطوير المحلي
  : 'https://dag-system-7xlv.vercel.app/api'; // الرابط الرسمي على Vercel

/**
 * دالة fetch موحدة مع معالجة أخطاء متقدمة و timeout
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${
    endpoint.startsWith('/') ? endpoint : '/' + endpoint
  }`;

  // Timeout 15 ثانية عشان نتجنب التعليق الطويل
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `خطأ في الاتصال: ${response.status}`;

      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }

        // رسائل مخصصة لمشاكل الداتابيز الشائعة
        if (errorMessage.includes('Database connection')) {
          errorMessage = 'قاعدة البيانات غير متصلة حاليًا. جاري المحاولة...';
        }
      } catch {
        // إذا فشل قراءة الـ body
      }

      console.error(`API Error [${endpoint}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    // 204 No Content (مثل الحذف الناجح)
    if (response.status === 204) return { success: true };

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error(`API Timeout [${endpoint}]`);
      throw new Error('انتهت مهلة الاتصال. تحقق من الإنترنت وحاول مرة أخرى.');
    }

    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'فشل الاتصال بالخادم. تأكد من الإنترنت أو أعد تحميل الصفحة.'
      );
    }

    console.error(`API Unexpected Error [${endpoint}]:`, error);
    throw error;
  }
}

// الـ API object اللي بنستخدمه في كل الصفحات
const api = {
  get: async (url: string) => {
    try {
      return await apiRequest(url, { method: 'GET' });
    } catch (error: any) {
      console.warn(`GET failed: ${url}`, error.message);
      return null; // fallback للبيانات المخزنة محليًا لو موجودة
    }
  },

  post: (url: string, data: any) =>
    apiRequest(url, { method: 'POST', body: JSON.stringify(data) }),

  put: (url: string, data: any) =>
    apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }),

  patch: (url: string, data: any) =>
    apiRequest(url, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (url: string) => apiRequest(url, { method: 'DELETE' }),
};

export default api;
