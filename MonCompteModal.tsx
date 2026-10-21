import React, { useState } from 'react';
import {
  User as UserIcon,
  Moon,
  Sun,
  PhoneCall,
  Trash2,
  LogOut,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface MonCompteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export const MonCompteModal: React.FC<MonCompteModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal,
}) => {
  const { user, logout, isOwner } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  const [clearingCache, setClearingCache] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeTab, setActiveTab] = useState<'compte' | 'urgence'>('compte');

  if (!isOpen) return null;

  // Cache cleaning function
  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // 1. Clear window.caches (Service Worker / PWA caches)
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }

      // 2. Clear sessionStorage
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }

      // 3. Clear non-essential localStorage items (keep credentials safe)
      try {
        const preservedTheme = localStorage.getItem('ndao_auto_theme');
        const preservedUser = localStorage.getItem('ndao_user');
        const preservedToken = localStorage.getItem('ndao_auth_token');

        // Clean temp keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            key !== 'ndao_auto_theme' &&
            key !== 'ndao_user' &&
            key !== 'ndao_auth_token'
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        if (preservedTheme) localStorage.setItem('ndao_auto_theme', preservedTheme);
        if (preservedUser) localStorage.setItem('ndao_user', preservedUser);
        if (preservedToken) localStorage.setItem('ndao_auth_token', preservedToken);
      } catch {
        // ignore
      }

      setCacheStatus('Cache vidé avec succès ! Données et mémoire temporaires nettoyées.');
      setTimeout(() => {
        setCacheStatus(null);
      }, 5000);
    } catch (err) {
      setCacheStatus('Nettoyage du cache terminé.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    setConfirmLogout(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#071E26] text-white border-2 border-[#164b5b] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0a2732] to-[#041217] p-5 border-b border-[#113845] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00c9a7] to-[#008f77] flex items-center justify-center text-[#071E26] shadow-lg font-black text-lg">
              <UserIcon className="w-6 h-6 text-[#071E26]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white">Mon Compte</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00c9a7] font-bold border border-[#00c9a7]/30">
                  NDAO’AUTO 🇸🇳
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {user ? `${user.prenom} ${user.nom}` : 'Espace personnel & Réglages'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogoutClick}
                className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition border border-red-500/50 cursor-pointer"
                title="Se déconnecter immédiatement"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#0c2f3b] hover:bg-[#164b5b] text-slate-300 hover:text-white flex items-center justify-center transition border border-[#1b4e5f]"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation sub-tabs */}
        <div className="flex border-b border-[#113845] bg-[#05171d] text-xs font-bold">
          <button
            onClick={() => setActiveTab('compte')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'compte'
                ? 'border-[#00c9a7] text-[#00c9a7] bg-[#071E26]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil & Réglages</span>
          </button>

          <button
            onClick={() => setActiveTab('urgence')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'urgence'
                ? 'border-red-500 text-red-400 bg-[#071E26]'
                : 'border-transparent text-slate-400 hover:text-red-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Contact d’Urgence SOS</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {activeTab === 'compte' ? (
            <>
              {/* Profile Card */}
              {user ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c313d] to-[#071E26] border-2 border-[#164b5b] shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#164b5b]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c9a7] to-[#008f77] text-[#071E26] font-black flex items-center justify-center text-sm shadow-md">
                        {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
                        {user.nom ? user.nom.charAt(0).toUpperCase() : ''}
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#00c9a7] font-extrabold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#00c9a7]" />
                          {isOwner ? 'Propriétaire Officiel NDAO’AUTO' : 'Client Connecté'}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          Session active
                        </span>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Connecté
                    </span>
                  </div>

                  {/* Clear separation of Prénom and Nom as requested */}
                  <div className="grid grid-cols-2 gap-3 bg-[#05171d] p-3.5 rounded-xl border border-[#113845]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Prénom</span>
                      <span className="font-extrabold text-white text-base break-words">
                        {user.prenom}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Nom</span>
                      <span className="font-extrabold text-white text-base break-words">
                        {user.nom}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Téléphone</span>
                      <span className="font-bold text-[#00c9a7] text-xs tracking-wide">
                        {user.telephone || 'Non renseigné'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">E-mail</span>
                      <span className="text-slate-300 text-xs truncate block" title={user.email}>
                        {user.email || 'Non renseigné'}
                      </span>
                    </div>
                  </div>

                  {/* Immediate Logout Button right in the Profile Card */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-300">
                      Compte actif sur cet appareil.
                    </span>

                    {!confirmLogout ? (
                      <button
                        onClick={() => setConfirmLogout(true)}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs shadow-lg shadow-red-950/50 transition flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleLogoutClick}
                          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs transition cursor-pointer"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setConfirmLogout(false)}
                          className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0b2731] border border-[#164b5b] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-bold text-white">Vous êtes en mode Invité</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Connectez-vous pour suivre vos réservations, favoris et historique.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-extrabold text-xs shadow-md transition shrink-0 cursor-pointer"
                  >
                    Se connecter / S’inscrire
                  </button>
                </div>
              )}

              {/* 1. THÈME SOMBRE OU CLAIR (Required by prompt) */}
              <div className="p-4 rounded-2xl bg-[#0b2731] border border-[#164b5b] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                      Thème d’affichage (Sombre ou Clair)
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Choisissez l’apparence visuelle adaptée à votre environnement de lecture.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#071E26] text-[#00c9a7] border border-[#164b5b]">
                    {theme === 'dark' ? 'Sombre' : 'Clair'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Option Mode Sombre */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#06181f] border-[#00c9a7] shadow-lg shadow-[#00c9a7]/10'
                        : 'bg-[#071E26] border-[#164b5b] opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold block text-white">Thème Sombre</span>
                      <span className="text-[10px] text-slate-300">Mode Nuit Automobile</span>
                    </div>
                    {theme === 'dark' && (
                      <span className="text-[10px] font-bold text-[#00c9a7] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                      </span>
                    )}
                  </button>

                  {/* Option Mode Clair */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#f8fafc] border-[#00c9a7] text-slate-900 shadow-lg shadow-[#00c9a7]/20'
                        : 'bg-[#071E26] border-[#164b5b] opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-xs font-bold block ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        Thème Clair
                      </span>
                      <span
                        className={`text-[10px] ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        Mode Jour Lumineux
                      </span>
                    </div>
                    {theme === 'light' && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. CONTACT D'URGENCE (Quick button & preview) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0b2731] to-[#0b2731] border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Contact d’Urgence 24h/24</h3>
                      <p className="text-xs text-red-200">
                        Assistance dépannage & urgence NDAO’AUTO Sénégal 🇸🇳
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('urgence')}
                    className="text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href="tel:+221777308383"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Appel SOS : 77 730 83 83</span>
                  </a>

                  <a
                    href="https://wa.me/221777308383?text=URGENCE%20ASSISTANCE%20NDAO%20AUTO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp SOS</span>
                  </a>
                </div>
              </div>

              {/* 3. VIDER LA CACHE (Required by prompt) */}
              <div className="p-4 rounded-2xl bg-[#0b2731] border border-[#164b5b] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Vider la Cache</h3>
                      <p className="text-xs text-slate-300">
                        Supprime les fichiers temporaires, images en mémoire et actualise l’application.
                      </p>
                    </div>
                  </div>
                </div>

                {cacheStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{cacheStatus}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c2f3b] hover:bg-[#144757] text-[#00c9a7] border border-[#1a5567] font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{clearingCache ? 'Nettoyage...' : 'Vider le cache maintenant'}</span>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#071E26] hover:bg-[#0c2f3b] text-slate-300 hover:text-white border border-[#164b5b] font-medium text-xs transition cursor-pointer"
                    title="Actualiser la page"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recharger l’app</span>
                  </button>
                </div>
              </div>

              {/* 4. SE DÉCONNECTER (Required by prompt) */}
              {user && (
                <div className="p-4 rounded-2xl bg-[#0b2731] border border-[#164b5b] space-y-3">
                  {!confirmLogout ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-red-400" />
                          Session & Déconnexion
                        </h3>
                        <p className="text-xs text-slate-400">
                          Fermer la session actuelle sur cet appareil.
                        </p>
                      </div>

                      <button
                        onClick={() => setConfirmLogout(true)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Confirmer la déconnexion ?</span>
                      </div>
                      <p className="text-[11px] text-red-200">
                        Vous devrez saisir à nouveau vos identifiants pour accéder à vos messages et annonces.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleLogoutClick}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition cursor-pointer"
                        >
                          Oui, se déconnecter
                        </button>
                        <button
                          onClick={() => setConfirmLogout(false)}
                          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Emergency SOS Tab Detail */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/70 to-[#071E26] border-2 border-red-500/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-lg">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Assistance d’Urgence & Dépannage
                    </h3>
                    <p className="text-xs text-red-300">
                      Service d’intervention rapide NDAO’AUTO Sénégal 🇸🇳
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  En cas de panne moteur, crevaison, accident, ou remorquage sur l’autoroute ou en ville partout dans le monde, contactez immédiatement nos équipes d’urgence disponibles 24h/24 et 7j/7.
                </p>

                {/* Direct Owner Line */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                      Ligne Prioritaire Propriétaire
                    </span>
                    <h4 className="text-sm font-extrabold text-white">Mouhamed Ndao</h4>
                    <span className="text-sm text-[#00c9a7] font-black tracking-wider">
                      +221 77 730 83 83
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="tel:+221777308383"
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Appeler</span>
                    </a>

                    <a
                      href="https://wa.me/221777308383?text=URGENCE%20ASSISTANCE%20NDAO%20AUTO"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* National Official Emergency Numbers in Senegal */}
              <div className="p-4 rounded-2xl bg-[#0b2731] border border-[#164b5b] space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Numéros d’Urgence Nationaux (Sénégal)
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:18"
                    className="p-3 rounded-xl bg-[#071E26] hover:bg-red-950/40 border border-[#164b5b] hover:border-red-500/40 transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="block font-bold text-white group-hover:text-red-300">
                        Sapeurs-Pompiers
                      </span>
                      <span className="text-[10px] text-slate-400">Incendies & Secours</span>
                    </div>
                    <span className="text-base font-black text-red-400">18</span>
                  </a>

                  <a
                    href="tel:17"
                    className="p-3 rounded-xl bg-[#071E26] hover:bg-blue-950/40 border border-[#164b5b] hover:border-blue-500/40 transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="block font-bold text-white group-hover:text-blue-300">
                        Police Secours
                      </span>
                      <span className="text-[10px] text-slate-400">Sécurité & Accidents</span>
                    </div>
                    <span className="text-base font-black text-blue-400">17</span>
                  </a>

                  <a
                    href="tel:1515"
                    className="p-3 rounded-xl bg-[#071E26] hover:bg-emerald-950/40 border border-[#164b5b] hover:border-emerald-500/40 transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="block font-bold text-white group-hover:text-emerald-300">
                        SAMU National
                      </span>
                      <span className="text-[10px] text-slate-400">Urgences Médicales</span>
                    </div>
                    <span className="text-base font-black text-emerald-400">1515</span>
                  </a>

                  <a
                    href="tel:800002020"
                    className="p-3 rounded-xl bg-[#071E26] hover:bg-indigo-950/40 border border-[#164b5b] hover:border-indigo-500/40 transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="block font-bold text-white group-hover:text-indigo-300">
                        Gendarmerie
                      </span>
                      <span className="text-[10px] text-slate-400">Numéro Vert National</span>
                    </div>
                    <span className="text-xs font-black text-indigo-400">800 00 20 20</span>
                  </a>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('compte')}
                className="w-full py-2.5 rounded-xl bg-[#0c2f3b] hover:bg-[#144757] text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Retour aux réglages du compte</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#041217] border-t border-[#113845] flex items-center justify-between text-[11px] text-slate-400">
          <span>NDAO’AUTO • Partout dans le monde 🌍</span>
          <span className="text-[#00c9a7]">Plateforme 100% Fonctionnelle</span>
        </div>
      </div>
    </div>
  );
};
