import React, { useState } from "react";
import { Project } from "../types";
import { Sparkles, Smartphone, Globe, Layers, Clipboard, FileText, UploadCloud, MessageSquare, BookOpen, ShoppingBag, Truck, Wallet, Check, X, ShieldAlert } from "lucide-react";

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (title: string, description: string, category: Project["category"], targetType: Project["targetType"]) => void;
  onOpenOnboardingTour?: () => void;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  onOpenOnboardingTour,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Project["category"]>("ecommerce");
  const [targetType, setTargetType] = useState<Project["targetType"]>("both");
  const [isSmartDrawerOpen, setIsSmartDrawerOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateProject(title.trim(), description.trim() || "Application conçue par les 3 IA", category, targetType);
    onClose();
  };

  // Smart Phone Apps Import Helpers
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setDescription((prev) => (prev ? `${prev}\n\n${text}` : text));
          setImportStatus("Texte du presse-papier collé avec succès !");
          setTimeout(() => setImportStatus(null), 2000);
          return;
        }
      }
      setImportStatus("Veuillez coller manuellement votre texte dans la zone.");
    } catch {
      setImportStatus("Accès presse-papier bloqué par le navigateur. Collez manuellement.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDescription((prev) => (prev ? `${prev}\n\n[Importé depuis ${file.name}]:\n${content}` : content));
        setImportStatus(`Fichier "${file.name}" importé avec succès !`);
        setTimeout(() => setImportStatus(null), 2500);
      }
    };
    reader.readAsText(file);
  };

  const applyTemplatePreset = (presetTitle: string, presetDesc: string, presetCat: Project["category"]) => {
    setTitle(presetTitle);
    setDescription(presetDesc);
    setCategory(presetCat);
    setImportStatus(`Modèle "${presetTitle}" appliqué !`);
    setTimeout(() => setImportStatus(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nouveau Projet sans Aucune Compétence</h2>
              <p className="text-xs text-slate-400">Décrivez simplement votre idée, nos 3 IA s'occupent de tout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick onboarding guide reminder */}
          {onOpenOnboardingTour && (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Nouveau sur le Studio ? Découvrez comment les 3 IA conçoivent votre projet.</span>
              </div>
              <button
                type="button"
                id="btn-open-tour-from-modal"
                onClick={() => {
                  onClose();
                  onOpenOnboardingTour();
                }}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] whitespace-nowrap transition active:scale-95 shadow-xs"
              >
                Voir le Guide
              </button>
            </div>
          )}

          {/* Target Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Que voulez-vous créer ?</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setTargetType("both")}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  targetType === "both"
                    ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Layers className="w-5 h-5 text-blue-400" />
                <span className="text-xs">App Mobile & Web</span>
                <span className="text-[10px] text-blue-300 font-normal">Recommandé (APK + Site)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType("mobile_app")}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  targetType === "mobile_app"
                    ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">Application Mobile</span>
                <span className="text-[10px] text-emerald-300 font-normal">Android APK & AAB</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType("website")}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  targetType === "website"
                    ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Globe className="w-5 h-5 text-amber-400" />
                <span className="text-xs">Site Web Responsive</span>
                <span className="text-[10px] text-amber-300 font-normal">Hébergement 1 clic</span>
              </button>
            </div>
          </div>

          {/* Project Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Nom du projet / Application</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ivoire Marché, Fast Delivery, Auto School..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="ecommerce">🛍️ E-commerce / Vente</option>
                <option value="delivery">🛵 Livraison & Repas</option>
                <option value="fintech">💳 Fintech & Portefeuille</option>
                <option value="service">🛠️ Services & Réservation</option>
                <option value="showcase">💼 Vitrine & Portfolio</option>
                <option value="education">📚 Éducation & École</option>
                <option value="custom">✨ Personnalisé / Autre</option>
              </select>
            </div>
          </div>

          {/* Smart Description with Phone App Import Window */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Description détaillée du projet
              </label>

              {/* Toggle phone app import drawer */}
              <button
                type="button"
                onClick={() => setIsSmartDrawerOpen(!isSmartDrawerOpen)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-600/10 border border-blue-500/30 px-2.5 py-1 rounded-xl transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isSmartDrawerOpen ? "Fermer Import Téléphone" : "📲 Importer depuis vos applications"}</span>
              </button>
            </div>

            {/* Smart Import Drawer (Access to phone apps, clipboard, files, templates) */}
            {isSmartDrawerOpen && (
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-blue-500/40 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
                  <span>Accès direct aux applications de votre téléphone / PC :</span>
                  <span className="text-[10px] text-slate-400 font-normal">Coller notes, WhatsApp, fichiers</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1 transition"
                  >
                    <Clipboard className="w-4 h-4 text-emerald-400" />
                    <span>Coller Presse-papier</span>
                  </button>

                  <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1 cursor-pointer transition text-center">
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    <span>Importer un Fichier</span>
                    <input type="file" accept=".txt,.doc,.docx,.pdf,.json" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      applyTemplatePreset(
                        "Shop Abidjan Wave",
                        "Boutique en ligne avec catalogue de vêtements et chaussures, panier d'achat, paiement instantané par Wave et Orange Money, suivi des livraisons en temps réel par SMS et WhatsApp.",
                        "ecommerce"
                      )
                    }
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1 transition text-center"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Modèle E-Commerce</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      applyTemplatePreset(
                        "Dakar Fast Food",
                        "Application de commande de repas et plats locaux (Thiéboudienne, Yassa, Pastels) avec géolocalisation du client, choix de livraison à domicile ou à emporter et paiement Mobile Money.",
                        "delivery"
                      )
                    }
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex flex-col items-center gap-1 transition text-center"
                  >
                    <Truck className="w-4 h-4 text-purple-400" />
                    <span>Modèle Livraison Repas</span>
                  </button>
                </div>
              </div>
            )}

            {importStatus && (
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{importStatus}</span>
              </div>
            )}

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Je veux une application pour vendre des vêtements et accessoires. Mes clients doivent pouvoir choisir les articles, ajouter au panier et payer directement par Wave ou Orange Money..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <p className="text-[11px] text-slate-400">
              💡 Nos 3 IA s'occupent d'analyser vos besoins, chercher des designs modernes et sécuriser le code automatiquement.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Générer l'Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
