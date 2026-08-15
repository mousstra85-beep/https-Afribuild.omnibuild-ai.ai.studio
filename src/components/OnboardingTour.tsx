import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles,
  Cpu,
  Search,
  Shield,
  Smartphone,
  Globe,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  ArrowRight,
  FileCode,
  Zap,
  Activity,
  Github,
  Download,
  Share2,
  HelpCircle,
  Eye,
  Check,
  Award,
  BookOpen,
} from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewProject?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onStartNewProject,
}) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<"dev" | "research" | "control">("dev");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Synchronize preference with localStorage
  useEffect(() => {
    const storedPref = localStorage.getItem("afribuilder_hide_onboarding_auto");
    if (storedPref === "true") {
      setDontShowAgain(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("afribuilder_hide_onboarding_auto", "true");
    } else {
      localStorage.removeItem("afribuilder_hide_onboarding_auto");
    }
    onClose();
  };

  const handleCreateProjectAction = () => {
    handleClose();
    if (onStartNewProject) {
      onStartNewProject();
    }
  };

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: "intro",
      title: "Bienvenue sur AfriBuilder AI Studio",
      subtitle: "La plateforme no-code propulsée par 3 Intelligences Artificielles coordonnées",
      badge: "Vue d'ensemble",
      badgeColor: "blue",
    },
    {
      id: "ai_trio",
      title: "Les 3 IA Spécialisées à Votre Service",
      subtitle: "Comprendre comment l'IA de Développement, de Recherche et de Contrôle collaborent",
      badge: "Architecture 3 IA",
      badgeColor: "purple",
    },
    {
      id: "ai_research",
      title: "1. L'IA de Recherche & Inspiration",
      subtitle: "Analyse de marché, tendances design modernes, palettes et ressources gratuites",
      badge: "IA Recherche",
      badgeColor: "amber",
    },
    {
      id: "ai_dev",
      title: "2. L'IA de Développement & Architecture",
      subtitle: "Génération de code complet, packaging Android (APK/AAB) et orchestration web",
      badge: "IA Développement",
      badgeColor: "blue",
    },
    {
      id: "ai_control",
      title: "3. L'IA de Contrôle & Sécurité",
      subtitle: "Tests automatisés, audit de sécurité, accessibilité WCAG et diagnostic de santé",
      badge: "IA Contrôle",
      badgeColor: "emerald",
    },
    {
      id: "create_flow",
      title: "Comment Créer un Projet en 30 Secondes",
      subtitle: "De l'idée brute à l'application fonctionnelle sans aucune ligne de code",
      badge: "Guide Pratique",
      badgeColor: "indigo",
    },
    {
      id: "workspace_export",
      title: "Piloter l'Espace de Travail & Exporter",
      subtitle: "Aperçu en direct, dialogue multi-IA, export 1-clic GitHub et téléchargement ZIP",
      badge: "Prise en Main",
      badgeColor: "emerald",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-4 transition-all animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Modal Top Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "bg-slate-850 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Guide Interactif des 3 IA</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  Étape {currentStep + 1} sur {tourSteps.length}
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Apprenez à concevoir vos applications mobiles et web facilement
              </p>
            </div>
          </div>

          <button
            id="btn-close-onboarding-tour"
            onClick={handleClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900"
            }`}
            title="Fermer le guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className={`w-full h-1.5 ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Modal Body Content Area */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 0: INTRO */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>Conception d'Applications sans Compétences Techniques</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  Transformez vos idées en Applications & Sites Web Réels
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Bienvenue dans **AfriBuilder AI Studio**. Vous n'avez pas besoin d'écrire une seule ligne de code :
                  notre système coordonne automatiquement **trois intelligences artificielles complémentaires** qui conçoivent,
                  développent, testent et déploient votre solution clé en main.
                </p>
              </div>

              {/* 3 Pillars Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div
                  className={`p-4 rounded-2xl border space-y-2 transition ${
                    isDark
                      ? "bg-slate-850/80 border-slate-800 hover:border-blue-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-blue-500">IA de Développement</h4>
                  <p className={`text-[11px] leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Génère le code interactif, prépare l'APK/AAB Android et structure les fichiers complets.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-2 transition ${
                    isDark
                      ? "bg-slate-850/80 border-slate-800 hover:border-amber-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-amber-400"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-500">IA de Recherche</h4>
                  <p className={`text-[11px] leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Trouve les meilleures pratiques UX, palettes de couleurs et bibliothèques CDN gratuites.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-2 transition ${
                    isDark
                      ? "bg-slate-850/80 border-slate-800 hover:border-emerald-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-500">IA de Contrôle</h4>
                  <p className={`text-[11px] leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Audite la sécurité, vérifie la conformité mobile et exécute 16+ tests automatiques de qualité.
                  </p>
                </div>
              </div>

              {/* Ready prompt */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-blue-950/30 border-blue-500/30 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    Prêt à découvrir comment chaque IA travaille pour vous ? Cliquez sur **Suivant** ci-dessous.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: AI TRIO ARCHITECTURE & SYNCHRONIZATION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Coordination en Temps Réel
                </span>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Comment les 3 IA travaillent ensemble
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Chaque IA possède un rôle précis et communique avec les autres pour garantir un résultat professionnel.
                </p>
              </div>

              {/* Interactive Flow Diagram */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  {/* Step 1 in flow */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-500 font-bold text-xs">
                      <Search className="w-3.5 h-3.5" />
                      <span>Phase 1 : Recherche</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Analyse de l'idée & proposition d'un thème visuel moderne (couleurs, typographies, icônes).
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />

                  {/* Step 2 in flow */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-500 font-bold text-xs">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Phase 2 : Développement</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Écriture de l'application interactive complète, du HTML/Tailwind, et préparation du build APK/AAB.
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />

                  {/* Step 3 in flow */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-500 font-bold text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Phase 3 : Contrôle</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Audit de sécurité, 16 tests automatisés et attribution d'un score de santé (98/100).
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Agent Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Aperçu interactif des réponses des 3 IA :
                  </span>
                  <span className="text-[10px] text-slate-400">Cliquez pour basculer</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveInteractiveTab("research")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      activeInteractiveTab === "research"
                        ? "bg-amber-600/20 border-amber-500 text-amber-400"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>IA Recherche</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInteractiveTab("dev")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      activeInteractiveTab === "dev"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>IA Développement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInteractiveTab("control")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                      activeInteractiveTab === "control"
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>IA Contrôle</span>
                  </button>
                </div>

                {/* Interactive Card Display */}
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}
                >
                  {activeInteractiveTab === "research" && (
                    <div>
                      <div className="flex items-center gap-2 text-amber-500 font-bold mb-1">
                        <Search className="w-4 h-4" />
                        <span>Rapport d'Inspiration de l'IA Recherche :</span>
                      </div>
                      <p className="text-slate-300">
                        « J'ai sélectionné une palette **Bleu Océan & Émeraude** adaptée au secteur Mobile Money, avec les icônes Lucide CDN et une typographie haute lisibilité conforme WCAG AA. »
                      </p>
                    </div>
                  )}

                  {activeInteractiveTab === "dev" && (
                    <div>
                      <div className="flex items-center gap-2 text-blue-500 font-bold mb-1">
                        <Cpu className="w-4 h-4" />
                        <span>Rapport de Conception de l'IA Développement :</span>
                      </div>
                      <p className="text-slate-300">
                        « J'ai généré l'application complète dans <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">index.html</code> avec panier d'achat interactif, validation Mobile Money et structure APK prête pour Google Play. »
                      </p>
                    </div>
                  )}

                  {activeInteractiveTab === "control" && (
                    <div>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold mb-1">
                        <Shield className="w-4 h-4" />
                        <span>Rapport d'Audit de l'IA Contrôle :</span>
                      </div>
                      <p className="text-slate-300">
                        « Score de santé : **98/100**. Aucun script vulnérable détecté. 16 tests unitaires sur 16 réussis avec succès sur mobile et desktop. »
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IA RECHERCHE EN DETAIL */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Agent Spécialisé 1/3
                  </span>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    L'IA de Recherche & Inspiration
                  </h3>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                L'IA de Recherche est l'éclaireur de votre projet. Elle analyse votre idée et recherche les meilleures
                références visuelles et ergonomiques adaptées aux marchés africains et internationaux.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tendances Visuelles Modernes</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Propose automatiquement des styles graphiques épurés, des contrastes soignés et des micro-interactions élégantes.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ressources 100% Gratuites (CDN)</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Sélectionne des bibliothèques CDN stables sans coût de licence (Tailwind CSS, icônes Lucide, polices Google Fonts).
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accessibilité & Inclusivité</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Garantit une lisibilité maximale conforme aux normes internationales WCAG AA pour tous les utilisateurs.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Spécificités Locales (Mobile Money)</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Adapte les parcours clients aux habitudes de paiement locales (Wave, Orange Money, MTN MoMo, Moov).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IA DEVELOPPEMENT EN DETAIL */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Agent Spécialisé 2/3
                  </span>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    L'IA de Développement & Architecture
                  </h3>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                L'IA de Développement est le maître d'œuvre qui transforme le cahier des charges en application réelle
                avec un code optimisé et des packages prêts à être installés sur smartphone ou hébergés en ligne.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Génération de Packages Android APK & AAB</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Compile les manifestes, icônes et configurations nécessaires pour installer l'app directement ou la publier sur Google Play Store.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Application Web & PWA Instantanée</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Génère le Service Worker et le Web Manifest pour que vos utilisateurs puissent l'installer comme une appli native sur iOS et Android.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Code Source Structuré & Propre</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Crée l'arborescence complète : <code className="text-blue-400">index.html</code>, <code className="text-blue-400">package.json</code>, configurations et documentation README.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                    <Github className="w-3.5 h-3.5" />
                    <span>Export 1-Clic GitHub & Archive ZIP</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Synchronise directement votre code avec votre compte GitHub ou télécharge une archive ZIP prête pour Vercel, Netlify ou Cloud Run.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: IA CONTROLE EN DETAIL */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    Agent Spécialisé 3/3
                  </span>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    L'IA de Contrôle & Sécurité
                  </h3>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                L'IA de Contrôle agit comme votre inspecteur qualité indépendant. Elle audite le code généré, détecte
                les failles potentielles et garantit que votre application ne plantera jamais devant vos clients.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Batterie de 16+ Tests Automatisés</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Vérifie la syntaxe JavaScript, le rendu responsive, les boutons tactiles et la compatibilité navigateurs.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Scan de Sécurité & Données</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    S'assure de l'absence d'injections de scripts néfastes et valide le cryptage des données sensibles.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Optimisation de la Vitesse & Performance</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Analyse la vitesse de chargement pour assurer un fonctionnement ultra-fluide même avec une connexion 3G/4G modeste.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tableau de Diagnostic Intégré</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Consultez l'onglet « Diagnostic Santé & Tests » pour voir les recommandations précises de l'IA en temps réel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMMENT CREER UN PROJET (PAS-A-PAS) */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Guide Pas-à-Pas
                </span>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Créer un projet en 4 étapes simples
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Voici exactement comment lancer votre première application depuis l'interface Studio.
                </p>
              </div>

              {/* Step by step cards */}
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Cliquez sur « Nouveau Projet »</h4>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Le bouton bleu est accessible à tout moment dans la barre supérieure de navigation.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Choisissez votre Format Cible</h4>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Sélectionnez **App Mobile & Web** (recommandé pour avoir à la fois l'APK Android et le site web), **Application Mobile** ou **Site Web**.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Décrivez votre Idée ou Importez vos Notes</h4>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Tapez une phrase simple (ex : <em>« Application de livraison de repas avec paiement Wave »</em>) ou cliquez sur **« 📲 Importer depuis vos applications »** pour coller un texte WhatsApp, un document ou utiliser nos modèles prêts à l'emploi.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Cliquez sur « Générer l'Application »</h4>
                    <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Les 3 IA se synchronisent immédiatement et votre application apparaît prête à être testée en direct !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PILOTER LE WORKSPACE & EXPORTER */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Espace de Travail & Export
                </span>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Piloter et Déployer votre Application
                </h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Une fois votre projet généré, vous disposez d'un arsenal d'outils puissants dans l'espace de travail.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-500">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aperçu en Direct & Plein Écran</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Testez l'application dans le simulateur smartphone ou ouvrez-la dans un nouvel onglet de navigateur.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-500">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Chat Multi-IA Interactif</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Demandez des modifications en langage naturel : <em>« Ajoute un bouton de contact WhatsApp »</em>, <em>« Change le logo »</em>...
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                    <Github className="w-3.5 h-3.5" />
                    <span>⚡ Export 1-Clic GitHub & ZIP</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Poussez le code directement sur votre dépôt GitHub ou téléchargez l'archive ZIP pré-configurée avec CI/CD.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    isDark ? "bg-slate-850/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partage Multi-Canaux Instantané</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Diffusez le lien de votre application sur WhatsApp, Instagram, Facebook ou par e-mail en 1 clic.
                  </p>
                </div>
              </div>

              {/* Ready Banner */}
              <div
                className={`p-4 rounded-2xl border text-center space-y-2 ${
                  isDark ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                <p className="text-xs font-bold">
                  🎉 Vous êtes fin prêt à concevoir votre première application !
                </p>
                <button
                  type="button"
                  id="btn-onboarding-finish-create"
                  onClick={handleCreateProjectAction}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Créer mon Premier Projet Maintenant</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-slate-850 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}
        >
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              id="chk-dont-show-onboarding"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
            />
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>
              Ne plus ouvrir automatiquement au démarrage
            </span>
          </label>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {currentStep > 0 && (
              <button
                type="button"
                id="btn-onboarding-prev"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 border ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            )}

            {currentStep < tourSteps.length - 1 ? (
              <button
                type="button"
                id="btn-onboarding-next"
                onClick={() => setCurrentStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-onboarding-finish"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Terminer le Guide</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
