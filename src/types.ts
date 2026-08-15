export interface UserAccount {
  id: string;
  nom: string;
  prenom: string;
  phoneMobileMoney: string;
  pinCode: string; // 4 chiffres
  credits: number;
  createdAt: string;
  isAdmin?: boolean;
}

export interface MobileMoneyOperator {
  id: string;
  name: string;
  icon: string;
  color: string;
  merchantCode: string;
  ussdTemplate: string;
  description: string;
  active: boolean;
}

export interface AdminSettings {
  promoModeFree: boolean; // Mode promotionnel gratuit
  rateFcfaPerMinute: number; // 5f cfa par défaut
  merchantCodes: MobileMoneyOperator[];
  adminPin: string;
  totalWorkMinutesLogged: number;
  totalRevenueFcfa: number;
}

export type StepId =
  | "conception"
  | "research"
  | "code_generation"
  | "security_audit"
  | "apk_generation"
  | "checkpoint"
  | "web_deployment"
  | "hosting_setup"
  | "store_publish";

export interface StepInfo {
  id: StepId;
  title: string;
  subtitle: string;
  aiRole: "developer" | "researcher" | "controller" | "user";
  icon: string;
  status: "pending" | "in_progress" | "completed" | "paused";
}

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
  description?: string;
}

export interface ProjectVersion {
  id: string;
  versionTag: string;
  timestamp: string;
  summary: string;
  author: string;
  filesCount: number;
}

export interface SecurityAuditCheck {
  category: string;
  name: string;
  status: "passed" | "warning" | "failed";
  detail: string;
}

export interface SecurityAuditData {
  globalScore: number;
  securityStatus: "Sécurisé" | "Attention" | "Critique";
  performanceScore: number;
  accessibilityScore: number;
  mobileReadinessScore: number;
  testsPassedCount: number;
  totalTestsCount: number;
  auditChecks: SecurityAuditCheck[];
  recommendations: string[];
}

export interface ResearchData {
  enhancedTitle: string;
  summary: string;
  keyFeatures: string[];
  suggestedTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPairing: string;
    designStyle: string;
  };
  freeResources: {
    icons: string;
    fonts: string;
    illustrations: string;
    cdnLibraries: string[];
  };
  accessibilityTips: string[];
  competitiveAdvantage: string;
}

export interface GitHubExportConfig {
  personalAccessToken?: string;
  username?: string;
  repoName?: string;
  isPrivate?: boolean;
  branch?: string;
  lastExportedAt?: string;
  lastExportUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "ecommerce" | "delivery" | "service" | "fintech" | "showcase" | "health" | "education" | "custom";
  targetType: "mobile_app" | "website" | "both";
  createdAt: string;
  updatedAt: string;
  currentStepId: StepId;
  stepProgress: number;
  isCheckpointReached: boolean;
  userDecisionAfterApk: "pending" | "continue" | "stay_apk";
  interactiveAppHtml: string;
  files: ProjectFile[];
  versions: ProjectVersion[];
  researchData?: ResearchData;
  securityAudit?: SecurityAuditData;
  apkBundleConfig: {
    packageName: string;
    versionCode: number;
    versionName: string;
    apkSizeMb: string;
    aabSizeMb: string;
    sha256: string;
    generatedAt: string;
    qrData: string;
  };
  webDeployment: {
    liveUrl: string;
    subdomain: string;
    status: "offline" | "deployed";
    deployedAt?: string;
    ssl: boolean;
  };
  hostingOptions: {
    provider: string;
    name: string;
    url: string;
    isFree: boolean;
    tier: string;
    features: string[];
    setupGuide: string;
  }[];
  documentation: string;
  githubConfig?: GitHubExportConfig;
  totalTimeSpentMinutes: number;
  totalCostFcfa: number;
  chatHistory: {
    id: string;
    role: "user" | "developer" | "researcher" | "controller";
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}
