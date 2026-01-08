import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userName: { type: String, required: true, unique: true }, // متطابق مع Backend model
  password: { type: String, required: true },
  role: { type: String, required: true },
  phone: String,
  email: String,
  lastModified: String,
  version: { type: Number, default: 1 }
});

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  joinDate: String,
  type: String,
  governorate: String,
  streetAddress: String,
  classification: String,
  points: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  totalPointsUsed: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  lastPurchaseDate: String,
  hasBadReputation: { type: Boolean, default: false },
  source: String,
  primaryBranchId: String,
  log: [{
    invoiceId: String,
    date: String,
    details: String,
    status: String,
    feedback: Number,
    pointsChange: Number,
    amount: Number
  }],
  impressions: [{
    id: String,
    date: String,
    recordedByUserId: String,
    recordedByUserName: String,
    productQualityRating: Number,
    productQualityNotes: String,
    branchExperienceRating: Number,
    branchExperienceNotes: String,
    discoveryChannel: String,
    isFirstVisit: Boolean,
    relatedInvoiceIds: [String],
    branchId: String,
    visitTime: String
  }],
  lastModified: String,
  version: { type: Number, default: 1 }
});

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  customerId: String,
  customerName: String,
  dateOpened: String,
  channel: String,
  type: String,
  priority: String,
  status: String,
  description: String,
  assignedTo: String,
  resolutionNotes: String,
  dateClosed: String,
  log: [{
    user: String,
    date: String,
    action: String
  }],
  productId: String,
  productColor: String,
  productSize: String,
  attachments: [String],
  lastModified: String,
  version: { type: Number, default: 1 }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: String,
  name: String,
  price: Number,
  cost: Number,
  points: Number,
  alertLimit: Number,
  variations: [{
    id: String,
    colorName: String,
    image: String,
    stock: {
      M: Number,
      L: Number,
      XL: Number,
      XXL: Number
    }
  }],
  lastModified: String,
  version: { type: Number, default: 1 }
});

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  location: String,
  lastModified: String,
  version: { type: Number, default: 1 }
});

const dailyInquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  date: String,
  productInquiry: String,
  customerGovernorate: String,
  lastModified: String,
  version: { type: Number, default: 1 }
});

const followUpTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: String,
  customerName: String,
  dateCreated: String,
  reason: String,
  details: String,
  status: String,
  assignedTo: String,
  resolutionNotes: String,
  lastModified: String,
  version: { type: Number, default: 1 }
});

const dailyFeedbackTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerId: String,
  customerName: String,
  invoiceId: String,
  invoiceDate: String,
  status: String,
  lastModified: String,
  version: { type: Number, default: 1 }
});

const activityLogSchema = new mongoose.Schema({
  id: { type: String, required: false }, // Optional ID
  userId: String,
  userName: String,
  timestamp: String,
  type: String,
  details: String,
  duration: Number,
  version: { type: Number, default: 1 }
});

const systemSettingsSchema = new mongoose.Schema({
  pointValue: Number,
  importSpend: Number,
  importPoints: Number,
  classification: {
    silver: Number,
    gold: Number,
    platinum: Number
  },
  companyName: String,
  companyLogo: String,
  emailJsServiceId: String,
  emailJsTemplateId: String,
  emailJsPublicKey: String,
  systemEmail: String,
  complaintTypes: [String]
});

const themeSettingsSchema = new mongoose.Schema({
  colors: {
    primary: String,
    secondary: String,
    accent: String,
    accent2: String,
    danger: String,
    warning: String,
    info: String,
    background: String,
    surface: String,
    textPrimary: String,
    textSecondary: String,
    sidebarBackground: String,
    sidebarText: String,
    sidebarActiveBackground: String,
    sidebarLinkText: String,
    badgeSuccessBg: String,
    badgeSuccessText: String,
    badgeWarningBg: String,
    badgeWarningText: String,
    badgeDangerBg: String,
    badgeDangerText: String,
    badgeInfoBg: String,
    badgeInfoText: String,
    badgeMutedBg: String,
    badgeMutedText: String,
    badgePendingBg: String,
    badgePendingText: String,
    border: String,
    backgroundMuted: String,
    tableHeaderBg: String,
    tableHeaderText: String,
    link: String,
    textDisabled: String,
    badgeGoldBg: String,
    badgeGoldText: String
  },
  font: String
});

export const User = mongoose.model('User', userSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Complaint = mongoose.model('Complaint', complaintSchema);
export const Product = mongoose.model('Product', productSchema);
export const Branch = mongoose.model('Branch', branchSchema);
export const DailyInquiry = mongoose.model('DailyInquiry', dailyInquirySchema);
export const FollowUpTask = mongoose.model('FollowUpTask', followUpTaskSchema);
export const DailyFeedbackTask = mongoose.model('DailyFeedbackTask', dailyFeedbackTaskSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export const ThemeSettings = mongoose.model('ThemeSettings', themeSettingsSchema);