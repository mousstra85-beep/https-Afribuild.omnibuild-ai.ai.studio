import React, { useState, useEffect } from "react";
import { Project } from "../types";
import {
  Github,
  Key,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Settings,
  X,
  UploadCloud,
  FileCode2,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
  GitBranch,
  Terminal,
  Smartphone,
  Globe,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  validateGitHubToken,
  exportProjectToGitHub,
  GitHubUser,
  GitHubExportResult,
} from "../utils/githubService";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updated: Project) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<"github" | "general">("github");

  // GitHub PAT State
  const [token, setToken] = useState<string>(() => {
    return project.githubConfig?.personalAccessToken || localStorage.getItem("afribuilder_github_pat") || "";
  });
  const [showToken, setShowToken] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenUser, setTokenUser] = useState<GitHubUser | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // GitHub Export Form State
  const [repoName, setRepoName] = useState<string>(() => {
    return (
      project.githubConfig?.repoName ||
      project.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") ||
      "mon-application-afribuilder"
    );
  });
  const [repoDescription, setRepoDescription] = useState(project.description);
  const [isPrivate, setIsPrivate] = useState<boolean>(project.githubConfig?.isPrivate ?? false);
  const [branch, setBranch] = useState<string>(project.githubConfig?.branch || "main");
  const [commitMessage, setCommitMessage] = useState(
    `🚀 Export initial du projet ${project.title} depuis AfriBuilder AI Studio`
  );

  // Export Progress State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ step: string; percent: number }>({
    step: "",
    percent: 0,
  });
  const [exportResult, setExportResult] = useState<GitHubExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // General Settings State
  const [generalTitle, setGeneralTitle] = useState(project.title);
  const [generalDescription, setGeneralDescription] = useState(project.description);
  const [generalCategory, setGeneralCategory] = useState(project.category);
  const [generalTargetType, setGeneralTargetType] = useState(project.targetType);
  const [generalPackageName, setGeneralPackageName] = useState(
    project.apkBundleConfig?.packageName || "com.afribuilder.app"
  );
  const [generalSubdomain, setGeneralSubdomain] = useState(
    project.webDeployment?.subdomain || project.id
  );
  const [generalSuccess, setGeneralSuccess] = useState(false);

  // Auto-validate token on mount or if provided
  useEffect(() => {
    if (token && token.trim().length >= 10 && !tokenUser && !tokenError) {
      handleTestToken(false);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestToken = async (showSuccessAlert = true) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setTokenError("Veuillez entrer votre jeton d'accès GitHub (PAT).");
      setTokenUser(null);
      return;
    }

    setIsValidatingToken(true);
    setTokenError(null);

    try {
      const user = await validateGitHubToken(cleanToken);
      setTokenUser(user);
      // Persist in localStorage and project config
      localStorage.setItem("afribuilder_github_pat", cleanToken);

      const updatedProject: Project = {
        ...project,
        githubConfig: {
          ...project.githubConfig,
          personalAccessToken: cleanToken,
          username: user.login,
        },
      };
      onUpdateProject(updatedProject);
    } catch (err: any) {
      setTokenError(err.message || "Erreur de connexion au compte GitHub.");
      setTokenUser(null);
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleClearToken = () => {
    setToken("");
    setTokenUser(null);
    setTokenError(null);
    localStorage.removeItem("afribuilder_github_pat");

    const updatedProject: Project = {
      ...project,
      githubConfig: {
        ...project.githubConfig,
        personalAccessToken: undefined,
        username: undefined,
      },
    };
    onUpdateProject(updatedProject);
  };

  const handleRunExport = async () => {
    if (!token.trim()) {
      setExportError("Un jeton d'accès personnel GitHub (PAT) est requis pour l'exportation.");
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportResult(null);

    try {
      const result = await exportProjectToGitHub({
        token: token.trim(),
        project,
        repoName,
        description: repoDescription,
        isPrivate,
        branch,
        commitMessage,
        onProgress: (step, percent) => {
          setExportProgress({ step, percent });
        },
      });

      setExportResult(result);

      // Save config in project
      const updatedProject: Project = {
        ...project,
        githubConfig: {
          personalAccessToken: token.trim(),
          username: result.owner,
          repoName: result.repoName,
          isPrivate,
          branch,
          lastExportedAt: result.timestamp,
          lastExportUrl: result.repoUrl,
        },
      };
      onUpdateProject(updatedProject);
    } catch (err: any) {
      setExportError(err.message || "Une erreur est survenue lors de l'exportation vers GitHub.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Project = {
      ...project,
      title: generalTitle.trim() || project.title,
      description: generalDescription.trim() || project.description,
      category: generalCategory,
      targetType: generalTargetType,
      apkBundleConfig: {
        ...project.apkBundleConfig,
        packageName: generalPackageName.trim() || project.apkBundleConfig.packageName,
      },
      webDeployment: {
        ...project.webDeployment,
        subdomain: generalSubdomain.trim() || project.webDeployment.subdomain,
        liveUrl: `https://${generalSubdomain.trim() || project.id}.afribuilder.app`,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updated);
    setGeneralSuccess(true);
    setTimeout(() => setGeneralSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div
        id="modal-project-settings"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-white shadow-md">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Paramètres du Projet & Intégration GitHub</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {project.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configuration du jeton d'accès GitHub (PAT), export automatique et métadonnées
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-btn-github-settings"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
              activeTab === "github"
                ? "bg-slate-900 text-white font-bold border-b-2 border-blue-500 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Github className="w-4 h-4 text-emerald-400" />
            <span>🔑 Jeton d'Accès GitHub (PAT) & Export</span>
          </button>

          <button
            id="tab-btn-general-settings"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition ${
              activeTab === "general"
                ? "bg-slate-900 text-white font-bold border-b-2 border-blue-500 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>⚙️ Paramètres Généraux du Projet</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GITHUB PERSONAL ACCESS TOKEN & EXPORT */}
          {activeTab === "github" && (
            <div className="space-y-6">
              {/* Section 1: PAT Configuration Card */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Jeton d'Accès Personnel GitHub (PAT)
                    </h3>
                  </div>
                  {tokenUser && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Connecté : @{tokenUser.login}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Le jeton d'accès personnel GitHub (Personal Access Token) permet à AfriBuilder AI Studio d'exporter et
                  de créer des dépôts directement sur votre compte GitHub en toute sécurité.
                </p>

                {/* PAT Input Field with Controls */}
                <div className="space-y-2">
                  <div className="relative flex items-center">
                    <input
                      id="input-github-pat"
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value);
                        setTokenError(null);
                      }}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx ou github_pat_xxxxxxxx..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none pr-28"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title={showToken ? "Masquer le jeton" : "Afficher le jeton"}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {token && (
                        <button
                          type="button"
                          onClick={handleClearToken}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Effacer le jeton"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      id="btn-test-github-pat"
                      onClick={() => handleTestToken(true)}
                      disabled={isValidatingToken || !token.trim()}
                      className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isValidatingToken ? "animate-spin" : ""}`} />
                      <span>{isValidatingToken ? "Vérification..." : "Vérifier le Jeton"}</span>
                    </button>

                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=AfriBuilder+AI+Studio+Export"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                    >
                      <span>Créer un jeton GitHub avec permission `repo`</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Token Error Alert */}
                {tokenError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{tokenError}</span>
                  </div>
                )}

                {/* Connected User Profile Card */}
                {tokenUser && (
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={tokenUser.avatar_url}
                        alt={tokenUser.login}
                        className="w-10 h-10 rounded-xl border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white">{tokenUser.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">(@{tokenUser.login})</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{tokenUser.public_repos} dépôts publics</span>
                          <span>•</span>
                          <span className="text-emerald-400">Prêt pour l'export</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={tokenUser.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Ouvrir le profil GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Instructions Accordion */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-300 space-y-1.5">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Comment obtenir votre jeton d'accès GitHub (PAT) ?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                    <li>Rendez-vous sur <strong className="text-slate-300">GitHub.com → Settings → Developer Settings → Personal Access Tokens</strong>.</li>
                    <li>Cliquez sur <strong className="text-slate-300">Generate new token (classic)</strong>.</li>
                    <li>Cochez la case principale <strong className="text-emerald-400">repo</strong> (Accès complet aux dépôts).</li>
                    <li>Copiez la clé générée et collez-la dans le champ ci-dessus.</li>
                  </ol>
                </div>
              </div>

              {/* Section 2: Repository Export Configuration */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Paramètres d'Exportation du Dépôt
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Repo Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                      Nom du Dépôt GitHub :
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-slate-950 text-slate-500 border border-r-0 border-slate-700 rounded-l-xl font-mono text-xs">
                        {tokenUser ? `${tokenUser.login}/` : "github.com/"}
                      </span>
                      <input
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        placeholder="nom-du-projet"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-r-xl text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Branch & Visibility */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      Branche Principale & Confidentialité :
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none"
                        placeholder="main"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isPrivate
                            ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                            : "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                        }`}
                      >
                        {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{isPrivate ? "Privé" : "Public"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-300">Description du Dépôt :</label>
                    <input
                      type="text"
                      value={repoDescription}
                      onChange={(e) => setRepoDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  {/* Commit Message */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-300">Message du Commit :</label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Progress display */}
                {isExporting && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/40 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {exportProgress.step}
                      </span>
                      <span className="font-bold text-white">{exportProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${exportProgress.percent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Export Error Alert */}
                {exportError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{exportError}</span>
                  </div>
                )}

                {/* Export Success Box */}
                {exportResult && (
                  <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold text-xs text-white">Exportation GitHub Réussie !</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {exportResult.pushedFilesCount} fichiers synchronisés
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={exportResult.repoUrl}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(exportResult.repoUrl, "res_url")}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1"
                      >
                        {copiedKey === "res_url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "res_url" ? "Copié !" : "Copier"}</span>
                      </button>
                      <a
                        href={exportResult.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                      >
                        <span>Ouvrir sur GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Main Action Trigger */}
                <button
                  type="button"
                  id="btn-run-github-export-modal"
                  onClick={handleRunExport}
                  disabled={isExporting || !token.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Github className="w-4 h-4" />
                  <span>
                    {isExporting
                      ? "Exportation et synchronisation vers GitHub en cours..."
                      : "Exporter Immédiatement le Projet vers GitHub"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL PROJECT SETTINGS */}
          {activeTab === "general" && (
            <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-4 text-xs">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Informations de l'Application
                </h3>

                {generalSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Paramètres du projet enregistrés avec succès !</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Titre de l'application :</label>
                    <input
                      type="text"
                      value={generalTitle}
                      onChange={(e) => setGeneralTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Description :</label>
                    <textarea
                      rows={3}
                      value={generalDescription}
                      onChange={(e) => setGeneralDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Catégorie :</label>
                      <select
                        value={generalCategory}
                        onChange={(e) => setGeneralCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      >
                        <option value="ecommerce">E-commerce & Boutique</option>
                        <option value="delivery">Livraison & Logistique</option>
                        <option value="service">Services & Réservations</option>
                        <option value="fintech">Fintech & Mobile Money</option>
                        <option value="showcase">Site Vitrine & Portfolio</option>
                        <option value="health">Santé & Bien-être</option>
                        <option value="education">Éducation & Formation</option>
                        <option value="custom">Sur-mesure</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Type de Cible :</label>
                      <select
                        value={generalTargetType}
                        onChange={(e) => setGeneralTargetType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      >
                        <option value="both">Mobile (APK/AAB) & Web Hybride</option>
                        <option value="mobile_app">Application Mobile Android</option>
                        <option value="website">Site Web / Web App</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/50">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        Package ID Android :
                      </label>
                      <input
                        type="text"
                        value={generalPackageName}
                        onChange={(e) => setGeneralPackageName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        Sous-domaine Web :
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={generalSubdomain}
                          onChange={(e) => setGeneralSubdomain(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-l-xl text-white font-mono text-xs outline-none"
                        />
                        <span className="px-2.5 py-2 bg-slate-950 text-slate-500 border border-l-0 border-slate-700 rounded-r-xl text-xs font-mono">
                          .afribuilder.app
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer les Modifications</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Les jetons GitHub restent confidentiels et ne sont jamais partagés.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
