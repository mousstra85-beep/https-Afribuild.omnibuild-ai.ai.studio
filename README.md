<div align="center">

# ⚡ OMNIBUILD AI STUDIO

**Plateforme No-Code & Studio IA de Nouvelle Génération pour la Conception, la Génération et le Déploiement d'Applications Web & Mobiles Android (APK / AAB) propulsée par Google AI Studio & Gemini.**

[![Build & Typecheck](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google GenAI](https://img.shields.io/badge/Gemini-3.7_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Mobile Ready](https://img.shields.io/badge/Android-APK%20%7C%20AAB%20%7C%20Capacitor-3DDC84?logo=android&logoColor=white)](https://capacitorjs.com/)

[Fonctionnalités](#-fonctionnalités-clés) • [Architecture](#-architecture-technique) • [Base de Données](#-base-de-données-sql) • [Installation](#-installation--démarrage-rapide) • [Déploiement](#-déploiement--production)

</div>

---

## 🌟 Vue d'Ensemble

**Omnibuild AI Studio** est un environnement complet développé sur **Google AI Studio** combinant un éditeur visuel, un bac à sable interactif en temps réel, un moteur de diagnostic auto-réparateur, et 3 agents IA coordonnés pour permettre à quiconque de créer, tester et publier des applications web et mobiles Android complètes sans écrire de code.

---

## ✨ Fonctionnalités Clés

### 🤖 Trio d'Agents IA Coordonnés (Google Gemini 3.7 Flash)
- **Agent Développement & Architecture** : Génération de code HTML5 / Tailwind / JavaScript réactif, modulaire et structuré.
- **Agent Recherche & Inspiration UI/UX** : Veille de tendances, palettes de couleurs harmonieuses et sélection de composants gratuits.
- **Agent Sécurité & Audit Qualité** : Analyse statique, conformité RGPD/WCAG, tests de stress et corrections préventives.

### 📱 Génération Mobile Android Native (APK & AAB)
- Export de fichiers prêts pour la compilation (`AndroidManifest.xml`, `build.gradle`, `capacitor.config.json`, keystore signatures).
- Compatibilité directe avec Android Studio, Capacitor et Google Play Store.

### 💳 Passerelles de Paiement Mobile Money Intégrées
- Prise en charge native de **Wave**, **Orange Money**, **MTN MoMo**, **Moov Money**, cartes bancaires et espèces à la livraison.

### 📊 Moniteur de Diagnostic & Auto-Réparation (Self-Healing)
- Détection proactive des corruptions de stockage ou de fichiers manquants.
- Procédure de retry automatique multi-passes avec récupération d'état en 1 clic.

### 🌐 Déploiement Multi-Cibles
- Déploiement en 1 clic sur **GitHub Pages**, **Vercel**, **Netlify**, ou export en **HTML Autonome / Archive ZIP**.

---

## 🗄️ Base de Données SQL

Le studio est fourni avec son schéma relationnel complet dans `database_omnibuild.sql` (compatible PostgreSQL, Cloud SQL, Neon, Supabase) :

### Schéma des Tables :
1. **`studio_users`** : Gestion des comptes développeurs, administrateurs et préférences de studio.
2. **`studio_projects`** : Métadonnées des projets créés, versions, styles et statuts de publication.
3. **`project_files`** : Système de fichiers virtuel complet (HTML, JS, CSS, JSON, SQL).
4. **`project_mobile_builds`** : Paramètres de packaging Android (APK Debug/Release, AAB, package name, versioning).
5. **`project_payment_integrations`** : Configurations des passerelles de paiement sécurisées (Wave, Orange Money, MTN MoMo).
6. **`studio_diagnostic_logs`** : Journal de télémétrie, de santé et d'auto-réparation en temps réel.
7. **`ai_generation_sessions`** : Historique des requêtes et réponses des modèles Gemini.

#### Exécution du script SQL :
```bash
psql -h <HOST> -U <UTILISATEUR> -d <NOM_BASE> -f database_omnibuild.sql
```

---

## 🏗️ Architecture Technique

```
├── server.ts                   # Serveur backend Express + intégration Google GenAI SDK (Gemini)
├── index.html                  # Point d'entrée HTML5 du Studio
├── metadata.json               # Déclaration des capacités AI Studio & autorisations
├── database_omnibuild.sql      # Schéma SQL complet pour le Studio Omnibuild
├── src/
│   ├── App.tsx                 # Composant racine & gestionnaire d'état principal
│   ├── main.tsx                # Point d'entrée React 19
│   ├── components/             # Composants modulaires du Studio
│   │   ├── ProjectWorkspace.tsx          # Espace de travail & bac à sable
│   │   ├── DiagnosticLogsMonitor.tsx     # Moniteur de télémétrie & retry
│   │   ├── ProjectHealthDashboard.tsx    # Tableau de bord de santé & audits IA
│   │   ├── ProjectWizard.tsx             # Assistant de création de projets
│   │   ├── ShareModal.tsx                # Modale de partage & réseaux sociaux
│   │   ├── DeploymentTab.tsx             # Déploiement Web & hébergeurs
│   │   └── ...
│   ├── utils/                  # Utilitaires & Moteurs
│   │   ├── storage.ts          # Persistance locale, assainissement & auto-réparation
│   │   ├── githubService.ts    # Intégration GitHub API & export de dépôts
│   │   ├── projectGenerators.ts# Générateurs de code pour projets
│   │   └── gemini.ts           # Client d'appel sécurisé aux modèles Gemini
│   └── types.ts                # Typage TypeScript strict
├── vite.config.ts              # Configuration Vite & Tailwind CSS v4
├── tsconfig.json               # Configuration TypeScript
└── package.json                # Dépendances et scripts de build
```

---

## 🚀 Installation & Démarrage Rapide

### Prérequis
- **Node.js** version 18 ou supérieure
- Clé d'API Google Gemini (`GEMINI_API_KEY`)

### 1. Cloner le Dépôt
```bash
git clone https://github.com/VOTRE_COMPTE/omnibuild-ai.git
cd omnibuild-ai
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configurer l'Environnement
Créez un fichier `.env` à la racine :
```env
GEMINI_API_KEY=votre_cle_api_gemini
PORT=3000
```

### 4. Lancer en Mode Développement
```bash
npm run dev
```
L'application est accessible sur `http://localhost:3000`.

---

## 📦 Scripts Disponibles

- `npm run dev` : Démarre le serveur backend Express et le serveur de développement Vite.
- `npm run build` : Compile le frontend Vite et bundle le serveur TypeScript en `dist/server.cjs`.
- `npm run start` : Démarre le serveur de production compilé.
- `npm run lint` : Vérification statique des types TypeScript (`tsc --noEmit`).

---

## 🔒 Sécurité & Bonnes Pratiques
- La clé `GEMINI_API_KEY` est exclusivement conservée et exécutée côté serveur (`server.ts`) sans jamais être exposée au navigateur client.
- Les fichiers générés dans l'iframe sont sécurisés dans un bac à sable (`sandbox="allow-scripts allow-modals allow-same-origin"`).

---

## 📄 Licence
Ce projet est distribué sous licence MIT. Développé avec ❤️ sur **Google AI Studio**.
