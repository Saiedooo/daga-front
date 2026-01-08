import React from 'react';
import { Page, User, UserRole } from '../types';
import {
  DashboardIcon,
  ComplaintIcon,
  CustomerIcon,
  ReportIcon,
  SettingsIcon,
  ProductIcon,
  ActivityLogIcon,
  InquiryIcon,
  UsersIcon,
  BranchIcon,
  FollowUpIcon,
  FeedbackIcon,
} from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  currentUser: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  isOpen,
  setIsOpen,
}) => {
  const handleNavigation = (page: Page) => {
  console.log('navigate to', page);
  setActivePage(page);
  if (window.innerWidth < 768) {
    setIsOpen(false);
  }
};

  const getMenuItems = (role: UserRole | string | undefined | null) => {
    const staffItems = [
      { id: 'dashboard' as Page, label: 'لوحة التحكم', icon: DashboardIcon },
      { id: 'complaints' as Page, label: 'سجل الشكاوى', icon: ComplaintIcon },
      {
        id: 'dailyInquiries' as Page,
        label: 'سجل الاستفسارات',
        icon: InquiryIcon,
      },
      { id: 'settings' as Page, label: 'الإعدادات', icon: SettingsIcon },
    ];

    const moderatorItems = [
      { id: 'complaints' as Page, label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers' as Page, label: 'إدارة العملاء', icon: CustomerIcon },
      {
        id: 'dailyFeedback' as Page,
        label: 'التقييمات اليومية',
        icon: FeedbackIcon,
      },
      {
        id: 'dailyInquiries' as Page,
        label: 'سجل الاستفسارات',
        icon: InquiryIcon,
      },
      { id: 'settings' as Page, label: 'الإعدادات', icon: SettingsIcon },
    ];

    const teamLeaderItems = [
      { id: 'dashboard' as Page, label: 'لوحة التحكم', icon: DashboardIcon },
      { id: 'complaints' as Page, label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers' as Page, label: 'إدارة العملاء', icon: CustomerIcon },
      {
        id: 'dailyFeedback' as Page,
        label: 'التقييمات اليومية',
        icon: FeedbackIcon,
      },
      { id: 'users' as Page, label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'followUp' as Page, label: 'مهام المتابعة', icon: FollowUpIcon },
      {
        id: 'dailyInquiries' as Page,
        label: 'سجل الاستفسارات',
        icon: InquiryIcon,
      },
      { id: 'settings' as Page, label: 'الإعدادات', icon: SettingsIcon },
    ];

    const accountsManagerItems = [
      {
        id: 'managerDashboard' as Page,
        label: 'لوحة تحكم المدير',
        icon: DashboardIcon,
      },
      { id: 'complaints' as Page, label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers' as Page, label: 'إدارة العملاء', icon: CustomerIcon },
      {
        id: 'dailyFeedback' as Page,
        label: 'التقييمات اليومية',
        icon: FeedbackIcon,
      },
      { id: 'users' as Page, label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'reports' as Page, label: 'التقارير', icon: ReportIcon },
      { id: 'branches' as Page, label: 'تقارير الفروع', icon: BranchIcon },
      { id: 'followUp' as Page, label: 'مهام المتابعة', icon: FollowUpIcon },
      {
        id: 'activityLog' as Page,
        label: 'شيت تقارير اليوم',
        icon: ActivityLogIcon,
      },
      { id: 'products' as Page, label: 'المخزون', icon: ProductIcon },
      { id: 'settings' as Page, label: 'الإعدادات', icon: SettingsIcon },
    ];

    const generalManagerItems = [
      {
        id: 'managerDashboard' as Page,
        label: 'لوحة تحكم المدير',
        icon: DashboardIcon,
      },
      { id: 'complaints' as Page, label: 'سجل الشكاوى', icon: ComplaintIcon },
      { id: 'customers' as Page, label: 'إدارة العملاء', icon: CustomerIcon },
      {
        id: 'dailyFeedback' as Page,
        label: 'التقييمات اليومية',
        icon: FeedbackIcon,
      },
      { id: 'users' as Page, label: 'ملفات الموظفين', icon: UsersIcon },
      { id: 'reports' as Page, label: 'التقارير', icon: ReportIcon },
      { id: 'branches' as Page, label: 'تقارير الفروع', icon: BranchIcon },
      { id: 'followUp' as Page, label: 'مهام المتابعة', icon: FollowUpIcon },
      {
        id: 'activityLog' as Page,
        label: 'شيت تقارير اليوم',
        icon: ActivityLogIcon,
      },
      { id: 'products' as Page, label: 'المخزون', icon: ProductIcon },
      { id: 'settings' as Page, label: 'الإعدادات', icon: SettingsIcon },
    ];

    const normalizedRole = role as UserRole;

    switch (normalizedRole) {
      case UserRole.GeneralManager:
        return generalManagerItems;
      case UserRole.AccountsManager:
        return accountsManagerItems;
      case UserRole.TeamLeader:
        return teamLeaderItems;
      case UserRole.Moderator:
        return moderatorItems;
      case UserRole.Staff:
        return staffItems;
      default:
        return generalManagerItems;
    }
  };

  const menuItems = getMenuItems(currentUser.role);

  const getRoleLabel = (role: UserRole | string): string => {
    const roleMap: Record<string, string> = {
      GeneralManager: 'مدير عام',
      AccountsManager: 'مدير حسابات',
      TeamLeader: 'قائد فريق',
      Moderator: 'مشرف',
      Staff: 'موظف',
    };

    if (!role) return 'غير محدد';

    const roleStr = String(role);
    return roleMap[roleStr] || roleStr;
  };

  return (
    <div
      className={`w-64 bg-sidebar-background text-sidebar-text p-4 flex flex-col fixed right-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } md:translate-x-0 top-0 h-screen overflow-hidden`}
    >
      <div className="text-2xl font-bold mb-6 text-center pt-8">
        نظام الشكاوى
      </div>
      <nav className="flex-1 overflow-y-auto min-h-0 mb-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-2">
              <button
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors relative ${
                  activePage === item.id
                    ? 'bg-sidebar-active-background text-white'
                    : 'hover:bg-sidebar-active-background/50'
                }`}
              >
                {activePage === item.id && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-white rounded-r-full"></div>
                )}
                <item.icon className="w-6 h-6 ml-3" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-4 border-t border-sidebar-text/20 flex-shrink-0 pb-4">
        <div className="p-3 rounded-lg bg-sidebar-active-background/50 border border-sidebar-text/10">
          <div className="text-sm font-semibold text-sidebar-text mb-1 truncate">
            {currentUser?.name || 'مستخدم'}
          </div>
          <div className="text-xs text-sidebar-text/80 font-medium">
            {getRoleLabel(currentUser.role)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
