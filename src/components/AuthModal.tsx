import React, { useState } from "react";
import { UserAccount } from "../types";
import { recoverPinByPhone, saveUsersDb, setCurrentUser, loadStoredUsers } from "../utils/storage";
import { User, KeyRound, Phone, CheckCircle, AlertCircle, Sparkles, RefreshCw, X, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "register" | "recover">("profile");

  // Registration / Switch state
  const [nom, setNom] = useState(currentUser.nom);
  const [prenom, setPrenom] = useState(currentUser.prenom);
  const [phone, setPhone] = useState(currentUser.phoneMobileMoney);
  const [pin, setPin] = useState(currentUser.pinCode);

  // Recovery state
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryResult, setRecoveryResult] = useState<{
    success?: boolean;
    pin?: string;
    message?: string;
    user?: UserAccount;
  } | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4 || isNaN(Number(pin))) {
      setFeedbackMsg("Le code PIN doit comporter exactement 4 chiffres.");
      return;
    }
    if (!phone || phone.trim().length < 8) {
      setFeedbackMsg("Veuillez saisir un numéro Mobile Money valide.");
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      nom: nom.trim() || "Utilisateur",
      prenom: prenom.trim() || "Client",
      phoneMobileMoney: phone.trim(),
      pinCode: pin.trim(),
    };

    setCurrentUser(updated);
    onUserUpdated(updated);
    setFeedbackMsg("Compte et code PIN mémorisés avec succès !");
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1200);
  };

  const handleRegisterNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4 || isNaN(Number(pin))) {
      setFeedbackMsg("Le code PIN doit comporter exactement 4 chiffres au choix.");
      return;
    }
    if (!phone || phone.trim().length < 8) {
      setFeedbackMsg("Veuillez saisir un numéro Mobile Money valide.");
      return;
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      nom: nom.trim() || "Utilisateur",
      prenom: prenom.trim() || "Membre",
      phoneMobileMoney: phone.trim(),
      pinCode: pin.trim(),
      credits: 60, // 60 minutes free promo
      createdAt: new Date().toISOString(),
      isAdmin: false
    };

    setCurrentUser(newUser);
    onUserUpdated(newUser);
    setFeedbackMsg("Nouveau compte créé et mémorisé avec succès !");
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1200);
  };

  const handleRecoverPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryPhone.trim()) {
      setRecoveryResult({ success: false, message: "Veuillez entrer votre numéro Mobile Money." });
      return;
    }

    const result = recoverPinByPhone(recoveryPhone);
    setRecoveryResult(result);

    if (result.success && result.user) {
      setCurrentUser(result.user);
      onUserUpdated(result.user);
      setNom(result.user.nom);
      setPrenom(result.user.prenom);
      setPhone(result.user.phoneMobileMoney);
      setPin(result.user.pinCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Compte & Sécurité Mobile Money</h2>
              <p className="text-xs text-slate-400">Mémorisation et restitution sécurisée du code PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "profile" ? "bg-slate-800 text-white shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mon Profil</span>
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "register" ? "bg-slate-800 text-white shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nouvelle Inscription</span>
          </button>
          <button
            onClick={() => setActiveTab("recover")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "recover" ? "bg-amber-600/30 text-amber-300 border border-amber-500/30 shadow-xs font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Code Oublié ?</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Numéro Mobile Money (Wave, Orange, MTN, Moov)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+225 07 00 00 00 00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sert d'identifiant unique pour vos projets et la restitution de code.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Code Secret à 4 chiffres (au choix)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    placeholder="Ex: 1234"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400">Solde temps de travail</p>
                  <p className="text-sm font-bold text-white">{currentUser.credits} minutes gratuites</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
                  Mode Promo Actif
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md"
                >
                  Mémoriser les informations
                </button>
              </div>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegisterNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    placeholder="Ex: Kouamé"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    placeholder="Ex: Sarah"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Numéro Mobile Money</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+225 05 00 00 00 00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Définir un Code PIN à 4 chiffres (au choix)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    placeholder="4 chiffres secrets"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">La plateforme mémorise ce code pour vos futures connexions.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md"
              >
                Créer mon compte & Commencer
              </button>
            </form>
          )}

          {activeTab === "recover" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
                <p className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4" /> Procédure de restitution de code PIN
                </p>
                <p className="mt-1 text-slate-300">
                  Entrez simplement le numéro Mobile Money ayant servi à l'ouverture de votre compte. La plateforme vous restituera instantanément votre code d'accès à 4 chiffres.
                </p>
              </div>

              <form onSubmit={handleRecoverPin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Numéro de compte Mobile Money d'origine
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={recoveryPhone}
                      onChange={(e) => setRecoveryPhone(e.target.value)}
                      placeholder="Ex: +225 07 48 92 10 33"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restituer mon Code d'Accès
                </button>
              </form>

              {recoveryResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                    recoveryResult.success
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                      : "bg-red-950/40 border-red-500/50 text-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {recoveryResult.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <span className="font-bold">{recoveryResult.message}</span>
                  </div>

                  {recoveryResult.success && recoveryResult.pin && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 text-center">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Votre Code Secret à 4 chiffres :</p>
                      <div className="text-2xl font-black text-emerald-400 font-mono tracking-widest my-1">
                        {recoveryResult.pin}
                      </div>
                      <p className="text-[10px] text-slate-400">Votre session a été automatiquement restaurée !</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
