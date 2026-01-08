
export type ElectronApi = {
  getInitialData: () => Promise<AppState>;
  auth: {
    login: (username: string, password: string) => Promise<{ user: User; token: string }>;
    logout: () => void;
    getToken: () => string | null;
    validateToken: () => Promise<boolean>;
  };
  onUpdate: (callback: (event: string, payload: any) => void) => () => void;
  complaint: CrudApi<Complaint>;
  customer: CrudApi<Customer>;
  product: CrudApi<Product>;
  branch: CrudApi<Branch>;
  followUpTask: CrudApi<FollowUpTask>;
  dailyInquiry: CrudApi<DailyInquiry>;
  dailyFeedbackTask: CrudApi<DailyFeedbackTask>;
  user: CrudApi<User>;
  activityLog: CrudApi<ActivityLogEntry>;
  settings: {
      update: (settings: { systemSettings?: SystemSettings, theme?: ThemeSettings }) => void;
  }
}

export type CrudApi<T> = {
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export type ComplaintLogEntry = {
  user: string;
  date: string;
  action: string;
}

export const ComplaintStatus = {
  Open: 'مفتوحة',
  InProgress: 'قيد المراجعة',
  PendingCustomer: 'في انتظار رد العميل',
  Resolved: 'تم الحل',
  Escalated: 'مُصعَّدة',
} as const;
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

export const ComplaintPriority = {
  Normal: 'عادية',
  Medium: 'متوسطة',
  Urgent: 'عاجلة',
} as const;
export type ComplaintPriority = typeof ComplaintPriority[keyof typeof ComplaintPriority];

export const UserRole = {
  GeneralManager: 'GeneralManager',
  AccountsManager: 'AccountsManager',
  TeamLeader: 'TeamLeader',
  Moderator: 'Moderator',
  Staff: 'Staff',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const CustomerType = {
  Corporate: 'Corporate',
  Normal: 'Normal',
} as const;
export type CustomerType = typeof CustomerType[keyof typeof CustomerType];

export const CustomerClassification = {
    Bronze: 'Bronze',
    Silver: 'Silver',
    Gold: 'Gold',
    Platinum: 'Platinum',
} as const;
export type CustomerClassification = typeof CustomerClassification[keyof typeof CustomerClassification];

export const OrderStatus = {
    Pending: 'Pending',
    Processing: 'Processing',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Returned: 'Returned',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const ComplaintChannel = {
    Facebook: 'فيسبوك',
    WhatsApp: 'واتساب',
    Phone: 'هاتف',
    Email: 'بريد إلكتروني',
    Website: 'الموقع الإلكتروني',
} as const;
export type ComplaintChannel = typeof ComplaintChannel[keyof typeof ComplaintChannel];

export const DiscoveryChannel = {
    Facebook: 'Facebook',
    Instagram: 'Instagram',
    Google: 'Google',
    Friends: 'Friends',
    Street: 'Street',
    Other: 'Other',
} as const;
export type DiscoveryChannel = typeof DiscoveryChannel[keyof typeof DiscoveryChannel];

export const FollowUpStatus = {
    Pending: 'Pending',
    Done: 'Done',
} as const;
export type FollowUpStatus = typeof FollowUpStatus[keyof typeof FollowUpStatus];

export const DailyFeedbackStatus = {
    Pending: 'Pending',
    Completed: 'Completed',
} as const;
export type DailyFeedbackStatus = typeof DailyFeedbackStatus[keyof typeof DailyFeedbackStatus];

export type User = {
  id: string;
  name: string;
  userName: string; // متطابق مع Backend model
  password?: string;
  role: UserRole;
  phone?: string;
  email?: string;
  lastModified?: string;
  version?: number;
}

export type Branch = {
    id: string;
    name: string;
    location: string;
    lastModified?: string;
    version?: number;
}

export type CustomerLogEntry = {
    invoiceId: string;
    date: string;
    details: string;
    status: OrderStatus;
    feedback: number | null;
    pointsChange: number;
    amount: number;
}

export type CustomerImpression = {
    id: string;
    date: string;
    recordedByUserId: string;
    recordedByUserName: string;
    productQualityRating: number;
    productQualityNotes?: string;
    branchExperienceRating: number;
    branchExperienceNotes?: string;
    discoveryChannel: DiscoveryChannel;
    isFirstVisit: boolean;
    relatedInvoiceIds?: string[];
    branchId: string;
    visitTime?: string;
}

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joinDate: string;
  type: CustomerType;
  governorate: string;
  streetAddress?: string;
  gender?: 'male' | 'female';
  classification: CustomerClassification;
  points: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
  totalPurchases: number;
  purchaseCount: number;
  lastPurchaseDate: string | null;
  hasBadReputation: boolean;
  source: string;
  primaryBranchId?: string;
  log: CustomerLogEntry[];
  impressions: CustomerImpression[];
  lastModified?: string;
  version?: number;
}

export type Complaint = {
  complaintId?: string; // Optional - backend will generate if not provided
  customerId: string;
  customerName: string;
  customerEmail?: string; // Added to match backend
  customerPhone?: string; // Added to match backend
  dateOpened?: string; // Optional - backend can set it
  channel: ComplaintChannel;
  type: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  complaintText?: string; // Added for backend mapping (maps to description)
  assignedTo?: string;
  resolutionNotes?: string;
  dateClosed: string | null;
  log: ComplaintLogEntry[];
  productId?: string;
  productColor?: string;
  productSize?: string;
  attachments?: string[];
  lastModified?: string;
  version?: number;
}

export type ProductVariation = {
    id: string;
    colorName: string;
    image: string;
    stock: ProductStock;
}

export type ProductStock = {
    M: number;
    L: number;
    XL: number;
    XXL: number;
}

export type Product = {
    id: string;
    code: string;
    name: string;
    price: number;
    cost: number;
    points: number;
    alertLimit: number;
    variations: ProductVariation[];
    lastModified?: string;
    version?: number;
}

export type DailyInquiry = {
    id: string;
    userId: string;
    userName: string;
    date: string;
    productInquiry: string;
    customerGovernorate: string;
    lastModified?: string;
    version?: number;
}

export type FollowUpTask = {
    id: string;
    customerId: string;
    customerName: string;
    dateCreated: string;
    reason: string;
    details: string;
    status: FollowUpStatus;
    assignedTo?: string;
    resolutionNotes?: string;
    lastModified?: string;
    version?: number;
}

export type DailyFeedbackTask = {
    id: string;
    customerId: string;
    customerName: string;
    invoiceId: string;
    invoiceDate: string;
    status: DailyFeedbackStatus;
    lastModified?: string;
    version?: number;
}

export type ActivityLogEntry = {
    id?: string;
    userId: string;
    userName: string;
    timestamp: string;
    type: 'LOGIN' | 'LOGOUT' | 'ACTION';
    details: string;
    duration?: number;
    version?: number;
}

export type SystemSettings = {
    pointValue: number;
    importSpend: number;
    importPoints: number;
    classification: {
        silver: number;
        gold: number;
        platinum: number;
    };
    companyName: string;
    companyLogo: string;
    emailJsServiceId: string;
    emailJsTemplateId: string;
    emailJsPublicKey: string;
    systemEmail: string;
    complaintTypes: string[];
}

export type ThemeSettings = {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        accent2: string;
        danger: string;
        warning: string;
        info: string;
        background: string;
        surface: string;
        textPrimary: string;
        textSecondary: string;
        sidebarBackground: string;
        sidebarText: string;
        sidebarActiveBackground: string;
        sidebarLinkText: string;
        badgeSuccessBg: string;
        badgeSuccessText: string;
        badgeWarningBg: string;
        badgeWarningText: string;
        badgeDangerBg: string;
        badgeDangerText: string;
        badgeInfoBg: string;
        badgeInfoText: string;
        badgeMutedBg: string;
        badgeMutedText: string;
        badgePendingBg: string;
        badgePendingText: string;
        border: string;
        backgroundMuted: string;
        tableHeaderBg: string;
        tableHeaderText: string;
        link: string;
        textDisabled: string;
        badgeGoldBg: string;
        badgeGoldText: string;
    };
    font: string;
}

export type AppState = {
    users: User[];
    customers: Customer[];
    complaints: Complaint[];
    products: Product[];
    dailyInquiries: DailyInquiry[];
    branches: Branch[];
    followUpTasks: FollowUpTask[];
    dailyFeedbackTasks: DailyFeedbackTask[];
    activityLog: ActivityLogEntry[];
    systemSettings: SystemSettings;
    theme: ThemeSettings;
}

export type Page = 
    | 'dashboard' 
    | 'complaints' 
    | 'customers' 
    | 'reports' 
    | 'settings' 
    | 'managerDashboard' 
    | 'products' 
    | 'activityLog' 
    | 'dailyInquiries' 
    | 'users' 
    | 'branches' 
    | 'followUp' 
    | 'dailyFeedback';

declare global {
  interface Window {
    electron: ElectronApi;
  }
}
