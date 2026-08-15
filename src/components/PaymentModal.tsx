import React, { useState } from "react";
import { AdminSettings, UserAccount } from "../types";
import { setCurrentUser } from "../utils/storage";
import { DollarSign, QrCode, CheckCircle, Copy, Check, Sparkles, X, ShieldCheck, PhoneCall, Gift } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  adminSettings: AdminSettings;
  onUserUpdated: (user: UserAccount) => void;
  requiredActionName?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  adminSettings,
  onUserUpdated,
  requiredActionName,
  onPaymentSuccess,
}) => {
  const [selectedPackMinutes, setSelectedPackMinutes] = useState(30);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCost = selectedPackMinutes * adminSettings.rateFcfaPerMinute;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSimulateMobileMoneyPayment = (operatorName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const updated: UserAccount = {
        ...currentUser,
        credits: currentUser.credits + selectedPackMinutes,
      };
      setCurrentUser(updated);
      onUserUpdated(updated);
      setSuccessMessage(`Paiement de ${totalCost} F CFA validé avec succès via ${operatorName} ! +${selectedPackMinutes} crédits ajoutés.`);
      setTimeout(() => {
        setSuccessMessage(null);
        if (onPaymentSuccess) onPaymentSuccess();
        onClose();
      }, 1800);
    }, 1200);
  };

  const handleUseFreePromo = () => {
    if (onPaymentSuccess) onPaymentSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-900/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Recharge & Paiement Mobile Money</h2>
              <p className="text-xs text-slate-400">1 minute de temps de travail = 1 crédit = {adminSettings.rateFcfaPerMinute} F CFA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Promo Mode Banner */}
          {adminSettings.promoModeFree ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Gift className="w-5 h-5 text-emerald-400" />
                <span>Offre de Lancement : Mode Gratuit Activé !</span>
              </div>
              <p className="text-xs text-slate-300">
                La plateforme est actuellement en phase de promotion gratuite configurée par l'administrateur. Toutes vos opérations (génération, téléchargement APK/AAB, déploiement web) sont 100% offertes.
              </p>
              {requiredActionName && (
                <button
                  type="button"
                  onClick={handleUseFreePromo}
                  className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Continuer gratuitement ({requiredActionName})</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
              <p className="font-bold">Mode Payant Activé :</p>
              <p className="mt-0.5 text-slate-300">
                Votre solde actuel est de <span className="font-bold text-white">{currentUser.credits} crédits</span>. Pour télécharger ou exporter ({requiredActionName || "vos fichiers"}), veuillez recharger vos minutes de travail.
              </p>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Credit Pack Options */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Choisissez un forfait de temps de travail :</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { min: 10, label: "10 Min", cost: 10 * adminSettings.rateFcfaPerMinute },
                { min: 30, label: "30 Min", cost: 30 * adminSettings.rateFcfaPerMinute, popular: true },
                { min: 60, label: "1 Heure", cost: 60 * adminSettings.rateFcfaPerMinute },
              ].map((pack) => (
                <button
                  key={pack.min}
                  type="button"
                  onClick={() => setSelectedPackMinutes(pack.min)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between ${
                    selectedPackMinutes === pack.min
                      ? "bg-amber-500/20 border-amber-400 text-white font-bold"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xs">{pack.label}</span>
                  <span className="text-sm font-extrabold text-amber-400 mt-1">{pack.cost} F CFA</span>
                  {pack.popular && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full mt-1">
                      Populaire
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Mobile Money Payment Channels Presentation */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                5 Codes Marchands Mobile Money Disponibles :
              </label>
              <span className="text-[11px] text-amber-400 font-bold">Total : {totalCost} F CFA</span>
            </div>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {adminSettings.merchantCodes.filter((m) => m.active).map((op) => (
                <div
                  key={op.id}
                  className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{op.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{op.name}</span>
                        <span className="text-[10px] px-2 py-0.2 bg-slate-900 font-mono text-amber-400 rounded-md border border-slate-700">
                          {op.merchantCode}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{op.ussdTemplate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(op.id, op.merchantCode)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Copier le code marchand"
                    >
                      {copiedCodeId === op.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSimulateMobileMoneyPayment(op.name)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                    >
                      <span>Valider</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Paiement 100% sécurisé sans intermédiaire
            </span>
            <span>Support : 24h/7j</span>
          </div>
        </div>
      </div>
    </div>
  );
};
