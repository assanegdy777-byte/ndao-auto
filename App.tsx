import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { HeaderBanner } from './components/HeaderBanner';
import { FilClientScreen } from './components/FilClientScreen';
import { FicheDetailleeScreen } from './components/FicheDetailleeScreen';
import { MessagerieScreen } from './components/MessagerieScreen';
import { MonCompteModal } from './components/MonCompteModal';
import { EspaceProprietaire } from './components/EspaceProprietaire';
import { InscriptionClientScreen } from './components/InscriptionClientScreen';
import { CommandeModal } from './components/CommandeModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { FooterBadges } from './components/FooterBadges';
import { Vehicle, Category, Announcement } from './types';
import { api } from './services/api';
import {
  Car,
  Bike,
  Truck,
  MessageSquare,
  ShieldCheck,
  Search,
  Home,
  Layers,
  User as UserIcon,
  ChevronRight,
  QrCode,
} from 'lucide-react';

function MainApp() {
  const { user, isOwner } = useAuth();

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<'accueil' | 'catalogue' | 'messagerie' | 'proprietaire'>('accueil');

  // Selected vehicle for detailed view
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Toutes'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under5m' | 'under10m' | 'over10m'>('all');

  // Catalog vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Modals
  const [orderModalVehicle, setOrderModalVehicle] = useState<Vehicle | null>(null);
  const [showApkModal, setShowApkModal] = useState(false);
  const [apkModalTab, setApkModalTab] = useState<'qr' | 'pwa' | 'apk'>('qr');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleOpenApkModal = (tab: 'qr' | 'pwa' | 'apk' = 'qr') => {
    setApkModalTab(tab);
    setShowApkModal(true);
  };

  // Load vehicles from backend database
  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (priceFilter === 'under5m') maxPrice = 5000000;
      else if (priceFilter === 'under10m') maxPrice = 10000000;
      else if (priceFilter === 'over10m') minPrice = 10000000;

      const list = await api.getVehicles({
        categorie: selectedCategory === 'Toutes' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        minPrice,
        maxPrice,
      });

      setVehicles(list);
      if (list.length > 0 && !selectedVehicle) {
        setSelectedVehicle(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedCategory, searchQuery, priceFilter]);

  // Handlers
  const handleOpenVehicleDetails = (v: Vehicle) => {
    setSelectedVehicle(v);
    setCurrentTab('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMessage = (v?: Vehicle, a?: Announcement) => {
    if (v) setSelectedVehicle(v);
    if (a) setSelectedAnnouncement(a);
    setCurrentTab('messagerie');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrder = (v: Vehicle) => {
    setOrderModalVehicle(v);
  };

  return (
    <div className="min-h-screen bg-[#040e13] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#00c9a7]/30 pb-16 lg:pb-0">
      {/* Official Header Banner */}
      <HeaderBanner
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentTab !== 'catalogue' && currentTab !== 'accueil') {
            setCurrentTab('catalogue');
          }
        }}
        onOpenApkModal={handleOpenApkModal}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenAccountModal={() => setShowAccountModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {/* ========================================================================= */}
        {/* 1. ACCUEIL / ANNONCES & FIL CLIENT */}
        {/* ========================================================================= */}
        {currentTab === 'accueil' && (
          <div className="space-y-10">
            {/* Immersive Feed & Announcements Card */}
            <FilClientScreen
              vehicles={vehicles}
              onSelectVehicle={handleOpenVehicleDetails}
              onOpenMessage={handleOpenMessage}
              onOpenOrder={handleOpenOrder}
            />

            {/* Catalog Highlights Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0f3643] pb-3">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Véhicules en vente chez MOUHAMED NDAO</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {vehicles.length} disponibles
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Achetez, négociez et commandez en Franc CFA (FCFA) directement auprès du propriétaire.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('catalogue')}
                  className="text-xs text-[#00c9a7] font-bold hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  <span>Consulter tout le catalogue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Vehicles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleOpenVehicleDetails(v)}
                    className="bg-[#071E26] rounded-3xl border border-[#143e4c] overflow-hidden shadow-xl hover:border-[#00c9a7] transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="h-48 bg-black relative overflow-hidden">
                        <img
                          src={v.images[0]}
                          alt={v.modele}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#071E26]/90 text-emerald-300 border border-emerald-500/30">
                            {v.disponibilite}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 text-slate-200">
                            {v.etat}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#00c9a7] uppercase tracking-wider">
                            {v.categorie}
                          </span>
                          <span className="text-xs text-slate-400">{v.annee}</span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-[#00c9a7] transition truncate">
                          {v.marque} {v.modele}
                        </h4>

                        <p className="text-lg font-black text-[#00c9a7]">
                          {v.prixFcfa.toLocaleString('fr-FR')} FCFA
                        </p>

                        <p className="text-xs text-slate-300 line-clamp-2">{v.description}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#05171d] border-t border-[#0e313d] flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrder(v);
                        }}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] font-bold text-xs hover:brightness-110 transition shadow-md"
                      >
                        Commander
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMessage(v);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1b5061] text-white text-xs font-semibold transition"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CATALOGUE & FICHE DÉTAILLÉE DU VÉHICULE (Screen 3 from reference) */}
        {/* ========================================================================= */}
        {currentTab === 'catalogue' && (
          <div>
            {selectedVehicle ? (
              <FicheDetailleeScreen
                vehicle={selectedVehicle}
                onBack={() => setSelectedVehicle(null)}
                onContactSeller={handleOpenMessage}
                onOrder={handleOpenOrder}
              />
            ) : (
              <div className="space-y-6">
                {/* Search & Filters Toolbar */}
                <div className="bg-[#071E26] p-4 rounded-3xl border border-[#133e4d] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher Toyota, Moto, Tricycle..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#0c2833] border border-[#194553] rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7]"
                    />
                  </div>

                  {/* Budget Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                    {[
                      { id: 'all', label: 'Tous les prix' },
                      { id: 'under5m', label: '< 5 millions FCFA' },
                      { id: 'under10m', label: '< 10 millions FCFA' },
                      { id: 'over10m', label: '> 10 millions FCFA' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setPriceFilter(btn.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                          priceFilter === btn.id
                            ? 'bg-[#00c9a7] text-[#071E26] border-[#00c9a7] font-bold'
                            : 'bg-[#0b2832] text-slate-300 border-[#143e4c] hover:bg-[#103440]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className="bg-[#071E26] rounded-3xl border border-[#143e4c] overflow-hidden shadow-xl hover:border-[#00c9a7] transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="h-48 bg-black relative overflow-hidden">
                          <img
                            src={v.images[0]}
                            alt={v.modele}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#071E26]/90 text-emerald-300 border border-emerald-500/30">
                              {v.disponibilite}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/80 text-slate-200">
                              {v.etat}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#00c9a7] uppercase tracking-wider">
                              {v.categorie}
                            </span>
                            <span className="text-xs text-slate-400">{v.annee}</span>
                          </div>

                          <h4 className="text-base font-bold text-white group-hover:text-[#00c9a7] transition truncate">
                            {v.marque} {v.modele}
                          </h4>

                          <p className="text-lg font-black text-[#00c9a7]">
                            {v.prixFcfa.toLocaleString('fr-FR')} FCFA
                          </p>

                          <p className="text-xs text-slate-300 line-clamp-2">{v.description}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-[#05171d] border-t border-[#0e313d] flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenOrder(v);
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] font-bold text-xs hover:brightness-110 transition shadow-md"
                        >
                          Commander
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMessage(v);
                          }}
                          className="px-3 py-2 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1b5061] text-white text-xs font-semibold transition"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MESSAGERIE INTERNE (WhatsApp Style - Direct avec MOUHAMED NDAO) */}
        {/* ========================================================================= */}
        {currentTab === 'messagerie' && (
          <div className="w-full">
            <MessagerieScreen
              vehicle={selectedVehicle}
              announcement={selectedAnnouncement}
              onBack={() => setCurrentTab('accueil')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ESPACE PROPRIÉTAIRE (Sécurisé - MOUHAMED NDAO) */}
        {/* ========================================================================= */}
        {currentTab === 'proprietaire' && (
          <div className="w-full">
            <EspaceProprietaire
              onClose={() => setCurrentTab('accueil')}
              onViewVehicleClient={handleOpenVehicleDetails}
              onNavigateToMessages={() => setCurrentTab('messagerie')}
            />
          </div>
        )}
      </main>

      {/* Mon Compte Modal (Thème sombre ou clair, Contact d'urgence, Vider la cache, Déconnexion) */}
      <MonCompteModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Client Auth Modal (Registration & Login & Password Recovery) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071E26] border-2 border-[#164b5b] rounded-3xl overflow-hidden shadow-2xl p-4">
            <div className="flex justify-end pb-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕ Fermer
              </button>
            </div>
            <InscriptionClientScreen onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Purchase / Negotiation Modal */}
      {orderModalVehicle && (
        <CommandeModal
          vehicle={orderModalVehicle}
          onClose={() => setOrderModalVehicle(null)}
          onSuccess={() => fetchVehicles()}
        />
      )}

      {/* Android APK & QR Code Modal */}
      {showApkModal && (
        <AndroidApkModal
          initialTab={apkModalTab}
          onClose={() => setShowApkModal(false)}
        />
      )}

      {/* Floating Quick QR Code APK Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-30">
        <button
          onClick={() => handleOpenApkModal('qr')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-extrabold text-xs shadow-2xl shadow-[#00c9a7]/40 border-2 border-white/20 transition-all transform hover:scale-105 cursor-pointer"
          title="Scanner le QR Code pour installer l'application Android"
        >
          <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">📱 QR Code APK</span>
          <span className="sm:hidden">QR Code</span>
        </button>
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#05171d] border-t border-[#0f3643] py-2 px-3 z-40 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setCurrentTab('accueil')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            currentTab === 'accueil' ? 'text-[#00c9a7] font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('catalogue');
            setSelectedVehicle(null);
          }}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            currentTab === 'catalogue' ? 'text-[#00c9a7] font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalogue</span>
        </button>

        <button
          onClick={() => setCurrentTab('messagerie')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            currentTab === 'messagerie' ? 'text-[#00c9a7] font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messagerie</span>
        </button>

        <button
          onClick={() => handleOpenApkModal('qr')}
          className="flex flex-col items-center gap-1 text-[#00c9a7] font-bold transition hover:brightness-110 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setCurrentTab('proprietaire')}
            className={`flex flex-col items-center gap-1 transition cursor-pointer ${
              currentTab === 'proprietaire' ? 'text-[#00c9a7] font-bold' : 'text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Propriétaire</span>
          </button>
        )}

        <button
          onClick={() => setShowAccountModal(true)}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-[#00c9a7] transition cursor-pointer"
          title="Mon Compte : Profil, Thème, Urgences, Cache, Déconnexion"
        >
          <UserIcon className="w-4 h-4 text-[#00c9a7]" />
          <span className="font-semibold text-white truncate max-w-[80px]">
            {user ? user.prenom : 'Mon Compte'}
          </span>
        </button>
      </div>

      {/* Bottom Guarantees Badges */}
      <FooterBadges />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
