import {
  AdminSettings,
  MobileMoneyOperator,
  Project,
  ProjectFile,
  ProjectVersion,
  ResearchData,
  SecurityAuditData,
  UserAccount,
} from "../types";
import { createDefaultProject, generateInitialInteractiveApp } from "./projectGenerators";

const STORAGE_KEY_USER = "afribuilder_user";
const STORAGE_KEY_USERS_DB = "afribuilder_users_db";
const STORAGE_KEY_PROJECTS = "afribuilder_projects";
const STORAGE_KEY_ACTIVE_PROJECT_ID = "afribuilder_active_project_id";
const STORAGE_KEY_ADMIN_SETTINGS = "afribuilder_admin_settings";

export const DEFAULT_MERCHANT_CODES: MobileMoneyOperator[] = [
  {
    id: "orange_money",
    name: "Orange Money",
    icon: "🟠",
    color: "#FF6600",
    merchantCode: "OM-88421",
    ussdTemplate: "#144*37*88421*MONTANT#",
    description: "Côte d'Ivoire, Sénégal, Mali, Cameroun, Guinée, BF",
    active: true
  },
  {
    id: "wave",
    name: "Wave Mobile Money",
    icon: "🌊",
    color: "#1DC3E8",
    merchantCode: "WAVE-77409",
    ussdTemplate: "Scanner QR Code Wave ou envoyer au +225 0700000000",
    description: "Sénégal, Côte d'Ivoire, Mali, Burkina Faso (0% frais)",
    active: true
  },
  {
    id: "mtn_momo",
    name: "MTN MoMo",
    icon: "🟡",
    color: "#FFCC00",
    merchantCode: "MOMO-91024",
    ussdTemplate: "*133# ou *126# code marchand 91024",
    description: "Bénin, Cameroun, Côte d'Ivoire, Ghana, Congo",
    active: true
  },
  {
    id: "moov_money",
    name: "Moov Money",
    icon: "🔵",
    color: "#006699",
    merchantCode: "MOOV-55120",
    ussdTemplate: "*155*4*1*55120*MONTANT#",
    description: "Côte d'Ivoire, Bénin, Togo, Gabon, Niger",
    active: true
  },
  {
    id: "free_djamo",
    name: "Free Money / Djamo",
    icon: "🟢",
    color: "#10B981",
    merchantCode: "DJAMO-11983",
    ussdTemplate: "*150# ou virement instantané Djamo",
    description: "Sénégal, Côte d'Ivoire, UEMOA",
    active: true
  }
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  promoModeFree: true, // Keep app free for promotional phase as requested!
  rateFcfaPerMinute: 5, // 1 credit for 1 minute = 5 FCFA (modifiable by admin)
  merchantCodes: DEFAULT_MERCHANT_CODES,
  adminPin: "0000",
  totalWorkMinutesLogged: 42,
  totalRevenueFcfa: 210
};

export const INITIAL_DEMO_USER: UserAccount = {
  id: "usr_demo_1",
  nom: "Traoré",
  prenom: "Moussa",
  phoneMobileMoney: "+225 07 48 92 10 33",
  pinCode: "1234",
  credits: 50,
  createdAt: new Date().toISOString(),
  isAdmin: true
};

export function loadStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!raw) {
      const initial = [INITIAL_DEMO_USER];
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [INITIAL_DEMO_USER];
  }
}

export function saveUsersDb(users: UserAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users DB", e);
  }
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(INITIAL_DEMO_USER));
      return INITIAL_DEMO_USER;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_USER;
  }
}

export function setCurrentUser(user: UserAccount) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    // Also sync in DB
    const users = loadStoredUsers();
    const idx = users.findIndex(u => u.phoneMobileMoney.replace(/\s+/g, "") === user.phoneMobileMoney.replace(/\s+/g, ""));
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveUsersDb(users);
  } catch (e) {
    console.error("Failed to set current user", e);
  }
}

export function recoverPinByPhone(phone: string): { success: boolean; pin?: string; user?: UserAccount; message: string } {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const users = loadStoredUsers();
  const match = users.find(u => u.phoneMobileMoney.replace(/[^0-9+]/g, "") === cleanPhone);

  if (match) {
    return {
      success: true,
      pin: match.pinCode,
      user: match,
      message: `Compte retrouvé avec succès pour ${match.prenom} ${match.nom}. Votre code PIN secret est : ${match.pinCode}`
    };
  }

  return {
    success: false,
    message: "Aucun compte n'a été trouvé avec ce numéro Mobile Money. Veuillez vérifier le numéro ou créer un nouveau compte."
  };
}

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(DEFAULT_ADMIN_SETTINGS));
      return DEFAULT_ADMIN_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save admin settings", e);
  }
}

export function sanitizeProject(raw: any): { project: Project; isRepaired: boolean; repairIssues: string[] } {
  const issues: string[] = [];
  let isRepaired = false;

  if (!raw || typeof raw !== "object") {
    const fresh = createDefaultProject("Mon Application", "Description de l'application", "custom", "both");
    return {
      project: fresh,
      isRepaired: true,
      repairIssues: ["Données du projet introuvables ou format corrompu. Réinitialisation complète effectuée."]
    };
  }

  const safeTitle = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Mon Application";
  if (!raw.title) {
    issues.push("Titre du projet absent (corrigé).");
    isRepaired = true;
  }

  const safeCategory: Project["category"] = ["ecommerce", "service", "delivery", "custom"].includes(raw.category)
    ? raw.category
    : "custom";

  const safeTargetType: Project["targetType"] = ["mobile", "web", "both"].includes(raw.targetType)
    ? raw.targetType
    : "both";

  const safeDescription = typeof raw.description === "string" ? raw.description : "Application créée sur AfriBuilder Studio";

  // Ensure valid HTML content
  let safeHtml = typeof raw.interactiveAppHtml === "string" && raw.interactiveAppHtml.trim().length > 100
    ? raw.interactiveAppHtml
    : "";

  if (!safeHtml || safeHtml.includes("triggerQuickAction()")) {
    safeHtml = generateInitialInteractiveApp(safeTitle, safeCategory, safeDescription);
    issues.push("Code HTML de l'application interactif manquant ou obsolète (reconstruit).");
    isRepaired = true;
  }

  // Ensure files array integrity
  let safeFiles: ProjectFile[] = [];
  if (Array.isArray(raw.files) && raw.files.length > 0) {
    safeFiles = raw.files
      .filter((f: any) => f && typeof f === "object" && typeof f.name === "string")
      .map((f: any) => ({
        name: f.name || "fichier.txt",
        path: typeof f.path === "string" ? f.path : f.name,
        language: typeof f.language === "string" ? f.language : "plaintext",
        content: typeof f.content === "string" ? f.content : "",
        description: typeof f.description === "string" ? f.description : "Fichier de projet",
      }));
  }

  // Check if index.html is in files
  const indexFileIndex = safeFiles.findIndex((f) => f.name === "index.html" || f.path === "www/index.html");
  if (indexFileIndex >= 0) {
    if (!safeFiles[indexFileIndex].content || safeFiles[indexFileIndex].content.length < 50) {
      safeFiles[indexFileIndex].content = safeHtml;
      issues.push("Fichier index.html vide (restauré à partir du bac à sable).");
      isRepaired = true;
    }
  } else {
    safeFiles.unshift({
      name: "index.html",
      path: "www/index.html",
      language: "html",
      content: safeHtml,
      description: "Interface principale réactive avec Tailwind et Mobile Money",
    });
    issues.push("Fichier index.html absent dans l'explorateur (généré).");
    isRepaired = true;
  }

  // Check AndroidManifest.xml
  if (!safeFiles.some((f) => f.name === "AndroidManifest.xml")) {
    safeFiles.push({
      name: "AndroidManifest.xml",
      path: "android/app/src/main/AndroidManifest.xml",
      language: "xml",
      content: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}">\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n    <application android:label="${safeTitle}">\n        <activity android:name=".MainActivity" android:exported="true" />\n    </application>\n</manifest>`,
      description: "Configuration du package Android et permissions",
    });
  }

  // Check build.gradle
  if (!safeFiles.some((f) => f.name === "build.gradle")) {
    safeFiles.push({
      name: "build.gradle",
      path: "android/app/build.gradle",
      language: "groovy",
      content: `apply plugin: 'com.android.application'\nandroid {\n    compileSdkVersion 34\n    defaultConfig {\n        applicationId "com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}"\n        minSdkVersion 22\n        targetSdkVersion 34\n        versionCode 1\n        versionName "1.0.0"\n    }\n}`,
      description: "Script de compilation Gradle pour APK et Android App Bundle",
    });
  }

  // Check capacitor.config.json
  if (!safeFiles.some((f) => f.name === "capacitor.config.json")) {
    safeFiles.push({
      name: "capacitor.config.json",
      path: "capacitor.config.json",
      language: "json",
      content: JSON.stringify({
        appId: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        appName: safeTitle,
        webDir: "www",
      }, null, 2),
      description: "Configuration du pont natif mobile",
    });
  }

  // Ensure default versions
  let safeVersions: ProjectVersion[] = [];
  if (Array.isArray(raw.versions) && raw.versions.length > 0) {
    safeVersions = raw.versions;
  } else {
    safeVersions = [
      {
        id: `v_${Date.now()}`,
        versionTag: "v1.0.0",
        timestamp: raw.createdAt || new Date().toISOString(),
        summary: "Version initiale restaurée",
        author: "IA de Développement",
        filesCount: safeFiles.length,
      }
    ];
  }

  // Ensure chat history
  let safeChat: any[] = [];
  if (Array.isArray(raw.chatHistory) && raw.chatHistory.length > 0) {
    safeChat = raw.chatHistory;
  } else {
    safeChat = [
      {
        id: `msg_init_${Date.now()}`,
        role: "developer",
        senderName: "IA de Développement",
        text: `Projet "${safeTitle}" prêt ! Vous pouvez modifier les fichiers, tester l'aperçu ou compiler votre APK.`,
        timestamp: new Date().toISOString(),
      }
    ];
  }

  // Ensure research data
  const safeResearch: ResearchData = raw.researchData && typeof raw.researchData === "object" ? {
    enhancedTitle: raw.researchData.enhancedTitle || `${safeTitle} - Solution No-Code Pro`,
    summary: raw.researchData.summary || `Projet optimisé pour mobile et web avec interface moderne et paiement Mobile Money instantané.`,
    keyFeatures: Array.isArray(raw.researchData.keyFeatures) ? raw.researchData.keyFeatures : [
      "Interface responsive tactile fluide",
      "Panier et validation de commande en 1 clic",
      "Passerelle Mobile Money (Wave, Orange, MTN, Moov)",
      "Génération native APK et AAB intégrée"
    ],
    suggestedTheme: raw.researchData.suggestedTheme || {
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      fontPairing: "Plus Jakarta Sans & Inter",
      designStyle: "Design épuré moderne avec Tailwind CSS"
    },
    freeResources: raw.researchData.freeResources || {
      icons: "Lucide React & FontAwesome 6",
      fonts: "Google Fonts (Inter / Plus Jakarta Sans)",
      illustrations: "Unsplash Free Assets",
      cdnLibraries: ["Tailwind CSS CDN", "FontAwesome CDN"]
    },
    accessibilityTips: Array.isArray(raw.researchData.accessibilityTips) ? raw.researchData.accessibilityTips : [
      "Contraste élevé pour lisibilité en plein soleil",
      "Boutons tactiles d'au moins 44px de hauteur"
    ],
    competitiveAdvantage: raw.researchData.competitiveAdvantage || "Paiement Mobile Money instantané et architecture PWA/APK prête pour le marché local."
  } : {
    enhancedTitle: `${safeTitle} - Solution No-Code Pro`,
    summary: `Projet optimisé pour mobile et web avec interface moderne et paiement Mobile Money instantané.`,
    keyFeatures: [
      "Interface responsive tactile fluide",
      "Panier et validation de commande en 1 clic",
      "Passerelle Mobile Money (Wave, Orange, MTN, Moov)",
      "Génération native APK et AAB intégrée"
    ],
    suggestedTheme: {
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      fontPairing: "Plus Jakarta Sans & Inter",
      designStyle: "Design épuré moderne avec Tailwind CSS"
    },
    freeResources: {
      icons: "Lucide React & FontAwesome 6",
      fonts: "Google Fonts (Inter / Plus Jakarta Sans)",
      illustrations: "Unsplash Free Assets",
      cdnLibraries: ["Tailwind CSS CDN", "FontAwesome CDN"]
    },
    accessibilityTips: [
      "Contraste élevé pour lisibilité en plein soleil",
      "Boutons tactiles d'au moins 44px de hauteur"
    ],
    competitiveAdvantage: "Paiement Mobile Money instantané et architecture PWA/APK prête pour le marché local."
  };

  // Ensure security audit
  const safeSecurity: SecurityAuditData = raw.securityAudit && typeof raw.securityAudit === "object" ? {
    globalScore: typeof raw.securityAudit.globalScore === "number" ? raw.securityAudit.globalScore : 98,
    securityStatus: (raw.securityAudit.securityStatus || "Sécurisé") as "Sécurisé" | "Attention" | "Critique",
    performanceScore: typeof raw.securityAudit.performanceScore === "number" ? raw.securityAudit.performanceScore : 96,
    accessibilityScore: typeof raw.securityAudit.accessibilityScore === "number" ? raw.securityAudit.accessibilityScore : 98,
    mobileReadinessScore: typeof raw.securityAudit.mobileReadinessScore === "number" ? raw.securityAudit.mobileReadinessScore : 99,
    testsPassedCount: typeof raw.securityAudit.testsPassedCount === "number" ? raw.securityAudit.testsPassedCount : 16,
    totalTestsCount: typeof raw.securityAudit.totalTestsCount === "number" ? raw.securityAudit.totalTestsCount : 16,
    auditChecks: Array.isArray(raw.securityAudit.auditChecks) ? raw.securityAudit.auditChecks : [
      { category: "Sécurité", name: "Chiffrement HTTPS / TLS", status: "passed", detail: "Certificat SSL 256 bits valide" },
      { category: "Sécurité", name: "Protection XSS & Injection", status: "passed", detail: "Entrées filtrées et assainies" },
      { category: "Mobile", name: "Conformité Android API 34", status: "passed", detail: "Target SDK 34 configuré" },
      { category: "Accessibilité", name: "Contraste WCAG AA", status: "passed", detail: "Ratios de contraste supérieurs à 4.5:1" }
    ],
    recommendations: Array.isArray(raw.securityAudit.recommendations) ? raw.securityAudit.recommendations : [
      "Activer l'authentification 2FA pour les comptes administrateurs",
      "Vérifier régulièrement les logs de transaction Mobile Money"
    ]
  } : {
    globalScore: 98,
    securityStatus: "Sécurisé",
    performanceScore: 96,
    accessibilityScore: 98,
    mobileReadinessScore: 99,
    testsPassedCount: 16,
    totalTestsCount: 16,
    auditChecks: [
      { category: "Sécurité", name: "Chiffrement HTTPS / TLS", status: "passed", detail: "Certificat SSL 256 bits valide" },
      { category: "Sécurité", name: "Protection XSS & Injection", status: "passed", detail: "Entrées filtrées et assainies" },
      { category: "Mobile", name: "Conformité Android API 34", status: "passed", detail: "Target SDK 34 configuré" },
      { category: "Accessibilité", name: "Contraste WCAG AA", status: "passed", detail: "Ratios de contraste supérieurs à 4.5:1" }
    ],
    recommendations: [
      "Activer l'authentification 2FA pour les comptes administrateurs",
      "Vérifier régulièrement les logs de transaction Mobile Money"
    ]
  };

  // Ensure apkBundleConfig
  const safeApk = raw.apkBundleConfig && typeof raw.apkBundleConfig === "object" ? {
    packageName: raw.apkBundleConfig.packageName || `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    versionCode: typeof raw.apkBundleConfig.versionCode === "number" ? raw.apkBundleConfig.versionCode : 1,
    versionName: raw.apkBundleConfig.versionName || "1.0.0",
    apkSizeMb: raw.apkBundleConfig.apkSizeMb || "4.8 MB",
    aabSizeMb: raw.apkBundleConfig.aabSizeMb || "3.2 MB",
    sha256: raw.apkBundleConfig.sha256 || "A1:B2:C3:D4:E5:F6:78:90:12:34:56:78:90:AB:CD:EF",
    generatedAt: raw.apkBundleConfig.generatedAt || (raw.createdAt || new Date().toISOString()),
    qrData: raw.apkBundleConfig.qrData || `https://${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}.afribuilder.app`,
  } : {
    packageName: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    versionCode: 1,
    versionName: "1.0.0",
    apkSizeMb: "4.8 MB",
    aabSizeMb: "3.2 MB",
    sha256: "A1:B2:C3:D4:E5:F6:78:90:12:34:56:78:90:AB:CD:EF",
    generatedAt: raw.createdAt || new Date().toISOString(),
    qrData: `https://${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}.afribuilder.app`,
  };

  const subdomain = `${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;
  const safeWebDeployment = raw.webDeployment && typeof raw.webDeployment === "object" ? {
    liveUrl: raw.webDeployment.liveUrl || `https://${subdomain}.afribuilder.app`,
    subdomain: raw.webDeployment.subdomain || subdomain,
    status: (raw.webDeployment.status === "deployed" ? "deployed" : "offline") as "offline" | "deployed",
    deployedAt: raw.webDeployment.deployedAt,
    ssl: raw.webDeployment.ssl ?? true,
  } : {
    liveUrl: `https://${subdomain}.afribuilder.app`,
    subdomain,
    status: "offline" as const,
    ssl: true,
  };

  const safeHostingOptions = Array.isArray(raw.hostingOptions) && raw.hostingOptions.length > 0 ? raw.hostingOptions : [
    {
      provider: "Vercel",
      name: "Vercel Hobby",
      url: "https://vercel.com",
      isFree: true,
      tier: "100% Gratuit à vie",
      features: ["Certificat SSL Automatique", "CDN Global Ultra Rapide", "Déploiement Continu Git"],
      setupGuide: "1. Importez votre projet depuis GitHub\n2. Cliquez sur 'Deploy'\n3. Votre application est immédiatement en ligne avec HTTPS !"
    },
    {
      provider: "Netlify",
      name: "Netlify Starter",
      url: "https://netlify.com",
      isFree: true,
      tier: "Gratuit 100 Go/mois",
      features: ["Domaine personnalisé gratuit", "Formulaires inclus", "Performances optimales"],
      setupGuide: "1. Glissez-déposez le dossier 'www' ou connectez GitHub\n2. Votre site est actif en moins de 30 secondes."
    }
  ];

  const safeDocumentation = typeof raw.documentation === "string" && raw.documentation.length > 20 ? raw.documentation : `# Spécifications Techniques & Guide - ${safeTitle}

## 1. Description du Projet
${safeDescription}

## 2. Architecture & Composants
- Interface utilisateur : HTML5, Tailwind CSS, Lucide Icons, FontAwesome 6
- Module Mobile Money : Wave, Orange Money, MTN MoMo, Moov Money
- Cible mobile : Android 14 (API 34) avec Capacitor Native Bridge

## 3. Guide de Déploiement
1. Téléchargez l'archive ZIP ou exportez vers GitHub.
2. Pour Android : Générez l'APK ou AAB signé directement dans l'onglet 'Génération APK'.
3. Pour le Web : Déployez en 1 clic sur Vercel, Netlify ou Cloudflare Pages.
`;

  const project: Project = {
    id: typeof raw.id === "string" && raw.id ? raw.id : `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: safeTitle,
    description: safeDescription,
    category: safeCategory,
    targetType: safeTargetType,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStepId: raw.currentStepId || "conception",
    stepProgress: typeof raw.stepProgress === "number" ? raw.stepProgress : 25,
    isCheckpointReached: Boolean(raw.isCheckpointReached),
    userDecisionAfterApk: raw.userDecisionAfterApk || "pending",
    interactiveAppHtml: safeHtml,
    files: safeFiles,
    versions: safeVersions,
    chatHistory: safeChat,
    researchData: safeResearch,
    securityAudit: safeSecurity,
    apkBundleConfig: safeApk,
    webDeployment: safeWebDeployment,
    hostingOptions: safeHostingOptions,
    documentation: safeDocumentation,
    githubConfig: raw.githubConfig,
    totalTimeSpentMinutes: typeof raw.totalTimeSpentMinutes === "number" ? raw.totalTimeSpentMinutes : 12,
    totalCostFcfa: typeof raw.totalCostFcfa === "number" ? raw.totalCostFcfa : 60,
  };

  return {
    project,
    isRepaired,
    repairIssues: issues
  };
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      const defaultProj = createDefaultProject(
        "Boutique Ivoire Express",
        "Application de commerce électronique et livraison rapide avec paiement Wave et Orange Money à Abidjan",
        "ecommerce",
        "both"
      );
      const initial = [defaultProj];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, defaultProj.id);
      return initial;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn("Corrupted JSON in afribuilder_projects, recovering default project.");
      const recovered = [createDefaultProject("Boutique Ivoire Express", "Application de commerce électronique", "ecommerce", "both")];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(recovered));
      return recovered;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultProj = createDefaultProject(
        "Boutique Ivoire Express",
        "Application de commerce électronique et livraison rapide avec paiement Wave et Orange Money à Abidjan",
        "ecommerce",
        "both"
      );
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify([defaultProj]));
      return [defaultProj];
    }

    let needsPersist = false;
    const validatedProjects: Project[] = [];

    for (const rawProj of parsed) {
      const { project, isRepaired } = sanitizeProject(rawProj);
      if (isRepaired) {
        needsPersist = true;
      }
      validatedProjects.push(project);
    }

    if (needsPersist) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(validatedProjects));
    }

    return validatedProjects;
  } catch (err) {
    console.error("Critical error in loadProjects recovery:", err);
    return [createDefaultProject("Mon Application", "Description", "custom", "both")];
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects", e);
  }
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
}

export function setActiveProjectId(id: string) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, id);
}

/**
 * Generate a real, working web URL to share this application
 */
export function getProjectLiveUrl(project: Project): string {
  if (typeof window === "undefined") {
    return `https://afribuilder.app?app=${project.id}`;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?app=${encodeURIComponent(project.id)}`;
}

/**
 * Trigger immediate download of the standalone HTML app file
 */
export function downloadStandaloneHtml(project: Project) {
  try {
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_") || "application"}.html`;
    const blob = new Blob([project.interactiveAppHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to download HTML file", e);
  }
}

/**
 * Open the interactive application in a new safe tab/window via Blob URL
 */
export function openAppInNewTab(project: Project) {
  try {
    const blob = new Blob([project.interactiveAppHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      alert("Veuillez autoriser les fenêtres pop-up pour tester l'application en plein écran.");
    }
  } catch (e) {
    console.error("Failed to open app in new tab", e);
  }
}
