
// FIX: Import types from types.ts to ensure dummy implementations match the expected API structure
import { AppState, User, SystemSettings, ThemeSettings } from '../types';

// Remote-only configuration. Local DB bypassed.
// FIX: Explicitly defined return type as Promise<AppState> and provided default empty arrays/objects to satisfy the type checker
export const getInitialData = async (): Promise<AppState> => ({
    users: [],
    customers: [],
    complaints: [],
    products: [],
    dailyInquiries: [],
    branches: [],
    followUpTasks: [],
    dailyFeedbackTasks: [],
    activityLog: [],
    systemSettings: {} as SystemSettings,
    theme: {} as ThemeSettings
});

// FIX: Implemented dummy auth methods matching the ElectronApi signature
export const authService = {
    login: async (username: string, password: string) => ({ user: {} as User, token: '' }),
    logout: () => {},
    getToken: () => null
};

// FIX: Created a reusable dummy CRUD object that satisfies the CrudApi<T> interface
const dummyCrud = {
    create: async (data: any) => {},
    update: async (id: string, data: any) => {},
    delete: async (id: string) => {}
};

export const complaintService = dummyCrud;
export const customerService = dummyCrud;
export const productService = dummyCrud;
export const branchService = dummyCrud;
export const userService = dummyCrud;
export const followUpTaskService = dummyCrud;
export const dailyInquiryService = dummyCrud;
export const dailyFeedbackTaskService = dummyCrud;
export const activityLogService = dummyCrud;

// FIX: Implemented settings update method matching the ElectronApi signature
export const settingsService = {
    update: (settings: { systemSettings?: SystemSettings, theme?: ThemeSettings }) => {}
};
