import React from "react";
import { AdminSettings, Project, UserAccount } from "../types";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles,
  Shield,
  Cpu,
  Search,
  Plus,
  User,
  Settings,
  FolderOpen,
  Coins,
  Share2,
  Sun,
  Moon,
  HelpCircle,
} from "lucide-react";

interface NavbarProps {
  currentUser: UserAccount;
  projects: Project[];
  activeProject: Project | null;
  adminSettings: AdminSettings;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenPayment: () => void;
  onOpenShare?: () => void;
  onOpenSettings?: () => void;
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  projects,
  activeProject,
  adminSettings,
  onSelectProject,
  onNewProject,
  onOpenAuth,
  onOpenAdmin,
  onOpenPayment,
  onOpenShare,
  onOpenSettings,
  onOpenOnboarding,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <header
      id="app-header"
      className={`${
        isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-200 shadow-sm"
      } border-b sticky top-0 z-40 transition-colors duration-200`}
    >
      {/* Promo banner */}
      {adminSettings.promoModeFree && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold py-1 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
            Offre Spéciale
          </span>
          <span>
            🎉 Mode Promotion Gratuit Activé : Génération d'applications, APK, AAB et hébergement 100% offerts !
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-900/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-extrabold text-base sm:text-lg tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                AfriBuilder <span className="text-blue-500 font-black">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30">
                Studio No-Code
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"} hidden sm:block`}>
              3 IA Synchronisées : Dév • Recherche • Sécurité
            </p>
          </div>
        </div>

        {/* 3 Coordinated AI Status Pill (Interactive Trigger for Tour) */}
        <button
          type="button"
          id="btn-navbar-ai-trio-status"
          onClick={() => onOpenOnboarding && onOpenOnboarding()}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer transition hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200 hover:border-blue-500/40"
              : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:border-blue-400"
          }`}
          title="Cliquez pour lancer le guide interactif des 3 IA"
        >
          <div className="flex items-center gap-1 text-blue-500 font-medium">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>IA Dév</span>
          </div>
          <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
          <div className="flex items-center gap-1 text-amber-500 font-medium">
            <Search className="w-3.5 h-3.5" />
            <span>IA Recherche</span>
          </div>
          <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
          <div className="flex items-center gap-1 text-emerald-500 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>IA Contrôle</span>
          </div>
          <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
          <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Guide
          </span>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Guide 3 IA Button */}
          {onOpenOnboarding && (
            <button
              id="btn-navbar-open-tour"
              onClick={onOpenOnboarding}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl transition border active:scale-95 ${
                isDark
                  ? "bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/40 text-purple-300"
                  : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
              }`}
              title="Guide interactif : Comprendre le rôle des 3 IA et la création de projet"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Guide 3 IA</span>
            </button>
          )}

          {/* Theme Selector Toggle (Dark/Light) */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition border flex items-center justify-center active:scale-95 ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300 shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs"
            }`}
            title={isDark ? "Basculer vers le mode Clair (Light Mode)" : "Basculer vers le mode Sombre (Dark Mode)"}
            aria-label="Changer de thème"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Projects Selector Dropdown */}
          <div className="relative flex items-center">
            <FolderOpen
              className={`w-4 h-4 absolute left-2.5 pointer-events-none ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <select
              value={activeProject?.id || ""}
              onChange={(e) => onSelectProject(e.target.value)}
              className={`text-xs rounded-xl pl-8 pr-7 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none max-w-[130px] sm:max-w-[190px] truncate border ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-slate-100 border-slate-200 text-slate-900"
              }`}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* New Project Button */}
          <button
            id="btn-new-project"
            onClick={onNewProject}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Projet</span>
          </button>

          {/* Direct Share Button if active project */}
          {activeProject && onOpenShare && (
            <button
              id="btn-navbar-share"
              onClick={onOpenShare}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs active:scale-95"
              title="Partager l'application (WhatsApp, Instagram, Mail, Lien...)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </button>
          )}

          {/* Project Settings & GitHub PAT Button */}
          {activeProject && onOpenSettings && (
            <button
              id="btn-navbar-project-settings"
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-xl transition shadow-xs active:scale-95 border ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Paramètres du Projet & Exportation GitHub (PAT)"
            >
              <Settings className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden lg:inline">Paramètres & GitHub</span>
            </button>
          )}

          {/* Credits / Pricing Pill */}
          <button
            id="btn-credits-pill"
            onClick={onOpenPayment}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-xl transition border ${
              isDark
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300"
                : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
            }`}
            title="Tarification et Mobile Money"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {adminSettings.promoModeFree
                ? "Gratuit (Promo)"
                : `${currentUser.credits} min (${currentUser.credits * adminSettings.rateFcfaPerMinute} F)`}
            </span>
          </button>

          {/* Admin Switch */}
          <button
            id="btn-open-admin"
            onClick={onOpenAdmin}
            className={`p-2 rounded-xl transition border ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200"
            }`}
            title="Administration & Tarifs Mobile Money"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Button */}
          <button
            id="btn-user-profile"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 rounded-xl transition border ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden md:inline max-w-[100px] truncate">{currentUser.prenom}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

