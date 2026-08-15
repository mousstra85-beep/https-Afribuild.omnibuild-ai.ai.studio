import React, { useState } from "react";
import { Project } from "../types";
import {
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Copy,
  Check,
  QrCode,
  Mail,
  Send,
  X,
  ExternalLink,
  Code2,
  Instagram,
  Facebook,
  Globe,
} from "lucide-react";
import { ShareModal } from "./ShareModal";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [deviceMode, setDeviceMode] = useState<"mobile" | "tablet" | "desktop" | "code">("mobile");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!isOpen) return null;

  const previewUrl = project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`;
  const shareText = `🚀 Découvrez l'application "${project.title}" créée avec l'IA AfriBuilder Studio : ${previewUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleInstagramShare = () => {
    const caption = `✨ Découvrez l'application "${project.title}" : ${previewUrl} #AfriBuilder #NoCode`;
    navigator.clipboard.writeText(caption);
    window.open("https://www.instagram.com", "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Découvrez l'application ${project.title}`);
    const body = encodeURIComponent(`${shareText}\n\nConçue sans code avec AfriBuilder AI.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
          {/* Header Bar */}
          <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-850">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-[280px]">
                Aperçu en direct : {project.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Phase {project.currentStepId}
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  deviceMode === "mobile" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => setDeviceMode("tablet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  deviceMode === "tablet" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablette</span>
              </button>
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  deviceMode === "desktop" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bureau</span>
              </button>
              <button
                onClick={() => setDeviceMode("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  deviceMode === "code" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
              </button>
            </div>

            {/* Share & Transfer Controls */}
            <div className="flex items-center gap-2">
              <button
                id="btn-preview-share-direct"
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md active:scale-95"
                title="Partager sur WhatsApp, Instagram, Email, Réseaux..."
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager l'App</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Frame Viewport Container */}
          <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
            {deviceMode === "mobile" && (
              <div className="relative w-[375px] h-[680px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-700 flex flex-col">
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                </div>

                {/* Screen iframe */}
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-white">
                  <iframe
                    title="Mobile App Preview"
                    srcDoc={project.interactiveAppHtml}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  />
                </div>

                {/* Bottom bar */}
                <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2"></div>
              </div>
            )}

            {deviceMode === "tablet" && (
              <div className="relative w-[650px] h-[720px] bg-slate-900 rounded-[36px] p-4 shadow-2xl border-[6px] border-slate-700 flex flex-col">
                <div className="w-full h-full rounded-[24px] overflow-hidden bg-white">
                  <iframe
                    title="Tablet App Preview"
                    srcDoc={project.interactiveAppHtml}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  />
                </div>
              </div>
            )}

            {deviceMode === "desktop" && (
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-white">
                <iframe
                  title="Desktop App Preview"
                  srcDoc={project.interactiveAppHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              </div>
            )}

            {deviceMode === "code" && (
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-auto bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-blue-400 font-bold">Code Source HTML5 / CSS / JavaScript</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(project.interactiveAppHtml);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "Copié !" : "Copier le code"}</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap">{project.interactiveAppHtml}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Complete Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        project={project}
      />
    </>
  );
};
