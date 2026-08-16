import React, { useState, useEffect } from "react";
import { AdminSettings, Project, UserAccount } from "./types";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  decodeProjectPayload,
  getActiveProjectId,
  getAdminSettings,
  getCurrentUser,
  loadProjects,
  saveAdminSettings,
  saveProjects,
  setActiveProjectId,
  setCurrentUser,
} from "./utils/storage";
import { createDefaultProject } from "./utils/projectGenerators";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { AdminModal } from "./components/AdminModal";
import { ProjectCreateModal } from "./components/ProjectCreateModal";
import { PreviewModal } from "./components/PreviewModal";
import { ShareModal } from "./components/ShareModal";
import { PaymentModal } from "./components/PaymentModal";
import { ApkCheckpointModal } from "./components/ApkCheckpointModal";
import { ProjectWorkspace } from "./components/ProjectWorkspace";
import { ProjectSettingsModal } from "./components/ProjectSettingsModal";
import { OnboardingTour } from "./components/OnboardingTour";
import { LiveAppViewer } from "./components/LiveAppViewer";
import { Sparkles, Plus, Layers, ShieldCheck, Heart } from "lucide-react";

function AppStudio() {
  const { isDark } = useTheme();
  const [currentUser, setUser] = useState<UserAccount>(getCurrentUser());
  const [adminSettings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [projects, setProjectsList] = useState<Project[]>(loadProjects());
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    const saved = getActiveProjectId();
    const list = loadProjects();
    return saved && list.some((p) => p.id === saved) ? saved : list[0]?.id || null;
  });

  // View Mode: 'studio' (IDE/Dashboard) or 'live_app' (User-facing Fullscreen Application)
  const [viewMode, setViewMode] = useState<"studio" | "live_app">(() => {
    if (typeof window === "undefined") return "studio";
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view === "app" || view === "live" || view === "preview" || view === "standalone") {
      return "live_app";
    }
    if (params.has("app") && !params.has("studio")) {
      return "live_app";
    }
    if (window.location.hash && window.location.hash.includes("data=")) {
      return "live_app";
    }
    return "studio";
  });

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentActionName, setPaymentActionName] = useState<string>("Opération");
  const [onPaymentSuccessCallback, setOnPaymentSuccessCallback] = useState<(() => void) | undefined>(undefined);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    // Open for users who haven't disabled it yet
    return localStorage.getItem("afribuilder_hide_onboarding_auto") !== "true";
  });

  // Check URL payload for imported shared projects
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    if (hash && hash.includes("data=")) {
      const b64 = hash.split("data=")[1]?.split("&")[0];
      if (b64) {
        const decoded = decodeProjectPayload(b64);
        if (decoded) {
          const currentList = loadProjects();
          const existingIdx = currentList.findIndex((p) => p.id === decoded.id);
          let updatedList: Project[];
          if (existingIdx >= 0) {
            updatedList = currentList.map((p) => (p.id === decoded.id ? decoded : p));
          } else {
            updatedList = [decoded, ...currentList];
          }
          setProjectsList(updatedList);
          saveProjects(updatedList);
          setActiveIdState(decoded.id);
          setActiveProjectId(decoded.id);
        }
      }
    } else if (params.has("app")) {
      const targetAppId = params.get("app");
      if (targetAppId) {
        const currentList = loadProjects();
        if (currentList.some((p) => p.id === targetAppId)) {
          setActiveIdState(targetAppId);
          setActiveProjectId(targetAppId);
        }
      }
    }
  }, []);

  // Active project reference
  const activeProject = projects.find((p) => p.id === activeId) || projects[0] || null;

  // If in Live App mode (Fullscreen standalone application with zero studio clutter)
  if (viewMode === "live_app" && activeProject) {
    return (
      <LiveAppViewer
        project={activeProject}
        onOpenStudio={() => {
          setViewMode("studio");
          const url = new URL(window.location.href);
          url.searchParams.set("view", "studio");
          window.history.pushState({}, "", url.toString());
        }}
      />
    );
  }

  // Persist projects whenever changed
  const handleUpdateProject = (updated: Project) => {
    const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjectsList(updatedList);
    saveProjects(updatedList);
  };

  const handleSelectProject = (id: string) => {
    setActiveIdState(id);
    setActiveProjectId(id);
  };

  const handleCreateProject = (
    title: string,
    description: string,
    category: Project["category"],
    targetType: Project["targetType"]
  ) => {
    const newProj = createDefaultProject(title, description, category, targetType);
    const updatedList = [newProj, ...projects];
    setProjectsList(updatedList);
    saveProjects(updatedList);
    setActiveIdState(newProj.id);
    setActiveProjectId(newProj.id);
  };

  const handleOpenPaymentWithAction = (actionName: string, onSuccess: () => void) => {
    setPaymentActionName(actionName);
    setOnPaymentSuccessCallback(() => onSuccess);
    setIsPaymentOpen(true);
  };

  // Checkpoint decisions
  const handleContinueWorkflow = () => {
    if (activeProject) {
      const updated: Project = {
        ...activeProject,
        userDecisionAfterApk: "continue",
        currentStepId: "web_deployment",
        stepProgress: 85,
      };
      handleUpdateProject(updated);
    }
    setIsCheckpointOpen(false);
  };

  const handleStayAtApkLevel = () => {
    if (activeProject) {
      const updated: Project = {
        ...activeProject,
        userDecisionAfterApk: "stay_apk",
        currentStepId: "apk_generation",
      };
      handleUpdateProject(updated);
    }
    setIsCheckpointOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        projects={projects}
        activeProject={activeProject}
        adminSettings={adminSettings}
        onSelectProject={handleSelectProject}
        onNewProject={() => setIsCreateOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPayment={() => {
          setPaymentActionName("Recharge Forfait Minutes");
          setOnPaymentSuccessCallback(undefined);
          setIsPaymentOpen(true);
        }}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onLaunchLiveApp={() => {
          setViewMode("live_app");
          const url = new URL(window.location.href);
          url.searchParams.set("view", "app");
          if (activeProject) url.searchParams.set("app", activeProject.id);
          window.history.pushState({}, "", url.toString());
        }}
      />


      {/* Main Studio View */}
      <main className="flex-1">
        {activeProject ? (
          <ProjectWorkspace
            project={activeProject}
            currentUser={currentUser}
            adminSettings={adminSettings}
            onUpdateProject={handleUpdateProject}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onOpenPayment={handleOpenPaymentWithAction}
            onOpenCheckpoint={() => setIsCheckpointOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenOnboardingTour={() => setIsOnboardingOpen(true)}
          />
        ) : (
          <div
            className={`max-w-md mx-auto my-20 p-8 rounded-3xl text-center space-y-4 border ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-500 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Aucun projet sélectionné
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Créez votre première application sans aucune compétence grâce aux 3 IA coordonnées.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Projet</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 px-6 text-center text-xs flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isDark
            ? "border-slate-800/80 bg-slate-900/50 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 shadow-inner"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>AfriBuilder AI Studio</span>
          <span>• Plateforme de création d'applications et sites web no-code</span>
        </div>
        <div className={`flex items-center gap-4 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          <span>Orange Money • Wave • MTN MoMo • Moov</span>
          <span className="flex items-center gap-1 font-medium text-emerald-500">
            <ShieldCheck className="w-3.5 h-3.5" /> Sécurisé 100%
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(u) => setUser(u)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminSettings={adminSettings}
        onSettingsUpdated={(s) => setSettings(s)}
      />

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateProject={handleCreateProject}
        onOpenOnboardingTour={() => setIsOnboardingOpen(true)}
      />

      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartNewProject={() => setIsCreateOpen(true)}
      />

      {activeProject && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          project={activeProject}
        />
      )}

      {activeProject && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          project={activeProject}
        />
      )}

      {activeProject && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          project={activeProject}
          onUpdateProject={handleUpdateProject}
        />
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        currentUser={currentUser}
        adminSettings={adminSettings}
        onUserUpdated={(u) => setUser(u)}
        requiredActionName={paymentActionName}
        onPaymentSuccess={onPaymentSuccessCallback}
      />

      {activeProject && (
        <ApkCheckpointModal
          isOpen={isCheckpointOpen}
          onClose={() => setIsCheckpointOpen(false)}
          project={activeProject}
          onContinueWorkflow={handleContinueWorkflow}
          onStayAtApkLevel={handleStayAtApkLevel}
          onDownloadApk={() => {
            handleOpenPaymentWithAction("Téléchargement Package APK/AAB", () => {
              setIsCheckpointOpen(false);
            });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStudio />
    </ThemeProvider>
  );
}

