import React, { useState } from "react";
import { Project } from "../types";
import { downloadStandaloneHtml, getProjectLiveUrl, openAppInNewTab } from "../utils/storage";
import {
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Download,
  ExternalLink,
  Code2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Wrench,
  Check,
  Copy,
} from "lucide-react";
import { ShareModal } from "./ShareModal";

interface LiveAppViewerProps {
  project: Project;
  onOpenStudio: () => void;
}

export const LiveAppViewer: React.FC<LiveAppViewerProps> = ({ project, onOpenStudio }) => {
  const [deviceMode, setDeviceMode] = useState<"fullscreen" | "mobile" | "tablet">("fullscreen");
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyDirectLink = () => {
    const liveUrl = getProjectLiveUrl(project, "app");
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Floating / Persistent App Control Bar */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-3 py-2 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: App Identity & Live Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">
                  {project.title}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Application Déployée
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Mode utilisateur final • Toutes les interfaces & paiements Mobile Money actifs
              </p>
            </div>
          </div>

          {/* Middle: Device Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => setDeviceMode("fullscreen")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                deviceMode === "fullscreen"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Affichage 100% Plein Écran Web"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plein Écran</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                deviceMode === "mobile"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Cadre Smartphone Mobile (iPhone / Android)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode("tablet")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                deviceMode === "tablet"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Cadre Tablette"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablette</span>
            </button>
          </div>

          {/* Right: Actions (Share, Download, Studio) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="btn-live-share"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
              title="Partager sur WhatsApp, Instagram, Lien direct..."
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </button>

            <button
              id="btn-live-copy-link"
              onClick={handleCopyDirectLink}
              className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 transition active:scale-95"
              title="Copier le lien public direct"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copié !" : "Copier Lien"}</span>
            </button>

            <button
              id="btn-live-download-html"
              onClick={() => downloadStandaloneHtml(project)}
              className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 transition active:scale-95"
              title="Télécharger le fichier .HTML autonome"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Fichier .HTML</span>
            </button>

            <button
              id="btn-switch-to-studio"
              onClick={onOpenStudio}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
              title="Basculer vers l'éditeur de conception OmniBuild Studio"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Éditer dans OmniBuild</span>
              <span className="sm:hidden">Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Application Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 bg-slate-950 overflow-hidden relative">
        {deviceMode === "fullscreen" && (
          <div className="w-full h-[calc(100vh-54px)] bg-white">
            <iframe
              id="live-app-iframe-fullscreen"
              title={`Application ${project.title}`}
              srcDoc={project.interactiveAppHtml}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
            />
          </div>
        )}

        {deviceMode === "mobile" && (
          <div className="py-4 px-2 w-full flex items-center justify-center overflow-auto h-[calc(100vh-54px)]">
            <div className="relative w-[375px] h-[720px] max-h-[92vh] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-700 flex flex-col shrink-0">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
              </div>

              {/* Screen iframe */}
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-white">
                <iframe
                  id="live-app-iframe-mobile"
                  title={`Mobile App ${project.title}`}
                  srcDoc={project.interactiveAppHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
                />
              </div>

              {/* Bottom bar */}
              <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2"></div>
            </div>
          </div>
        )}

        {deviceMode === "tablet" && (
          <div className="py-4 px-2 w-full flex items-center justify-center overflow-auto h-[calc(100vh-54px)]">
            <div className="relative w-[680px] h-[780px] max-h-[92vh] bg-slate-900 rounded-[36px] p-4 shadow-2xl border-[6px] border-slate-700 flex flex-col shrink-0">
              <div className="w-full h-full rounded-[24px] overflow-hidden bg-white">
                <iframe
                  id="live-app-iframe-tablet"
                  title={`Tablet App ${project.title}`}
                  srcDoc={project.interactiveAppHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals allow-popups"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
      />
    </div>
  );
};
