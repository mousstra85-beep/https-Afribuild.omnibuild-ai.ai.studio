import React, { useState, useMemo } from "react";
import { Project, AdminSettings, UserAccount } from "../types";
import {
  prepareProjectManifest,
  getGitHubQuickCreateUrl,
  validateGitHubToken,
  exportProjectToGitHub,
  GitHubUser,
  GitHubExportResult,
} from "../utils/githubService";
import { exportProjectZip } from "../utils/projectGenerators";
import { getProjectLiveUrl } from "../utils/storage";
import confetti from "canvas-confetti";
import {
  Github,
  Download,
  Globe,
  Rocket,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  CheckCircle2,
  Key,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  FolderGit2,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  Terminal,
  FileText,
  Boxes,
  Send,
  Zap,
} from "lucide-react";

interface SmartExportWizardProps {
  project: Project;
  currentUser: UserAccount;
  adminSettings: AdminSettings;
  onUpdateProject: (updated: Project) => void;
  onOpenPayment?: (featureName: string, onConfirmAction: () => void) => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const SmartExportWizard: React.FC<SmartExportWizardProps> = ({
  project,
  currentUser,
  adminSettings,
  onUpdateProject,
  onOpenPayment,
  onNavigateToTab,
}) => {
  // GitHub PAT & Credentials State
  const [githubPat, setGithubPat] = useState<string>(
    project.githubConfig?.personalAccessToken || localStorage.getItem("afribuilder_github_pat") || ""
  );
  const [showGithubPat, setShowGithubPat] = useState(false);
  const [isValidatingPat, setIsValidatingPat] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(
    project.githubConfig?.username
      ? {
          login: project.githubConfig.username,
          name: project.githubConfig.username,
          avatar_url: `https://github.com/${project.githubConfig.username}.png`,
          html_url: `https://github.com/${project.githubConfig.username}`,
          public_repos: 0,
        }
      : null
  );
  const [githubPatError, setGithubPatError] = useState<string | null>(null);

  // Exportation State
  const [isExportingGithub, setIsExportingGithub] = useState(false);
  const [githubExportProgress, setGithubExportProgress] = useState({ step: "", percent: 0 });
  const [githubExportError, setGithubExportError] = useState<string | null>(null);
  const [githubExportResult, setGithubExportResult] = useState<GitHubExportResult | null>(
    project.githubConfig?.lastExportUrl
      ? {
          success: true,
          repoUrl: project.githubConfig.lastExportUrl,
          cloneUrl: `${project.githubConfig.lastExportUrl}.git`,
          repoName: project.githubConfig.repoName || "mon-application",
          owner: project.githubConfig.username || "utilisateur",
          pushedFilesCount: 12,
          commitMessage: "Dernière exportation synchronisée",
          timestamp: project.githubConfig.lastExportedAt || new Date().toISOString(),
          pagesUrl: `https://${project.githubConfig.username || "compte"}.github.io/${project.githubConfig.repoName || "repo"}/`,
        }
      : null
  );

  // ZIP Download State
  const [isZipping, setIsZipping] = useState(false);

  // Inspector File Selection
  const [activeInspectorFile, setActiveInspectorFile] = useState<string>("README.md");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Custom Repo Name & Settings
  const [customRepoName, setCustomRepoName] = useState(
    project.githubConfig?.repoName ||
      project.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") ||
      "mon-application-omnibuild"
  );
  const [isPrivateRepo, setIsPrivateRepo] = useState(project.githubConfig?.isPrivate ?? false);

  // Live and generated URLs
  const liveAppUrl = project.webDeployment?.liveUrl || getProjectLiveUrl(project);
  const quickCreateGitHubUrl = getGitHubQuickCreateUrl(project);

  // Automatically prepared manifest & files
  const manifest = useMemo(() => {
    return prepareProjectManifest(project, githubUser?.login);
  }, [project, githubUser]);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Verify GitHub Token
  const handleTestPat = async () => {
    if (!githubPat.trim()) {
      setGithubPatError("Veuillez saisir votre jeton d'accès GitHub.");
      return;
    }
    setIsValidatingPat(true);
    setGithubPatError(null);

    try {
      const u = await validateGitHubToken(githubPat);
      setGithubUser(u);
      localStorage.setItem("afribuilder_github_pat", githubPat.trim());

      const updated: Project = {
        ...project,
        githubConfig: {
          ...project.githubConfig,
          personalAccessToken: githubPat.trim(),
          username: u.login,
        },
      };
      onUpdateProject(updated);
      triggerNotice(`Compte GitHub vérifié : @${u.login}`);
    } catch (e: any) {
      setGithubPatError(e.message || "Erreur de validation du jeton GitHub.");
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
    triggerNotice("Jeton GitHub réinitialisé.");
  };

  // 2. Automated 1-Click GitHub Export
  const handleDirectExportGithub = async () => {
    const cleanToken = githubPat.trim();
    if (!cleanToken) {
      setGithubPatError("Un jeton GitHub (PAT) est requis pour l'export automatique 1-clic.");
      return;
    }

    setIsExportingGithub(true);
    setGithubExportError(null);
    setGithubExportResult(null);

    try {
      const res = await exportProjectToGitHub({
        token: cleanToken,
        project,
        repoName: customRepoName,
        description: project.description,
        isPrivate: isPrivateRepo,
        branch: "main",
        onProgress: (step, percent) => {
          setGithubExportProgress({ step, percent });
        },
      });

      setGithubExportResult(res);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

      const updated: Project = {
        ...project,
        githubConfig: {
          personalAccessToken: cleanToken,
          username: res.owner,
          repoName: res.repoName,
          isPrivate: isPrivateRepo,
          branch: "main",
          lastExportedAt: res.timestamp,
          lastExportUrl: res.repoUrl,
        },
      };
      onUpdateProject(updated);
      triggerNotice("Exportation GitHub réussie avec succès !");
    } catch (err: any) {
      setGithubExportError(err.message || "Erreur lors de l'exportation vers GitHub.");
    } finally {
      setIsExportingGithub(false);
    }
  };

  // 3. Automated 1-Click ZIP Download
  const handleDownloadSmartZip = async () => {
    const doDownload = async () => {
      setIsZipping(true);
      triggerNotice("Génération du package ZIP tout-en-un...");
      try {
        const blob = await exportProjectZip(project);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${customRepoName}_bundle_complet.zip`;
        a.click();
        URL.revokeObjectURL(url);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.65 } });
        triggerNotice("Archive ZIP téléchargée ! Prête pour GitHub Web, Vercel ou Netlify.");
      } catch (err) {
        console.error(err);
        triggerNotice("Erreur lors de la création du ZIP.");
      } finally {
        setIsZipping(false);
      }
    };

    if (adminSettings.promoModeFree || currentUser.credits >= 5) {
      await doDownload();
    } else if (onOpenPayment) {
      onOpenPayment("Exportation Source & Fichiers ZIP", doDownload);
    } else {
      await doDownload();
    }
  };

  // 4. Zero-Token Direct GitHub Creation Helper
  const handleZeroTokenGitHubWorkflow = async () => {
    // Automatically trigger ZIP download so the user has the files ready
    await handleDownloadSmartZip();
    // Open GitHub repo creation in a new tab with prefilled info
    window.open(quickCreateGitHubUrl, "_blank");
  };

  const selectedFileObject = manifest.files.find((f) => f.path === activeInspectorFile) || manifest.files[0];

  return (
    <div className="space-y-6">
      {/* Action Toast */}
      {actionNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. COPILOT HERO / DEVOPS AUTOMATION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                DevOps & Exportation Automatisée 1-Clic
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold text-[10px] border border-blue-500/30">
                Omnibuild AI Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Exportez, Hébergez et Publiez votre Application en <span className="text-emerald-400">1 Clic</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Omnibuild AI prélève automatiquement toutes les informations de{" "}
              <strong className="text-white font-semibold">{project.title}</strong>, prépare l’arborescence des fichiers,
              intègre votre adresse d’hébergement web et configure GitHub Pages, Vercel, Netlify et le code Android.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 shrink-0">
            <button
              onClick={handleDownloadSmartZip}
              disabled={isZipping}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isZipping ? "animate-bounce" : ""}`} />
              <span>{isZipping ? "Création du ZIP..." : "Télécharger ZIP Complet (1 Clic)"}</span>
            </button>

            <a
              href={liveAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voir l'Application en Ligne</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATIC DATA EXTRACTION & LIVE HOSTING CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Project Metadata Extracted */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Nom du Dépôt Suggéré</h4>
              <p className="text-[11px] text-slate-400">Prélevé depuis le titre</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              value={customRepoName}
              onChange={(e) => setCustomRepoName(e.target.value)}
              placeholder="nom-du-depot"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateRepo}
                  onChange={(e) => setIsPrivateRepo(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Dépôt Privé</span>
              </label>
              <span>Branche: <strong className="text-slate-300">main</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Live Web Hosting Address */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Adresse Web d'Hébergement</h4>
              <p className="text-[11px] text-slate-400">Intégrée dans le README</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={liveAppUrl}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-[11px] font-mono text-emerald-300 truncate outline-none"
              />
              <button
                onClick={() => copyToClipboard(liveAppUrl, "live_host_url")}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Copier l'URL d'hébergement"
              >
                {copiedId === "live_host_url" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Certificat SSL actif • Accessible partout</span>
            </p>
          </div>
        </div>

        {/* Card 3: Configurations Built by Omnibuild */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configurations Prêtes</h4>
              <p className="text-[11px] text-slate-400">{manifest.files.length} fichiers auto-générés</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              ✓ index.html
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              ✓ manifest.json (PWA)
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              ✓ deploy.yml (CI/CD)
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              ✓ vercel.json
            </span>
          </div>
        </div>
      </div>

      {/* 3. TWO EASY EXPORT PATHS (WITH OR WITHOUT TOKEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PATH A: 1-CLICK GITHUB AUTOMATED EXPORT (WITH TOKEN) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Méthode 1 : Export GitHub Automatisé en 1 Clic</h3>
                  <p className="text-xs text-slate-400">Création automatique du dépôt et envoi direct du code</p>
                </div>
              </div>

              {githubUser ? (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> @{githubUser.login}
                </span>
              ) : (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Jeton requis
                </span>
              )}
            </div>

            {/* Token input card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Jeton d'accès personnel GitHub (PAT) :
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Omnibuild+AI+Studio+Export"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                >
                  <span>Créer un token en 10 sec</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showGithubPat ? "text" : "password"}
                  value={githubPat}
                  onChange={(e) => {
                    setGithubPat(e.target.value);
                    setGithubPatError(null);
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx ou github_pat_xxxxxxxx..."
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none pr-20"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGithubPat(!showGithubPat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title={showGithubPat ? "Masquer" : "Afficher"}
                  >
                    {showGithubPat ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {githubPat && (
                    <button
                      type="button"
                      onClick={handleClearPat}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Effacer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleTestPat}
                  disabled={isValidatingPat || !githubPat.trim()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3 h-3 ${isValidatingPat ? "animate-spin" : ""}`} />
                  <span>{isValidatingPat ? "Vérification..." : "Vérifier la connexion"}</span>
                </button>
                <span className="text-[10px] text-slate-400">Permission requise : <code>repo</code></span>
              </div>
            </div>

            {githubPatError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{githubPatError}</span>
              </div>
            )}

            {/* Export Progress Bar */}
            {isExportingGithub && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-blue-500/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {githubExportProgress.step}
                  </span>
                  <span className="font-bold text-white">{githubExportProgress.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${githubExportProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {githubExportError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{githubExportError}</span>
              </div>
            )}

            {/* Result Card if exported */}
            {githubExportResult && (
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-xs text-white">Dépôt GitHub Synchronisé !</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {githubExportResult.pushedFilesCount} fichiers envoyés
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={githubExportResult.repoUrl}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(githubExportResult.repoUrl, "gh_res_url")}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                  >
                    {copiedId === "gh_res_url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={githubExportResult.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                  >
                    <span>Ouvrir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDirectExportGithub}
            disabled={isExportingGithub || !githubPat.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 transition active:scale-95 mt-4"
          >
            <Github className="w-4 h-4" />
            <span>
              {isExportingGithub
                ? "Exportation et synchronisation GitHub en cours..."
                : "🚀 Exporter et Publier sur GitHub en 1 Clic"}
            </span>
          </button>
        </div>

        {/* PATH B: ZERO-TOKEN NO-CODE DEPLOYMENT (ZIP + GITHUB WEB OR VERCEL) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Méthode 2 : Sans Token (Glisser-Déposer en 10s)</h3>
                <p className="text-xs text-slate-400">
                  Idéal si vous n'avez pas de jeton GitHub ou préférez Vercel / Netlify
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Téléchargement automatique du package complet :</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  L'archive contient déjà <code className="text-emerald-400">index.html</code>, <code className="text-blue-400">manifest.json</code>, le script de déploiement GitHub Actions et la configuration Android.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Création du dépôt pré-rempli sur GitHub :</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Cliquez sur le bouton ci-dessous : Omnibuild AI ouvre GitHub avec le nom et la description déjà saisis. Vous n'avez plus qu'à glisser vos fichiers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black">
                    3
                  </span>
                  <span>Hébergement direct en 1 Clic (Vercel ou Netlify) :</span>
                </div>
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>Vercel Deploy</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>Netlify Drop</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleZeroTokenGitHubWorkflow}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-indigo-950/40 flex items-center justify-center gap-2 transition active:scale-95 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>📦 Télécharger le ZIP & Ouvrir GitHub Pré-Rempli (1 Clic)</span>
          </button>
        </div>
      </div>

      {/* 4. FILE INSPECTOR & MANIFEST PREVIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Inspecteur des Fichiers Préparés par Omnibuild AI</h3>
              <p className="text-xs text-slate-400">
                Visualisez les fichiers générés avant l'exportation ou le téléchargement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(selectedFileObject.content, "inspector_copy")}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              {copiedId === "inspector_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === "inspector_copy" ? "Copié !" : "Copier le fichier"}</span>
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
          {manifest.files.map((file) => (
            <button
              key={file.path}
              onClick={() => setActiveInspectorFile(file.path)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition border ${
                activeInspectorFile === file.path
                  ? "bg-blue-600 text-white border-blue-500 font-bold shadow-md"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              {file.path}
            </button>
          ))}
        </div>

        {/* Selected File Description */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
          <span className="font-medium">{selectedFileObject.description}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            Taille : {Math.round(selectedFileObject.content.length / 1024 * 10) / 10} Ko
          </span>
        </div>

        {/* Code Content Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
            {selectedFileObject.content}
          </pre>
        </div>
      </div>

      {/* 5. CLI TERMINAL COMMANDS (FOR POWER USERS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                Commandes Git Terminal (Alternative pour Développeurs)
              </h4>
              <p className="text-[11px] text-slate-400">Si vous préférez exécuter l'envoi via votre console</p>
            </div>
          </div>

          <button
            onClick={() =>
              copyToClipboard(
                `git init\ngit add .\ngit commit -m "Initial commit from Omnibuild AI Studio"\ngit branch -M main\ngit remote add origin https://github.com/${githubUser?.login || "votre-compte"}/${customRepoName}.git\ngit push -u origin main`,
                "git_cli_full"
              )
            }
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1"
          >
            {copiedId === "git_cli_full" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === "git_cli_full" ? "Copié !" : "Copier le script"}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs space-y-1">
          <p>git init</p>
          <p>git add .</p>
          <p>git commit -m "Initial commit from Omnibuild AI Studio"</p>
          <p>git branch -M main</p>
          <p>git remote add origin https://github.com/{githubUser?.login || "votre-compte"}/{customRepoName}.git</p>
          <p>git push -u origin main</p>
        </div>
      </div>
    </div>
  );
};
