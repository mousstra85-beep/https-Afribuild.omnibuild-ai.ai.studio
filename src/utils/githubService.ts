import { Project, ProjectFile } from "../types";
import { getProjectLiveUrl } from "./storage";

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  total_private_repos?: number;
  scopes?: string[];
}

export interface GitHubExportResult {
  success: boolean;
  repoUrl: string;
  cloneUrl: string;
  repoName: string;
  owner: string;
  pushedFilesCount: number;
  commitMessage: string;
  timestamp: string;
  pagesUrl?: string;
}

export interface PreparedProjectFiles {
  repoName: string;
  description: string;
  liveHostingUrl: string;
  githubPagesUrl: string;
  files: { path: string; content: string; description: string }[];
}

/**
 * Validates a GitHub Personal Access Token (PAT) by fetching the user profile
 */
export async function validateGitHubToken(token: string): Promise<GitHubUser> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("Veuillez saisir un jeton d'accès personnel GitHub (PAT).");
  }

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (res.status === 401) {
    throw new Error("Jeton GitHub invalide ou expiré (401 Unauthorized). Vérifiez votre token PAT.");
  }

  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error("Limite de requêtes GitHub atteinte pour cette adresse IP/compte. Réessayez plus tard.");
    }
    throw new Error("Accès refusé par GitHub (403 Forbidden). Assurez-vous d'avoir coché la permission 'repo'.");
  }

  if (!res.ok) {
    throw new Error(`Erreur GitHub (${res.status}): ${res.statusText}`);
  }

  const scopesHeader = res.headers.get("x-oauth-scopes") || "";
  const scopes = scopesHeader.split(",").map((s) => s.trim()).filter(Boolean);

  const data = await res.json();
  return {
    login: data.login,
    name: data.name || data.login,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    public_repos: data.public_repos,
    total_private_repos: data.total_private_repos,
    scopes,
  };
}

/**
 * Converts text string to Base64 safely handling Unicode/UTF-8
 */
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Generates a clean URL slug from project title
 */
export function getProjectRepoSlug(project: Project): string {
  if (project.githubConfig?.repoName) {
    return project.githubConfig.repoName;
  }
  const base = project.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "mon-application-omnibuild";
}

/**
 * Prepares the complete ready-to-push or ready-to-download bundle with all configurations
 */
export function prepareProjectManifest(project: Project, githubUsername?: string): PreparedProjectFiles {
  const repoName = getProjectRepoSlug(project);
  const owner = githubUsername || "votre-compte";
  const liveHostingUrl = project.webDeployment?.liveUrl || getProjectLiveUrl(project);
  const githubPagesUrl = `https://${owner}.github.io/${repoName}/`;
  const description = project.description || `Application ${project.title} générée automatiquement par Omnibuild AI / AfriBuilder Studio.`;

  const files: { path: string; content: string; description: string }[] = [];

  // 1. Root index.html (Ready for instant deployment on GitHub Pages / Vercel / Netlify)
  files.push({
    path: "index.html",
    content: project.interactiveAppHtml,
    description: "Point d'entrée principal HTML5 de l'application interactive",
  });

  // 2. dist/index.html and www/index.html for frameworks and hybrid wrappers
  files.push({
    path: "dist/index.html",
    content: project.interactiveAppHtml,
    description: "Fichier de compilation statique optimisé pour CDN",
  });

  files.push({
    path: "www/index.html",
    content: project.interactiveAppHtml,
    description: "Code source web pour Capacitor & Android",
  });

  // 3. Web App Manifest (PWA mobile installable)
  const manifestContent = JSON.stringify(
    {
      name: project.title,
      short_name: project.title.slice(0, 12),
      description: project.description,
      start_url: "./index.html",
      display: "standalone",
      background_color: "#0F172A",
      theme_color: project.category === "fintech" ? "#059669" : "#2563EB",
      orientation: "portrait",
      icons: [
        {
          src: "https://api.iconify.design/lucide:smartphone.svg",
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: "https://api.iconify.design/lucide:sparkles.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
      ],
    },
    null,
    2
  );
  files.push({
    path: "manifest.json",
    content: manifestContent,
    description: "Manifeste PWA pour installation native sur smartphone Android & iOS",
  });

  // 4. Service Worker for offline capability
  const swContent = `// Service Worker pour ${project.title} (Omnibuild AI)
const CACHE_NAME = "${repoName}-v1";
const ASSETS_TO_CACHE = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).catch(() => caches.match("./index.html")))
  );
});
`;
  files.push({
    path: "sw.js",
    content: swContent,
    description: "Service Worker pour cache hors-ligne et fonctionnement autonome",
  });

  // 5. GitHub Actions CI/CD Workflow for GitHub Pages (.github/workflows/deploy.yml)
  const githubActionsWorkflow = `name: Déploiement Automatique GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Configuration GitHub Pages
        uses: actions/configure-pages@v4

      - name: Téléversement de l'artefact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Déploiement sur GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
  files.push({
    path: ".github/workflows/deploy.yml",
    content: githubActionsWorkflow,
    description: "Workflow GitHub Actions pour mise en ligne automatique sur GitHub Pages",
  });

  // 6. Vercel & Netlify configuration files
  files.push({
    path: "vercel.json",
    content: JSON.stringify(
      {
        version: 2,
        name: repoName,
        routes: [{ src: "/(.*)", dest: "/index.html" }],
      },
      null,
      2
    ),
    description: "Configuration pour déploiement instantané sur Vercel",
  });

  files.push({
    path: "netlify.toml",
    content: `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`,
    description: "Configuration pour déploiement glisser-déposer sur Netlify",
  });

  // 7. Complete README.md with Live Hosting & Badges
  const readmeContent = `# ${project.title}

[![Omnibuild AI](https://img.shields.io/badge/Généré_par-Omnibuild_AI_Studio-blue.svg)](https://afribuilder.app)
[![Hébergement Live](https://img.shields.io/badge/Hébergement_Web-En_Ligne-success.svg)](${liveHostingUrl})
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Automatisé-purple.svg)](${githubPagesUrl})
[![Mobile Ready](https://img.shields.io/badge/Mobile-Android_APK_&_PWA-emerald.svg)](#-application-mobile-android)
[![Licence](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)

> **${description}**

---

## 🌐 Liens d'Hébergement & Démonstration en Direct

- 🚀 **Accès Direct en Ligne (SSL) :** [${liveHostingUrl}](${liveHostingUrl})
- 📄 **GitHub Pages (Déploiement Auto) :** [${githubPagesUrl}](${githubPagesUrl})
- 📱 **Package Mobile Android :** \`${project.apkBundleConfig?.packageName || "com.afribuilder.app"}\` (Version ${project.apkBundleConfig?.versionName || "1.0.0"})

---

## 📦 Structure du Projet

\`\`\`
├── index.html                  # Application web interactive principale
├── manifest.json               # Configuration PWA & installation mobile
├── sw.js                       # Service Worker (mode hors-ligne)
├── package.json                # Dépendances et scripts de développement
├── vercel.json                 # Configuration 1-clic pour Vercel
├── netlify.toml                # Configuration 1-clic pour Netlify
├── .github/
│   └── workflows/
│       └── deploy.yml          # Déploiement automatique GitHub Pages
├── database/                   # Schémas SQL & Migrations
│   ├── schema.sql              # Tables PostgreSQL/CloudSQL (Users, Items, Orders, Payments)
│   ├── seed.sql                # Données initiales de démonstration
│   └── sqlite_schema.sql       # Variante SQLite locale / mobile
├── android/                    # Fichiers sources pour compilation APK / AAB
│   └── app/
│       ├── build.gradle
│       └── src/main/AndroidManifest.xml
├── capacitor.config.json       # Configuration mobile Capacitor
├── DOCUMENTATION.md            # Cahier des charges & documentation technique
└── README.md                   # Présentation du projet
\`\`\`

---

## 🗄️ Base de Données SQL & Migrations

Les fichiers SQL sont situés dans le dossier \`database/\` :
- **\`database/schema.sql\`** : Schéma relationnel prêt pour PostgreSQL, Supabase, Neon, ou Cloud SQL avec gestion des utilisateurs, des articles, des commandes et des paiements Mobile Money (Wave, Orange Money, MTN).
- **\`database/seed.sql\`** : Données initiales pour tester immédiatement votre application.
- **\`database/sqlite_schema.sql\`** : Version SQLite ultra-légère pour les tests locaux ou le stockage embarqué.

Pour exécuter le schéma sur votre base PostgreSQL / Supabase :
\`\`\`bash
psql -h <VOTRE_HOTE> -U <UTILISATEUR> -d <NOM_BASE> -f database/schema.sql
\`\`\`

---

## 🚀 Déploiement en 1 Clic sur les Plateformes Gratuites

### Option 1 : GitHub Pages (Automatisé)
Ce dépôt inclut déjà le fichier \`.github/workflows/deploy.yml\`. Rendez-vous dans **Settings > Pages > Source : GitHub Actions** pour activer votre site.

### Option 2 : Vercel
1. Rendez-vous sur [vercel.com](https://vercel.com).
2. Cliquez sur **Add New > Project** et sélectionnez ce dépôt GitHub.
3. Cliquez sur **Deploy** : votre site est en ligne en 20 secondes !

### Option 3 : Netlify (Glisser-Déposer)
Glissez simplement l'ensemble de ce dossier sur [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 📱 Application Mobile Android (APK & AAB)

- **Identifiant :** \`${project.apkBundleConfig?.packageName || "com.afribuilder.app"}\`
- **Version :** \`${project.apkBundleConfig?.versionName || "1.0.0"}\` (Code ${project.apkBundleConfig?.versionCode || 1})
- **Empreinte SHA-256 :** \`${project.apkBundleConfig?.sha256 || "N/A"}\`

---

## 📄 Documentation Complète
${project.documentation || "Documentation technique intégrée."}

---

## ⚖️ Licence
Ce projet est distribué sous licence MIT. Projet créé avec **Omnibuild AI Studio** le ${new Date().toLocaleDateString("fr-FR")}.
`;
  files.push({
    path: "README.md",
    content: readmeContent,
    description: "Guide complet du projet, badges de statut et liens d'hébergement",
  });

  // 8. LICENSE (MIT)
  const licenseContent = `MIT License

Copyright (c) ${new Date().getFullYear()} ${project.title} - Omnibuild AI Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
`;
  files.push({
    path: "LICENSE",
    content: licenseContent,
    description: "Licence Open-Source MIT pour exploitation commerciale et libre",
  });

  // 9. package.json
  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: repoName,
        private: true,
        version: project.apkBundleConfig?.versionName || "1.0.0",
        type: "module",
        description: project.description,
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          lucide: "^0.450.0",
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          "@types/react": "^18.3.1",
          "@types/react-dom": "^18.3.1",
          "@vitejs/plugin-react": "^4.3.4",
          typescript: "^5.6.3",
          vite: "^6.0.1",
        },
      },
      null,
      2
    ),
    description: "Manifeste Node.js & scripts de compilation Vite",
  });

  // 10. .gitignore
  files.push({
    path: ".gitignore",
    content: `node_modules
dist
.env
.env.local
*.log
.DS_Store
.idea
.vscode
`,
    description: "Fichier d'exclusion Git pour fichiers temporaires",
  });

  // 11. capacitor.config.json & Android files
  files.push({
    path: "capacitor.config.json",
    content: JSON.stringify(
      {
        appId: project.apkBundleConfig?.packageName || "com.afribuilder.app",
        appName: project.title,
        webDir: "www",
      },
      null,
      2
    ),
    description: "Configuration mobile hybride Capacitor",
  });

  // 12. Complete SQL Schemas & Database Migrations (PostgreSQL, MySQL, SQLite)
  const sqlPostgresSchema = `-- ==============================================================================
-- BASE DE DONNÉES : ${project.title.toUpperCase()}
-- Généré automatiquement par Omnibuild AI Studio
-- Compatible : PostgreSQL 13+, Neon, Supabase, Cloud SQL, Supabase, AWS RDS
-- ==============================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer', 'driver', 'agent')),
    avatar_url TEXT,
    preferred_currency VARCHAR(10) DEFAULT 'XOF',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des Catégories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'folder',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des Produits / Articles / Services
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    price_cfa NUMERIC(12, 2) NOT NULL DEFAULT 0,
    original_price_cfa NUMERIC(12, 2),
    stock_quantity INT DEFAULT 100,
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 4.80,
    image_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des Commandes
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount_cfa NUMERIC(12, 2) NOT NULL,
    delivery_fee_cfa NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled')),
    delivery_address TEXT NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des Lignes de Commande
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cfa NUMERIC(12, 2) NOT NULL,
    subtotal_cfa NUMERIC(12, 2) NOT NULL
);

-- Table des Transactions et Paiements Mobile Money (Wave, Orange Money, MTN MoMo)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('wave', 'orange_money', 'mtn_momo', 'moov_money', 'card', 'cash')),
    transaction_reference VARCHAR(120) UNIQUE NOT NULL,
    operator_reference VARCHAR(120),
    amount_cfa NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    phone_number VARCHAR(50) NOT NULL,
    raw_webhook_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ==============================================================================
-- DONNÉES INITIALES (SEEDING)
-- ==============================================================================

INSERT INTO categories (id, name, slug, description, icon_name, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Articles Vedettes', 'articles-vedettes', 'Sélection des meilleures offres de la semaine', 'sparkles', 1),
    ('22222222-2222-2222-2222-222222222222', 'Nouveautés & Tendances', 'nouveautes-tendances', 'Nouveaux arrivages récents', 'fire', 2),
    ('33333333-3333-3333-3333-333333333333', 'Promotions & Réductions', 'promotions-reductions', 'Tarifs réduits et déstockage', 'tags', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO items (id, category_id, title, slug, description, price_cfa, original_price_cfa, stock_quantity, is_available, rating, image_url)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Pack Découverte Premium', 'pack-decouverte-premium', 'Pack complet exclusif avec livraison express en 2h', 15000.00, 18500.00, 50, TRUE, 4.90, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Kit Essentiel Mobile Money', 'kit-essentiel-mobile-money', 'Prêt à l emploi, compatible Wave, Orange Money et MTN', 8500.00, 10000.00, 120, TRUE, 4.85, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Abonnement Sérénité Pro', 'abonnement-serenite-pro', 'Accès illimité aux services et assistance prioritaire 7j/7', 25000.00, 30000.00, 999, TRUE, 5.00, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600')
ON CONFLICT (slug) DO NOTHING;
`;

  files.push({
    path: "database/schema.sql",
    content: sqlPostgresSchema,
    description: "Schéma SQL complet et migrations avec tables relationnelles (Users, Items, Orders, Payments Wave/Orange/MTN)",
  });

  files.push({
    path: "database/seed.sql",
    content: sqlPostgresSchema,
    description: "Script de peuplement initial des données (Seed Data SQL)",
  });

  // SQLite / MySQL alternative syntax script
  const sqlSqliteSchema = `-- ==============================================================================
-- SCHÉMA SQLITE (Compatibilité Légère & Mobile Local)
-- Application : ${project.title}
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_cfa REAL NOT NULL DEFAULT 0,
    stock_quantity INTEGER DEFAULT 100,
    rating REAL DEFAULT 4.8,
    image_url TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    total_amount_cfa REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_address TEXT,
    customer_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    provider TEXT NOT NULL,
    transaction_reference TEXT UNIQUE NOT NULL,
    amount_cfa REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

  files.push({
    path: "database/sqlite_schema.sql",
    content: sqlSqliteSchema,
    description: "Schéma SQL optimisé pour base locale SQLite et mobile offline",
  });

  // Include any custom project files if available
  if (project.files && project.files.length > 0) {
    project.files.forEach((f) => {
      const cleanPath = f.path.startsWith("/") ? f.path.slice(1) : f.path;
      if (!files.some((existing) => existing.path === cleanPath)) {
        files.push({
          path: cleanPath,
          content: f.content,
          description: `Fichier source du projet : ${f.name}`,
        });
      }
    });
  }

  // 12. DOCUMENTATION.md
  files.push({
    path: "DOCUMENTATION.md",
    content: project.documentation || `# Documentation de ${project.title}\n\nSpécifications techniques du projet.`,
    description: "Spécifications d'architecture et cahier des charges technique",
  });

  return {
    repoName,
    description,
    liveHostingUrl,
    githubPagesUrl,
    files,
  };
}

/**
 * Returns GitHub web direct repository creation link with prefilled parameters
 */
export function getGitHubQuickCreateUrl(project: Project): string {
  const repoName = getProjectRepoSlug(project);
  const desc = encodeURIComponent(
    (project.description || `Application ${project.title} générée par Omnibuild AI`).slice(0, 100)
  );
  return `https://github.com/new?name=${encodeURIComponent(repoName)}&description=${desc}&public=true`;
}

/**
 * Creates or retrieves repository, and pushes all files using the GitHub API
 */
export async function exportProjectToGitHub(options: {
  token: string;
  project: Project;
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
  branch?: string;
  commitMessage?: string;
  onProgress?: (step: string, percentage: number) => void;
}): Promise<GitHubExportResult> {
  const {
    token,
    project,
    repoName: customRepoName,
    description: customDescription,
    isPrivate = false,
    branch = "main",
    commitMessage = `🚀 Exportation & Mise en ligne de ${project.title} via Omnibuild AI Studio`,
    onProgress,
  } = options;

  const cleanToken = token.trim();
  const cleanRepoName = (customRepoName || getProjectRepoSlug(project))
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();

  if (!cleanRepoName) {
    throw new Error("Nom de dépôt GitHub invalide.");
  }

  // 1. Authenticate user
  onProgress?.("Vérification des identifiants GitHub & droits d'accès...", 10);
  const user = await validateGitHubToken(cleanToken);

  // 2. Check or create repository
  onProgress?.(`Vérification de l'existence du dépôt ${user.login}/${cleanRepoName}...`, 20);
  let defaultBranch = branch;

  const checkRepoRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (checkRepoRes.ok) {
    const repoData = await checkRepoRes.json();
    defaultBranch = repoData.default_branch || branch;
  } else if (checkRepoRes.status === 404) {
    // Create new repo
    onProgress?.(`Création du nouveau dépôt GitHub ${user.login}/${cleanRepoName}...`, 30);
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: customDescription || project.description || `Application ${project.title} générée par Omnibuild AI`,
        private: Boolean(isPrivate),
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(
        `Impossible de créer le dépôt GitHub: ${errData.message || createRes.statusText}. Vérifiez vos droits PAT ('repo').`
      );
    }
  } else {
    throw new Error(`Erreur lors de la consultation du dépôt: HTTP ${checkRepoRes.status}`);
  }

  // Wait 1.2s for GitHub's async git repo initialization
  await new Promise((r) => setTimeout(r, 1200));

  // 3. Prepare complete file bundle
  onProgress?.("Génération intelligente des configurations (GitHub Actions, PWA, Vercel)...", 45);
  const manifest = prepareProjectManifest(project, user.login);
  const filesToPush = manifest.files;

  // 4. Push each file via Contents API
  const totalFiles = filesToPush.length;
  let pushedCount = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = filesToPush[i];
    const pct = Math.round(50 + (i / totalFiles) * 45);
    onProgress?.(`Envoi du fichier (${i + 1}/${totalFiles}) : ${file.path}...`, pct);

    try {
      // Get existing file SHA if any
      let existingSha: string | undefined = undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${user.login}/${cleanRepoName}/contents/${encodeURIComponent(file.path)}?ref=${defaultBranch}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        existingSha = fileData.sha;
      }

      // Put file content
      const putRes = await fetch(
        `https://api.github.com/repos/${user.login}/${cleanRepoName}/contents/${encodeURIComponent(file.path)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: existingSha ? `Update ${file.path} from Omnibuild AI` : commitMessage,
            content: utf8ToBase64(file.content),
            branch: defaultBranch,
            ...(existingSha ? { sha: existingSha } : {}),
          }),
        }
      );

      if (putRes.ok) {
        pushedCount++;
      } else {
        console.warn(`Could not push file ${file.path}: ${putRes.statusText}`);
      }
    } catch (err) {
      console.warn(`Error uploading ${file.path}:`, err);
    }
  }

  onProgress?.("Exportation GitHub finalisée avec succès !", 100);

  return {
    success: true,
    repoUrl: `https://github.com/${user.login}/${cleanRepoName}`,
    cloneUrl: `https://github.com/${user.login}/${cleanRepoName}.git`,
    repoName: cleanRepoName,
    owner: user.login,
    pushedFilesCount: pushedCount,
    commitMessage,
    timestamp: new Date().toISOString(),
    pagesUrl: `https://${user.login}.github.io/${cleanRepoName}/`,
  };
}

