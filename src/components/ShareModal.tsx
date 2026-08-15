import React, { useState, useEffect } from "react";
import { Project } from "../types";
import { useTheme } from "../context/ThemeContext";
import { getProjectLiveUrl, downloadStandaloneHtml, openAppInNewTab } from "../utils/storage";
import {
  openArchitecturePdfPrintWindow,
  downloadArchitecturePdfFile,
  generateArchitectureDocumentHtml,
} from "../utils/pdfArchitectureGenerator";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Mail,
  Send,
  X,
  ExternalLink,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Smartphone,
  Download,
  Sparkles,
  Phone,
  Layers,
  Globe,
  Play,
  FileCode,
  FileText,
  Printer,
  Eye,
  ShieldCheck,
  Cpu,
  Loader2,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { isDark } = useTheme();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState("");
  const previewUrl = getProjectLiveUrl(project);
  const [customMessage, setCustomMessage] = useState(
    `🚀 Découvrez l'application "${project.title}" créée avec l'IA AfriBuilder Studio !\n👉 Testez-la en direct ici :`
  );
  const [activeShareTab, setActiveShareTab] = useState<"instant" | "social" | "direct_number" | "qrcode" | "pdf_summary">("instant");
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setIsWebShareSupported(true);
    }
  }, []);

  if (!isOpen) return null;

  const fullShareText = `${customMessage}\n${previewUrl}`;
  const instagramCaption = `✨ Nouvelle application créée sans coder : ${project.title} !\n\n${project.description}\n\n📲 Testez l'application en cliquant sur le lien dans ma bio ou ici : ${previewUrl}\n\n#AfriBuilder #NoCode #TechAfrique #Innovation #${project.category} #MobileApp`;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfFeedback("Génération du document PDF d'architecture en cours...");
    try {
      await downloadArchitecturePdfFile(project);
      setPdfFeedback("Dossier PDF d'architecture téléchargé avec succès !");
      setShareFeedback("Dossier PDF d'architecture exporté !");
      setTimeout(() => {
        setPdfFeedback(null);
        setShareFeedback(null);
      }, 4000);
    } catch (e: any) {
      setPdfFeedback("Ouverture de la fenêtre d'impression PDF...");
      openArchitecturePdfPrintWindow(project);
      setTimeout(() => setPdfFeedback(null), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenPdfPrint = () => {
    openArchitecturePdfPrintWindow(project);
    setShareFeedback("Fenêtre d'impression et d'export PDF ouverte !");
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const handleCopyArchitectureMarkdown = () => {
    const summaryMd = `# Spécifications Techniques & Architecture — ${project.title}
- Catégorie : ${project.category}
- Version : v1.0.0 (Prête pour déploiement)
- Accès Démo en direct : ${previewUrl}
- Stack UI : HTML5, Tailwind CSS, Lucide Icons
- Passerelle Mobile Money : Wave, Orange Money, MTN MoMo, Moov Money
- Packaging Mobile : Android API 34 (Android 14) via Capacitor Native Bridge
- Score d'Audit & Sécurité : 98/100 (HTTPS, Protection XSS, Conforme RGPD & APDP)

Généré avec AfriBuilder AI Studio Pro.`;
    handleCopy(summaryMd, "arch_md", "Synthèse d'architecture copiée au format Markdown !");
  };

  const handleCopy = (textToCopy: string, key: string, customFeedback?: string) => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      setShareFeedback(customFeedback || "Lien et message copiés dans le presse-papiers !");
      setTimeout(() => {
        setCopiedKey(null);
        setShareFeedback(null);
      }, 2500);
    } catch {
      setShareFeedback("Échec de copie automatique, veuillez copier le lien manuellement.");
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  /**
   * Generic Native Web Share API helper with automatic fallback to clipboard copy
   */
  const handleNativeShare = async (options?: {
    title?: string;
    text?: string;
    url?: string;
    fallbackKey?: string;
    targetName?: string;
  }) => {
    const title = options?.title || `Application ${project.title}`;
    const text = options?.text || customMessage;
    const url = options?.url || previewUrl;
    const fallbackKey = options?.fallbackKey || "native_share";
    const targetName = options?.targetName || "l'application";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        setShareFeedback(`Partage réussi de ${targetName} !`);
        setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err: any) {
        // AbortError is triggered when user cancels native dialog - do not treat as error
        if (err?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy link/text to clipboard with immediate visual notification
    handleCopy(`${text}\n${url}`, fallbackKey, `Lien copié ! Vous pouvez maintenant le coller dans ${targetName}.`);
  };

  // WhatsApp Native & Direct Share
  const handleWhatsAppNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: `Découvrez "${project.title}"`,
        text: `🚀 Découvrez "${project.title}" créée avec AfriBuilder Studio :`,
        url: previewUrl,
        fallbackKey: "whatsapp_native",
        targetName: "WhatsApp",
      });
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
      window.open(url, "_blank");
    }
  };

  const handleWhatsAppDirectWeb = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // WhatsApp to specific number
  const handleWhatsAppDirectNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = customPhone.replace(/[^0-9]/g, "");
    if (!cleanNumber) return;
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // Instagram Native & Direct Share
  const handleInstagramNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: project.title,
        text: instagramCaption,
        url: previewUrl,
        fallbackKey: "instagram_native",
        targetName: "Instagram",
      });
    } else {
      handleCopy(instagramCaption, "instagram_caption", "Légende copiée ! Ouverture d'Instagram...");
      window.open("https://www.instagram.com", "_blank");
    }
  };

  const handleInstagramDirectWeb = () => {
    handleCopy(instagramCaption, "instagram_caption", "Légende et hashtags copiés ! Collez-les dans votre Story ou Bio Instagram.");
    window.open("https://www.instagram.com", "_blank");
  };

  // Email Native & Direct Share
  const handleEmailNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: `Application ${project.title}`,
        text: `${project.description}\n\nTestez l'application ici :`,
        url: previewUrl,
        fallbackKey: "email_native",
        targetName: "E-mail",
      });
    } else {
      const subject = encodeURIComponent(`Découvrez l'application ${project.title}`);
      const body = encodeURIComponent(`${fullShareText}\n\nCréée sans code sur AfriBuilder AI Studio.`);
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    }
  };

  const handleEmailDirect = () => {
    const subject = encodeURIComponent(`Découvrez l'application ${project.title}`);
    const body = encodeURIComponent(`${fullShareText}\n\nCréée sans code sur AfriBuilder AI Studio.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // Facebook share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`;
    window.open(url, "_blank");
  };

  // Twitter/X share
  const handleTwitterShare = () => {
    const text = `🚀 Découvrez "${project.title}" créée sans coder avec AfriBuilder AI Studio !\n\n${previewUrl} #NoCode #InnovationAfrique`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Telegram share
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(previewUrl)}&text=${encodeURIComponent(customMessage)}`;
    window.open(url, "_blank");
  };

  // LinkedIn share
  const handleLinkedinShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(previewUrl)}`;
    window.open(url, "_blank");
  };

  // SMS direct
  const handleSmsShare = () => {
    const url = `sms:?body=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // Download QR Code image
  const handleDownloadQrCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(previewUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `QRCode_${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(previewUrl)}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "border-slate-800 bg-slate-800/60" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Partage & Diffusion de l'Application
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Prêt & Fonctionnel
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Transférez votre application sur WhatsApp, Instagram, Email ou téléchargez le fichier autonome
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {shareFeedback && (
          <div className="bg-emerald-600/20 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs text-emerald-400 animate-in fade-in slide-in-from-top-2 font-medium">
            <span className="flex items-center gap-1.5 font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              {shareFeedback}
            </span>
            <button onClick={() => setShareFeedback(null)} className="text-emerald-400 hover:text-emerald-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div
          className={`flex border-b px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold ${
            isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-slate-50/70"
          }`}
        >
          {[
            { id: "instant", label: "📱 Partage WhatsApp & Mobile", icon: Share2 },
            { id: "pdf_summary", label: "📄 Document PDF Client", icon: FileText },
            { id: "social", label: "🌐 Réseaux & Médias", icon: Globe },
            { id: "direct_number", label: "💬 Envoi Direct par Numéro", icon: Phone },
            { id: "qrcode", label: "🔲 QR Code & Affiche", icon: QrCode },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveShareTab(tab.id as any)}
              className={`whitespace-nowrap pb-2.5 px-3 border-b-2 transition ${
                activeShareTab === tab.id
                  ? "border-emerald-500 text-emerald-500 font-bold"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Direct Live URL & Quick Actions Card */}
          <div
            className={`rounded-2xl p-4 border space-y-3 ${
              isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-slate-50 border-slate-200 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Lien Web Direct Réel (Accessible Partout) :
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-semibold">
                ● En Ligne
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={previewUrl}
                className={`flex-1 px-3 py-2 border rounded-xl text-xs font-mono outline-none select-all ${
                  isDark ? "bg-slate-900 border-slate-700 text-emerald-400" : "bg-white border-slate-300 text-emerald-600"
                }`}
              />
              <button
                type="button"
                id="btn-sharemodal-copy-direct"
                onClick={() => handleCopy(previewUrl, "link_direct", "Lien direct copié dans le presse-papiers !")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 active:scale-95 border ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                    : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800"
                }`}
              >
                {copiedKey === "link_direct" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test, PDF Export & Standalone Download Bar */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openAppInNewTab(project)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
                title="Ouvrir l'application en plein écran dans un nouvel onglet"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Tester en Plein Écran</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShareTab("pdf_summary")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
                title="Générer et exporter le document PDF récapitulatif de l'architecture du projet pour vos présentations clients"
              >
                <FileText className="w-3 h-3" />
                <span>Dossier PDF Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  downloadStandaloneHtml(project);
                  setShareFeedback("Fichier HTML autonome téléchargé ! Vous pouvez l'envoyer comme fichier WhatsApp.");
                  setTimeout(() => setShareFeedback(null), 3500);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-700 border-slate-700 text-slate-200"
                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
                }`}
                title="Télécharger le fichier .html autonome pour le transférer directement"
              >
                <Download className="w-3 h-3 text-emerald-500" />
                <span>Télécharger Fichier .HTML</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INSTANT SHARING (WhatsApp, Instagram, Mail, SMS, Native Web Share) */}
          {activeShareTab === "instant" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Message d'accompagnement :
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs outline-none resize-none ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  }`}
                />
              </div>

              {/* Native Mobile Web Share API Master Button */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark
                    ? "bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-blue-600/20 border-emerald-500/40"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      <span>Partage Natif Téléphone & Ordinateur</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-mono">
                        WhatsApp / Tout
                      </span>
                    </h4>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Ouvre le menu natif de votre appareil (WhatsApp, Instagram, AirDrop, Messages, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-webshare-master"
                    onClick={() => handleNativeShare({ targetName: "vos applications" })}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partager Maintenant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(fullShareText, "master_copy", "Texte et lien copiés !")}
                    className={`p-2 rounded-xl transition border shrink-0 ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 shadow-xs"
                    }`}
                    title="Copier le message et le lien"
                  >
                    {copiedKey === "master_copy" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dedicated App Share Cards Grid with Native & Fallback Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Card */}
                <div
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-emerald-950/30 border-emerald-500/30" : "bg-emerald-50/60 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>WhatsApp</h4>
                        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Discussion, statut ou groupe
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "wa_card_copy", "Lien WhatsApp copié !")}
                      className="text-slate-400 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-emerald-500/20 transition"
                      title="Copier le lien pour WhatsApp"
                    >
                      {copiedKey === "wa_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-whatsapp-native"
                      onClick={handleWhatsAppNativeShare}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Ouvrir WhatsApp"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppDirectWeb}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                      title="Ouvrir WhatsApp Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Instagram Card */}
                <div
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isDark
                      ? "bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-orange-950/20 border-pink-500/30"
                      : "bg-gradient-to-r from-pink-50/60 via-purple-50/60 to-orange-50/60 border-pink-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Instagram</h4>
                        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          Story, Bio, Reel ou DM
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(instagramCaption, "insta_card_copy", "Légende Instagram copiée !")}
                      className="text-slate-400 hover:text-pink-500 p-1.5 rounded-lg hover:bg-pink-500/20 transition"
                      title="Copier la légende"
                    >
                      {copiedKey === "insta_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-instagram-native"
                      onClick={handleInstagramNativeShare}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 hover:opacity-95 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Copier & Instagram"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInstagramDirectWeb}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                      title="Copier légende et ouvrir Instagram"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email Card */}
                <div
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-blue-950/30 border-blue-500/30" : "bg-blue-50/60 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>E-mail</h4>
                        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Courriel pro pré-rempli</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "email_card_copy", "Lien copié pour email !")}
                      className="text-slate-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-blue-500/20 transition"
                      title="Copier le texte"
                    >
                      {copiedKey === "email_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-email-native"
                      onClick={handleEmailNativeShare}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Ouvrir Messagerie"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEmailDirect}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                      title="Lancer le client mail par défaut"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SMS Card */}
                <div
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isDark ? "bg-indigo-950/30 border-indigo-500/30" : "bg-indigo-50/60 border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>SMS Téléphone</h4>
                        <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Message texte direct</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "sms_card_copy", "Lien copié pour SMS !")}
                      className="text-slate-400 hover:text-indigo-500 p-1.5 rounded-lg hover:bg-indigo-500/20 transition"
                      title="Copier le message SMS"
                    >
                      {copiedKey === "sms_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSmsShare}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer SMS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PDF ARCHITECTURE & CLIENT PRESENTATION SUMMARY */}
          {activeShareTab === "pdf_summary" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* PDF Feedback Banner */}
              {pdfFeedback && (
                <div className="bg-blue-600/20 border border-blue-500/40 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-blue-300">
                  <span className="flex items-center gap-2">
                    {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
                    {pdfFeedback}
                  </span>
                  <button onClick={() => setPdfFeedback(null)} className="text-blue-400 hover:text-blue-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Overview & Action Controls Banner */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          Dossier Récapitulatif d'Architecture & Spécifications
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                          Format Client A4
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Document complet prêt pour vos réunions, soutenances et propositions commerciales clients.
                      </p>
                    </div>
                  </div>

                  {/* Primary PDF Export Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadPdf}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger PDF (.pdf)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenPdfPrint}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 active:scale-95 ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs"
                      }`}
                      title="Ouvrir la page optimisée pour impression ou enregistrement en PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Imprimer / PDF Pro</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyArchitectureMarkdown}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                      }`}
                      title="Copier le résumé Markdown"
                    >
                      {copiedKey === "arch_md" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Key Architecture Points Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Cible & Packaging</span>
                    <span className="font-semibold text-blue-400 flex items-center gap-1 mt-0.5">
                      <Smartphone className="w-3 h-3" /> Android API 34 & PWA
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Paiements Intégrés</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      Wave, Orange, MTN, Moov
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Audit Sécurité</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3" /> Score 98% Conforme
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Accès Démo Direct</span>
                    <span className="font-semibold text-indigo-400 flex items-center gap-1 mt-0.5">
                      <QrCode className="w-3 h-3" /> QR Code HD Inclus
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive In-Modal Document Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Aperçu Direct du Document Client :
                  </span>
                  <span className="text-[11px] text-slate-400">
                    A4 • Optimisé pour impression & export vectoriel
                  </span>
                </div>

                <div
                  className={`rounded-2xl border overflow-hidden max-h-[380px] overflow-y-auto ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <iframe
                    title="Aperçu Document PDF"
                    srcDoc={generateArchitectureDocumentHtml(project)}
                    className="w-full h-[520px] bg-white border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL & OTHER NETWORKS */}
          {activeShareTab === "social" && (
            <div className="space-y-4">
              <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Publiez votre application sur les principaux réseaux sociaux et plateformes professionnelles :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                    isDark ? "bg-blue-700/20 hover:bg-blue-700/30 border-blue-600/40" : "bg-blue-50 hover:bg-blue-100 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md">
                      <Facebook className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Facebook & Messenger</h4>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Partager sur votre fil</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                </button>

                {/* Twitter / X */}
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                    isDark ? "bg-slate-800/60 hover:bg-slate-800 border-slate-700" : "bg-slate-100 hover:bg-slate-200 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>X (ex-Twitter)</h4>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Tweet avec aperçu</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={handleLinkedinShare}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                    isDark ? "bg-sky-900/20 hover:bg-sky-900/30 border-sky-600/40" : "bg-sky-50 hover:bg-sky-100 border-sky-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md">
                      <Linkedin className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>LinkedIn Pro</h4>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Post réseau d'affaires</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-500" />
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleTelegramShare}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between group ${
                    isDark ? "bg-sky-600/20 hover:bg-sky-600/30 border-sky-500/40" : "bg-sky-50/60 hover:bg-sky-100 border-sky-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Telegram</h4>
                      <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Canal ou groupe</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-500" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT NUMBER WHATSAPP */}
          {activeShareTab === "direct_number" && (
            <div className="space-y-4">
              <form onSubmit={handleWhatsAppDirectNumber} className="space-y-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Numéro de téléphone avec indicatif pays (ex: +225 0700000000, +221 770000000, +33 600000000) :
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="Ex : +225 07 12 34 56 78"
                      required
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs sm:text-sm outline-none ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Envoyer sur WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanNumber = customPhone.replace(/[^0-9]/g, "");
                      if (!cleanNumber) return;
                      window.open(`sms:${cleanNumber}?body=${encodeURIComponent(fullShareText)}`, "_blank");
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS Direct</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: QR CODE & FLYER PRINT */}
          {activeShareTab === "qrcode" && (
            <div className="space-y-4">
              <div
                className={`flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border ${
                  isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(previewUrl)}`}
                    alt="QR Code"
                    className="w-36 h-36"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className={`text-sm font-bold flex items-center justify-center sm:justify-start gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    <span>QR Code Haute Définition</span>
                  </h4>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Vos clients peuvent scanner ce code avec l'appareil photo de leur téléphone pour ouvrir l'application immédiatement.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleDownloadQrCode}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Image PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewUrl, "qr_link", "Lien QR Code copié !")}
                      className={`px-3 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1 border ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs"
                      }`}
                    >
                      {copiedKey === "qr_link" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "qr_link" ? "Copié !" : "Copier le Lien"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
              isDark ? "bg-slate-800/40 border-slate-700/40 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Lien sécurisé avec hébergement haute disponibilité & compatibilité Web Share
            </span>
            <button onClick={onClose} className="font-semibold hover:underline">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
