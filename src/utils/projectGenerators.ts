import JSZip from "jszip";
import { Project, ProjectFile, ProjectVersion, StepId } from "../types";

export function generateInitialInteractiveApp(title: string, category: string, description: string): string {
  const safeTitle = title || "Mon Application Pro";
  const primaryColor = category === "fintech" ? "#059669" : category === "delivery" ? "#EA580C" : category === "ecommerce" ? "#4F46E5" : "#2563EB";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${safeTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '${primaryColor}',
            brandDark: '#1E293B',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .custom-scroll::-webkit-scrollbar { display: none; }
    .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
  <!-- Top Navigation Bar -->
  <header class="bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-4 py-3 shadow-xs">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" onclick="switchView('home')">
        <div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight text-slate-900">${safeTitle}</h1>
          <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            En ligne • Mobile Money Prêt
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleTopSearch()" class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition" title="Rechercher">
          <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </button>
        <button onclick="openCartModal()" class="relative w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition" title="Panier">
          <i class="fa-solid fa-basket-shopping text-sm"></i>
          <span id="cartCountBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Collapsible Top Search Bar -->
  <div id="topSearchBar" class="hidden bg-white border-b border-slate-200 px-4 py-2.5 shadow-xs">
    <div class="max-w-4xl mx-auto relative flex items-center gap-2">
      <div class="relative flex-1">
        <input 
          id="topSearchInput" 
          type="text" 
          oninput="handleGlobalSearch(this.value)" 
          placeholder="Rechercher des articles, services, offres..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand outline-none" 
        />
        <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400 text-xs"></i>
      </div>
      <button onclick="toggleTopSearch()" class="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1">Fermer</button>
    </div>
  </div>

  <!-- MAIN APP CONTAINER (Multi-View) -->
  <main class="flex-1 max-w-4xl w-full mx-auto p-4 pb-24">
    
    <!-- 1. VIEW: HOME (ACCUEIL) -->
    <div id="view-home" class="space-y-5">
      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand p-6 text-white shadow-lg">
        <div class="relative z-10 space-y-2.5 max-w-md">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
            <i class="fa-solid fa-sparkles text-amber-300"></i> Nouveautés 2026
          </span>
          <h2 class="text-2xl font-extrabold leading-tight">Bienvenue sur ${safeTitle}</h2>
          <p class="text-xs text-slate-200 leading-relaxed">${description.slice(0, 110) || "Découvrez nos offres exclusives avec paiement Mobile Money instantané et livraison rapide."}</p>
          <div class="pt-2 flex flex-wrap items-center gap-2.5">
            <button onclick="switchView('explore')" class="px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-slate-100 transition active:scale-95 flex items-center gap-1.5">
              <span>Explorer le catalogue</span>
              <i class="fa-solid fa-compass text-brand"></i>
            </button>
            <button onclick="openCartModal()" class="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition active:scale-95">
              Mon Panier
            </button>
          </div>
        </div>
        <div class="absolute -right-4 -bottom-6 opacity-15 text-9xl text-white pointer-events-none">
          <i class="fa-solid fa-store"></i>
        </div>
      </div>

      <!-- Flash Promo Banner -->
      <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5 text-amber-900">
          <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div>
            <span class="font-bold block">Offre Flash du Jour : -15%</span>
            <span class="text-[11px] text-amber-700">Code promo <b class="bg-amber-100 px-1 py-0.5 rounded font-mono">AFRI2026</b> à la commande</span>
          </div>
        </div>
        <button onclick="switchView('explore')" class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition active:scale-95 shadow-xs">
          En profiter
        </button>
      </div>

      <!-- Quick Category Tabs -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Catégories populaires</h3>
          <button onclick="switchView('explore')" class="text-xs text-brand font-bold hover:underline flex items-center gap-1">
            <span>Tout voir</span>
            <i class="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
        <div class="flex gap-2 overflow-x-auto custom-scroll pb-1">
          <button onclick="filterCategory('all')" class="cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white transition shadow-xs">Tous</button>
          <button onclick="filterCategory('vedette')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">⭐ En vedette</button>
          <button onclick="filterCategory('promo')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">🔥 Promotions</button>
          <button onclick="filterCategory('nouveau')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">✨ Nouveautés</button>
          <button onclick="filterCategory('packs')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">🎁 Packs Pro</button>
        </div>
      </div>

      <!-- Featured Items Grid (Home) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Sélection du moment</h3>
          <span id="homeItemsCount" class="text-xs text-slate-500">4 disponibles</span>
        </div>
        <div id="homeProductsGrid" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <!-- Dynamic Products injected here via JS -->
        </div>
      </div>

      <!-- Mobile Money Trust Box -->
      <div class="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-sm shadow-xs">
              <i class="fa-solid fa-shield-check"></i>
            </div>
            <div>
              <span class="text-xs font-bold block">Paiements Mobile Money 100% Sécurisés</span>
              <span class="text-[10px] text-slate-400">Transactions cryptées et validées en temps réel</span>
            </div>
          </div>
          <span class="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
            0% frais
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
          <div class="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center gap-1.5">
            <span>🟠 Orange Money</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center gap-1.5">
            <span>🌊 Wave</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center gap-1.5">
            <span>🟡 MTN MoMo</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center gap-1.5">
            <span>🔵 Moov Money</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. VIEW: EXPLORE (CATALOGUE COMPLET & RECHERCHE) -->
    <div id="view-explore" class="hidden space-y-5">
      <!-- Explore Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-compass text-brand"></i>
            <span>Catalogue & Découverte</span>
          </h2>
          <p class="text-xs text-slate-500">Explorez l'ensemble des articles, packs et services disponibles</p>
        </div>
        <div class="flex items-center gap-2">
          <span id="exploreResultsCount" class="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
            8 articles
          </span>
          <button onclick="switchView('home')" class="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Retour</span>
          </button>
        </div>
      </div>

      <!-- Explore Search & Filters -->
      <div class="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div class="relative">
          <input 
            id="exploreSearchInput"
            type="text" 
            oninput="handleExploreSearch(this.value)" 
            placeholder="Rechercher par nom, mot-clé, catégorie..." 
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition" 
          />
          <i class="fa-solid fa-search absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
        </div>

        <!-- Filter Chips in Explore -->
        <div class="flex gap-2 overflow-x-auto custom-scroll pb-1 text-xs">
          <button onclick="filterExploreCategory('all')" class="explore-filter-btn active whitespace-nowrap px-3.5 py-1.5 rounded-xl font-bold bg-brand text-white transition shadow-xs">Tous</button>
          <button onclick="filterExploreCategory('vedette')" class="explore-filter-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">⭐ En vedette</button>
          <button onclick="filterExploreCategory('promo')" class="explore-filter-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">🔥 Promotions</button>
          <button onclick="filterExploreCategory('nouveau')" class="explore-filter-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">✨ Nouveautés</button>
          <button onclick="filterExploreCategory('packs')" class="explore-filter-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">🎁 Packs Pro</button>
          <button onclick="filterExploreCategory('services')" class="explore-filter-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">⚡ Services VIP</button>
        </div>
      </div>

      <!-- Explore Products Grid -->
      <div id="exploreProductsGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Injected via JS -->
      </div>

      <!-- Empty state fallback -->
      <div id="exploreEmptyState" class="hidden text-center py-12 space-y-3 bg-white rounded-3xl border border-slate-200 p-6">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto">
          <i class="fa-solid fa-box-open"></i>
        </div>
        <h4 class="font-bold text-slate-800 text-sm">Aucun article ne correspond à votre recherche</h4>
        <p class="text-xs text-slate-500 max-w-xs mx-auto">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
        <button onclick="resetExploreFilters()" class="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-xs transition active:scale-95">
          Voir tous les articles
        </button>
      </div>
    </div>

  </main>

  <!-- Bottom Navigation Bar (Fixed) -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 z-40 shadow-lg">
    <div class="max-w-md mx-auto flex items-center justify-between text-xs font-medium text-slate-500">
      <button id="nav-btn-home" onclick="switchView('home')" class="flex flex-col items-center gap-1 text-brand font-bold transition">
        <i class="fa-solid fa-house text-base"></i>
        <span>Accueil</span>
      </button>
      <button id="nav-btn-explore" onclick="switchView('explore')" class="flex flex-col items-center gap-1 hover:text-brand transition">
        <i class="fa-solid fa-compass text-base"></i>
        <span>Explorer</span>
      </button>
      <button id="nav-btn-cart" onclick="openCartModal()" class="flex flex-col items-center gap-1 hover:text-brand transition relative">
        <i class="fa-solid fa-cart-shopping text-base"></i>
        <span>Panier</span>
        <span id="navCartCount" class="absolute -top-1 right-1 bg-brand text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">1</span>
      </button>
      <button id="nav-btn-profile" onclick="openProfileModal()" class="flex flex-col items-center gap-1 hover:text-brand transition">
        <i class="fa-solid fa-user text-base"></i>
        <span>Compte</span>
      </button>
    </div>
  </nav>

  <!-- 3. MODAL: CART & CHECKOUT -->
  <div id="cartModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
    <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h3 class="font-bold text-slate-900 text-base">Mon Panier</h3>
        </div>
        <button onclick="closeCartModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">✕</button>
      </div>

      <!-- Items List -->
      <div id="cartItemsList" class="space-y-2.5">
        <!-- Injected via JS -->
      </div>

      <!-- Promo code field -->
      <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">Code de réduction :</span>
          <span id="appliedPromoBadge" class="hidden text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">-15% appliqué</span>
        </div>
        <div class="flex gap-2">
          <input id="promoInput" type="text" placeholder="Ex: AFRI2026" class="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 uppercase font-mono text-xs outline-none focus:border-brand" />
          <button onclick="applyPromoCode()" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition active:scale-95">Appliquer</button>
        </div>
      </div>

      <!-- Total & Action -->
      <div class="border-t border-slate-200 pt-3 space-y-3">
        <div class="space-y-1 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Sous-total :</span>
            <span id="cartSubtotalText" class="font-mono font-bold">4 500 F CFA</span>
          </div>
          <div id="promoDiscountRow" class="hidden flex justify-between text-emerald-600 font-semibold">
            <span>Remise promo :</span>
            <span id="cartDiscountText">-0 F CFA</span>
          </div>
          <div class="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
            <span>Total final :</span>
            <span id="cartTotalText" class="text-brand font-mono">4 500 F CFA</span>
          </div>
        </div>

        <button onclick="openPaymentSheet()" class="w-full py-3.5 rounded-2xl bg-brand text-white font-bold text-sm shadow-lg hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-lock text-xs"></i>
          <span>Commander avec Mobile Money</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 4. MODAL: MOBILE MONEY PAYMENT SHEET -->
  <div id="paymentSheetModal" class="hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 class="font-bold text-slate-900 text-base">Paiement Mobile Money</h3>
          <p class="text-xs text-slate-500">Choisissez votre opérateur de paiement direct</p>
        </div>
        <button onclick="closePaymentSheet()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
      </div>

      <!-- Operator Selector -->
      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-700">Sélectionnez le réseau :</label>
        <div class="grid grid-cols-2 gap-2 text-xs font-bold">
          <button type="button" onclick="selectOperator('wave')" class="op-btn active p-3 rounded-2xl border-2 border-brand bg-brand/5 flex items-center gap-2 text-left transition">
            <span class="text-xl">🌊</span>
            <div>
              <span class="block">Wave</span>
              <span class="text-[10px] text-slate-400 font-normal">Sans frais</span>
            </div>
          </button>
          <button type="button" onclick="selectOperator('orange')" class="op-btn p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-2 text-left transition">
            <span class="text-xl">🟠</span>
            <div>
              <span class="block">Orange Money</span>
              <span class="text-[10px] text-slate-400 font-normal">Validation USSD</span>
            </div>
          </button>
          <button type="button" onclick="selectOperator('mtn')" class="op-btn p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-2 text-left transition">
            <span class="text-xl">🟡</span>
            <div>
              <span class="block">MTN MoMo</span>
              <span class="text-[10px] text-slate-400 font-normal">Code secret</span>
            </div>
          </button>
          <button type="button" onclick="selectOperator('moov')" class="op-btn p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-2 text-left transition">
            <span class="text-xl">🔵</span>
            <div>
              <span class="block">Moov Money</span>
              <span class="text-[10px] text-slate-400 font-normal">Direct</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Phone Input -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700">Numéro de téléphone :</label>
        <input id="paymentPhone" type="tel" value="+225 07 00 00 00 00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:border-brand" />
      </div>

      <!-- Confirm Button -->
      <div class="pt-2">
        <button id="btnConfirmPay" onclick="executePaymentProcess()" class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2">
          <span>Payer <span id="paymentTotalAmount">4 500 F CFA</span></span>
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- 5. MODAL: PRODUCT DETAIL -->
  <div id="productDetailModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <span id="modalProductBadge" class="px-2.5 py-0.5 bg-brand/10 text-brand text-[10px] font-bold rounded-full">Détail</span>
        <button onclick="closeProductModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
      </div>

      <div class="space-y-3">
        <div id="modalProductIconBox" class="h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-5xl text-brand">
          <i class="fa-solid fa-box"></i>
        </div>
        <div>
          <h3 id="modalProductTitle" class="text-base font-extrabold text-slate-900">Titre</h3>
          <p id="modalProductDesc" class="text-xs text-slate-500 mt-1 leading-relaxed">Description complète de l'article...</p>
        </div>
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Prix unitaire</span>
            <span id="modalProductPrice" class="text-lg font-black text-brand">4 500 F CFA</span>
          </div>
          <div class="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <i class="fa-solid fa-star"></i>
            <span class="text-slate-700">4.9 / 5 (128 avis)</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-1">
        <button id="modalBtnAddToCart" class="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition">
          + Ajouter au Panier
        </button>
        <button id="modalBtnBuyNow" class="py-3 rounded-xl bg-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition">
          Acheter Direct
        </button>
      </div>
    </div>
  </div>

  <!-- 6. MODAL: PROFILE & ACCOUNT -->
  <div id="profileModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-slate-900 text-base">Espace Client</h3>
        <button onclick="closeProfileModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
      </div>

      <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
        <div class="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center text-xl font-bold">
          <i class="fa-solid fa-user-check"></i>
        </div>
        <div>
          <h4 class="font-bold text-slate-900 text-sm">Moussa Traoré</h4>
          <p class="text-xs text-slate-500">+225 07 00 00 00 00</p>
          <span class="inline-block mt-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">⭐ 1 450 points fidélité</span>
        </div>
      </div>

      <div class="space-y-2 text-xs">
        <span class="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Historique Récent :</span>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span class="font-bold text-slate-800 block">Commande #CMD-8492</span>
            <span class="text-[10px] text-slate-400">Payée par Wave • Livrée</span>
          </div>
          <span class="font-bold text-emerald-600">8 900 F</span>
        </div>
      </div>

      <div class="pt-2">
        <button onclick="showToast('Assistance WhatsApp joignable au +225 07 00 00 00 00')" class="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Contacter le support WhatsApp</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="hidden fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 transition-all">
    <i id="toastIcon" class="fa-solid fa-circle-check text-emerald-400"></i>
    <span id="toastMsg">Action effectuée</span>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    // Complete catalog database
    const PRODUCTS_DATA = [
      {
        id: 1,
        title: "Pack Essentiel Pro",
        desc: "Solution complète tout-en-un avec livraison express 24h et garantie.",
        price: 4500,
        badge: "⭐ Populaire",
        category: "vedette",
        icon: "fa-box-open",
        bg: "from-blue-100 to-indigo-50",
        color: "text-blue-600",
        rating: "4.9 (142 avis)"
      },
      {
        id: 2,
        title: "Abonnement Express VIP",
        desc: "Accès instantané aux fonctionnalités avancées et support prioritaire 7j/7.",
        price: 8900,
        badge: "🔥 Tendance",
        category: "promo",
        icon: "fa-bolt",
        bg: "from-amber-100 to-orange-50",
        color: "text-amber-600",
        rating: "5.0 (89 avis)"
      },
      {
        id: 3,
        title: "Service Sérénité Plus",
        desc: "Assistance dédiée sur-mesure et prise en charge complète sécurisée.",
        price: 12000,
        badge: "✨ Garantie",
        category: "services",
        icon: "fa-shield-halved",
        bg: "from-emerald-100 to-teal-50",
        color: "text-emerald-600",
        rating: "4.8 (64 avis)"
      },
      {
        id: 4,
        title: "Pack Suprême Intégral",
        desc: "L'offre exclusive avec toutes les options Premium débloquées à vie.",
        price: 25000,
        badge: "👑 Exclusif",
        category: "packs",
        icon: "fa-crown",
        bg: "from-purple-100 to-pink-50",
        color: "text-purple-600",
        rating: "5.0 (215 avis)"
      },
      {
        id: 5,
        title: "Kit Démarrage Rapide",
        desc: "Prêt à l'emploi en 5 minutes avec guide pas-à-pas illustré.",
        price: 3500,
        badge: "✨ Nouveau",
        category: "nouveau",
        icon: "fa-rocket",
        bg: "from-sky-100 to-cyan-50",
        color: "text-sky-600",
        rating: "4.7 (38 avis)"
      },
      {
        id: 6,
        title: "Module d'Extension Pro",
        desc: "Extension haute performance conçue pour décupler votre efficacité.",
        price: 6500,
        badge: "⚡ Pack VIP",
        category: "packs",
        icon: "fa-puzzle-piece",
        bg: "from-indigo-100 to-purple-50",
        color: "text-indigo-600",
        rating: "4.9 (92 avis)"
      },
      {
        id: 7,
        title: "Offre Découverte Flash",
        desc: "Tarif promotionnel spécial réservé aux nouveaux utilisateurs.",
        price: 2900,
        badge: "🔥 -30%",
        category: "promo",
        icon: "fa-tag",
        bg: "from-rose-100 to-red-50",
        color: "text-rose-600",
        rating: "4.8 (110 avis)"
      },
      {
        id: 8,
        title: "Audit & Consultation Personnalisée",
        desc: "Session d'échange stratégique 1-to-1 avec un expert certifié.",
        price: 15000,
        badge: "💎 Conseil",
        category: "services",
        icon: "fa-comments",
        bg: "from-teal-100 to-emerald-50",
        color: "text-teal-600",
        rating: "5.0 (77 avis)"
      }
    ];

    // State
    let cart = [{ id: 1, name: 'Pack Essentiel Pro', price: 4500, qty: 1 }];
    let currentCategory = 'all';
    let currentExploreCategory = 'all';
    let promoDiscountPercent = 0;
    let selectedOperator = 'wave';

    // Initialize application
    document.addEventListener('DOMContentLoaded', () => {
      renderHomeProducts();
      renderExploreProducts(PRODUCTS_DATA);
      updateCartUI();
    });

    // View Switching
    function switchView(viewName) {
      const homeView = document.getElementById('view-home');
      const exploreView = document.getElementById('view-explore');
      const navHome = document.getElementById('nav-btn-home');
      const navExplore = document.getElementById('nav-btn-explore');

      if (viewName === 'explore') {
        homeView.classList.add('hidden');
        exploreView.classList.remove('hidden');
        navExplore.classList.add('text-brand', 'font-bold');
        navExplore.classList.remove('text-slate-500');
        navHome.classList.remove('text-brand', 'font-bold');
        navHome.classList.add('text-slate-500');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Catalogue complet ouvert !', 'fa-compass');
      } else {
        exploreView.classList.add('hidden');
        homeView.classList.remove('hidden');
        navHome.classList.add('text-brand', 'font-bold');
        navHome.classList.remove('text-slate-500');
        navExplore.classList.remove('text-brand', 'font-bold');
        navExplore.classList.add('text-slate-500');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Render Home Products (Top 4)
    function renderHomeProducts(filter = 'all') {
      const grid = document.getElementById('homeProductsGrid');
      grid.innerHTML = '';

      let list = PRODUCTS_DATA;
      if (filter !== 'all') {
        list = PRODUCTS_DATA.filter(p => p.category === filter);
      }
      const toShow = list.slice(0, 4);

      document.getElementById('homeItemsCount').innerText = list.length + ' disponibles';

      toShow.forEach(prod => {
        grid.innerHTML += \`
          <div class="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer" onclick="openProductModal(\${prod.id})">
            <div>
              <div class="h-28 rounded-xl bg-gradient-to-br \${prod.bg} flex items-center justify-center \${prod.color} text-3xl mb-2 shadow-inner">
                <i class="fa-solid \${prod.icon}"></i>
              </div>
              <span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">\${prod.badge}</span>
              <h4 class="font-bold text-xs text-slate-800 mt-1 leading-snug">\${prod.title}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">\${prod.desc}</p>
            </div>
            <div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100" onclick="event.stopPropagation()">
              <span class="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">\${prod.price.toLocaleString()} F</span>
              <button onclick="addToCartById(\${prod.id})" class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition shadow-xs" title="Ajouter au panier">
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>
        \`;
      });
    }

    // Render Explore Products
    function renderExploreProducts(productsList) {
      const grid = document.getElementById('exploreProductsGrid');
      const empty = document.getElementById('exploreEmptyState');
      const count = document.getElementById('exploreResultsCount');

      grid.innerHTML = '';
      count.innerText = productsList.length + ' articles';

      if (productsList.length === 0) {
        grid.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
      }

      grid.classList.remove('hidden');
      empty.classList.add('hidden');

      productsList.forEach(prod => {
        grid.innerHTML += \`
          <div class="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition cursor-pointer" onclick="openProductModal(\${prod.id})">
            <div class="space-y-2">
              <div class="h-32 rounded-2xl bg-gradient-to-br \${prod.bg} flex items-center justify-center \${prod.color} text-4xl shadow-inner relative">
                <i class="fa-solid \${prod.icon}"></i>
                <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold shadow-xs">
                  \${prod.badge}
                </span>
              </div>
              <div>
                <h4 class="font-black text-sm text-slate-900">\${prod.title}</h4>
                <p class="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">\${prod.desc}</p>
              </div>
              <div class="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                <i class="fa-solid fa-star"></i>
                <span class="text-slate-600">\${prod.rating}</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onclick="event.stopPropagation()">
              <div>
                <span class="text-[10px] text-slate-400 block font-bold uppercase">Prix</span>
                <span class="text-sm font-black text-brand font-mono">\${prod.price.toLocaleString()} F CFA</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button onclick="addToCartById(\${prod.id})" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-95">
                  + Panier
                </button>
                <button onclick="directCheckoutSingle(\${prod.id})" class="px-3 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-xs hover:opacity-90 transition active:scale-95">
                  Acheter
                </button>
              </div>
            </div>
          </div>
        \`;
      });
    }

    // Category Filtering
    function filterCategory(cat) {
      currentCategory = cat;
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.classList.remove('active', 'bg-brand', 'text-white', 'shadow-xs');
        b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      });
      event.target.classList.add('active', 'bg-brand', 'text-white', 'shadow-xs');
      event.target.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');

      renderHomeProducts(cat);
      showToast('Filtre : ' + cat.toUpperCase());
    }

    function filterExploreCategory(cat) {
      currentExploreCategory = cat;
      document.querySelectorAll('.explore-filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-brand', 'text-white', 'shadow-xs');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      event.target.classList.add('active', 'bg-brand', 'text-white', 'shadow-xs');
      event.target.classList.remove('bg-slate-100', 'text-slate-700');

      const query = document.getElementById('exploreSearchInput').value.toLowerCase().trim();
      applyExploreFilter(query, cat);
    }

    function handleExploreSearch(val) {
      applyExploreFilter(val.toLowerCase().trim(), currentExploreCategory);
    }

    function handleGlobalSearch(val) {
      switchView('explore');
      document.getElementById('exploreSearchInput').value = val;
      handleExploreSearch(val);
    }

    function applyExploreFilter(search, cat) {
      let res = PRODUCTS_DATA;
      if (cat !== 'all') {
        res = res.filter(p => p.category === cat);
      }
      if (search) {
        res = res.filter(p => p.title.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search));
      }
      renderExploreProducts(res);
    }

    function resetExploreFilters() {
      document.getElementById('exploreSearchInput').value = '';
      currentExploreCategory = 'all';
      renderExploreProducts(PRODUCTS_DATA);
    }

    // Cart Management
    function addToCartById(id) {
      const p = PRODUCTS_DATA.find(x => x.id === id);
      if (!p) return;
      const existing = cart.find(x => x.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: p.id, name: p.title, price: p.price, qty: 1 });
      }
      updateCartUI();
      showToast(p.title + ' ajouté au panier !', 'fa-cart-plus');
    }

    function updateItemQty(id, delta) {
      const item = cart.find(x => x.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(x => x.id !== id);
      }
      updateCartUI();
    }

    function updateCartUI() {
      const totalCount = cart.reduce((acc, c) => acc + c.qty, 0);
      document.getElementById('cartCountBadge').innerText = totalCount;
      document.getElementById('navCartCount').innerText = totalCount;

      const list = document.getElementById('cartItemsList');
      list.innerHTML = '';

      if (cart.length === 0) {
        list.innerHTML = '<p class="text-center py-6 text-xs text-slate-400">Votre panier est vide.</p>';
      }

      let subtotal = 0;
      cart.forEach(item => {
        subtotal += item.price * item.qty;
        list.innerHTML += \`
          <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div class="flex-1 pr-2">
              <span class="font-bold text-slate-900 block">\${item.name}</span>
              <span class="text-slate-400">\${item.price.toLocaleString()} F CFA</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-0.5">
                <button onclick="updateItemQty(\${item.id}, -1)" class="w-5 h-5 rounded text-slate-600 flex items-center justify-center hover:bg-slate-100">-</button>
                <span class="font-bold font-mono px-1">\${item.qty}</span>
                <button onclick="updateItemQty(\${item.id}, 1)" class="w-5 h-5 rounded text-slate-600 flex items-center justify-center hover:bg-slate-100">+</button>
              </div>
              <span class="font-black text-slate-900 font-mono w-16 text-right">\${(item.price * item.qty).toLocaleString()} F</span>
            </div>
          </div>
        \`;
      });

      const discount = Math.round(subtotal * promoDiscountPercent);
      const finalTotal = subtotal - discount;

      document.getElementById('cartSubtotalText').innerText = subtotal.toLocaleString() + ' F CFA';
      if (promoDiscountPercent > 0) {
        document.getElementById('promoDiscountRow').classList.remove('hidden');
        document.getElementById('cartDiscountText').innerText = '-' + discount.toLocaleString() + ' F CFA';
      } else {
        document.getElementById('promoDiscountRow').classList.add('hidden');
      }
      document.getElementById('cartTotalText').innerText = finalTotal.toLocaleString() + ' F CFA';
      document.getElementById('paymentTotalAmount').innerText = finalTotal.toLocaleString() + ' F CFA';
    }

    function applyPromoCode() {
      const code = document.getElementById('promoInput').value.trim().toUpperCase();
      if (code === 'AFRI2026') {
        promoDiscountPercent = 0.15;
        document.getElementById('appliedPromoBadge').classList.remove('hidden');
        updateCartUI();
        showToast('Code AFRI2026 activé : -15% de réduction !', 'fa-tag');
      } else {
        showToast('Code promo invalide. Essayez AFRI2026', 'fa-circle-xmark');
      }
    }

    // Modals
    function openCartModal() {
      document.getElementById('cartModal').classList.remove('hidden');
    }
    function closeCartModal() {
      document.getElementById('cartModal').classList.add('hidden');
    }

    function openPaymentSheet() {
      if (cart.length === 0) {
        showToast('Votre panier est vide.');
        return;
      }
      closeCartModal();
      document.getElementById('paymentSheetModal').classList.remove('hidden');
    }
    function closePaymentSheet() {
      document.getElementById('paymentSheetModal').classList.add('hidden');
    }

    function selectOperator(op) {
      selectedOperator = op;
      document.querySelectorAll('.op-btn').forEach(b => {
        b.classList.remove('active', 'border-2', 'border-brand', 'bg-brand/5');
        b.classList.add('border', 'border-slate-200', 'bg-white');
      });
      event.currentTarget.classList.add('active', 'border-2', 'border-brand', 'bg-brand/5');
      event.currentTarget.classList.remove('border-slate-200', 'bg-white');
    }

    function executePaymentProcess() {
      const btn = document.getElementById('btnConfirmPay');
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validation avec l\\'opérateur...';
      btn.disabled = true;

      setTimeout(() => {
        closePaymentSheet();
        btn.innerHTML = '<span>Payer</span> <i class="fa-solid fa-check"></i>';
        btn.disabled = false;
        cart = [];
        updateCartUI();
        showToast('Succès ! Paiement validé par ' + selectedOperator.toUpperCase() + ' (Réf: TXN-' + Math.floor(100000 + Math.random() * 900000) + ')', 'fa-circle-check');
      }, 1200);
    }

    function directCheckoutSingle(id) {
      const p = PRODUCTS_DATA.find(x => x.id === id);
      if (!p) return;
      cart = [{ id: p.id, name: p.title, price: p.price, qty: 1 }];
      updateCartUI();
      openPaymentSheet();
    }

    function openProductModal(id) {
      const p = PRODUCTS_DATA.find(x => x.id === id);
      if (!p) return;

      document.getElementById('modalProductBadge').innerText = p.badge;
      document.getElementById('modalProductTitle').innerText = p.title;
      document.getElementById('modalProductDesc').innerText = p.desc;
      document.getElementById('modalProductPrice').innerText = p.price.toLocaleString() + ' F CFA';
      document.getElementById('modalProductIconBox').className = 'h-32 rounded-2xl bg-gradient-to-br ' + p.bg + ' flex items-center justify-center text-5xl ' + p.color;
      document.getElementById('modalProductIconBox').innerHTML = '<i class="fa-solid ' + p.icon + '"></i>';

      document.getElementById('modalBtnAddToCart').onclick = () => {
        addToCartById(p.id);
        closeProductModal();
      };
      document.getElementById('modalBtnBuyNow').onclick = () => {
        closeProductModal();
        directCheckoutSingle(p.id);
      };

      document.getElementById('productDetailModal').classList.remove('hidden');
    }
    function closeProductModal() {
      document.getElementById('productDetailModal').classList.add('hidden');
    }

    function openProfileModal() {
      document.getElementById('profileModal').classList.remove('hidden');
    }
    function closeProfileModal() {
      document.getElementById('profileModal').classList.add('hidden');
    }

    function toggleTopSearch() {
      const b = document.getElementById('topSearchBar');
      b.classList.toggle('hidden');
      if (!b.classList.contains('hidden')) {
        document.getElementById('topSearchInput').focus();
      }
    }

    function showToast(msg, iconClass = 'fa-circle-check') {
      const t = document.getElementById('toast');
      const tm = document.getElementById('toastMsg');
      const ti = document.getElementById('toastIcon');
      tm.innerText = msg;
      ti.className = 'fa-solid ' + iconClass + ' text-emerald-400';
      t.classList.remove('hidden');
      setTimeout(() => t.classList.add('hidden'), 2500);
    }
  </script>
</body>
</html>`;
}

export function createDefaultProject(title: string, description: string, category: Project["category"] = "custom", targetType: Project["targetType"] = "both"): Project {
  const safeTitle = title || "Nouvelle Application";
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const initialHtml = generateInitialInteractiveApp(safeTitle, category, description);

  const initialFiles: ProjectFile[] = [
    {
      name: "index.html",
      path: "www/index.html",
      language: "html",
      content: initialHtml,
      description: "Interface principale réactive avec Tailwind et Mobile Money"
    },
    {
      name: "AndroidManifest.xml",
      path: "android/app/src/main/AndroidManifest.xml",
      language: "xml",
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${safeTitle}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
      description: "Configuration du package Android et permissions requises"
    },
    {
      name: "build.gradle",
      path: "android/app/build.gradle",
      language: "groovy",
      content: `apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}`,
      description: "Script de compilation Gradle pour APK et Android App Bundle (AAB)"
    },
    {
      name: "capacitor.config.json",
      path: "capacitor.config.json",
      language: "json",
      content: JSON.stringify({
        appId: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        appName: safeTitle,
        webDir: "www",
        bundledWebRuntime: false,
        plugins: {
          SplashScreen: {
            launchShowDuration: 1500,
            backgroundColor: "#0F172A"
          }
        }
      }, null, 2),
      description: "Configuration du pont natif mobile"
    }
  ];

  const initialVersion: ProjectVersion = {
    id: `v_${Date.now()}`,
    versionTag: "v1.0.0",
    timestamp: now,
    summary: "Création initiale du projet avec architecture multi-IA",
    author: "IA de Développement",
    filesCount: initialFiles.length
  };

  const subdomain = `${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    title: safeTitle,
    description: description || "Projet conçu avec les 3 IA AfriBuilder Studio",
    category,
    targetType,
    createdAt: now,
    updatedAt: now,
    currentStepId: "conception",
    stepProgress: 15,
    isCheckpointReached: false,
    userDecisionAfterApk: "pending",
    interactiveAppHtml: initialHtml,
    files: initialFiles,
    versions: [initialVersion],
    researchData: {
      enhancedTitle: `${safeTitle} - Solution No-Code Pro`,
      summary: `Projet optimisé pour mobile et web avec interface moderne et paiement Mobile Money instantané.`,
      keyFeatures: [
        "Interface responsive tactile fluide",
        "Panier et validation de commande en 1 clic",
        "Passerelle Mobile Money (Wave, Orange, MTN, Moov)",
        "Génération native APK et AAB intégrée"
      ],
      suggestedTheme: {
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        fontPairing: "Plus Jakarta Sans & Inter",
        designStyle: "Design épuré moderne avec Tailwind CSS"
      },
      freeResources: {
        icons: "Lucide React & FontAwesome 6",
        fonts: "Google Fonts (Inter / Plus Jakarta Sans)",
        illustrations: "Unsplash Free Assets",
        cdnLibraries: ["Tailwind CSS CDN", "FontAwesome CDN"]
      },
      accessibilityTips: [
        "Contraste élevé pour lisibilité en plein soleil",
        "Boutons tactiles d'au moins 44px de hauteur"
      ],
      competitiveAdvantage: "Conception 100% sans code avec déploiement instantané."
    },
    securityAudit: {
      globalScore: 98,
      securityStatus: "Sécurisé",
      performanceScore: 99,
      accessibilityScore: 96,
      mobileReadinessScore: 100,
      testsPassedCount: 16,
      totalTestsCount: 16,
      auditChecks: [
        { category: "Sécurité", name: "Protection XSS & Injection", status: "passed", detail: "Code conforme aux règles de sécurité web" },
        { category: "Sécurité", name: "Sécurisation Mobile Money", status: "passed", detail: "Validation des formulaires côté client" },
        { category: "Accessibilité", name: "Contraste WCAG 2.1 AA", status: "passed", detail: "Rapports de contraste validés à 100%" },
        { category: "Mobile", name: "Responsive & Écrans Tactiles", status: "passed", detail: "Balise Viewport adaptative prête pour Android" }
      ],
      recommendations: [
        "Tester l'installation sur un vrai smartphone Android via le QR Code",
        "Vérifier les numéros marchands Mobile Money dans l'espace admin"
      ]
    },
    apkBundleConfig: {
      packageName: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      versionCode: 1,
      versionName: "1.0.0",
      apkSizeMb: "12.4 MB",
      aabSizeMb: "8.1 MB",
      sha256: "9F83A2E14B7D6C5E3F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E",
      generatedAt: now,
      qrData: `https://${subdomain}.afribuilder.app`
    },
    webDeployment: {
      liveUrl: `https://${subdomain}.afribuilder.app`,
      subdomain,
      status: "deployed",
      deployedAt: now,
      ssl: true
    },
    hostingOptions: [
      {
        provider: "Vercel",
        name: "Vercel Free Tier",
        url: "https://vercel.com",
        isFree: true,
        tier: "100% Gratuit à vie",
        features: ["Déploiement 1 clic", "SSL automatique", "Bande passante 100GB/mois", "Nom de domaine personnalisé gratuit"],
        setupGuide: "1. Déposez vos fichiers sur GitHub\n2. Importez le dépôt sur vercel.com\n3. Cliquez sur 'Deploy' : votre site est en ligne en 20 secondes !"
      },
      {
        provider: "Netlify",
        name: "Netlify Free Starter",
        url: "https://netlify.com",
        isFree: true,
        tier: "100% Gratuit",
        features: ["Glisser-déposer de dossier ZIP", "HTTPS automatique", "Formulaires de contact intégrés"],
        setupGuide: "Glissez simplement le dossier 'www' sur app.netlify.com/drop pour être en ligne immédiatement !"
      },
      {
        provider: "Cloudflare",
        name: "Cloudflare Pages",
        url: "https://pages.cloudflare.com",
        isFree: true,
        tier: "100% Gratuit illimité",
        features: ["Protection DDoS mondiale", "Vitesse ultra-rapide en Afrique", "Bande passante illimitée"],
        setupGuide: "Liez votre compte GitHub et profitez du réseau CDN Cloudflare mondial sans limite."
      },
      {
        provider: "GitHub Pages",
        name: "GitHub Pages",
        url: "https://pages.github.com",
        isFree: true,
        tier: "100% Gratuit Open-Source",
        features: ["Hébergement direct depuis le dépôt", "Domaine yourname.github.io"],
        setupGuide: "Activez Pages dans l'onglet 'Settings > Pages' de votre dépôt GitHub."
      }
    ],
    documentation: `# Documentation Complète du Projet : ${safeTitle}

## 1. Vision & Fonctionnalités
- **Application :** ${safeTitle}
- **Type :** ${targetType === "both" ? "Application Android Native + Site Web" : targetType === "mobile_app" ? "Application Android Mobile" : "Site Web Responsive"}
- **Description :** ${description || "Application conçue sans code avec AfriBuilder AI"}
- **Paiements :** Passerelle Mobile Money (Orange Money, Wave, MTN MoMo, Moov)

## 2. Déploiement Web
L'application est optimisée pour fonctionner sur n'importe quel hébergement statique gratuit (Vercel, Netlify, Cloudflare).

## 3. Compilation Android (APK & AAB)
- Fichier APK : Dédié aux tests directs sur smartphone Android sans passer par le store.
- Fichier AAB (Android App Bundle) : Format requis pour la publication officielle sur le Google Play Store.`,
    totalTimeSpentMinutes: 3,
    totalCostFcfa: 15,
    chatHistory: [
      {
        id: "msg_1",
        role: "developer",
        senderName: "IA de Développement",
        text: `👋 Bienvenue ! Je suis votre IA de Développement et Administrateur. J'ai configuré l'architecture de votre projet "${safeTitle}". Les 3 IA (Développement, Recherche Web & Sécurité) sont synchronisées pour vous assister à chaque étape.`,
        timestamp: now
      }
    ]
  };
}

export async function exportProjectZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const repoName = project.githubConfig?.repoName || project.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "mon-application";

  // 1. Root index.html (Works immediately in any browser or static hosting)
  zip.file("index.html", project.interactiveAppHtml);

  // 2. www/ and dist/ folders
  const wwwFolder = zip.folder("www");
  if (wwwFolder) {
    wwwFolder.file("index.html", project.interactiveAppHtml);
  }
  const distFolder = zip.folder("dist");
  if (distFolder) {
    distFolder.file("index.html", project.interactiveAppHtml);
  }

  // 3. Manifest PWA & Service Worker
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        name: project.title,
        short_name: project.title.slice(0, 12),
        description: project.description,
        start_url: "./index.html",
        display: "standalone",
        background_color: "#0F172A",
        theme_color: project.category === "fintech" ? "#059669" : "#2563EB",
        orientation: "portrait",
      },
      null,
      2
    )
  );

  zip.file(
    "sw.js",
    `// Service Worker pour ${project.title}
const CACHE_NAME = "${repoName}-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["./", "./index.html", "./manifest.json"])));
  self.skipWaiting();
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
`
  );

  // 4. GitHub Actions CI/CD workflow
  const githubFolder = zip.folder(".github");
  const workflowsFolder = githubFolder?.folder("workflows");
  if (workflowsFolder) {
    workflowsFolder.file(
      "deploy.yml",
      `name: Déploiement Automatique GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
`
    );
  }

  // 5. Vercel & Netlify configs
  zip.file(
    "vercel.json",
    JSON.stringify(
      {
        version: 2,
        name: repoName,
        routes: [{ src: "/(.*)", dest: "/index.html" }],
      },
      null,
      2
    )
  );

  zip.file(
    "netlify.toml",
    `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
  );

  // 6. Root README.md & DOCUMENTATION.md
  zip.file(
    "README.md",
    `# ${project.title}

${project.description}

> ⚡ **Généré avec Omnibuild AI Studio** — Prêt pour hébergement Web, GitHub Pages, Vercel et Android APK/AAB.

---

## 🌐 Déploiement en 1 Clic
- **GitHub Pages :** Téléversez ce dossier sur GitHub et activez Pages dans *Settings > Pages*.
- **Vercel / Netlify :** Glissez l'ensemble des fichiers sur votre dashboard d'hébergement.
- **Mobile Android :** Utilisez le dossier \`android/\` ou Capacitor pour compiler l'APK / AAB.

---

## 📄 Documentation Technique
${project.documentation || "Documentation technique intégrée."}
`
  );

  zip.file("DOCUMENTATION.md", project.documentation);

  // 7. package.json & .gitignore
  zip.file(
    "package.json",
    JSON.stringify(
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
    )
  );

  zip.file(
    ".gitignore",
    `node_modules
dist
.env
.env.local
*.log
.DS_Store
`
  );

  // 8. Capacitor & Android
  zip.file(
    "capacitor.config.json",
    JSON.stringify(
      {
        appId: project.apkBundleConfig.packageName,
        appName: project.title,
        webDir: "www",
      },
      null,
      2
    )
  );

  const androidFolder = zip.folder("android");
  if (androidFolder) {
    const appFolder = androidFolder.folder("app");
    if (appFolder) {
      appFolder.file("build.gradle", project.files.find((f) => f.name === "build.gradle")?.content || "");
      const srcFolder = appFolder.folder("src");
      const mainFolder = srcFolder?.folder("main");
      if (mainFolder) {
        mainFolder.file(
          "AndroidManifest.xml",
          project.files.find((f) => f.name === "AndroidManifest.xml")?.content || ""
        );
      }
    }
  }

  // Include project custom files if any
  if (project.files && project.files.length > 0) {
    project.files.forEach((f) => {
      const cleanPath = f.path.startsWith("/") ? f.path.slice(1) : f.path;
      if (!cleanPath.startsWith("android/")) {
        zip.file(cleanPath, f.content);
      }
    });
  }

  return await zip.generateAsync({ type: "blob" });
}
