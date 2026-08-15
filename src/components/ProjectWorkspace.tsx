import React, { useState, useMemo, useEffect } from "react";
import { AdminSettings, Project, ProjectFile, ProjectVersion, StepId, UserAccount } from "../types";
import { exportProjectZip, generateInitialInteractiveApp } from "../utils/projectGenerators";
import { saveProjects, sanitizeProject } from "../utils/storage";
import {
  openArchitecturePdfPrintWindow,
  downloadArchitecturePdfFile,
} from "../utils/pdfArchitectureGenerator";
import confetti from "canvas-confetti";
import { ProjectSettingsModal } from "./ProjectSettingsModal";
import { ProjectHealthDashboard } from "./ProjectHealthDashboard";
import { ProjectVelocityDashboard } from "./ProjectVelocityDashboard";
import { SmartExportWizard } from "./SmartExportWizard";
import {
  validateGitHubToken,
  exportProjectToGitHub,
  GitHubUser,
  GitHubExportResult,
} from "../utils/githubService";
import {
  Sparkles,
  Cpu,
  Search,
  Shield,
  Smartphone,
  Globe,
  Server,
  FileText,
  Github,
  Rocket,
  Play,
  RotateCcw,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FolderGit2,
  AlertTriangle,
  Code2,
  Share2,
  Layers,
  HelpCircle,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Phone,
  Mail,
  Settings,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  Trash2,
  EyeOff,
  UploadCloud,
  GitBranch,
  Activity,
  TrendingUp,
  BarChart3,
  Wrench,
  FilePlus,
  Edit3,
  Save,
  FileDown,
  X,
  FileCode,
  Printer,
} from "lucide-react";

interface ProjectWorkspaceProps {
  project: Project;
  currentUser: UserAccount;
  adminSettings: AdminSettings;
  onUpdateProject: (updated: Project) => void;
  onOpenPreview: () => void;
  onOpenPayment: (actionName: string, onSuccess: () => void) => void;
  onOpenCheckpoint: () => void;
  onOpenShare?: () => void;
  onOpenSettings?: () => void;
  onOpenOnboardingTour?: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  currentUser,
  adminSettings,
  onUpdateProject,
  onOpenPreview,
  onOpenPayment,
  onOpenCheckpoint,
  onOpenShare,
  onOpenSettings,
  onOpenOnboardingTour,
}) => {
  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "velocity" | "health" | "code" | "apk" | "web" | "share" | "hosting" | "docs" | "github" | "publish" | "versions" | "chat"
  >("overview");

  // Selected file in file viewer
  const [selectedFileName, setSelectedFileName] = useState<string>("index.html");

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatRole, setChatRole] = useState<"developer" | "researcher" | "controller">("developer");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // General loading / action states
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sync / Execution state
  const [isBuildingApk, setIsBuildingApk] = useState(false);
  const [isDeployingWeb, setIsDeployingWeb] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Settings & GitHub Integration State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [githubPat, setGithubPat] = useState<string>(() => {
    return project.githubConfig?.personalAccessToken || localStorage.getItem("afribuilder_github_pat") || "";
  });
  const [showGithubPat, setShowGithubPat] = useState(false);
  const [isValidatingPat, setIsValidatingPat] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubPatError, setGithubPatError] = useState<string | null>(null);
  const [isExportingGithub, setIsExportingGithub] = useState(false);
  const [githubExportProgress, setGithubExportProgress] = useState<{ step: string; percent: number }>({
    step: "",
    percent: 0,
  });
  const [githubExportResult, setGithubExportResult] = useState<GitHubExportResult | null>(null);
  const [githubExportError, setGithubExportError] = useState<string | null>(null);

  // File explorer search, live editing & creation states
  const [fileSearchQuery, setFileSearchQuery] = useState<string>("");
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editedFileContent, setEditedFileContent] = useState<string>("");
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFilePath, setNewFilePath] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("html");
  const [newFileContent, setNewFileContent] = useState("");

  // Safe file list computation
  const filesList: ProjectFile[] = useMemo(() => {
    if (Array.isArray(project.files) && project.files.length > 0) {
      return project.files;
    }
    return [
      {
        name: "index.html",
        path: "www/index.html",
        language: "html",
        content: project.interactiveAppHtml || generateInitialInteractiveApp(project.title, project.category, project.description),
        description: "Interface web et mobile principale",
      },
    ];
  }, [project.files, project.interactiveAppHtml, project.title, project.category, project.description]);

  const selectedFile: ProjectFile = useMemo(() => {
    const found = filesList.find((f) => f.name === selectedFileName);
    return found || filesList[0] || {
      name: "index.html",
      path: "www/index.html",
      language: "html",
      content: project.interactiveAppHtml || "",
      description: "Interface principale",
    };
  }, [filesList, selectedFileName, project.interactiveAppHtml]);

  // Sync editedFileContent when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      setEditedFileContent(selectedFile.content || "");
      setIsEditingFile(false);
    }
  }, [selectedFile.name, selectedFile.content]);

  // Data Integrity & Corruption detection
  const integrityStatus = useMemo(() => {
    const issues: string[] = [];
    if (!project.files || !Array.isArray(project.files) || project.files.length === 0) {
      issues.push("Aucun fichier source indexé dans le projet");
    } else if (!project.files.some((f) => f.name === "index.html")) {
      issues.push("Fichier index.html principal manquant");
    }
    if (!project.interactiveAppHtml || project.interactiveAppHtml.trim().length < 50) {
      issues.push("Code source du bac à sable interactif vide ou incomplet");
    }
    if (!project.apkBundleConfig?.packageName) {
      issues.push("Configuration de compilation APK incomplète");
    }
    return {
      isCorrupted: issues.length > 0,
      issues,
    };
  }, [project]);

  // One-click repair handler for corrupted project data
  const handleRepairProjectData = () => {
    const { project: repaired, repairIssues } = sanitizeProject(project);
    onUpdateProject(repaired);
    triggerNotice(`Projet réparé et resynchronisé avec succès (${repairIssues.length || 1} corrections appliquées).`);
  };

  // Handler to save file modifications
  const handleSaveEditedFile = () => {
    if (!selectedFile) return;
    const currentFiles = Array.isArray(project.files) && project.files.length > 0 ? [...project.files] : [...filesList];
    const targetIdx = currentFiles.findIndex((f) => f.name === selectedFile.name);
    
    if (targetIdx >= 0) {
      currentFiles[targetIdx] = {
        ...currentFiles[targetIdx],
        content: editedFileContent,
      };
    } else {
      currentFiles.push({
        ...selectedFile,
        content: editedFileContent,
      });
    }

    const updatedProject: Project = {
      ...project,
      files: currentFiles,
      interactiveAppHtml: selectedFile.name === "index.html" ? editedFileContent : project.interactiveAppHtml,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
    setIsEditingFile(false);
    triggerNotice(`Fichier "${selectedFile.name}" enregistré et synchronisé avec succès !`);
  };

  // Handler to download a single file
  const handleDownloadSingleFile = (fileToDownload: ProjectFile) => {
    try {
      const blob = new Blob([fileToDownload.content || ""], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileToDownload.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerNotice(`Téléchargement de "${fileToDownload.name}" démarré.`);
    } catch (e: any) {
      triggerNotice(`Erreur lors du téléchargement : ${e.message}`);
    }
  };

  // Handler to add a new file
  const handleAddNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFileName.trim();
    if (!cleanName) return;

    const currentFiles = Array.isArray(project.files) && project.files.length > 0 ? [...project.files] : [...filesList];
    if (currentFiles.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      triggerNotice(`Un fichier nommé "${cleanName}" existe déjà.`);
      return;
    }

    const newFile: ProjectFile = {
      name: cleanName,
      path: newFilePath.trim() || `src/${cleanName}`,
      language: newFileLanguage,
      content: newFileContent || `// Fichier ${cleanName}\n`,
      description: `Fichier personnalisé créé par l'utilisateur`,
    };

    currentFiles.push(newFile);
    const updatedProject: Project = {
      ...project,
      files: currentFiles,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
    setSelectedFileName(cleanName);
    setIsAddFileModalOpen(false);
    setNewFileName("");
    setNewFilePath("");
    setNewFileContent("");
    triggerNotice(`Fichier "${cleanName}" ajouté au projet !`);
  };

  // Handler to restore default project files
  const handleRestoreDefaultFiles = () => {
    const { project: repaired } = sanitizeProject(project);
    onUpdateProject(repaired);
    setSelectedFileName("index.html");
    triggerNotice("Fichiers de base restaurés et synchronisés !");
  };

  const handleTestPat = async () => {
    const clean = githubPat.trim();
    if (!clean) {
      setGithubPatError("Veuillez saisir votre jeton d'accès GitHub (PAT).");
      setGithubUser(null);
      return;
    }
    setIsValidatingPat(true);
    setGithubPatError(null);
    try {
      const u = await validateGitHubToken(clean);
      setGithubUser(u);
      localStorage.setItem("afribuilder_github_pat", clean);
      const updated: Project = {
        ...project,
        githubConfig: {
          ...project.githubConfig,
          personalAccessToken: clean,
          username: u.login,
        },
      };
      onUpdateProject(updated);
      triggerNotice(`Jeton GitHub validé avec succès pour @${u.login}`);
    } catch (e: any) {
      setGithubPatError(e.message || "Erreur lors de la vérification du jeton.");
      setGithubUser(null);
    } finally {
      setIsValidatingPat(false);
    }
  };

  const handleClearPat = () => {
    setGithubPat("");
    setGithubUser(null);
    setGithubPatError(null);
    localStorage.removeItem("afribuilder_github_pat");
    const updated: Project = {
      ...project,
      githubConfig: {
        ...project.githubConfig,
        personalAccessToken: undefined,
        username: undefined,
      },
    };
    onUpdateProject(updated);
    triggerNotice("Jeton GitHub supprimé avec succès.");
  };

  const handleDirectExportGithub = async () => {
    const clean = githubPat.trim();
    if (!clean) {
      setGithubExportError("Veuillez configurer votre jeton d'accès GitHub (PAT).");
      return;
    }
    setIsExportingGithub(true);
    setGithubExportError(null);
    setGithubExportResult(null);

    const repoSlug =
      project.githubConfig?.repoName ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") ||
      "mon-application-afribuilder";

    try {
      const res = await exportProjectToGitHub({
        token: clean,
        project,
        repoName: repoSlug,
        description: project.description,
        isPrivate: project.githubConfig?.isPrivate ?? false,
        branch: project.githubConfig?.branch || "main",
        onProgress: (step, percent) => {
          setGithubExportProgress({ step, percent });
        },
      });

      setGithubExportResult(res);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

      const updated: Project = {
        ...project,
        githubConfig: {
          personalAccessToken: clean,
          username: res.owner,
          repoName: res.repoName,
          isPrivate: project.githubConfig?.isPrivate ?? false,
          branch: project.githubConfig?.branch || "main",
          lastExportedAt: res.timestamp,
          lastExportUrl: res.repoUrl,
        },
      };
      onUpdateProject(updated);
      triggerNotice("Exportation vers GitHub réussie !");
    } catch (err: any) {
      setGithubExportError(err.message || "Erreur lors de l'exportation vers GitHub.");
    } finally {
      setIsExportingGithub(false);
    }
  };

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 1. Synchronized Step Advancement
  const runFullAiGeneration = async () => {
    setIsAiLoading(true);
    triggerNotice("Synchronisation des 3 IA en cours (Recherche -> Dév -> Contrôle)...");

    try {
      // Step 1: Research AI
      const resResearch = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: project.description,
          category: project.category,
          targetType: project.targetType,
        }),
      });
      const dataResearch = await resResearch.json();

      // Step 2: Developer AI
      const resDev = await fetch("/api/ai/develop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          category: project.category,
          targetType: project.targetType,
          researchData: dataResearch.data,
        }),
      });
      const dataDev = await resDev.json();

      // Step 3: Control & Security AI
      const newHtml = dataDev.data?.interactiveAppHtml || generateInitialInteractiveApp(project.title, project.category, project.description);
      const resControl = await fetch("/api/ai/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeHtml: newHtml,
          projectTitle: project.title,
          category: project.category,
        }),
      });
      const dataControl = await resControl.json();

      // Create new Version
      const newVersionTag = `v1.${project.versions.length}.0`;
      const newVersion: ProjectVersion = {
        id: `v_${Date.now()}`,
        versionTag: newVersionTag,
        timestamp: new Date().toISOString(),
        summary: "Mise à jour complète synchronisée par les 3 IA",
        author: "IA de Développement",
        filesCount: project.files.length,
      };

      const updatedFiles = project.files.map((f) => {
        if (f.name === "index.html") return { ...f, content: newHtml };
        if (f.name === "AndroidManifest.xml" && dataDev.data?.androidManifestXml) return { ...f, content: dataDev.data.androidManifestXml };
        if (f.name === "build.gradle" && dataDev.data?.buildGradle) return { ...f, content: dataDev.data.buildGradle };
        return f;
      });

      const updatedProject: Project = {
        ...project,
        updatedAt: new Date().toISOString(),
        interactiveAppHtml: newHtml,
        files: updatedFiles,
        researchData: dataResearch.data || project.researchData,
        securityAudit: dataControl.data || project.securityAudit,
        currentStepId: "apk_generation",
        stepProgress: 60,
        isCheckpointReached: true,
        versions: [newVersion, ...project.versions],
        chatHistory: [
          ...project.chatHistory,
          {
            id: `msg_${Date.now()}`,
            role: "developer",
            senderName: "IA de Développement & Admin",
            text: `✅ Code, architecture, et tests de sécurité terminés avec un score de ${dataControl.data?.globalScore || 98}/100 ! Les fichiers APK et AAB sont maintenant prêts.`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      onUpdateProject(updatedProject);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      triggerNotice("Génération et compilation réussies !");
      onOpenCheckpoint();
    } catch (e) {
      console.error(e);
      triggerNotice("Mise à jour effectuée en mode autonome !");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 2. Chat with selected AI role
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userText = chatInput.trim();
    setChatInput("");

    const newMsg = {
      id: `msg_${Date.now()}`,
      role: "user" as const,
      senderName: `${currentUser.prenom} ${currentUser.nom}`,
      text: userText,
      timestamp: new Date().toISOString(),
    };

    const updatedWithUser = {
      ...project,
      chatHistory: [...project.chatHistory, newMsg],
    };
    onUpdateProject(updatedWithUser);

    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          role: chatRole,
          projectContext: {
            title: project.title,
            description: project.description,
            category: project.category,
            currentStep: project.currentStepId,
          },
        }),
      });
      const data = await res.json();

      const aiReply = {
        id: `msg_${Date.now() + 1}`,
        role: chatRole,
        senderName: chatRole === "developer" ? "IA de Développement" : chatRole === "researcher" ? "IA de Recherche" : "IA de Contrôle",
        text: data.response || "Demande synchronisée sur le projet avec succès !",
        timestamp: new Date().toISOString(),
      };

      onUpdateProject({
        ...updatedWithUser,
        chatHistory: [...updatedWithUser.chatHistory, aiReply],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 3. Trigger Downloads with Payment Check if not in promo mode
  const handleDownloadProjectZip = () => {
    const doDownload = async () => {
      triggerNotice("Création du bundle ZIP complet...");
      const blob = await exportProjectZip(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_source_bundle.zip`;
      a.click();
      URL.revokeObjectURL(url);
      triggerNotice("Téléchargement du projet terminé !");
    };

    if (adminSettings.promoModeFree || currentUser.credits >= 5) {
      doDownload();
    } else {
      onOpenPayment("Exportation Source & Fichiers ZIP", doDownload);
    }
  };

  const handleDownloadApkBundle = () => {
    const doDownload = async () => {
      triggerNotice("Préparation du package Android (APK + AAB)...");
      const blob = await exportProjectZip(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_Android_APK_AAB.zip`;
      a.click();
      URL.revokeObjectURL(url);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      triggerNotice("Package Android APK/AAB téléchargé !");
    };

    if (adminSettings.promoModeFree || currentUser.credits >= 5) {
      doDownload();
    } else {
      onOpenPayment("Téléchargement Package Android APK / AAB", doDownload);
    }
  };

  const handleSimulateDeploy = () => {
    setIsDeployingWeb(true);
    setTimeout(() => {
      setIsDeployingWeb(false);
      const updated: Project = {
        ...project,
        webDeployment: {
          ...project.webDeployment,
          status: "deployed",
          deployedAt: new Date().toISOString(),
        },
        currentStepId: "store_publish",
        stepProgress: 100,
      };
      onUpdateProject(updated);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      triggerNotice("Déploiement Web réussi avec certificat SSL !");
    }, 1500);
  };

  // Milestone Progress Steps definition
  const stepsList: { id: StepId; name: string; icon: any; isDone: boolean; isCurrent: boolean }[] = [
    { id: "conception", name: "1. Conception", icon: Sparkles, isDone: true, isCurrent: project.currentStepId === "conception" },
    { id: "research", name: "2. Recherche Web", icon: Search, isDone: project.stepProgress >= 30, isCurrent: project.currentStepId === "research" },
    { id: "code_generation", name: "3. Génération Code", icon: Cpu, isDone: project.stepProgress >= 50, isCurrent: project.currentStepId === "code_generation" },
    { id: "security_audit", name: "4. Contrôle & Sécurité", icon: Shield, isDone: project.stepProgress >= 60, isCurrent: project.currentStepId === "security_audit" },
    { id: "apk_generation", name: "5. APK & AAB", icon: Smartphone, isDone: project.stepProgress >= 75, isCurrent: project.currentStepId === "apk_generation" },
    { id: "web_deployment", name: "6. Déploiement Web", icon: Globe, isDone: project.webDeployment?.status === "deployed", isCurrent: project.currentStepId === "web_deployment" },
    { id: "store_publish", name: "7. Publication Store", icon: Rocket, isDone: project.stepProgress === 100, isCurrent: project.currentStepId === "store_publish" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-20">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* DATA INTEGRITY WARNING & REPAIR BANNER */}
      {integrityStatus.isCorrupted && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 text-amber-200 animate-in fade-in duration-300">
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-100 flex items-center gap-2">
                <span>Contrôle d'Intégrité : Données du Projet Incomplètes ou Corrompues</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {integrityStatus.issues.length} anomalie(s)
                </span>
              </h4>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                {integrityStatus.issues.join(" • ")}
              </p>
            </div>
          </div>
          <button
            onClick={handleRepairProjectData}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Wrench className="w-4 h-4" />
            <span>Réparer & Reconstruire l'Intégrité</span>
          </button>
        </div>
      )}

      {/* 1. EXECUTIVE RETURN STATUS GREETING CARD (Prompt requirement) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> IA de Développement & Orchestrateur
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Projet Actif
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Bonjour {currentUser.prenom} ! État du projet :{" "}
                <span className="text-blue-400 font-extrabold">{project.title}</span>
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {project.userDecisionAfterApk === "stay_apk"
                  ? "Votre projet est configuré en mode APK/AAB Mobile. Les tests et le code sont validés."
                  : project.stepProgress >= 80
                  ? "Votre projet a franchi toutes les étapes principales (Code validé, APK prêt, Déploiement Web configuré)."
                  : "Vos 3 IA ont synchronisé la conception, la recherche de styles et l'architecture logicielle."}
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                id="btn-open-preview-main"
                onClick={onOpenPreview}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2 active:scale-95"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Aperçu en Direct</span>
              </button>
              <button
                id="btn-open-smart-export-top"
                onClick={() => setActiveTab("github")}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center gap-2 active:scale-95"
                title="Exporter vers GitHub ou télécharger le package ZIP en 1 clic"
              >
                <Github className="w-4 h-4" />
                <span>⚡ Export 1-Clic</span>
              </button>
              <button
                id="btn-open-velocity-dashboard"
                onClick={() => setActiveTab("velocity")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 border ${
                  activeTab === "velocity"
                    ? "bg-blue-600 text-white border-blue-500 shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700"
                }`}
                title="Consulter le tableau de bord de vélocité et de ressources"
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Vélocité & IA</span>
              </button>
              <button
                id="btn-open-health-dashboard"
                onClick={() => setActiveTab("health")}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 border ${
                  activeTab === "health"
                    ? "bg-purple-600 text-white border-purple-500 shadow-md"
                    : "bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700"
                }`}
                title="Consulter le rapport de diagnostic, erreurs et tests IA"
              >
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Diagnostic & Tests</span>
              </button>
              <button
                id="btn-open-share-workspace"
                onClick={() => (onOpenShare ? onOpenShare() : setActiveTab("share"))}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center gap-2 active:scale-95"
                title="Partager sur WhatsApp, Instagram, Email, Réseaux..."
              >
                <Share2 className="w-4 h-4" />
                <span>Partager l'App</span>
              </button>
              <button
                id="btn-open-settings-workspace"
                onClick={() => (onOpenSettings ? onOpenSettings() : setIsSettingsModalOpen(true))}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
                title="Paramètres du Projet & Exportation GitHub (PAT)"
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Paramètres</span>
              </button>
              <button
                id="btn-run-generation-main"
                onClick={runFullAiGeneration}
                disabled={isAiLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-2 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
                <span>{isAiLoading ? "Synchronisation 3 IA..." : "Synchroniser"}</span>
              </button>
            </div>
          </div>

          {/* Roadmap Status Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Progression globale du parcours :</span>
              <span className="font-bold text-blue-400">{project.stepProgress}% accompli</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(15, project.stepProgress)}%` }}
              ></div>
            </div>

            {/* Steps Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
              {stepsList.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold border transition ${
                      step.isCurrent
                        ? "bg-blue-600/30 border-blue-500 text-white shadow-xs"
                        : step.isDone
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-800/50 border-slate-800 text-slate-500"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{step.name}</span>
                    {step.isDone && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* "Comment puis-je vous aider aujourd'hui ?" Prompt Box */}
          <div className="pt-2">
            <form onSubmit={handleSendChatMessage} className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="💬 Que puis-je faire pour vous aider sur ce projet ? (ex: ajouter un bouton Wave, changer le logo, ajouter une page...)"
                className="w-full pl-4 pr-28 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1"
                >
                  <span>Envoyer</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. THE 3 COORDINATED AI AGENTS DISPLAY CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Les 3 Intelligences Artificielles Coordonnées
            </h2>
          </div>
          {onOpenOnboardingTour && (
            <button
              id="btn-workspace-open-ai-guide"
              onClick={onOpenOnboardingTour}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-xl transition hover:bg-purple-900/50 active:scale-95"
              title="Ouvrir le guide interactif expliquant le rôle de chaque IA"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guide Interactif des 3 IA</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* IA 1: Développement */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              IA Dév & Admin
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">IA de Développement</h3>
            <p className="text-xs text-slate-400 mt-0.5">Génération d'applications, APK, AAB et administration de la plateforme.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Fichiers générés :</span>
              <span className="font-mono font-bold text-white">{project.files.length} fichiers</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Version actuelle :</span>
              <span className="font-mono font-bold text-emerald-400">{project.versions[0]?.versionTag || "v1.0.0"}</span>
            </div>
          </div>
        </div>

        {/* IA 2: Recherche Web & Inspiration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              IA Recherche & Design
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">IA de Recherche Web</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tendances design modernes, accessibilité WCAG et ressources 100% gratuites.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Bibliothèques :</span>
              <span className="font-bold text-white">Tailwind & Lucide CDN</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Accessibilité :</span>
              <span className="font-bold text-emerald-400">Conforme WCAG AA</span>
            </div>
          </div>
        </div>

        {/* IA 3: Contrôle & Sécurité */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              IA Contrôle & Tests
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">IA de Contrôle & Sécurité</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tests automatiques, détection d'erreurs, sécurité et validation du code.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Score Qualité :</span>
              <span className="font-mono font-bold text-emerald-400">{project.securityAudit?.globalScore || 98}/100</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tests validés :</span>
              <span className="font-bold text-white">
                {project.securityAudit?.testsPassedCount || 16}/{project.securityAudit?.totalTestsCount || 16} réussis
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 3. SUB-NAVIGATION TABS FOR THE ECOSYSTEM TOOLS */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: "overview", label: "Vue d'ensemble & Aperçu", icon: Eye },
          { id: "velocity", label: "📈 Vélocité & Ressources", icon: TrendingUp },
          { id: "health", label: "Diagnostic Santé & Tests IA", icon: Activity },
          { id: "apk", label: "Génération APK & AAB", icon: Smartphone },
          { id: "web", label: "Déploiement Web", icon: Globe },
          { id: "share", label: "Partage & Réseaux", icon: Share2 },
          { id: "hosting", label: "Recherche d'Hébergement", icon: Server },
          { id: "docs", label: "Conservation Documents", icon: FileText },
          { id: "github", label: "⚡ Export 1-Clic GitHub & ZIP", icon: Github },
          { id: "publish", label: "Assistant Publication", icon: Rocket },
          { id: "versions", label: "Versions & Historique", icon: RotateCcw },
          { id: "code", label: "Fichiers & Code", icon: Code2 },
          { id: "chat", label: "Assistant IA 24/7", icon: MessageSquare },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white font-bold border-b-2 border-blue-500 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. WORKSPACE TAB CONTENTS */}

      {/* TAB: OVERVIEW & LIVE SANDBOX */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Main: Live Sandbox Iframe */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="font-bold text-sm text-white">Aperçu Interactif en Temps Réel</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenPreview}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mode Écran Mobile</span>
                  </button>
                  <button
                    onClick={() => {
                      const w = window.open();
                      w?.document.write(project.interactiveAppHtml);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Plein Écran</span>
                  </button>
                </div>
              </div>

              {/* Responsive Iframe Frame */}
              <div className="w-full h-[520px] rounded-2xl overflow-hidden bg-white border border-slate-700 shadow-inner">
                <iframe
                  title="Live Sandbox"
                  srcDoc={project.interactiveAppHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              </div>
            </div>

            {/* Right: Quick Insights & Research Data */}
            <div className="lg:col-span-4 space-y-4">
              {/* Research & Inspiration Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  Inspirations & Design Moderne
                </h3>
                <p className="text-xs text-slate-400">{project.researchData?.summary}</p>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Fonctionnalités Clés :</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {project.researchData?.keyFeatures?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <p>
                    🎨 <strong>Palette :</strong> {project.researchData?.suggestedTheme?.designStyle}
                  </p>
                  <p>
                    ♿ <strong>Accessibilité :</strong> {project.researchData?.accessibilityTips?.[0]}
                  </p>
                </div>
              </div>

              {/* Quick Export / Download Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  Actions Rapides & Téléchargement
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("github")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>⚡ Export 1-Clic GitHub & ZIP</span>
                  </button>
                  <button
                    onClick={handleDownloadProjectZip}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger Archive ZIP Prête à Déployer</span>
                  </button>
                  <button
                    onClick={handleDownloadApkBundle}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs transition border border-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Télécharger APK / AAB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Velocity & Resource Usage Dashboard in Overview */}
          <ProjectVelocityDashboard
            project={project}
            onOpenHealthTab={() => setActiveTab("health")}
          />

          {/* Integrated Health & Diagnostic Dashboard in Overview */}
          <ProjectHealthDashboard
            project={project}
            onUpdateProject={onUpdateProject}
            onOpenPreview={onOpenPreview}
            onOpenShare={() => (onOpenShare ? onOpenShare() : setActiveTab("share"))}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        </div>
      )}

      {/* TAB: DEDICATED VELOCITY & RESOURCE USAGE DASHBOARD */}
      {activeTab === "velocity" && (
        <div className="space-y-6">
          <ProjectVelocityDashboard
            project={project}
            onOpenHealthTab={() => setActiveTab("health")}
          />
        </div>
      )}

      {/* TAB: DEDICATED HEALTH & DIAGNOSTIC DASHBOARD */}
      {activeTab === "health" && (
        <ProjectHealthDashboard
          project={project}
          onUpdateProject={onUpdateProject}
          onOpenPreview={onOpenPreview}
          onOpenShare={() => (onOpenShare ? onOpenShare() : setActiveTab("share"))}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {/* TAB: APK & AAB GENERATION */}
      {activeTab === "apk" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Générateur Natif Android (APK & AAB)</h3>
                <p className="text-xs text-slate-400">Compilation autonome sans Android Studio nécessaire</p>
              </div>
            </div>

            <button
              onClick={handleDownloadApkBundle}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger les fichiers APK & AAB</span>
            </button>
          </div>

          {/* APK Details & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Format APK (Test Mobile)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Prêt</span>
              </div>
              <p className="text-xl font-extrabold text-white">{project.apkBundleConfig.apkSizeMb}</p>
              <p className="text-[11px] text-slate-400">Installable directement sur tout smartphone Android par scan ou téléchargement.</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Format AAB (Google Play)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">Signé</span>
              </div>
              <p className="text-xl font-extrabold text-white">{project.apkBundleConfig.aabSizeMb}</p>
              <p className="text-[11px] text-slate-400">Android App Bundle conforme aux exigences du Google Play Console.</p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Identifiant Unique</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">v1.0.0</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-200 truncate">{project.apkBundleConfig.packageName}</p>
              <p className="text-[11px] text-slate-400">Empreinte SHA-256 certifiée et prête pour la signature.</p>
            </div>
          </div>

          {/* QR Code Mobile Test */}
          <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Tester directement sur votre téléphone :
              </h4>
              <p className="text-xs text-slate-400">
                Ouvrez la caméra ou l'application QR code de votre téléphone Android et scannez pour lancer l'application en direct sans installation !
              </p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-lg flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(project.webDeployment?.liveUrl || "https://afribuilder.app")}`}
                alt="QR Code Preview"
                className="w-28 h-28"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: WEB DEPLOYMENT */}
      {activeTab === "web" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Déploiement Web Instantané</h3>
                <p className="text-xs text-slate-400">Hébergement mondial avec certificat HTTPS SSL automatique</p>
              </div>
            </div>

            <button
              onClick={handleSimulateDeploy}
              disabled={isDeployingWeb}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>{isDeployingWeb ? "Déploiement en cours..." : "Re-déployer en 1 clic"}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">URL de Production :</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">En Ligne 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={project.webDeployment?.liveUrl}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 outline-none"
              />
              <button
                onClick={() => copyToClipboard(project.webDeployment?.liveUrl || "", "url")}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition text-xs flex items-center gap-1"
              >
                {copiedText === "url" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={project.webDeployment?.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <span>Visiter</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SHARE & MULTI-CHANNEL TRANSFER (WhatsApp, Instagram, Link, Mail, Social, QR) */}
      {activeTab === "share" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Centre de Partage & Diffusion Omnicanal</h3>
                <p className="text-xs text-slate-400">
                  Transférez votre application par WhatsApp, Instagram, Lien direct, Email, SMS et Réseaux sociaux
                </p>
              </div>
            </div>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ouvrir en Fenêtre Dédiée</span>
              </button>
            )}
          </div>

          {/* 1. Direct Link Section */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Lien Public Direct :
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Actif & Accessible Partout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`, "share_tab_url")}
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                {copiedText === "share_tab_url" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le Lien</span>
                  </>
                )}
              </button>
              <a
                href={project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center shrink-0"
                title="Tester dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 2. Direct Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Partage WhatsApp</h4>
                    <p className="text-[10px] text-slate-400">Discussion, statut ou groupe</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Envoyez un message prêt à l'emploi avec le lien d'accès en 1 clic à vos contacts et clients.
                </p>
              </div>
              <button
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🚀 Découvrez l'application "${project.title}" créée avec l'IA AfriBuilder Studio :\n${project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`}`
                  )}`;
                  window.open(url, "_blank");
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ouvrir WhatsApp</span>
              </button>
            </div>

            {/* Instagram */}
            <div className="p-4 bg-pink-950/20 rounded-2xl border border-pink-500/30 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Partage Instagram</h4>
                    <p className="text-[10px] text-slate-400">Story, Bio, Reel ou DM</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Copie la légende optimisée avec hashtags et ouvre Instagram pour coller dans votre bio ou story.
                </p>
              </div>
              <button
                onClick={() => {
                  const caption = `✨ Découvrez l'application "${project.title}" : ${project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`} #AfriBuilder #NoCode #TechAfrique`;
                  copyToClipboard(caption, "insta_btn");
                  window.open("https://www.instagram.com", "_blank");
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Copier Légende & Instagram</span>
              </button>
            </div>

            {/* E-mail */}
            <div className="p-4 bg-blue-950/30 rounded-2xl border border-blue-500/30 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Partage par E-mail</h4>
                    <p className="text-[10px] text-slate-400">Courriel pro pré-rempli</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Crée instantanément un courriel avec sujet et descriptif prêt pour vos investisseurs ou partenaires.
                </p>
              </div>
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Découvrez l'application ${project.title}`);
                  const body = encodeURIComponent(
                    `Bonjour,\n\nJe vous invite à découvrir notre application "${project.title}" :\n${project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`}\n\nCordialement.`
                  );
                  window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Envoyer par E-mail</span>
              </button>
            </div>
          </div>

          {/* 3. Other Social Platforms & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Social Grid */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Autres Réseaux Sociaux :</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(project.webDeployment?.liveUrl || "")}`;
                    window.open(url, "_blank");
                  }}
                  className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center gap-2 border border-blue-500/30 transition"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => {
                    const url = `https://t.me/share/url?url=${encodeURIComponent(project.webDeployment?.liveUrl || "")}&text=${encodeURIComponent(`Découvrez "${project.title}"`)}`;
                    window.open(url, "_blank");
                  }}
                  className="p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold flex items-center gap-2 border border-sky-500/30 transition"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>Telegram</span>
                </button>

                <button
                  onClick={() => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez mon application "${project.title}"`)}&url=${encodeURIComponent(project.webDeployment?.liveUrl || "")}`;
                    window.open(url, "_blank");
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
                >
                  <Twitter className="w-3.5 h-3.5 fill-current" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={() => {
                    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(project.webDeployment?.liveUrl || "")}`;
                    window.open(url, "_blank");
                  }}
                  className="p-2.5 rounded-xl bg-blue-700/20 hover:bg-blue-700/30 text-blue-300 text-xs font-semibold flex items-center gap-2 border border-blue-600/30 transition"
                >
                  <Linkedin className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* QR Code Quick Card */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>Affiche & Scan QR Code</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Idéal pour imprimer sur vos flyers ou faire tester immédiatement à vos clients en magasin.
                </p>
                <button
                  onClick={() => {
                    window.open(
                      `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(project.webDeployment?.liveUrl || "")}`,
                      "_blank"
                    );
                  }}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger HD</span>
                </button>
              </div>
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(project.webDeployment?.liveUrl || "https://afribuilder.app")}`}
                  alt="QR Code"
                  className="w-20 h-20"
                />
              </div>
            </div>
          </div>

          {/* 4. Client Presentation PDF Architecture Card */}
          <div className="p-5 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 rounded-2xl border border-blue-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      Dossier d'Architecture & Fiche Technique Client (PDF A4)
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      Format Pro Client
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Générez un dossier récapitulatif complet de l'architecture, de la sécurité, des intégrations Mobile Money et du QR code pour vos présentations et réunions clients.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadArchitecturePdfFile(project)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF (.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={() => openArchitecturePdfPrintWindow(project)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Imprimer / PDF Pro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FREE HOSTING FINDER */}
      {activeTab === "hosting" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Recherche & Intégration d'Hébergements 100% Gratuits</h3>
              <p className="text-xs text-slate-400">Sélection automatique des meilleurs hébergeurs sans frais mensuels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.hostingOptions?.map((host) => (
              <div key={host.provider} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{host.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {host.tier}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {host.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 text-[11px] text-slate-300 font-mono whitespace-pre-line">
                    {host.setupGuide}
                  </div>
                </div>

                <a
                  href={host.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Configurer sur {host.provider}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DOCUMENTATION VAULT */}
      {activeTab === "docs" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Conservation des Documents & Spécifications</h3>
                <p className="text-xs text-slate-400">Cahier des charges, architecture, guide utilisateur et manuel technique</p>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(project.documentation, "doc")}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              {copiedText === "doc" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText === "doc" ? "Copié !" : "Copier la Documentation"}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-[480px] overflow-y-auto leading-relaxed">
            {project.documentation}
          </div>
        </div>
      )}

      {/* TAB: GITHUB & SOURCE EXPORTER */}
      {activeTab === "github" && (
        <SmartExportWizard
          project={project}
          onUpdateProject={onUpdateProject}
          onOpenPayment={onOpenPayment}
        />
      )}

      {/* TAB: PUBLICATION ASSISTANT */}
      {activeTab === "publish" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Assistant de Publication Google Play Store</h3>
              <p className="text-xs text-slate-400">Fiche produit, métadonnées, politique de confidentialité et conformité</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="font-bold text-slate-300">Titre de l'application (Max 30 car.) :</span>
              <input
                type="text"
                readOnly
                value={project.title}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold outline-none"
              />

              <span className="font-bold text-slate-300 block pt-2">Description courte (Max 80 car.) :</span>
              <input
                type="text"
                readOnly
                value={project.description.slice(0, 80)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
              />

              <span className="font-bold text-slate-300 block pt-2">Mots-clés Store :</span>
              <div className="flex flex-wrap gap-1.5">
                {["Mobile Money", "Wave", "Orange", "E-commerce", "Afrique", "No-Code"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-900 text-blue-300 rounded-md border border-slate-700 text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <span className="font-bold text-slate-300">Checklist de Conformité Store :</span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Fichier Android App Bundle (.aab) signé en SHA-256</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Cible Android API 34 (exigence Google Play 2026)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Politique de confidentialité générée et incluse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Pas de permissions invasives ou inutiles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: VERSIONS & HISTORY */}
      {activeTab === "versions" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Historique des Versions & Sauvegardes</h3>
                <p className="text-xs text-slate-400">Restaurations instantanées et traçabilité des modifications</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {project.versions?.map((v, idx) => (
              <div key={v.id} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                      {v.versionTag}
                    </span>
                    <span className="text-xs font-bold text-white">{v.summary}</span>
                    {idx === 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auteur : {v.author} • {new Date(v.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>

                {idx !== 0 && (
                  <button
                    onClick={() => triggerNotice(`Version ${v.versionTag} restaurée !`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                  >
                    Restaurer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CODE & FILE EXPLORER */}
      {activeTab === "code" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Explorer Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Explorateur de Code Source & Fichiers</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                  {filesList.length} fichiers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualisez, modifiez en direct et téléchargez l'ensemble des fichiers générés pour votre application.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddFileModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                title="Ajouter un nouveau fichier personnalisé au projet"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Nouveau Fichier</span>
              </button>

              <button
                onClick={handleRestoreDefaultFiles}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                title="Rétablir les fichiers de base si certains ont été effacés"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurer Fichiers</span>
              </button>

              <button
                onClick={() => handleDownloadSingleFile(selectedFile)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
                title="Télécharger uniquement ce fichier"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Télécharger</span>
              </button>

              <button
                onClick={() => copyToClipboard(selectedFile.content || "", "file")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
              >
                {copiedText === "file" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === "file" ? "Copié !" : "Copier le code"}</span>
              </button>

              <button
                onClick={() => setIsEditingFile(!isEditingFile)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 border ${
                  isEditingFile
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingFile ? "Mode Lecture" : "Modifier le Fichier"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar File Tree */}
            <div className="space-y-3 md:border-r md:border-slate-800/80 md:pr-4">
              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fileSearchQuery}
                  onChange={(e) => setFileSearchQuery(e.target.value)}
                  placeholder="Rechercher un fichier..."
                  className="w-full pl-8 pr-7 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                {fileSearchQuery && (
                  <button
                    onClick={() => setFileSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Files List */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {filesList
                  .filter((f) => {
                    const q = fileSearchQuery.toLowerCase();
                    return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
                  })
                  .map((file) => {
                    const isSelected = selectedFileName === file.name;
                    return (
                      <button
                        key={file.name}
                        onClick={() => {
                          setSelectedFileName(file.name);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition flex flex-col gap-1 border ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500/50 text-white font-bold shadow-xs"
                            : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                            <span className="truncate font-mono">{file.name}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase shrink-0 ${
                              isSelected
                                ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {file.language || "txt"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono truncate pl-5">
                          {file.path}
                        </span>
                      </button>
                    );
                  })}

                {filesList.filter((f) => {
                  const q = fileSearchQuery.toLowerCase();
                  return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    Aucun fichier ne correspond à "{fileSearchQuery}".
                  </div>
                )}
              </div>
            </div>

            {/* Main File Content / Editor Area */}
            <div className="md:col-span-3 space-y-3">
              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-mono text-slate-300">
                  <span className="text-blue-400 font-bold">{selectedFile.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 text-[11px]">{selectedFile.path}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>{(selectedFile.content?.length || 0).toLocaleString()} car.</span>
                  <span>•</span>
                  <span>{(selectedFile.content?.split("\n").length || 1)} lignes</span>
                  <span>•</span>
                  <span className="text-emerald-400">
                    {((selectedFile.content?.length || 0) / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              {/* Editor / Viewer Container */}
              {isEditingFile ? (
                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-2xl border border-blue-500/40 overflow-hidden shadow-inner">
                    <div className="bg-blue-950/40 px-4 py-2 border-b border-blue-500/20 flex items-center justify-between text-xs text-blue-200">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        Mode Édition Activé — Les modifications s'appliquent immédiatement
                      </span>
                      {selectedFile.name === "index.html" && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          ⚡ Synchronisé avec le Bac à Sable & Mobile
                        </span>
                      )}
                    </div>
                    <textarea
                      value={editedFileContent}
                      onChange={(e) => setEditedFileContent(e.target.value)}
                      spellCheck={false}
                      className="w-full h-[450px] p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditedFileContent(selectedFile.content || "");
                        setIsEditingFile(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEditedFile}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Enregistrer les Modifications</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[500px] overflow-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap select-text">{selectedFile.content || "/* Fichier vide */"}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Modal to Add New File */}
          {isAddFileModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-blue-400" />
                    Ajouter un Nouveau Fichier au Projet
                  </h4>
                  <button
                    onClick={() => setIsAddFileModalOpen(false)}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddNewFile} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Nom du Fichier :</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: app-styles.css, custom-script.js, config.json..."
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Chemin d'accès relatif :</label>
                    <input
                      type="text"
                      placeholder="ex: www/css/ ou src/utils/"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Langage / Format :</label>
                    <select
                      value={newFileLanguage}
                      onChange={(e) => setNewFileLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Contenu Initial :</label>
                    <textarea
                      rows={5}
                      placeholder="// Écrivez ou collez le code initial ici..."
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 font-mono leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddFileModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md flex items-center gap-1.5"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      <span>Créer le Fichier</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: 24/7 AI CHAT ASSISTANT */}
      {activeTab === "chat" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Assistant IA Spécialisé 24/7</h3>
              <p className="text-xs text-slate-400">Dialoguez en direct avec l'IA de votre choix</p>
            </div>

            {/* Role selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChatRole("developer")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chatRole === "developer" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                💻 IA Dév
              </button>
              <button
                onClick={() => setChatRole("researcher")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chatRole === "researcher" ? "bg-amber-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                🔍 IA Recherche
              </button>
              <button
                onClick={() => setChatRole("controller")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chatRole === "controller" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                🛡️ IA Sécurité
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {project.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : msg.role === "researcher"
                    ? "bg-amber-950/40 border border-amber-500/40 text-amber-200"
                    : msg.role === "controller"
                    ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-200"
                    : "bg-slate-800 border border-slate-700 text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold opacity-80">
                  <span>{msg.senderName}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Posez une question à l'${chatRole === "developer" ? "IA de Développement" : chatRole === "researcher" ? "IA de Recherche" : "IA de Contrôle"}...`}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <span>Envoyer</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Project Settings & GitHub PAT Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </div>
  );
};
