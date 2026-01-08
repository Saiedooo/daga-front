import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import api from './services/api';

window.electron = {
  getInitialData: async () => {
    try {
      const [
        complaintsData,
        customersData,
        usersData,
        inquiriesData,
        invoicesData,
        feedbackTasksData,
      ] = await Promise.all([
        api.get('/v1/complaint'),
        api.get('/v1/customers'),
        api.get('/v1/users'),
        api.get('/v1/daily-inquiries'),
        api.get('/v1/invoices'),
        api.get('/v1/daily-feedback-tasks'),
      ]);

      const complaints = Array.isArray(complaintsData?.data)
        ? complaintsData.data
        : [];
      let customers = [];
      const customersResponse = customersData?.data || {};

      if (Array.isArray(customersResponse)) {
        customers = customersResponse;
      } else if (
        typeof customersResponse === 'object' &&
        customersResponse !== null
      ) {
        // لو جاء object (map)، نحوله لـ array
        customers = Object.values(customersResponse);
      } else {
        customers = [];
      }
      const users = Array.isArray(usersData?.data) ? usersData.data : [];
      const inquiries = Array.isArray(inquiriesData?.data)
        ? inquiriesData.data
        : [];
      const invoices = Array.isArray(invoicesData?.data)
        ? invoicesData.data
        : [];

      let dailyFeedbackTasks = [];
      if (feedbackTasksData?.data && Array.isArray(feedbackTasksData.data)) {
        dailyFeedbackTasks = feedbackTasksData.data.map((task) => ({
          id: task._id || `dft-${task.invoiceId}`,
          customerId: task.customerId,
          customerName: task.customerName || 'غير معروف',
          invoiceId: task.invoiceId,
          invoiceDate: task.invoiceDate || new Date().toISOString(),
          status: task.status || 'Pending',
          lastModified: task.updatedAt || new Date().toISOString(),
          version: 1,
        }));
      }

      return {
        complaints,
        customers,
        users,
        dailyInquiries: inquiries,
        products: [],
        branches: [],
        followUpTasks: [],
        dailyFeedbackTasks,
        activityLog: [],
        systemSettings: {
          companyName: 'نظام ضجة',
          complaintTypes: [
            'جودة المنتج',
            'تأخير شحن',
            'خدمة عملاء',
            'خطأ في الطلب',
          ],
          pointValue: 1,
          classification: { silver: 1000, gold: 5000, platinum: 10000 },
        },
        theme: { colors: {} },
      };
    } catch (error) {
      console.error('Failed to load data from backend:', error);
      return {
        complaints: [],
        customers: [],
        users: [],
        products: [],
        branches: [],
        dailyInquiries: [],
        followUpTasks: [],
        dailyFeedbackTasks: [],
        activityLog: [],
        systemSettings: {
          companyName: 'نظام ضجة (غير متصل بالإنترنت)',
          complaintTypes: [],
          pointValue: 1,
          classification: { silver: 1000, gold: 5000, platinum: 10000 },
        },
        theme: { colors: {} },
      };
    }
  },

  auth: {
    login: async (username, password) => {
      const res = await api.post('/v1/auth/login', {
        userName: username,
        password,
      });
      const token = res?.token || res?.data?.token;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      return res;
    },
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('last_user');
    },
    getToken: () => localStorage.getItem('authToken'),
    validateToken: async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        const isDevelopment =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';
        const BASE_URL = isDevelopment
          ? '/api'
          : 'https://dag-system-7xlv.vercel.app/api';

        const response = await fetch(`${BASE_URL}/v1/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) return false;
        if (!response.ok && (response.status === 0 || response.status >= 500))
          return false;

        return true;
      } catch (error) {
        console.error('Token validation failed:', error);
        return false;
      }
    },
  },

  complaint: {
    create: (data) => api.post('/v1/complaint', data),
    update: (id, data) => api.put(`/v1/complaint/${id}`, data),
    delete: (id) => api.delete(`/v1/complaint/${id}`),
  },
  customer: {
    create: (data) => api.post('/v1/customers', data),
    update: (id, data) => api.put(`/v1/customers/${id}`, data),
    delete: async (id) => {
      console.log('🔴 Frontend calling delete for ID:', id);
      try {
        const response = await fetch(`/api/v1/customers/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        console.log('🔴 Delete response status:', response.status);

        // التحقق من حالة الرد
        if (response.status === 204) {
          // Handle 204 No Content (النظام القديم)
          return { success: true, message: 'Customer deleted' };
        }

        const text = await response.text();
        console.log('🔴 Delete response body:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { success: false, message: 'Invalid JSON response' };
        }

        return data;
      } catch (error) {
        console.error('🔴 Delete error:', error);
        return { success: false, message: error.message };
      }
    },
  },
  user: {
    create: (data) => api.post('/v1/users', data),
    update: (id, data) => api.put(`/v1/users/${id}`, data),
    delete: (id) => api.delete(`/v1/users/${id}`),
  },
  dailyInquiry: {
    create: (data) => api.post('/v1/daily-inquiries', data),
    update: (id, data) => api.put(`/v1/daily-inquiries/${id}`, data),
    delete: (id) => api.delete(`/v1/daily-inquiries/${id}`),
  },

  dailyFeedbackTask: {
    create: async (data) => {
      const payload = {
        customerId: data.customerId,
        invoiceId: data.invoiceId,
        invoiceDate: data.invoiceDate,
      };

      try {
        const result = await api.post(
          '/v1/daily-feedback-tasks/feedback-tasks',
          payload
        );
        console.log('✅ مهمة تقييم أضيفت بنجاح:', result);
        return result;
      } catch (error) {
        console.error('❌ فشل إضافة مهمة:', error);
        throw new Error(error.message || 'فشل في إضافة المهمة');
      }
    },

    delete: async (invoiceId) => {
      try {
        await api.delete(`/v1/daily-feedback-tasks/${invoiceId}`);
        console.log('🗑️ مهمة حذفت بنجاح:', invoiceId);
      } catch (error) {
        console.error('❌ فشل حذف المهمة:', error);
        throw new Error(error.message || 'فشل حذف المهمة');
      }
    },
  },

  product: {
    create: (d) => Promise.resolve(),
    update: (id, d) => Promise.resolve(),
    delete: (id) => Promise.resolve(),
  },
  branch: {
    create: (d) => Promise.resolve(),
    update: (id, d) => Promise.resolve(),
    delete: (id) => Promise.resolve(),
  },
  followUpTask: {
    create: (d) => Promise.resolve(),
    update: (id, d) => Promise.resolve(),
    delete: (id) => Promise.resolve(),
  },
  activityLog: {
    create: (d) => Promise.resolve(),
    update: (id, d) => Promise.resolve(),
    delete: (id) => Promise.resolve(),
  },
  settings: { update: (s) => api.post('/v1/settings', s) },
  onUpdate: () => () => {},
};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App, null))
);
