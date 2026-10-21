import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  KeyRound,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Upload,
  Lock,
  LogOut,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Clock,
  Bike,
  Truck,
  MessageSquare,
  Sliders,
  Phone,
  MessageCircle,
  X,
} from 'lucide-react';
import { Vehicle, PurchaseOrder, RecoveryRequest, DashboardStats, Category, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface EspaceProprietaireProps {
  onClose?: () => void;
  onViewVehicleClient?: (v: Vehicle) => void;
  onNavigateToMessages?: () => void;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const EspaceProprietaire: React.FC<EspaceProprietaireProps> = ({
  onClose,
  onViewVehicleClient,
  onNavigateToMessages,
}) => {
  const { user, isOwner, logout } = useAuth();

  // Active menu tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicules' | 'annonces' | 'commandes' | 'recuperation' | 'parametres'>('dashboard');

  // Dashboard Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    annoncesActives: 0,
    vues7Jours: 0,
    messagesNonLus: 0,
    commandesEnCours: 0,
  });
  const [loading, setLoading] = useState(false);

  // Vehicle filter in owner space
  const [vehicleFilter, setVehicleFilter] = useState<string>('Toutes');

  // Vehicle Modal state ("+ Ajouter un automobile")
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Vehicle form fields (Voitures, Motos, Tricycles)
  const [formCategorie, setFormCategorie] = useState<'Voitures' | 'Motos' | 'Tricycles'>('Voitures');
  const [formMarque, setFormMarque] = useState('Toyota');
  const [formModele, setFormModele] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formAnnee, setFormAnnee] = useState(new Date().getFullYear());
  const [formPrixFcfa, setFormPrixFcfa] = useState('');
  const [formEtat, setFormEtat] = useState<'Neuf' | 'Occasion'>('Occasion');
  const [formDisponibilite, setFormDisponibilite] = useState<'Disponible' | 'Réservé' | 'Vendu'>('Disponible');
  const [formQuantiteStock, setFormQuantiteStock] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formKilometrage, setFormKilometrage] = useState('');
  const [formCarburant, setFormCarburant] = useState<'Diesel' | 'Essence' | 'Électrique' | 'Hybride' | 'Autre'>('Diesel');
  const [formBoite, setFormBoite] = useState<'Automatique' | 'Manuelle'>('Automatique');
  const [formCouleur, setFormCouleur] = useState('');
  const [formLocalisation, setFormLocalisation] = useState('Dakar, Sénégal');
  const [formPlaces, setFormPlaces] = useState<number | undefined>(5);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploadingVehicleImage, setIsUploadingVehicleImage] = useState(false);
  const [isUploadingVehicleVideo, setIsUploadingVehicleVideo] = useState(false);

  // Announcement Modal state ("Publier une annonce")
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitre, setAnnTitre] = useState('');
  const [annDescription, setAnnDescription] = useState('');
  const [annImageUrl, setAnnImageUrl] = useState('');
  const [annVideoUrl, setAnnVideoUrl] = useState('');
  const [isUploadingAnnImage, setIsUploadingAnnImage] = useState(false);
  const [isUploadingAnnVideo, setIsUploadingAnnVideo] = useState(false);
  const [annPrixFcfa, setAnnPrixFcfa] = useState('');
  const [annCategorie, setAnnCategorie] = useState<Category>('Voitures');

  // File Upload Handlers for Automobile
  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingVehicleImage(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await readFileAsDataUrl(files[i]);
        newImages.push(dataUrl);
      }
      setFormImages((prev) => [...prev, ...newImages]);
      if (!formImageUrl && newImages.length > 0) {
        setFormImageUrl(newImages[0]);
      }
    } catch {
      alert("Erreur lors de l'importation de l'image.");
    } finally {
      setIsUploadingVehicleImage(false);
      e.target.value = '';
    }
  };

  const handleVehicleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("La vidéo est trop volumineuse (maximum : 25 Mo).");
      return;
    }
    setIsUploadingVehicleVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setFormVideoUrl(reader.result as string);
        setIsUploadingVehicleVideo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Erreur lors de l'importation de la vidéo.");
      setIsUploadingVehicleVideo(false);
    }
    e.target.value = '';
  };

  // File Upload Handlers for Announcement
  const handleAnnImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAnnImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAnnImageUrl(dataUrl);
    } catch {
      alert("Erreur lors de l'importation de l'image.");
    } finally {
      setIsUploadingAnnImage(false);
      e.target.value = '';
    }
  };

  const handleAnnVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert("La vidéo est trop volumineuse (maximum : 25 Mo).");
      return;
    }
    setIsUploadingAnnVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setAnnVideoUrl(reader.result as string);
        setIsUploadingAnnVideo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Erreur lors de l'importation de la vidéo.");
      setIsUploadingAnnVideo(false);
    }
    e.target.value = '';
  };

  // Load owner data
  const loadData = async () => {
    try {
      setLoading(true);
      const [vList, annList, ordList, recList, st] = await Promise.all([
        api.getVehicles(),
        api.getAnnouncements(),
        api.getOrders(),
        api.getRecoveryRequests(),
        api.getStats().catch(() => ({
          annoncesActives: 0,
          vues7Jours: 0,
          messagesNonLus: 0,
          commandesEnCours: 0,
        })),
      ]);
      setVehicles(vList);
      setAnnouncements(annList);
      setOrders(ordList);
      setRecoveryRequests(recList);
      setStats({
        ...st,
        annoncesActives: vList.length,
      });
    } catch (err) {
      console.error('Failed to load owner data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save / Update Vehicle
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMarque || !formModele || !formPrixFcfa) {
      alert('Veuillez renseigner la marque, le modèle et le prix.');
      return;
    }

    const payload: Partial<Vehicle> = {
      categorie: formCategorie,
      marque: formMarque.trim(),
      modele: formModele.trim(),
      version: formVersion.trim() || undefined,
      annee: Number(formAnnee),
      prixFcfa: Number(formPrixFcfa),
      etat: formEtat,
      disponibilite: formDisponibilite,
      quantiteStock: Number(formQuantiteStock),
      kilometrage: formKilometrage ? Number(formKilometrage) : undefined,
      carburant: formCarburant,
      boiteVitesses: formBoite,
      couleur: formCouleur.trim() || undefined,
      localisation: formLocalisation.trim() || 'Dakar, Sénégal',
      places: formPlaces,
      description: formDescription.trim(),
      images: formImages.length > 0
        ? formImages
        : formImageUrl.trim()
        ? [formImageUrl.trim()]
        : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      videoUrl: formVideoUrl.trim() || undefined,
      statut: 'Publié',
    };

    try {
      if (editingVehicleId) {
        await api.updateVehicle(editingVehicleId, payload);
      } else {
        await api.createVehicle(payload);
      }
      setShowVehicleModal(false);
      resetVehicleForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement du véhicule.');
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setFormCategorie(v.categorie === 'Motos' || v.categorie === 'Motos électriques' ? 'Motos' : v.categorie === 'Tricycles' ? 'Tricycles' : 'Voitures');
    setFormMarque(v.marque);
    setFormModele(v.modele);
    setFormVersion(v.version || '');
    setFormAnnee(v.annee);
    setFormPrixFcfa(v.prixFcfa.toString());
    setFormEtat(v.etat);
    setFormDisponibilite(v.disponibilite);
    setFormQuantiteStock(v.quantiteStock);
    setFormDescription(v.description);
    setFormKilometrage(v.kilometrage ? v.kilometrage.toString() : '');
    setFormCarburant(v.carburant || 'Diesel');
    setFormBoite(v.boiteVitesses || 'Automatique');
    setFormCouleur(v.couleur || '');
    setFormLocalisation(v.localisation);
    setFormPlaces(v.places);
    setFormImages(v.images || []);
    setFormImageUrl(v.images[0] || '');
    setFormVideoUrl(v.videoUrl || '');
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer définitivement ce véhicule du catalogue ?')) {
      try {
        await api.deleteVehicle(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const resetVehicleForm = () => {
    setEditingVehicleId(null);
    setFormCategorie('Voitures');
    setFormMarque('');
    setFormModele('');
    setFormVersion('');
    setFormAnnee(new Date().getFullYear());
    setFormPrixFcfa('');
    setFormEtat('Occasion');
    setFormDisponibilite('Disponible');
    setFormQuantiteStock(1);
    setFormDescription('');
    setFormKilometrage('');
    setFormImages([]);
    setFormImageUrl('');
    setFormVideoUrl('');
  };

  // Publish Announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitre || !annDescription) {
      alert('Veuillez saisir un titre et une description.');
      return;
    }

    try {
      await api.createAnnouncement({
        titre: annTitre.trim(),
        description: annDescription.trim(),
        imageUrl: annImageUrl.trim() || undefined,
        videoUrl: annVideoUrl.trim() || undefined,
        prixFcfa: annPrixFcfa ? Number(annPrixFcfa) : undefined,
        categorie: annCategorie,
      });
      setShowAnnModal(false);
      setAnnTitre('');
      setAnnDescription('');
      setAnnImageUrl('');
      setAnnVideoUrl('');
      setAnnPrixFcfa('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la publication.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette annonce ?')) {
      try {
        await api.deleteAnnouncement(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Erreur de suppression.');
      }
    }
  };

  // Recovery Request Action
  const handleRecoveryAction = async (id: string, action: 'Autoriser' | 'Refuser') => {
    try {
      await api.actionRecoveryRequest(id, action);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du traitement de la demande.');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (id: string, statut: PurchaseOrder['statut']) => {
    try {
      await api.updateOrderStatus(id, statut);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur de mise à jour de la commande.');
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (vehicleFilter === 'Toutes') return true;
    if (vehicleFilter === 'Voitures') return v.categorie === 'Voitures';
    if (vehicleFilter === 'Motos') return v.categorie.includes('Moto');
    if (vehicleFilter === 'Tricycles') return v.categorie === 'Tricycles';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Owner Header Bar */}
      <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00c9a7] to-[#0b333e] flex items-center justify-center text-[#071E26] font-black text-2xl shadow-lg border border-[#00c9a7]/30">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                ESPACE PROPRIÉTAIRE (Sécurisé)
              </h1>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                MOUHAMED NDAO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Identifiant officiel : +221 777 308 383 • Gestionnaire principal NDAO'AUTO Sénégal 🇸🇳
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Vehicle & Publish Announcement */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              resetVehicleForm();
              setShowVehicleModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] font-bold text-xs sm:text-sm shadow-lg shadow-[#00c9a7]/20 hover:brightness-110 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ajouter un automobile</span>
          </button>

          <button
            onClick={() => setShowAnnModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1c5364] text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow"
          >
            <Film className="w-4 h-4 text-[#00c9a7]" />
            <span>Publier une annonce</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#041217] border border-[#133e4c] text-slate-300 hover:text-white transition"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#071E26] p-2 rounded-2xl border border-[#133e4d]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tableau de bord</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'vehicules'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Mes Automobiles ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('annonces')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'annonces'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Mes Annonces ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commandes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'commandes'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Commandes & Négociations ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recuperation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'recuperation'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Récupération de compte ({recoveryRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('parametres')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'parametres'
              ? 'bg-[#00c9a7] text-[#071E26] shadow'
              : 'text-slate-300 hover:text-white hover:bg-[#0c2833]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres & Urgence</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TABLEAU DE BORD (Metrics & Highlights) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Real Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#071E26] border border-[#133e4c] p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Annonces actives</span>
              <div className="text-2xl font-black text-white mt-1">{vehicles.length}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Catalogue publié</span>
            </div>

            <div className="bg-[#071E26] border border-[#133e4c] p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Vues enregistrées</span>
              <div className="text-2xl font-black text-white mt-1">
                {vehicles.reduce((acc, v) => acc + (v.vues || 0), 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Sur vos véhicules</span>
            </div>

            <div className="bg-[#071E26] border border-[#133e4c] p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Commandes reçues</span>
              <div className="text-2xl font-black text-[#00c9a7] mt-1">{orders.length}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">Clients réels</span>
            </div>

            <div className="bg-[#071E26] border border-[#133e4c] p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Demandes de récupération</span>
              <div className="text-2xl font-black text-amber-300 mt-1">{recoveryRequests.length}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Soumissions réelles</span>
            </div>
          </div>

          {/* Quick Access to WhatsApp Messages */}
          <div className="bg-gradient-to-r from-[#07242e] to-[#0b333e] border border-[#00c9a7]/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00a884] text-white flex items-center justify-center font-bold shadow-lg shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Messagerie Interne WhatsApp NDAO'AUTO</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Répondez directement aux clients qui s'intéressent à vos véhicules ou souhaitent négocier.
                </p>
              </div>
            </div>
            {onNavigateToMessages && (
              <button
                onClick={onNavigateToMessages}
                className="px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow shrink-0"
              >
                <span>Ouvrir les messages clients</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Real Recovery Requests (Screen 7 from reference image) */}
          <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#133e4c] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Dernières demandes de récupération de compte</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seules les demandes réelles soumises par des clients apparaissent ici.
                </p>
              </div>
            </div>

            {recoveryRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-[#041217] rounded-2xl border border-[#0f3440]">
                <p className="text-sm font-semibold text-slate-300">Aucune demande de récupération pour le moment</p>
                <p className="text-xs text-slate-400 mt-1">
                  Lorsqu'un client clique sur « Mot de passe oublié ? » et fait une demande, vous pourrez autoriser ou refuser sa réinitialisation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recoveryRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#041217] border border-[#133e4c] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{req.userName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.statut === 'Autorisé'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : req.statut === 'Refusé'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {req.statut}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{req.identifier}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Demandé le {new Date(req.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    {req.statut === 'En attente' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-[#133e4c]">
                        <button
                          onClick={() => handleRecoveryAction(req.id, 'Autoriser')}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                        >
                          Autoriser
                        </button>
                        <button
                          onClick={() => handleRecoveryAction(req.id, 'Refuser')}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs transition"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GESTION DES VÉHICULES (Voitures, Motos, Tricycles) */}
      {/* ========================================================================= */}
      {activeTab === 'vehicules' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#071E26] p-3 rounded-2xl border border-[#133e4d]">
            <div className="flex items-center gap-1.5">
              {(['Toutes', 'Voitures', 'Motos', 'Tricycles'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVehicleFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    vehicleFilter === cat
                      ? 'bg-[#00c9a7] text-[#071E26] font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                resetVehicleForm();
                setShowVehicleModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau véhicule</span>
            </button>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="bg-[#071E26] border border-[#133e4c] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="h-44 w-full relative overflow-hidden bg-black/40">
                  <img
                    src={v.images[0]}
                    alt={v.modele}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#00c9a7] text-[#071E26] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                    {v.categorie}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/70 backdrop-blur text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    {v.prixFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.marque} {v.modele}</h4>
                      <p className="text-xs text-slate-400">{v.annee} • {v.etat} • {v.localisation}</p>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded shrink-0">
                      Stock: {v.quantiteStock}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#133e4c]">
                    <span>Vues: {v.vues || 0}</span>
                    <span>J'aime: {v.likes || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleEditVehicle(v)}
                      className="flex-1 py-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MES ANNONCES (Images & Vidéos) */}
      {/* ========================================================================= */}
      {activeTab === 'annonces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#071E26] p-4 rounded-2xl border border-[#133e4d]">
            <div>
              <h3 className="text-sm font-bold text-white">Annonces & Publications du Propriétaire</h3>
              <p className="text-xs text-slate-400">
                Ces publications apparaissent directement sur le fil d'accueil des clients avec les boutons d'action.
              </p>
            </div>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publier une annonce</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#071E26] border border-[#133e4c] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                {ann.imageUrl && (
                  <div className="h-44 w-full bg-black/50 overflow-hidden relative">
                    <img src={ann.imageUrl} alt={ann.titre} className="w-full h-full object-cover" />
                    {ann.prixFcfa && (
                      <span className="absolute bottom-2 left-2 bg-black/80 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                        {ann.prixFcfa.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{ann.titre}</h4>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Supprimer cette annonce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {ann.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#133e4c]">
                    <span>J'aime: {ann.likes}</span>
                    <span>Intéressés: {ann.interessesCount || 0}</span>
                    <span>Pas intéressés: {ann.pasInteressesCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMMANDES & NÉGOCIATIONS REÇUES */}
      {/* ========================================================================= */}
      {activeTab === 'commandes' && (
        <div className="space-y-4">
          <div className="bg-[#071E26] p-4 rounded-2xl border border-[#133e4d]">
            <h3 className="text-sm font-bold text-white">Commandes et propositions clients</h3>
            <p className="text-xs text-slate-400">
              Commandes d'achat direct ou négociations de prix transmises par les clients.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#071E26] rounded-2xl border border-[#133e4c]">
              Aucune commande reçue pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#071E26] border border-[#133e4c] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{ord.vehiculeTitre}</h4>
                      <span className="text-[10px] bg-[#00c9a7]/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                        {ord.typeDemande}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Client : <span className="font-semibold text-white">{ord.clientNom}</span> • Téléphone : <span className="text-emerald-400 font-semibold">{ord.clientTelephone}</span>
                    </p>
                    {ord.prixProposeFcfa && (
                      <p className="text-xs text-amber-300 font-bold">
                        Prix proposé par le client : {ord.prixProposeFcfa.toLocaleString('fr-FR')} FCFA (Prix affiché : {ord.prixAfficheFcfa.toLocaleString('fr-FR')} FCFA)
                      </p>
                    )}
                    {ord.messageClient && (
                      <p className="text-xs text-slate-400 italic">« {ord.messageClient} »</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={ord.statut}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                      className="bg-[#041217] text-xs text-white border border-[#133e4c] rounded-xl px-3 py-1.5 outline-none"
                    >
                      <option value="En attente">En attente</option>
                      <option value="En discussion">En discussion</option>
                      <option value="Acceptée">Acceptée</option>
                      <option value="Refusée">Refusée</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DEMANDES DE RÉCUPÉRATION DE COMPTE */}
      {/* ========================================================================= */}
      {activeTab === 'recuperation' && (
        <div className="space-y-4">
          <div className="bg-[#071E26] p-4 rounded-2xl border border-[#133e4d]">
            <h3 className="text-sm font-bold text-white">Demandes de réinitialisation de mot de passe</h3>
            <p className="text-xs text-slate-400">
              Procédure de récupération sécurisée. Validez uniquement les demandes légitimes.
            </p>
          </div>

          {recoveryRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#071E26] rounded-2xl border border-[#133e4c]">
              Aucune demande de récupération de compte.
            </div>
          ) : (
            <div className="space-y-3">
              {recoveryRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#071E26] border border-[#133e4c] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{req.userName}</h4>
                    <p className="text-xs text-slate-400">{req.identifier}</p>
                    <p className="text-[10px] text-slate-500">Code temporaire : {req.code}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        req.statut === 'Autorisé'
                          ? 'bg-emerald-950 text-emerald-300'
                          : req.statut === 'Refusé'
                          ? 'bg-red-950 text-red-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {req.statut}
                    </span>
                    {req.statut === 'En attente' && (
                      <>
                        <button
                          onClick={() => handleRecoveryAction(req.id, 'Autoriser')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Autoriser
                        </button>
                        <button
                          onClick={() => handleRecoveryAction(req.id, 'Refuser')}
                          className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-300 font-bold text-xs"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PARAMÈTRES & CONTACT D'URGENCE WHATSAPP (ARTICLE 13 DU CAHIER DES CHARGES) */}
      {/* ========================================================================= */}
      {activeTab === 'parametres' && (
        <div className="space-y-6">
          {/* Emergency WhatsApp Contact Box */}
          <div className="bg-gradient-to-br from-[#0c2e3a] to-[#071e26] border-2 border-[#00c9a7]/50 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#00c9a7]/10 rounded-2xl border border-[#00c9a7]/40 text-[#00c9a7]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  Contact d'Urgence WhatsApp Officiel
                </h3>
                <p className="text-xs text-slate-300">
                  Numéro d'astreinte & service direct propriétaire NDAO’AUTO Sénégal 🇸🇳
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-[#164b5b] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Ligne officielle :</span>
                <span className="text-xl font-black text-[#00c9a7] tracking-wider font-mono">
                  +221 77 730 83 83
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Titulaire : <strong className="text-white">Mouhamed Ndao</strong> (Propriétaire NDAO'AUTO)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://wa.me/221777308383?text=Bonjour%20MOUHAMED%20NDAO%2C%20je%20vous%20contacte%20depuis%20l%27application%20NDAO%27AUTO."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ouvrir WhatsApp (+221 77 730 83 83)</span>
                </a>

                <a
                  href="tel:+221777308383"
                  className="px-4 py-2.5 rounded-xl bg-[#0c313d] hover:bg-[#144555] text-white font-bold text-xs flex items-center gap-2 border border-[#1d5b6e] transition"
                >
                  <Phone className="w-4 h-4 text-[#00c9a7]" />
                  <span>Appeler</span>
                </a>

                <a
                  href="sms:+221777308383"
                  className="px-4 py-2.5 rounded-xl bg-[#0c313d] hover:bg-[#144555] text-white font-bold text-xs flex items-center gap-2 border border-[#1d5b6e] transition"
                >
                  <span>SMS</span>
                </a>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Note de conformité : La messagerie interne de l'application gère les échanges réguliers et le contexte des annonces. WhatsApp sert uniquement au contact direct d'urgence et aux liaisons externes sécurisées.
            </p>
          </div>

          {/* Platform Settings & Security Status */}
          <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00c9a7]" />
              <span>Paramètres Système & Sécurité</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#041217] rounded-xl border border-[#0f3440] space-y-1">
                <span className="text-slate-400 text-[11px]">Plateforme & Propriétaire :</span>
                <p className="font-bold text-white text-sm">NDAO’AUTO — Mouhamed Ndao</p>
                <p className="text-slate-400">Identifiant d'authentification : <strong>777308383</strong></p>
              </div>

              <div className="p-3 bg-[#041217] rounded-xl border border-[#0f3440] space-y-1">
                <span className="text-slate-400 text-[11px]">Devise & Territoire :</span>
                <p className="font-bold text-emerald-400 text-sm">FCFA (Franc CFA) 🇸🇳 Sénégal</p>
                <p className="text-slate-400">Toutes les transactions et prix sont en FCFA.</p>
              </div>

              <div className="p-3 bg-[#041217] rounded-xl border border-[#0f3440] space-y-1">
                <span className="text-slate-400 text-[11px]">Sécurité des Mots de Passe :</span>
                <p className="font-bold text-white">Chiffrement SHA-512 + Salage Cryptographique</p>
                <p className="text-slate-400">Aucun mot de passe n'est stocké ni affiché en clair.</p>
              </div>

              <div className="p-3 bg-[#041217] rounded-xl border border-[#0f3440] space-y-1">
                <span className="text-slate-400 text-[11px]">Persistance des Données :</span>
                <p className="font-bold text-white">Stockage persistant serveur (/data/ndao_auto.db.json)</p>
                <p className="text-slate-400">Véhicules, commandes, annonces et messages réels.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJOUTER / MODIFIER UN AUTOMOBILE (Voitures, Motos, Tricycles) */}
      {/* ========================================================================= */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#133e4c] pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingVehicleId ? 'Modifier l\'automobile' : '+ Ajouter un automobile (Voiture, Moto, Tricycle)'}
              </h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Type d'automobile *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Voitures', 'Motos', 'Tricycles'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategorie(cat)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        formCategorie === cat
                          ? 'bg-[#00c9a7] text-[#071E26] border-[#00c9a7]'
                          : 'bg-[#041217] text-slate-300 border-[#133e4c] hover:bg-[#0c2f3b]'
                      }`}
                    >
                      {cat === 'Voitures' && <Car className="w-3.5 h-3.5" />}
                      {cat === 'Motos' && <Bike className="w-3.5 h-3.5" />}
                      {cat === 'Tricycles' && <Truck className="w-3.5 h-3.5" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Marque, Modèle, Version */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Marque *</label>
                  <input
                    type="text"
                    value={formMarque}
                    onChange={(e) => setFormMarque(e.target.value)}
                    placeholder="ex: Toyota, Bajaj, Dayang"
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Modèle *</label>
                  <input
                    type="text"
                    value={formModele}
                    onChange={(e) => setFormModele(e.target.value)}
                    placeholder="ex: Land Cruiser Prado"
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Version / Finition</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="ex: TX-L 2.8 D-4D"
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                  />
                </div>
              </div>

              {/* Prix en FCFA, Année, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Prix (FCFA) *</label>
                  <input
                    type="number"
                    value={formPrixFcfa}
                    onChange={(e) => setFormPrixFcfa(e.target.value)}
                    placeholder="ex: 12500000"
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Année *</label>
                  <input
                    type="number"
                    value={formAnnee}
                    onChange={(e) => setFormAnnee(Number(e.target.value))}
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantité en stock</label>
                  <input
                    type="number"
                    value={formQuantiteStock}
                    onChange={(e) => setFormQuantiteStock(Number(e.target.value))}
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                    min={0}
                  />
                </div>
              </div>

              {/* État, Disponibilité, Kilométrage, Carburant */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">État</label>
                  <select
                    value={formEtat}
                    onChange={(e) => setFormEtat(e.target.value as any)}
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none"
                  >
                    <option value="Occasion">Occasion</option>
                    <option value="Neuf">Neuf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Disponibilité</label>
                  <select
                    value={formDisponibilite}
                    onChange={(e) => setFormDisponibilite(e.target.value as any)}
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Réservé">Réservé</option>
                    <option value="Vendu">Vendu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kilométrage (km)</label>
                  <input
                    type="number"
                    value={formKilometrage}
                    onChange={(e) => setFormKilometrage(e.target.value)}
                    placeholder="ex: 85000"
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Carburant</label>
                  <select
                    value={formCarburant}
                    onChange={(e) => setFormCarburant(e.target.value as any)}
                    className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>
              </div>

              {/* Importation Photos & Vidéo (Upload direct depuis appareil) */}
              <div className="space-y-3 pt-1 border-t border-[#133e4c]">
                {/* 1. Photos upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#00c9a7]" />
                      <span>Photos de l'automobile (Importation directe) *</span>
                    </label>
                    <span className="text-[11px] text-[#00c9a7]">
                      {formImages.length > 0 ? `${formImages.length} photo(s) importée(s)` : '0 photo'}
                    </span>
                  </div>

                  {/* Bouton d'importation / Upload photo */}
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#041217] hover:bg-[#07242e] border-2 border-dashed border-[#00c9a7]/60 hover:border-[#00c9a7] transition cursor-pointer group text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#00c9a7]/10 flex items-center justify-center text-[#00c9a7] mb-2 group-hover:scale-110 transition shadow-sm">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {isUploadingVehicleImage
                        ? 'Importation des photos en cours...'
                        : '📁 Cliquez ici pour importer des photos (Galerie / Appareil)'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Formats acceptés : JPG, PNG, WEBP • Plusieurs photos autorisées
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleVehicleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Galerie des photos importées avec prévisualisation */}
                  {formImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {formImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-[#164b5b] bg-black aspect-video flex items-center justify-center"
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#00c9a7] text-[#071E26] text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              Principale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formImages.filter((_, i) => i !== idx);
                              setFormImages(updated);
                              if (updated.length > 0) {
                                setFormImageUrl(updated[0]);
                              } else {
                                setFormImageUrl('');
                              }
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition shadow cursor-pointer opacity-90 hover:opacity-100"
                            title="Supprimer cette photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Vidéo upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Vidéo de présentation (Optionnelle - Importation directe)</span>
                  </label>

                  {!formVideoUrl ? (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#041217] hover:bg-[#07242e] border-2 border-dashed border-[#164b5b] hover:border-cyan-400 text-slate-300 font-bold text-xs cursor-pointer transition">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>
                        {isUploadingVehicleVideo
                          ? 'Importation de la vidéo...'
                          : '🎥 Importer une vidéo de l’automobile (MP4, MOV, WebM)'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVehicleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#041217] border border-[#164b5b] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-white truncate">
                        <Film className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-emerald-400">Vidéo importée avec succès</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormVideoUrl('')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description détaillée</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="État du moteur, options, climatisation, entretien effectué à Dakar..."
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#133e4c]">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] font-bold text-xs shadow-lg hover:brightness-110 transition"
                >
                  {editingVehicleId ? 'Mettre à jour' : 'Enregistrer et publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLIER UNE ANNONCE (Image & Vidéo) */}
      {/* ========================================================================= */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#133e4c] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#00c9a7]" />
                <span>Publier une annonce (MOUHAMED NDAO)</span>
              </h3>
              <button
                onClick={() => setShowAnnModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titre de l'annonce *</label>
                <input
                  type="text"
                  value={annTitre}
                  onChange={(e) => setAnnTitre(e.target.value)}
                  placeholder="ex: Arrivage Spécial Toyota Prado 2020"
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Catégorie</label>
                <select
                  value={annCategorie}
                  onChange={(e) => setAnnCategorie(e.target.value as any)}
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none"
                >
                  <option value="Voitures">Voitures</option>
                  <option value="Motos">Motos</option>
                  <option value="Tricycles">Tricycles</option>
                  <option value="Autres véhicules">Autres véhicules</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Prix éventuel (FCFA)</label>
                <input
                  type="number"
                  value={annPrixFcfa}
                  onChange={(e) => setAnnPrixFcfa(e.target.value)}
                  placeholder="ex: 12500000"
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                />
              </div>

              {/* Importation Image & Vidéo pour l'annonce */}
              <div className="space-y-3 pt-1 border-t border-[#133e4c]">
                {/* 1. Photo Annonce Upload */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#00c9a7]" />
                    <span>Photo de l'annonce (Importation directe)</span>
                  </label>

                  {!annImageUrl ? (
                    <label className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#041217] hover:bg-[#07242e] border-2 border-dashed border-[#00c9a7]/60 hover:border-[#00c9a7] transition cursor-pointer group text-center">
                      <div className="w-9 h-9 rounded-xl bg-[#00c9a7]/10 flex items-center justify-center text-[#00c9a7] mb-1.5 group-hover:scale-110 transition shadow-sm">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        {isUploadingAnnImage
                          ? 'Importation de la photo...'
                          : '📁 Cliquez ici pour importer une photo d’annonce'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        Importation directe depuis votre téléphone ou ordinateur
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAnnImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-[#164b5b] bg-black aspect-video flex items-center justify-center">
                      <img
                        src={annImageUrl}
                        alt="Aperçu annonce"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAnnImageUrl('')}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 shadow cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer la photo</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Vidéo Annonce Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Vidéo de l'annonce (Optionnelle - Importation directe)</span>
                  </label>

                  {!annVideoUrl ? (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#041217] hover:bg-[#07242e] border-2 border-dashed border-[#164b5b] hover:border-cyan-400 text-slate-300 font-bold text-xs cursor-pointer transition">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>
                        {isUploadingAnnVideo
                          ? 'Importation de la vidéo...'
                          : '🎥 Importer une vidéo pour l’annonce (MP4, MOV, WebM)'}
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleAnnVideoUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#041217] border border-[#164b5b] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-white truncate">
                        <Film className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-emerald-400">Vidéo importée avec succès</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnnVideoUrl('')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Texte de l'annonce *</label>
                <textarea
                  rows={4}
                  value={annDescription}
                  onChange={(e) => setAnnDescription(e.target.value)}
                  placeholder="Présentez votre véhicule ou votre actualité aux clients sénégalais..."
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#133e4c]">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] font-bold text-xs shadow-lg hover:brightness-110 transition"
                >
                  Publier l'annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
