import React from 'react';
import {
  Car,
  Bike,
  Truck,
  ShieldCheck,
  Download,
  QrCode,
  User as UserIcon,
  LogOut,
  MessageSquare,
  Home,
  Layers,
} from 'lucide-react';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderBannerProps {
  currentTab: 'accueil' | 'catalogue' | 'messagerie' | 'proprietaire';
  onNavigate: (tab: 'accueil' | 'catalogue' | 'messagerie' | 'proprietaire') => void;
  selectedCategory: Category | 'Toutes';
  onSelectCategory: (cat: Category | 'Toutes') => void;
  onOpenApkModal: (tab?: 'qr' | 'pwa' | 'apk') => void;
  onOpenAuthModal: () => void;
  onOpenAccountModal: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  currentTab,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  onOpenApkModal,
  onOpenAuthModal,
  onOpenAccountModal,
}) => {
  const { user, isOwner, logout } = useAuth();

  const categories: Array<{ id: Category; label: string; icon: React.ReactNode }> = [
    { id: 'Voitures', label: 'Voitures', icon: <Car className="w-4 h-4" /> },
    { id: 'Motos', label: 'Motos', icon: <Bike className="w-4 h-4" /> },
    { id: 'Tricycles', label: 'Tricycles', icon: <Truck className="w-4 h-4 text-amber-300" /> },
  ];

  return (
    <header className="w-full bg-[#071E26] border-b border-[#0f3a47] text-white shadow-2xl sticky top-0 z-40 select-none">
      {/* Top Utility Ribbon */}
      <div className="bg-[#041217] px-4 py-1.5 border-b border-[#0a2730] flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Plateforme Officielle • Partout dans le monde 🌍
          </span>
          <span className="hidden md:inline text-slate-400">
            Accessible & synchronisée partout dans le monde
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* APK & QR Code Android button */}
          <button
            onClick={() => onOpenApkModal('qr')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-extrabold text-xs shadow-md shadow-[#00c9a7]/20 transition cursor-pointer"
            title="Scanner le QR Code ou installer l'application Android"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code APK Android</span>
          </button>

          {/* If recognized as Owner, display owner badge and link */}
          {isOwner && (
            <button
              onClick={() => onNavigate('proprietaire')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow ${
                currentTab === 'proprietaire'
                  ? 'bg-[#00c9a7] text-[#071E26]'
                  : 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Propriétaire (MOUHAMED NDAO)</span>
            </button>
          )}

          {/* User Account / Mon Compte Button */}
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0c2f3b] hover:bg-[#144757] text-[#00c9a7] border border-[#1a5567] text-xs font-bold transition shadow-sm cursor-pointer"
            title="Mon Compte : Thème sombre/clair, Contact d'urgence, Cache et Déconnexion"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{user ? `Mon Compte (${user.prenom} ${user.nom})` : 'Mon Compte'}</span>
          </button>

          {user && (
            <button
              onClick={async () => {
                await logout();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-bold transition cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c313d] to-[#061920] border-2 border-[#00c9a7] flex items-center justify-center shadow-lg shadow-[#00c9a7]/20 group-hover:scale-105 transition transform">
            <span className="text-[#00c9a7] font-black text-2xl tracking-tighter font-['Cabinet_Grotesk',sans-serif]">
              N
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white tracking-wide font-['Cabinet_Grotesk',sans-serif]">
                NDAO’
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#00c9a7] tracking-wide font-['Cabinet_Grotesk',sans-serif]">
                AUTO
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Vente & Gestion Automobile • Partout dans le monde 🌍
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigate('accueil')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              currentTab === 'accueil'
                ? 'bg-[#00c9a7] text-[#071E26] shadow-lg shadow-[#00c9a7]/20'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Accueil & Annonces</span>
          </button>

          <button
            onClick={() => onNavigate('catalogue')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              currentTab === 'catalogue'
                ? 'bg-[#00c9a7] text-[#071E26] shadow-lg shadow-[#00c9a7]/20'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catalogue</span>
          </button>

          <button
            onClick={() => onNavigate('messagerie')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              currentTab === 'messagerie'
                ? 'bg-[#00c9a7] text-[#071E26] shadow-lg shadow-[#00c9a7]/20'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#00c9a7]" />
            <span>Messagerie</span>
          </button>

          {isOwner && (
            <button
              onClick={() => onNavigate('proprietaire')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                currentTab === 'proprietaire'
                  ? 'bg-[#00c9a7] text-[#071E26] shadow-lg shadow-[#00c9a7]/20'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-[#0c2833]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gestion Propriétaire</span>
            </button>
          )}

          <button
            onClick={onOpenAccountModal}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 text-slate-300 hover:text-white hover:bg-[#0c2833] border border-[#143e4c]/70"
            title="Mon Compte : Profil, Thème sombre/clair, Urgence, Cache & Déconnexion"
          >
            <UserIcon className="w-4 h-4 text-[#00c9a7]" />
            <span>{user ? `Mon Compte (${user.prenom})` : 'Mon Compte'}</span>
          </button>
        </nav>
      </div>

      {/* Categories Bar (Voitures, Motos, Tricycles) */}
      <div className="bg-[#05171d] px-4 py-2 border-t border-[#092630]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectCategory('Toutes')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'Toutes'
                ? 'bg-[#00c9a7] text-[#071E26] font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
            }`}
          >
            Tous les véhicules
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#00c9a7] text-[#071E26] font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
