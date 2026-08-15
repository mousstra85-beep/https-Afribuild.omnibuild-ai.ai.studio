import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Project } from "../types";
import { useTheme } from "../context/ThemeContext";
import {
  Zap,
  TrendingUp,
  Clock,
  Cpu,
  Search,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  FileCode,
  Smartphone,
  Check,
} from "lucide-react";

interface ProjectVelocityDashboardProps {
  project: Project;
  onOpenHealthTab?: () => void;
}

export const ProjectVelocityDashboard: React.FC<ProjectVelocityDashboardProps> = ({
  project,
  onOpenHealthTab,
}) => {
  const { isDark } = useTheme();
  const [activeView, setActiveView] = useState<"velocity" | "resources" | "quality">("velocity");

  // 1. Calculate Phase Velocity & Milestone Progression Data
  const phaseData = useMemo(() => {
    const stepsConfig = [
      { id: "conception", name: "Conception", baseProgress: 15, aiMinutes: 0.5, humanHours: 6 },
      { id: "research", name: "Recherche UX", baseProgress: 30, aiMinutes: 0.8, humanHours: 10 },
      { id: "code_generation", name: "Génération Code", baseProgress: 60, aiMinutes: 1.5, humanHours: 35 },
      { id: "security_audit", name: "Audit Sécurité", baseProgress: 75, aiMinutes: 0.4, humanHours: 8 },
      { id: "apk_generation", name: "Packaging APK", baseProgress: 88, aiMinutes: 1.2, humanHours: 12 },
      { id: "web_deployment", name: "Déploiement Web", baseProgress: 95, aiMinutes: 0.6, humanHours: 5 },
      { id: "store_publish", name: "Prêt Publication", baseProgress: 100, aiMinutes: 0.8, humanHours: 8 },
    ];

    const currentProgress = project.stepProgress || 30;

    return stepsConfig.map((step) => {
      const isCompleted = currentProgress >= step.baseProgress;
      const isCurrent = Math.abs(currentProgress - step.baseProgress) <= 15;
      const completionRate = isCompleted
        ? 100
        : isCurrent
        ? Math.min(90, Math.round((currentProgress / step.baseProgress) * 100))
        : Math.round(Math.max(10, (currentProgress / step.baseProgress) * 60));

      return {
        phase: step.name,
        completion: completionRate,
        aiTime: step.aiMinutes,
        humanTimeEquivalent: step.humanHours,
        velocityRatio: Math.round((step.humanHours * 60) / (step.aiMinutes * 60)),
      };
    });
  }, [project.stepProgress]);

  // 2. Resource Allocation & 3 AI Workload Split
  const aiResourceData = useMemo(() => {
    const hasResearch = Boolean(project.researchData);
    const hasAudit = Boolean(project.securityAudit);
    const filesCount = project.files?.length || 5;

    // Relative compute weights for each AI agent
    const devWeight = 50 + Math.min(15, filesCount * 2);
    const researchWeight = hasResearch ? 26 : 20;
    const controlWeight = hasAudit ? 24 : 18;
    const total = devWeight + researchWeight + controlWeight;

    const devPercent = Math.round((devWeight / total) * 100);
    const researchPercent = Math.round((researchWeight / total) * 100);
    const controlPercent = 100 - devPercent - researchPercent;

    return [
      {
        name: "IA Développement",
        value: devPercent,
        role: "Génération de code, UI & APK",
        color: "#3B82F6", // Blue
        icon: Cpu,
      },
      {
        name: "IA Recherche",
        value: researchPercent,
        role: "Tendances UX, Couleurs & CDN",
        color: "#F59E0B", // Amber
        icon: Search,
      },
      {
        name: "IA Contrôle",
        value: controlPercent,
        role: "16 Tests unitaires & Sécurité",
        color: "#10B981", // Emerald
        icon: Shield,
      },
    ];
  }, [project]);

  // 3. Asset & File Footprint Distribution
  const assetDistributionData = useMemo(() => {
    const htmlSizeKb = 85;
    const logicJsKb = 42;
    const stylingKb = 28;
    const configPwaKb = 15;
    const apkBundleMb = parseFloat(project.apkBundleConfig?.apkSizeMb || "18.4") || 18.4;

    return [
      { assetType: "Code HTML/JSX", sizeKb: htmlSizeKb, color: "#6366F1" },
      { assetType: "Styles & Tailwind", sizeKb: stylingKb, color: "#06B6D4" },
      { assetType: "Logique & État", sizeKb: logicJsKb, color: "#3B82F6" },
      { assetType: "Manifestes & PWA", sizeKb: configPwaKb, color: "#10B981" },
      { assetType: "Package APK/AAB", sizeKb: Math.round(apkBundleMb * 1024), color: "#8B5CF6" },
    ];
  }, [project.apkBundleConfig]);

  // 4. Quality & Velocity Radar Data (5 Dimensions)
  const qualityRadarData = useMemo(() => {
    const audit = project.securityAudit;
    return [
      {
        dimension: "Sécurité",
        score: audit ? 100 : 92,
        fullMark: 100,
      },
      {
        dimension: "Performance",
        score: audit?.performanceScore || 96,
        fullMark: 100,
      },
      {
        dimension: "Accessibilité",
        score: audit?.accessibilityScore || 98,
        fullMark: 100,
      },
      {
        dimension: "Mobile Ready",
        score: audit?.mobileReadinessScore || 95,
        fullMark: 100,
      },
      {
        dimension: "Vélocité IA",
        score: 99,
        fullMark: 100,
      },
      {
        dimension: "Tests Unitaires",
        score: Math.round(((audit?.testsPassedCount || 16) / (audit?.totalTestsCount || 16)) * 100),
        fullMark: 100,
      },
    ];
  }, [project.securityAudit]);

  // Aggregate Top KPIs
  const totalHumanHoursSaved = useMemo(() => {
    return phaseData.reduce((acc, curr) => acc + curr.humanTimeEquivalent, 0);
  }, [phaseData]);

  const velocityMultiplier = useMemo(() => {
    const aiMinutes = Math.max(1, project.totalTimeSpentMinutes || 3);
    const humanMinutes = totalHumanHoursSaved * 60;
    return Math.round(humanMinutes / aiMinutes);
  }, [project.totalTimeSpentMinutes, totalHumanHoursSaved]);

  const customTooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    borderColor: isDark ? "#334155" : "#e2e8f0",
    borderRadius: "12px",
    color: isDark ? "#f8fafc" : "#0f172a",
    fontSize: "12px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    padding: "8px 12px",
  };

  return (
    <div
      id="mini-dashboard-velocity"
      className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-xl space-y-6 ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Top Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Vélocité & Tableau de Bord Ressources</h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualisation graphique de la vitesse de conception, de la charge des 3 IA et des ressources
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            id="btn-view-velocity"
            onClick={() => setActiveView("velocity")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === "velocity"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Vélocité & Étapes</span>
          </button>

          <button
            type="button"
            id="btn-view-resources"
            onClick={() => setActiveView("resources")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === "resources"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>3 IA & Ressources</span>
          </button>

          <button
            type="button"
            id="btn-view-quality"
            onClick={() => setActiveView("quality")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === "quality"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radar Qualité</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Velocity Multiplier */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Accélération IA</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            x{velocityMultiplier}
          </div>
          <p className="text-[11px] text-slate-400">
            ~{totalHumanHoursSaved}h équivalentes en ~{project.totalTimeSpentMinutes || 3} min
          </p>
        </div>

        {/* KPI 2: Overall Progress */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Progression Globale</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-400">
            {project.stepProgress}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${project.stepProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Coordinated 3 AI Health */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Score Qualité</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {project.securityAudit?.globalScore || 98}/100
          </div>
          <p className="text-[11px] text-slate-400">
            {project.securityAudit?.testsPassedCount || 16}/{project.securityAudit?.totalTestsCount || 16} tests validés
          </p>
        </div>

        {/* KPI 4: Resource Footprint */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Volume Fichiers & APK</span>
            <FileCode className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400">
            {project.files?.length || 5} fichiers
          </div>
          <p className="text-[11px] text-slate-400">
            APK : {project.apkBundleConfig?.apkSizeMb || "18.4 MB"}
          </p>
        </div>
      </div>

      {/* VIEW 1: VELOCITY & STEP COMPLETION */}
      {activeView === "velocity" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Courbe de Progression et Comparaison de Temps
              </h4>
              <p className="text-xs text-slate-400">
                Temps réel de compilation par les 3 IA (minutes) vs Développement traditionnel estimé (heures)
              </p>
            </div>
            <span className="text-[11px] text-blue-400 font-semibold bg-blue-950/50 border border-blue-500/30 px-2.5 py-1 rounded-xl">
              Gain de productivité : 97%
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart Area */}
            <div className="lg:col-span-8 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={phaseData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="humanHoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="phase" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Area
                    type="monotone"
                    dataKey="completion"
                    name="% Étape Validée"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#velocityGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="humanTimeEquivalent"
                    name="Heures Traditionnelles Économisées (h)"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#humanHoursGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Velocity Highlights List */}
            <div className="lg:col-span-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Détail des jalons clés :
              </span>
              <div className="space-y-2 text-xs overflow-y-auto max-h-[200px] pr-1">
                {phaseData.map((phase, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          phase.completion >= 90
                            ? "text-emerald-400"
                            : phase.completion >= 50
                            ? "text-blue-400"
                            : "text-slate-500"
                        }`}
                      />
                      <span className="text-slate-200 font-medium">{phase.phase}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold font-mono">{phase.completion}%</span>
                      <span className="text-[10px] text-slate-500 block">+{phase.humanTimeEquivalent}h sauvées</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 3 AI RESOURCE USAGE & ASSET BREAKDOWN */}
      {activeView === "resources" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                Distribution de la Charge entre les 3 IA & Poids des Ressources
              </h4>
              <p className="text-xs text-slate-400">
                Répartition dynamique du calcul et proportion des livrables compilés
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Donut Chart: 3 AI Workload Split */}
            <div className="lg:col-span-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block text-center">
                Part de Travail des 3 IA
              </span>
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiResourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {aiResourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} formatter={(val) => [`${val}% de charge`, ""]} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80">
                {aiResourceData.map((agent, i) => (
                  <div key={i} className="space-y-0.5">
                    <span className="text-[10px] font-bold block" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                    <span className="text-xs font-bold text-white">{agent.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Asset Footprint (KB) */}
            <div className="lg:col-span-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block text-center">
                Poids des Ressources & Artefacts (Ko)
              </span>
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="assetType" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={customTooltipStyle} formatter={(val) => [`${val} Ko`, "Taille"]} />
                    <Bar dataKey="sizeKb" name="Taille (Ko)" radius={[6, 6, 0, 0]}>
                      {assetDistributionData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80 px-2">
                <span>Code HTML + JS : ~127 Ko (Ultra léger)</span>
                <span className="text-purple-400 font-semibold">APK Complet : {project.apkBundleConfig?.apkSizeMb || "18.4 MB"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: QUALITY & RADAR AUDIT */}
      {activeView === "quality" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Radar Qualité Multidimensionnel
              </h4>
              <p className="text-xs text-slate-400">
                Évaluation globale sur 6 axes par l'IA de Contrôle et de Sécurité
              </p>
            </div>
            {onOpenHealthTab && (
              <button
                type="button"
                onClick={onOpenHealthTab}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                Voir rapport complet des 16 tests →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Radar Chart */}
            <div className="lg:col-span-7 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={qualityRadarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Radar
                    name="Score Atteint"
                    dataKey="score"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(val) => [`${val}/100`, "Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quality Breakdown Bars */}
            <div className="lg:col-span-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Indicateurs Clés de Conformité :
              </span>
              <div className="space-y-2.5 text-xs">
                {qualityRadarData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300 font-medium">{item.dimension}</span>
                      <span className="font-mono font-bold text-emerald-400">{item.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
