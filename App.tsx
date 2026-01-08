import React, { useState, useEffect, useCallback } from 'react';
import { Page, User, AppState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ComplaintsLog from './pages/ComplaintsLog';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DailyFeedback from './pages/DailyFeedback';
import DailyInquiries from './pages/DailyInquiries';
import LoginPage from './pages/LoginPage';
import NotificationToast from './components/NotificationToast';
import { MenuIcon, LogoutIcon } from './components/icons';

const getDefaultState = (): AppState => ({
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
    companyName: 'جاري التحميل...',
    complaintTypes: [],
    pointValue: 1,
    classification: { silver: 1000, gold: 5000, platinum: 10000 },
  } as any,
  theme: { colors: {} } as any,
});

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('complaints');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(getDefaultState());
  const [, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const fetchData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await window.electron.getInitialData();
      setState(data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      const fallbackState = getDefaultState();
      fallbackState.systemSettings.companyName = 'نظام ضجة (وضع عدم الاتصال)';
      setState(fallbackState);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) return;

    const validateAndRestoreSession = async () => {
      const authToken = window.electron.auth.getToken();
      const savedUser = localStorage.getItem('last_user');

      if (!authToken || !savedUser) {
        if (savedUser && !authToken) localStorage.removeItem('last_user');
        setCurrentUser(null);
        await fetchData(true);
        setIsInitialized(true);
        return;
      }

      const isValid = await window.electron.auth.validateToken();

      if (isValid) {
        setCurrentUser(JSON.parse(savedUser));
        await fetchData(true);
      } else {
        console.log('Token validation failed - clearing session');
        window.electron.auth.logout();
        setCurrentUser(null);
        await fetchData(true);
      }
      setIsInitialized(true);
    };

    validateAndRestoreSession();
  }, []);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setNotification({ message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('last_user', JSON.stringify(user));
    fetchData(false);
  };

  const handleLogout = () => {
    window.electron.auth.logout();
    setCurrentUser(null);
    localStorage.removeItem('last_user');
  };

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    if (!state || !currentUser) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      );
    }

    try {
      if (selectedCustomerId) {
        const customer = state.customers.find(
          (c) => c.id === selectedCustomerId
        );
        if (customer) {
          return (
            <CustomerProfile
              customer={customer}
              complaints={state.complaints.filter(
                (c) => c.customerId === customer.id
              )}
              branches={state.branches}
              onBack={() => setSelectedCustomerId(null)}
              onUpdateCustomer={() => fetchData(false)}
              onSaveImpression={() => fetchData(false)}
              systemSettings={state.systemSettings}
              currentUser={currentUser}
              showNotification={showNotification}
            />
          );
        } else {
          console.warn('Customer not found for ID:', selectedCustomerId);
          return (
            <Customers
              customers={state.customers}
              currentUser={currentUser}
              onViewCustomer={setSelectedCustomerId}
              logUserAction={() => {}}
              showNotification={showNotification}
              onRefresh={() => fetchData(false)}
            />
          );
        }
      }

      // التأكيد: complaints يفتح ComplaintsLog
      switch (activePage) {
        case 'dashboard':
          return (
            <Dashboard complaints={state.complaints} users={state.users} />
          );
        case 'complaints':
          return (
            <ComplaintsLog
              complaints={state.complaints}
              users={state.users}
              customers={state.customers}
              products={state.products}
              currentUser={currentUser}
              showNotification={showNotification}
              logUserAction={() => {}}
              onTriggerNotification={() => {}}
              onViewCustomer={setSelectedCustomerId}
              systemSettings={state.systemSettings}
              onRefresh={() => fetchData(false)}
            />
          );
        case 'customers':
          return (
            <Customers
              customers={state.customers}
              currentUser={currentUser}
              onViewCustomer={setSelectedCustomerId}
              logUserAction={() => {}}
              showNotification={showNotification}
              onRefresh={() => fetchData(false)}
            />
          );
        case 'dailyInquiries':
          return (
            <DailyInquiries
              inquiries={state.dailyInquiries}
              currentUser={currentUser}
              logUserAction={() => {}}
              showNotification={showNotification}
              onRefresh={() => fetchData(false)}
            />
          );
        case 'dailyFeedback':
          return (
            <DailyFeedback
              tasks={state.dailyFeedbackTasks}
              customers={state.customers}
              currentUser={currentUser}
              branches={state.branches}
              onViewCustomer={setSelectedCustomerId}
              showNotification={showNotification}
              onRefresh={() => fetchData(false)}
            />
          );
        case 'reports':
          return (
            <Reports
              complaints={state.complaints}
              users={state.users}
              customers={state.customers}
              dailyInquiries={state.dailyInquiries}
            />
          );
        case 'settings':
          return (
            <Settings
              currentUser={currentUser}
              users={state.users}
              customers={state.customers}
              complaints={state.complaints}
              branches={state.branches}
              setActivePage={setActivePage}
              systemSettings={state.systemSettings}
              logUserAction={() => {}}
              theme={state.theme}
              defaultTheme={state.theme}
              showNotification={showNotification}
              onRefresh={() => fetchData(false)}
            />
          );
        default:
          return (
            <Dashboard complaints={state.complaints} users={state.users} />
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            خطأ في تحميل الصفحة
          </h2>
          <p className="text-gray-600 mb-4">
            حدث خطأ أثناء محاولة تحميل الصفحة. يرجى المحاولة مرة أخرى.
          </p>
          <button
            onClick={() => {
              setActivePage('dashboard');
              fetchData();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans" dir="rtl">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-grow flex flex-col md:mr-64 transition-all duration-300">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="text-right">
              <h2 className="font-bold text-gray-800">
                مرحباً، {currentUser.name}
              </h2>
              <p className="text-[10px] text-gray-400">
                {state.systemSettings.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-4 md:p-8">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
