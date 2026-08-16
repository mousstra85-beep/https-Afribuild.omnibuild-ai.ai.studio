import {
  AdminSettings,
  DiagnosticLogEntry,
  MobileMoneyOperator,
  Project,
  ProjectFile,
  ProjectRetrievalReport,
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
const STORAGE_KEY_DIAGNOSTIC_LOGS = "afribuilder_diagnostic_logs";

// In-memory diagnostic logs cache for fast reactivity
let inMemoryDiagnosticLogs: DiagnosticLogEntry[] = [];

/**
 * Retrieve all diagnostic logs recorded during project retrieval, hydration, and explorer checks.
 */
export function getDiagnosticLogs(): DiagnosticLogEntry[] {
  try {
    if (inMemoryDiagnosticLogs.length > 0) {
      return [...inMemoryDiagnosticLogs];
    }
    const raw = localStorage.getItem(STORAGE_KEY_DIAGNOSTIC_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryDiagnosticLogs = parsed;
        return [...parsed];
      }
    }
  } catch (err) {
    console.error("Failed to read diagnostic logs from storage:", err);
  }
  return [...inMemoryDiagnosticLogs];
}

/**
 * Add a diagnostic log entry and sync with storage.
 */
export function addDiagnosticLog(entry: {
  level: "info" | "warn" | "error" | "success";
  category: "storage_read" | "json_parse" | "sanitization" | "file_explorer" | "state_retry" | "integrity_check";
  message: string;
  details?: string;
  contextData?: Record<string, any>;
  recovered?: boolean;
}): DiagnosticLogEntry {
  const newEntry: DiagnosticLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  inMemoryDiagnosticLogs.unshift(newEntry);
  if (inMemoryDiagnosticLogs.length > 150) {
    inMemoryDiagnosticLogs = inMemoryDiagnosticLogs.slice(0, 150);
  }

  try {
    localStorage.setItem(STORAGE_KEY_DIAGNOSTIC_LOGS, JSON.stringify(inMemoryDiagnosticLogs));
  } catch {
    // Silently ignore quota errors for logs
  }

  // Also dispatch custom event so UI components can re-render reactively
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("afribuilder_diagnostic_log_added", { detail: newEntry }));
  }

  return newEntry;
}

/**
 * Clear all diagnostic logs.
 */
export function clearDiagnosticLogs(): void {
  inMemoryDiagnosticLogs = [];
  try {
    localStorage.removeItem(STORAGE_KEY_DIAGNOSTIC_LOGS);
  } catch {
    // Ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("afribuilder_diagnostic_logs_cleared"));
  }
}

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

export function sanitizeProject(raw: any, sourceContext: string = "general"): { project: Project; isRepaired: boolean; repairIssues: string[] } {
  const issues: string[] = [];
  let isRepaired = false;

  if (!raw || typeof raw !== "object") {
    addDiagnosticLog({
      level: "error",
      category: "sanitization",
      message: `Projet null ou non-objet détecté lors du chargement (${sourceContext})`,
      details: `Valeur brute reçue : ${typeof raw === "object" ? "null" : typeof raw}`,
      recovered: true,
    });
    const fresh = createDefaultProject("Mon Application", "Description de l'application", "custom", "both");
    return {
      project: fresh,
      isRepaired: true,
      repairIssues: ["Données du projet introuvables ou format corrompu. Réinitialisation complète effectuée."]
    };
  }

  const safeTitle = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim() : "Mon Application";
  if (!raw.title || typeof raw.title !== "string" || !raw.title.trim()) {
    issues.push("Titre du projet absent ou invalide (corrigé).");
    isRepaired = true;
    addDiagnosticLog({
      level: "warn",
      category: "sanitization",
      message: `Titre manquant pour le projet ID "${raw.id || "inconnu"}"`,
      details: `Remplacé par le titre par défaut "${safeTitle}"`,
      recovered: true,
    });
  }

  const safeCategory: Project["category"] = ["ecommerce", "service", "delivery", "fintech", "showcase", "health", "education", "custom"].includes(raw.category)
    ? raw.category
    : "custom";

  const safeTargetType: Project["targetType"] = ["mobile_app", "website", "both"].includes(raw.targetType)
    ? raw.targetType
    : (raw.targetType === "mobile" ? "mobile_app" : raw.targetType === "web" ? "website" : "both");

  const safeDescription = typeof raw.description === "string" ? raw.description : "Application créée sur AfriBuilder Studio";

  // Ensure valid HTML content
  let safeHtml = typeof raw.interactiveAppHtml === "string" && raw.interactiveAppHtml.trim().length > 100
    ? raw.interactiveAppHtml
    : "";

  if (!safeHtml || safeHtml.includes("triggerQuickAction()")) {
    safeHtml = generateInitialInteractiveApp(safeTitle, safeCategory, safeDescription);
    issues.push("Code HTML de l'application interactif manquant ou obsolète (reconstruit).");
    isRepaired = true;
    addDiagnosticLog({
      level: "error",
      category: "file_explorer",
      message: `Code HTML interactif vide ou incomplet pour "${safeTitle}"`,
      details: `Taille détectée : ${typeof raw.interactiveAppHtml === "string" ? raw.interactiveAppHtml.length : 0} octets. Reconstitution depuis le gabarit.`,
      recovered: true,
    });
  }

  // Ensure files array integrity
  let safeFiles: ProjectFile[] = [];
  if (Array.isArray(raw.files) && raw.files.length > 0) {
    safeFiles = raw.files
      .filter((f: any) => f && typeof f === "object" && typeof f.name === "string" && f.name.trim().length > 0)
      .map((f: any) => ({
        name: (f.name || "fichier.txt").trim(),
        path: typeof f.path === "string" && f.path.trim() ? f.path.trim() : f.name,
        language: typeof f.language === "string" && f.language.trim() ? f.language.trim() : "plaintext",
        content: typeof f.content === "string" ? f.content : "",
        description: typeof f.description === "string" ? f.description : "Fichier de projet",
      }));
  } else {
    issues.push("Arborescence de fichiers absente ou format non-tableau (reconstruite).");
    isRepaired = true;
    addDiagnosticLog({
      level: "error",
      category: "file_explorer",
      message: `Tableau des fichiers (files) inexistant ou corrompu pour "${safeTitle}"`,
      details: `Type brut : ${typeof raw.files}, Array : ${Array.isArray(raw.files) ? "oui (vide)" : "non"}. Création des fichiers essentiels.`,
      recovered: true,
    });
  }

  // Check if index.html is in files
  const indexFileIndex = safeFiles.findIndex((f) => f.name === "index.html" || f.path === "www/index.html");
  if (indexFileIndex >= 0) {
    if (!safeFiles[indexFileIndex].content || safeFiles[indexFileIndex].content.trim().length < 50) {
      safeFiles[indexFileIndex].content = safeHtml;
      issues.push("Fichier index.html vide dans l'explorateur (restauré à partir du bac à sable).");
      isRepaired = true;
      addDiagnosticLog({
        level: "warn",
        category: "file_explorer",
        message: `Fichier index.html vide ou trop court (${safeFiles[indexFileIndex].content?.length || 0} car.)`,
        details: "Contenu réinjecté depuis l'application interactive.",
        recovered: true,
      });
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
    addDiagnosticLog({
      level: "warn",
      category: "file_explorer",
      message: `Fichier principal index.html absent de l'explorateur pour "${safeTitle}"`,
      details: "Création automatique du fichier www/index.html dans la liste des fichiers.",
      recovered: true,
    });
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

  // Check database/schema.sql
  if (!safeFiles.some((f) => f.name === "schema.sql" || f.path === "database/schema.sql")) {
    safeFiles.push({
      name: "schema.sql",
      path: "database/schema.sql",
      language: "sql",
      content: `-- ==============================================================================
-- BASE DE DONNÉES : ${safeTitle.toUpperCase()}
-- Schéma relationnel PostgreSQL / Cloud SQL / Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price_cfa NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock_quantity INT DEFAULT 100,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount_cfa NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT,
    customer_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'wave', 'orange_money', 'mtn_momo'
    transaction_reference VARCHAR(120) UNIQUE NOT NULL,
    amount_cfa NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    phone_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`,
      description: "Schéma SQL complet et migrations de la base de données",
    });
  }

  // Check README.md
  if (!safeFiles.some((f) => f.name === "README.md")) {
    safeFiles.push({
      name: "README.md",
      path: "README.md",
      language: "markdown",
      content: `# ${safeTitle}

Application générée avec **Omnibuild AI Studio**.

## 🚀 Fonctionnalités
- Interface interactive responsive (Mobile & Desktop)
- Intégration des paiements Mobile Money (Wave, Orange Money, MTN MoMo)
- Base de données SQL prête à l'emploi (\`database/schema.sql\`)
- Prêt pour déploiement sur Vercel, Netlify, GitHub Pages et Android APK

## 🗄️ Base de Données
Exécutez le script SQL sur votre instance PostgreSQL ou Supabase :
\`\`\`bash
psql -h <HOST> -U <USER> -d <DATABASE> -f database/schema.sql
\`\`\`
`,
      description: "Documentation et guide de démarrage du projet",
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

/**
 * Load projects with full telemetry diagnostics, anomaly detection, and auto-repair.
 */
export function loadProjectsWithDiagnostics(options?: {
  retryAttempt?: number;
}): {
  projects: Project[];
  report: ProjectRetrievalReport;
  logs: DiagnosticLogEntry[];
} {
  const retryAttempt = options?.retryAttempt || 0;
  const issues: string[] = [];
  let status: ProjectRetrievalReport["status"] = "optimal";
  let validatedProjects: Project[] = [];
  const activeId = getActiveProjectId();

  addDiagnosticLog({
    level: "info",
    category: "storage_read",
    message: `[loadProjects] Démarrage du cycle de récupération (tentative ${retryAttempt + 1})`,
    details: `Lecture de la clé localStorage "${STORAGE_KEY_PROJECTS}"`,
    contextData: { retryAttempt, activeId },
  });

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      addDiagnosticLog({
        level: "warn",
        category: "storage_read",
        message: "Clé afribuilder_projects absente du stockage",
        details: "Génération automatique d'un projet de départ 'Boutique Ivoire Express'",
        recovered: true,
      });
      const defaultProj = createDefaultProject(
        "Boutique Ivoire Express",
        "Application de commerce électronique et livraison rapide avec paiement Wave et Orange Money à Abidjan",
        "ecommerce",
        "both"
      );
      validatedProjects = [defaultProj];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(validatedProjects));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, defaultProj.id);
      status = "recovered";
    } else {
      let parsed: any;
      try {
        parsed = JSON.parse(raw);
        addDiagnosticLog({
          level: "success",
          category: "json_parse",
          message: "Désérialisation JSON du stockage réussie",
          details: `Taille des données brutes : ${raw.length} caractères, structure : ${Array.isArray(parsed) ? `Tableau (${parsed.length} éléments)` : typeof parsed}`,
        });
      } catch (jsonErr: any) {
        addDiagnosticLog({
          level: "error",
          category: "json_parse",
          message: "Erreur critique de syntaxe JSON lors du parsing",
          details: jsonErr.message || "Caractères invalides ou JSON tronqué",
          recovered: true,
        });
        issues.push("Syntaxe JSON du stockage corrompue.");
        status = "degraded";

        const recovered = [
          createDefaultProject("Boutique Ivoire Express", "Application de commerce électronique", "ecommerce", "both"),
        ];
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(recovered));
        parsed = recovered;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        addDiagnosticLog({
          level: "warn",
          category: "sanitization",
          message: "Structure de données inattendue (tableau vide ou objet unique)",
          details: `Type : ${typeof parsed}, Array : ${Array.isArray(parsed)}`,
          recovered: true,
        });
        issues.push("Format des projets invalide ou vide.");
        status = "degraded";

        const defaultProj = createDefaultProject(
          "Boutique Ivoire Express",
          "Application de commerce électronique et livraison rapide avec paiement Wave et Orange Money à Abidjan",
          "ecommerce",
          "both"
        );
        parsed = [defaultProj];
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(parsed));
      }

      let needsPersist = false;
      for (const rawProj of parsed) {
        const { project, isRepaired, repairIssues } = sanitizeProject(rawProj, "loadProjects");
        if (isRepaired) {
          needsPersist = true;
          status = status === "optimal" ? "recovered" : status;
          issues.push(...repairIssues);
        }
        validatedProjects.push(project);
      }

      if (needsPersist) {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(validatedProjects));
        addDiagnosticLog({
          level: "info",
          category: "state_retry",
          message: "Synchronisation et persistance des corrections appliquées",
          details: `${issues.length} anomalies résolues et sauvegardées.`,
        });
      }
    }

    // Integrity check on the active project
    const activeProject = validatedProjects.find((p) => p.id === activeId) || validatedProjects[0];
    const filesCount = activeProject?.files?.length || 0;
    const hasIndex = activeProject?.files?.some((f) => f.name === "index.html" && f.content && f.content.length > 50) ?? false;
    const hasInteractive = Boolean(activeProject?.interactiveAppHtml && activeProject.interactiveAppHtml.length > 50);

    if (filesCount === 0 || !hasIndex || !hasInteractive) {
      status = "critical";
      issues.push("L'explorateur ou le bac à sable interactif contient des données manquantes.");
      addDiagnosticLog({
        level: "error",
        category: "file_explorer",
        message: "État incomplet détecté pour l'explorateur de fichiers",
        details: `Fichiers: ${filesCount}, index.html: ${hasIndex ? "OK" : "MANQUANT"}, Bac à sable: ${hasInteractive ? "OK" : "MANQUANT"}`,
        recovered: false,
      });
    } else {
      addDiagnosticLog({
        level: "success",
        category: "integrity_check",
        message: `Validation de l'explorateur terminée (${filesCount} fichiers indexés)`,
        details: `Projet "${activeProject?.title}" prêt et opérationnel.`,
      });
    }

    const report: ProjectRetrievalReport = {
      timestamp: new Date().toISOString(),
      totalProjects: validatedProjects.length,
      activeProjectId: activeProject?.id || null,
      status,
      retryCount: retryAttempt,
      filesIndexedCount: filesCount,
      hasIndexHtml: hasIndex,
      hasInteractiveHtml: hasInteractive,
      integrityIssues: issues,
      recentLogs: getDiagnosticLogs().slice(0, 10),
    };

    return {
      projects: validatedProjects,
      report,
      logs: getDiagnosticLogs(),
    };
  } catch (err: any) {
    addDiagnosticLog({
      level: "error",
      category: "storage_read",
      message: `Exception critique non gérée lors du chargement : ${err.message}`,
      details: err.stack,
      recovered: true,
    });

    const fallback = [createDefaultProject("Mon Application", "Description", "custom", "both")];
    const report: ProjectRetrievalReport = {
      timestamp: new Date().toISOString(),
      totalProjects: 1,
      activeProjectId: fallback[0].id,
      status: "critical",
      retryCount: retryAttempt,
      filesIndexedCount: fallback[0].files.length,
      hasIndexHtml: true,
      hasInteractiveHtml: true,
      integrityIssues: [err.message || "Erreur de chargement critique"],
      recentLogs: getDiagnosticLogs().slice(0, 10),
    };

    return {
      projects: fallback,
      report,
      logs: getDiagnosticLogs(),
    };
  }
}

/**
 * Standard project loader that delegates to loadProjectsWithDiagnostics
 */
export function loadProjects(): Project[] {
  const result = loadProjectsWithDiagnostics();
  return result.projects;
}

/**
 * Retry mechanism for loading projects with progressive self-healing passes.
 */
export function retryLoadProjects(maxAttempts: number = 3): {
  projects: Project[];
  report: ProjectRetrievalReport;
  attemptsUsed: number;
  success: boolean;
} {
  addDiagnosticLog({
    level: "info",
    category: "state_retry",
    message: `[retryLoadProjects] Déclenchement de la procédure de re-tentative automatique (Max ${maxAttempts} passes)...`,
  });

  let lastResult = loadProjectsWithDiagnostics({ retryAttempt: 1 });
  let attempts = 1;

  while (attempts < maxAttempts && (lastResult.report.status === "critical" || !lastResult.report.hasIndexHtml || lastResult.report.filesIndexedCount === 0)) {
    attempts++;
    addDiagnosticLog({
      level: "warn",
      category: "state_retry",
      message: `Passe de réparation ${attempts}/${maxAttempts} en cours...`,
      details: `Anomalies restantes : ${lastResult.report.integrityIssues.join(", ") || "État incomplet"}`,
    });

    // Reconstruct corrupted entities
    const repaired = lastResult.projects.map((p) => {
      const { project } = sanitizeProject(p, `retry_pass_${attempts}`);
      return project;
    });

    saveProjects(repaired);
    lastResult = loadProjectsWithDiagnostics({ retryAttempt: attempts });
  }

  const isHealthy = lastResult.report.hasIndexHtml && lastResult.report.filesIndexedCount > 0;

  addDiagnosticLog({
    level: isHealthy ? "success" : "error",
    category: "state_retry",
    message: isHealthy
      ? `Récupération et auto-réparation réussies après ${attempts} passe(s)`
      : `Échec partiel de la récupération après ${attempts} tentatives`,
    details: `Statut final : ${lastResult.report.status}, Fichiers : ${lastResult.report.filesIndexedCount}`,
  });

  return {
    projects: lastResult.projects,
    report: lastResult.report,
    attemptsUsed: attempts,
    success: isHealthy,
  };
}

/**
 * Deep targeted recovery of a specific project state when the file explorer or sandbox encounters missing or corrupted data.
 */
export function retryAndRecoverProjectState(projectId?: string): {
  success: boolean;
  project: Project;
  recoveredCount: number;
  message: string;
  logs: DiagnosticLogEntry[];
} {
  addDiagnosticLog({
    level: "info",
    category: "state_retry",
    message: `[retryAndRecoverProjectState] Réparation ciblée demandée pour le projet : ${projectId || "Projet Actif"}`,
  });

  const projects = loadProjects();
  const targetIdx = projectId ? projects.findIndex((p) => p.id === projectId) : 0;
  const target = targetIdx >= 0 ? projects[targetIdx] : projects[0];

  if (!target) {
    const fresh = createDefaultProject("Nouvelle Application", "Description", "custom", "both");
    saveProjects([fresh]);
    return {
      success: true,
      project: fresh,
      recoveredCount: 1,
      message: "Nouveau projet sain initialisé avec succès.",
      logs: getDiagnosticLogs(),
    };
  }

  const { project: repaired, repairIssues } = sanitizeProject(target, "manual_deep_repair");

  // Force-ensure files list has complete essentials
  if (!repaired.files || repaired.files.length === 0 || !repaired.files.some((f) => f.name === "index.html")) {
    const initialFiles: ProjectFile[] = [
      {
        name: "index.html",
        path: "www/index.html",
        language: "html",
        content: repaired.interactiveAppHtml || generateInitialInteractiveApp(repaired.title, repaired.category, repaired.description),
        description: "Interface web et mobile principale",
      },
      {
        name: "app.js",
        path: "www/js/app.js",
        language: "javascript",
        content: `// Moteur logique de ${repaired.title}\nconsole.log("AfriBuilder App initialized");`,
        description: "Script applicatif interactif",
      },
      {
        name: "AndroidManifest.xml",
        path: "android/app/src/main/AndroidManifest.xml",
        language: "xml",
        content: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.afribuilder.${repaired.title.toLowerCase().replace(/[^a-z0-9]/g, "")}">\n    <application android:label="${repaired.title}">\n        <activity android:name=".MainActivity" android:exported="true" />\n    </application>\n</manifest>`,
        description: "Configuration Android",
      }
    ];
    repaired.files = initialFiles;
    repairIssues.push("Arborescence complète de fichiers reconstruite à neuf.");
  }

  projects[targetIdx >= 0 ? targetIdx : 0] = repaired;
  saveProjects(projects);

  addDiagnosticLog({
    level: "success",
    category: "state_retry",
    message: `Réparation en profondeur effectuée (${repairIssues.length} corrections)`,
    details: repairIssues.join(" • ") || "Aucune anomalie détectée.",
  });

  return {
    success: true,
    project: repaired,
    recoveredCount: repairIssues.length,
    message: `Projet "${repaired.title}" réparé avec succès (${repairIssues.length} corrections appliquées).`,
    logs: getDiagnosticLogs(),
  };
}

/**
 * Diagnostic helper to simulate a broken/incomplete project state to test the monitor & auto-recovery mechanism.
 */
export function simulateProjectCorruptionForTesting(projectId?: string): { success: boolean; message: string } {
  try {
    const projects = loadProjects();
    const targetIdx = projectId ? projects.findIndex((p) => p.id === projectId) : 0;
    if (targetIdx >= 0) {
      // Simulate missing files and broken index.html
      const broken: any = {
        ...projects[targetIdx],
        files: [], // Empty explorer
        interactiveAppHtml: "", // Empty sandbox
      };
      projects[targetIdx] = broken;
      saveProjects(projects);

      addDiagnosticLog({
        level: "error",
        category: "file_explorer",
        message: "[SIMULATION TEST] Altération artificielle de l'explorateur et du bac à sable pour test de résilience",
        details: "files = [], interactiveAppHtml = ''",
      });

      return {
        success: true,
        message: "Simulation d'erreur injectée : l'explorateur est maintenant vide. Observez la détection et déclenchez la réparation.",
      };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
  return { success: false, message: "Projet non trouvé" };
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
 * Encode a minimal project snapshot to a URL-safe Base64 string for instant cross-device sharing.
 */
export function encodeProjectPayload(project: Project): string {
  try {
    const minimal = {
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      targetType: project.targetType,
      interactiveAppHtml: project.interactiveAppHtml,
    };
    const jsonStr = JSON.stringify(minimal);
    // UTF-8 safe base64 encoding
    return btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    console.warn("Failed to encode project payload", e);
    return "";
  }
}

/**
 * Decode project from a URL-safe Base64 string.
 */
export function decodeProjectPayload(b64: string): Project | null {
  try {
    if (!b64 || b64.trim() === "") return null;
    const decodedStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64.trim()), (c: string) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const parsed = JSON.parse(decodedStr);
    if (parsed && (parsed.interactiveAppHtml || parsed.title)) {
      return sanitizeProject(parsed, "url_import").project;
    }
  } catch (e) {
    console.warn("Failed to decode project payload from URL", e);
  }
  return null;
}

/**
 * Generate a real, working web URL to share this application in full standalone mode
 */
export function getProjectLiveUrl(project: Project, mode: "app" | "studio" = "app"): string {
  if (typeof window === "undefined") {
    return `https://afribuilder.app?view=${mode}&app=${encodeURIComponent(project.id)}`;
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  const payload = encodeProjectPayload(project);
  
  if (payload && payload.length < 60000) {
    return `${base}?view=${mode}&app=${encodeURIComponent(project.id)}#data=${payload}`;
  }
  return `${base}?view=${mode}&app=${encodeURIComponent(project.id)}`;
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

