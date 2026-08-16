import React, { useState, useEffect, useMemo } from "react";
import { Project, DiagnosticLogEntry, ProjectRetrievalReport } from "../types";
import {
  getDiagnosticLogs,
  clearDiagnosticLogs,
  addDiagnosticLog,
  loadProjectsWithDiagnostics,
  retryLoadProjects,
  retryAndRecoverProjectState,
  simulateProjectCorruptionForTesting,
} from "../utils/storage";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  Terminal,
  ShieldAlert,
  Cpu,
  Layers,
  FileCode,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wrench,
  FlaskConical,
  Clock,
} from "lucide-react";

interface DiagnosticLogsMonitorProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onClose?: () => void;
  compact?: boolean;
}

export const DiagnosticLogsMonitor: React.FC<DiagnosticLogsMonitorProps> = ({
  project,
  onUpdateProject,
  onClose,
  compact = false,
}) => {
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>(() => getDiagnosticLogs());
  const [report, setReport] = useState<ProjectRetrievalReport | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Refresh logs and state report
  const refreshDiagnostics = () => {
    const res = loadProjectsWithDiagnostics();
    setLogs(res.logs);
    setReport(res.report);
  };

  useEffect(() => {
    refreshDiagnostics();

    // Listen for custom log events
    const handleLogAdded = () => {
      setLogs(getDiagnosticLogs());
    };
    const handleLogsCleared = () => {
      setLogs([]);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("afribuilder_diagnostic_log_added", handleLogAdded);
      window.addEventListener("afribuilder_diagnostic_logs_cleared", handleLogsCleared);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("afribuilder_diagnostic_log_added", handleLogAdded);
        window.removeEventListener("afribuilder_diagnostic_logs_cleared", handleLogsCleared);
      }
    };
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Automated Multi-pass retry handler
  const handleExecuteRetry = () => {
    setIsRetrying(true);
    triggerNotice("Exécution de la procédure de re-tentative et d'auto-réparation...");

    setTimeout(() => {
      try {
        const retryResult = retryLoadProjects(3);
        setLogs(getDiagnosticLogs());
        setReport(retryResult.report);

        const currentActive = retryResult.projects.find((p) => p.id === project.id) || retryResult.projects[0];
        if (currentActive) {
          onUpdateProject(currentActive);
        }

        if (retryResult.success) {
          triggerNotice(`Récupération réussie en ${retryResult.attemptsUsed} passe(s) ! Explorateur et bac à sable stabilisés.`);
        } else {
          triggerNotice(`Récupération partielle terminée. Consultez les logs pour les détails.`);
        }
      } catch (err: any) {
        triggerNotice(`Erreur lors de la tentative : ${err.message}`);
      } finally {
        setIsRetrying(false);
      }
    }, 600);
  };

  // Deep targeted recovery
  const handleDeepProjectRecovery = () => {
    setIsRetrying(true);
    triggerNotice("Reconstruction en profondeur du projet et de l'arborescence de fichiers...");

    setTimeout(() => {
      try {
        const res = retryAndRecoverProjectState(project.id);
        onUpdateProject(res.project);
        refreshDiagnostics();
        triggerNotice(res.message);
      } catch (e: any) {
        triggerNotice(`Erreur : ${e.message}`);
      } finally {
        setIsRetrying(false);
      }
    }, 500);
  };

  // Simulation handler to test resilience
  const handleSimulateCorruption = () => {
    const res = simulateProjectCorruptionForTesting(project.id);
    refreshDiagnostics();
    triggerNotice(res.message);
  };

  const handleClearLogs = () => {
    clearDiagnosticLogs();
    setLogs([]);
    triggerNotice("Journal des logs de diagnostic réinitialisé.");
  };

  const handleCopyReport = () => {
    const fullReport = {
      projectTitle: project.title,
      projectId: project.id,
      timestamp: new Date().toISOString(),
      report,
      logsCount: logs.length,
      logs,
    };
    navigator.clipboard.writeText(JSON.stringify(fullReport, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
    triggerNotice("Rapport de diagnostic complet copié dans le presse-papier !");
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedLevel !== "all" && log.level !== selectedLevel) return false;
      if (selectedCategory !== "all" && log.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMsg = log.message?.toLowerCase().includes(q);
        const matchDet = log.details?.toLowerCase().includes(q);
        const matchCat = log.category?.toLowerCase().includes(q);
        if (!matchMsg && !matchDet && !matchCat) return false;
      }
      return true;
    });
  }, [logs, selectedLevel, selectedCategory, searchQuery]);

  // Status computation for UI badge
  const statusConfig = useMemo(() => {
    const isCritical =
      report?.status === "critical" ||
      !project.files ||
      project.files.length === 0 ||
      !project.files.some((f) => f.name === "index.html");

    const isDegraded = report?.status === "degraded" || report?.status === "recovered";

    if (isCritical) {
      return {
        label: "État Incomplet / Erreur Détectée",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        icon: XCircle,
        dotClass: "bg-rose-500",
        description: "L'explorateur ou le bac à sable présente des anomalies bloquantes (fichiers absents ou vidés).",
      };
    }
    if (isDegraded) {
      return {
        label: "État Auto-Réparé / Dégradé",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        icon: AlertTriangle,
        dotClass: "bg-amber-500",
        description: "Le projet a été assaini et corrigé automatiquement lors de la dernière lecture.",
      };
    }
    return {
      label: "Explorateur & Données Optimaux",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: CheckCircle2,
      dotClass: "bg-emerald-500",
      description: "Toutes les structures de fichiers, l'index.html et le bac à sable interactif sont valides.",
    };
  }, [report, project]);

  const LevelBadge: React.FC<{ level: DiagnosticLogEntry["level"] }> = ({ level }) => {
    switch (level) {
      case "error":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> ERROR
          </span>
        );
      case "warn":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> WARN
          </span>
        );
      case "success":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> OK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> INFO
          </span>
        );
    }
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-blue-500/60 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header & Status Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Moniteur de Diagnostics & Récupération (loadProjects)</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass} animate-pulse`}></span>
                  <span>{statusConfig.label}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Surveillance en direct des étapes de désérialisation, d'intégrité de l'explorateur et moteur d'auto-réparation.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-retry-project-retrieval"
            onClick={handleExecuteRetry}
            disabled={isRetrying}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 active:scale-95"
            title="Lancer une procédure de ré-analyse et d'auto-réparation en 3 passes"
          >
            <RotateCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Réparation..." : "🔄 Réessayer Récupération (Retry)"}</span>
          </button>

          <button
            id="btn-deep-recovery"
            onClick={handleDeepProjectRecovery}
            disabled={isRetrying}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition flex items-center gap-1.5 active:scale-95"
            title="Reconstruire l'arborescence et restaurer index.html manquant"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Réparer l'Arborescence</span>
          </button>

          <button
            id="btn-simulate-corruption-test"
            onClick={handleSimulateCorruption}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition flex items-center gap-1.5 active:scale-95"
            title="Injecter une simulation d'erreur pour tester le moniteur et la récupération"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span>Tester Défaillance</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition flex items-center gap-1.5 active:scale-95"
            title="Copier le rapport de diagnostic au format JSON"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? "Copié !" : "Copier Logs"}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition flex items-center gap-1.5 active:scale-95"
            title="Vider la liste des logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" /> Fichiers Indexés
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-white">
              {project.files?.length || 0}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${project.files?.length ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {project.files?.length ? "Présents" : "0 fichier (Erreur)"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <FileCode className="w-3 h-3 text-emerald-400" /> Fichier index.html
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-white">
              {project.files?.some((f) => f.name === "index.html") ? "Valide" : "Manquant"}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${project.files?.some((f) => f.name === "index.html") ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {project.files?.some((f) => f.name === "index.html") ? "OK" : "Critique"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Bac à Sable HTML
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-white">
              {project.interactiveAppHtml?.length ? `${Math.round(project.interactiveAppHtml.length / 1024)} Ko` : "0 Ko"}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${project.interactiveAppHtml?.length > 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {project.interactiveAppHtml?.length > 100 ? "Opérationnel" : "Vide"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" /> Événements Traqués
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black font-mono text-white">
              {logs.length}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              {logs.filter((l) => l.level === "error").length} Erreur(s)
            </span>
          </div>
        </div>
      </div>

      {/* Explorer Root Cause Analyzer & Diagnostic Explanation Box */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Analyse des Causes de Défaillance de l'Explorateur</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Dernière vérification : {report?.timestamp ? new Date(report.timestamp).toLocaleTimeString("fr-FR") : "Maintenant"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>1. Désérialisation Storage</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vérifie que la clé localStorage <code className="text-blue-300">afribuilder_projects</code> n'a pas subi de troncature JSON ou d'erreur de syntaxe.
            </p>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>2. Intégrité des Fichiers</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Empêche que <code className="text-amber-300">project.files</code> devienne null, vide ou privé de son fichier maître <code className="text-amber-300">index.html</code>.
            </p>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>3. Mécanisme de Retry & Sync</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              En cas d'anomalie détectée, une reconstruction progressive en 3 passes régénère automatiquement les structures manquantes.
            </p>
          </div>
        </div>
      </div>

      {/* Log Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: "all", label: `Tous (${logs.length})` },
              { id: "error", label: `Erreurs (${logs.filter((l) => l.level === "error").length})` },
              { id: "warn", label: `Avertissements (${logs.filter((l) => l.level === "warn").length})` },
              { id: "success", label: `Succès (${logs.filter((l) => l.level === "success").length})` },
              { id: "info", label: `Infos (${logs.filter((l) => l.level === "info").length})` },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedLevel === lvl.id ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium outline-none focus:border-blue-500"
          >
            <option value="all">Toutes les Catégories</option>
            <option value="storage_read">Lecture Stockage (localStorage)</option>
            <option value="json_parse">Parsing JSON</option>
            <option value="sanitization">Assainissement des Données</option>
            <option value="file_explorer">Explorateur de Fichiers</option>
            <option value="state_retry">Tentatives & Auto-Réparation</option>
            <option value="integrity_check">Contrôle d'Intégrité</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les messages..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Real-time Logs Console Output */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <span>Journal d'Événements Détaillé ({filteredLogs.length} affichés)</span>
          <button
            onClick={refreshDiagnostics}
            className="hover:text-blue-400 flex items-center gap-1 transition"
            title="Rafraîchir"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Rafraîchir</span>
          </button>
        </div>

        <div className="divide-y divide-slate-900 max-h-[380px] overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600" />
              <p>Aucun log correspondant aux filtres sélectionnés.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className={`p-3 transition hover:bg-slate-900/40 cursor-pointer ${
                    log.level === "error" ? "bg-rose-950/10" : log.level === "warn" ? "bg-amber-950/10" : ""
                  }`}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <LevelBadge level={log.level} />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-semibold">{log.message}</span>
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {log.category}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{log.details}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-slate-500 text-[10px]">
                      <span>{new Date(log.timestamp).toLocaleTimeString("fr-FR")}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Expanded Inspector */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2 text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl">
                      {log.details && (
                        <div>
                          <span className="text-slate-500 font-bold block mb-0.5">Détails techniques :</span>
                          <div className="p-2 rounded bg-slate-950 text-slate-300 whitespace-pre-wrap">
                            {log.details}
                          </div>
                        </div>
                      )}
                      {log.contextData && (
                        <div>
                          <span className="text-slate-500 font-bold block mb-0.5">Contexte d'exécution :</span>
                          <pre className="p-2 rounded bg-slate-950 text-blue-300 text-[10px] overflow-x-auto">
                            {JSON.stringify(log.contextData, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>ID Log : {log.id}</span>
                        <span>Horodatage complet : {log.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
