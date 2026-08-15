import React, { useState } from "react";
import { AdminSettings, MobileMoneyOperator } from "../types";
import { saveAdminSettings } from "../utils/storage";
import { Settings, ToggleLeft, ToggleRight, DollarSign, QrCode, CheckCircle, ShieldCheck, X, Cpu, CreditCard } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onSettingsUpdated: (newSettings: AdminSettings) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onSettingsUpdated,
}) => {
  const [promoMode, setPromoMode] = useState(adminSettings.promoModeFree);
  const [rateFcfa, setRateFcfa] = useState(adminSettings.rateFcfaPerMinute);
  const [merchants, setMerchants] = useState<MobileMoneyOperator[]>(adminSettings.merchantCodes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleMerchantChange = (index: number, field: keyof MobileMoneyOperator, val: any) => {
    const updated = [...merchants];
    updated[index] = { ...updated[index], [field]: val };
    setMerchants(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: AdminSettings = {
      ...adminSettings,
      promoModeFree: promoMode,
      rateFcfaPerMinute: Number(rateFcfa) || 5,
      merchantCodes: merchants,
    };
    saveAdminSettings(newSettings);
    onSettingsUpdated(newSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Console Administrateur (IA de Dév)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-400">Gestion des tarifs, mode promotionnel et 5 codes marchands Mobile Money</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Paramètres administrateur et tarifs mis à jour avec succès !</span>
            </div>
          )}

          {/* Promotion Free Mode Switch */}
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Mode Promotionnel Gratuit
                </span>
                <p className="text-xs text-slate-400">
                  Quand activé, toutes les générations, exports APK/AAB et déploiements sont 100% gratuits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromoMode(!promoMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                  promoMode
                    ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-600/30 text-amber-300 border-amber-500/40"
                }`}
              >
                {promoMode ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-amber-400" />}
                <span>{promoMode ? "Mode Gratuit (Actif)" : "Mode Payant (Actif)"}</span>
              </button>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/60 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Configuration du Tarif Temps de Travail
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Prix par minute / crédit (en FCFA) :
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={rateFcfa}
                    onChange={(e) => setRateFcfa(Number(e.target.value))}
                    required
                    className="w-full pl-3 pr-14 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">F CFA</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Règle : 1 crédit = 1 min de travail = {rateFcfa} F CFA</p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 text-xs space-y-1">
                <p className="font-semibold text-slate-300">Exemple de facturation :</p>
                <p className="text-slate-400">10 min de génération = <span className="font-bold text-white">{10 * rateFcfa} F CFA</span></p>
                <p className="text-slate-400">60 min (1 heure) = <span className="font-bold text-white">{60 * rateFcfa} F CFA</span></p>
              </div>
            </div>
          </div>

          {/* 5 Mobile Money Merchant Codes Config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" />
                5 Espaces Codes Marchands Mobile Money
              </h3>
              <span className="text-xs text-slate-400">Affichés aux clients au paiement</span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {merchants.map((m, idx) => (
                <div key={m.id} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-xs font-bold text-white">{m.name}</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={(e) => handleMerchantChange(idx, "active", e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>Actif</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Code Marchand / N° :</label>
                      <input
                        type="text"
                        value={m.merchantCode}
                        onChange={(e) => handleMerchantChange(idx, "merchantCode", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Syntaxe USSD / Instruction :</label>
                      <input
                        type="text"
                        value={m.ussdTemplate}
                        onChange={(e) => handleMerchantChange(idx, "ussdTemplate", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md"
            >
              Sauvegarder les Tarifs & Codes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
