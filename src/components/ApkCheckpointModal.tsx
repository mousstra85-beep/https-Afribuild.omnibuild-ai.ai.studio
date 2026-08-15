import React from "react";
import { Project } from "../types";
import { CheckCircle, Smartphone, ArrowRight, PauseCircle, Download, Sparkles, X, QrCode } from "lucide-react";

interface ApkCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onContinueWorkflow: () => void;
  onStayAtApkLevel: () => void;
  onDownloadApk: () => void;
}

export const ApkCheckpointModal: React.FC<ApkCheckpointModalProps> = ({
  isOpen,
  onClose,
  project,
  onContinueWorkflow,
  onStayAtApkLevel,
  onDownloadApk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">APK & AAB Générés avec Succès !</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Étape Android Validée
                </span>
              </div>
              <p className="text-xs text-slate-400">Point de décision synchronisé de l'IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* APK summary card */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Package Android compilé :</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{project.apkBundleConfig.packageName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <p className="text-slate-400 text-[11px]">Format APK (Test mobile direct) :</p>
                <p className="font-bold text-white mt-0.5">{project.apkBundleConfig.apkSizeMb} • v{project.apkBundleConfig.versionName}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50">
                <p className="text-slate-400 text-[11px]">Format AAB (Google Play Store) :</p>
                <p className="font-bold text-white mt-0.5">{project.apkBundleConfig.aabSizeMb} • Bundle signé</p>
              </div>
            </div>

            <button
              onClick={onDownloadApk}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Package Android (.zip / APK)</span>
            </button>
          </div>

          {/* Synchronized AI Milestone Question */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-2">
            <h3 className="text-sm font-bold text-blue-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Question de synchronisation de l'IA :
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La génération de vos fichiers APK et AAB est terminée. <br />
              <strong>Souhaitez-vous continuer pour les étapes suivantes</strong> (Déploiement Web, Recherche d'hébergement gratuit et Assistant de publication sur les stores) <strong>ou vous limiter pour l'instant à ce niveau ?</strong>
            </p>
          </div>

          {/* Decision Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onStayAtApkLevel}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs transition flex flex-col items-center gap-1.5 text-center"
            >
              <PauseCircle className="w-5 h-5 text-amber-400" />
              <span>Se limiter à ce niveau</span>
              <span className="text-[10px] text-slate-400 font-normal">Garder l'application au stade APK actuel</span>
            </button>

            <button
              onClick={onContinueWorkflow}
              className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition flex flex-col items-center gap-1.5 text-center shadow-lg shadow-blue-900/30"
            >
              <ArrowRight className="w-5 h-5 text-emerald-300" />
              <span>Continuer le parcours complet</span>
              <span className="text-[10px] text-blue-200 font-normal">Déploiement Web, Hébergement & Publication</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
