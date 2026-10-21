import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  ShoppingCart,
  MessageSquare,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
  Send,
  Star,
  Check,
  Play,
  Film,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Vehicle, Announcement, AnnouncementComment } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FilClientScreenProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  onOpenMessage: (v?: Vehicle, a?: Announcement) => void;
  onOpenOrder: (v: Vehicle) => void;
}

export const FilClientScreen: React.FC<FilClientScreenProps> = ({
  vehicles,
  onSelectVehicle,
  onOpenMessage,
  onOpenOrder,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'annonces' | 'vehicules'>('annonces');
  const [activeCategory, setActiveCategory] = useState<'Toutes' | 'Voitures' | 'Motos' | 'Tricycles'>('Toutes');

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [currentAnnIndex, setCurrentAnnIndex] = useState(0);

  // Vehicle carousel index
  const [currentVehIndex, setCurrentVehIndex] = useState(0);

  // Interactive local states for real likes and interest
  const [likedAnnouncements, setLikedAnnouncements] = useState<Record<string, boolean>>({});
  const [announcementLikes, setAnnouncementLikes] = useState<Record<string, number>>({});
  const [interestedMap, setInterestedMap] = useState<Record<string, boolean>>({});
  const [notInterestedMap, setNotInterestedMap] = useState<Record<string, boolean>>({});

  // Comments drawer
  const [activeCommentAnnId, setActiveCommentAnnId] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<AnnouncementComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Load announcements
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const list = await api.getAnnouncements();
      setAnnouncements(list);
      const likesMap: Record<string, number> = {};
      list.forEach((a) => {
        likesMap[a.id] = a.likes;
      });
      setAnnouncementLikes(likesMap);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (activeCategory === 'Voitures') return v.categorie === 'Voitures';
    if (activeCategory === 'Motos') return v.categorie.includes('Moto');
    if (activeCategory === 'Tricycles') return v.categorie === 'Tricycles';
    return true;
  });

  const currentVehicle = filteredVehicles[currentVehIndex % (filteredVehicles.length || 1)] || vehicles[0];

  // Filter announcements
  const filteredAnnouncements = announcements.filter((a) => {
    if (activeCategory === 'Voitures') return a.categorie === 'Voitures';
    if (activeCategory === 'Motos') return a.categorie?.includes('Moto');
    if (activeCategory === 'Tricycles') return a.categorie === 'Tricycles';
    return true;
  });

  const currentAnnouncement = filteredAnnouncements[currentAnnIndex % (filteredAnnouncements.length || 1)];

  // Like Announcement
  const handleToggleLikeAnnouncement = async (id: string) => {
    const isLiked = !!likedAnnouncements[id];
    setLikedAnnouncements((prev) => ({ ...prev, [id]: !isLiked }));
    setAnnouncementLikes((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + (isLiked ? -1 : 1)),
    }));

    try {
      const likes = await api.likeAnnouncement(id, !isLiked);
      setAnnouncementLikes((prev) => ({ ...prev, [id]: likes }));
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  // Interest buttons
  const handleInterest = async (id: string, interest: 'interesse' | 'pas_interesse') => {
    if (interest === 'interesse') {
      setInterestedMap((prev) => ({ ...prev, [id]: true }));
      setNotInterestedMap((prev) => ({ ...prev, [id]: false }));
    } else {
      setNotInterestedMap((prev) => ({ ...prev, [id]: true }));
      setInterestedMap((prev) => ({ ...prev, [id]: false }));
      // move to next
      if (filteredAnnouncements.length > 1) {
        setCurrentAnnIndex((prev) => (prev + 1) % filteredAnnouncements.length);
      }
    }

    try {
      await api.setAnnouncementInterest(id, interest);
    } catch (err) {
      console.error('Failed to set interest', err);
    }
  };

  // Open comments
  const handleOpenComments = async (annId: string) => {
    setActiveCommentAnnId(annId);
    setLoadingComments(true);
    try {
      const list = await api.getAnnouncementComments(annId);
      setCommentsList(list);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentAnnId || !newCommentText.trim()) return;

    try {
      const added = await api.addAnnouncementComment(
        activeCommentAnnId,
        newCommentText.trim(),
        user ? `${user.prenom} ${user.nom}` : commentAuthorName.trim() || 'Client'
      );
      setCommentsList((prev) => [...prev, added]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Feed Tabs & Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#071E26] p-3 rounded-2xl border border-[#133e4d]">
        {/* Main Feed Tab (Annonces du Propriétaire vs Tous les Véhicules) */}
        <div className="flex items-center gap-1.5 bg-[#041217] p-1 rounded-xl border border-[#0f3440]">
          <button
            onClick={() => setActiveTab('annonces')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'annonces'
                ? 'bg-[#00c9a7] text-[#071E26] shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Annonces du Propriétaire</span>
            {announcements.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#071E26] text-[#00c9a7] font-extrabold">
                {announcements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vehicules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'vehicules'
                ? 'bg-[#00c9a7] text-[#071E26] shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Véhicules en Stock</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#071E26] text-[#00c9a7] font-extrabold">
              {vehicles.length}
            </span>
          </button>
        </div>

        {/* Category Pills (Voitures, Motos, Tricycles) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(['Toutes', 'Voitures', 'Motos', 'Tricycles'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentAnnIndex(0);
                setCurrentVehIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ANNONCES DU PROPRIÉTAIRE (MOUHAMED NDAO) */}
      {/* ========================================================================= */}
      {activeTab === 'annonces' && (
        <div>
          {loadingAnnouncements ? (
            <div className="p-12 text-center text-slate-400">Chargement des annonces de Mouhamed Ndao...</div>
          ) : !currentAnnouncement ? (
            <div className="p-12 text-center bg-[#071E26] rounded-3xl border border-[#133e4c] text-slate-300">
              <h3 className="text-base font-bold text-white mb-2">Aucune annonce publiée pour le moment</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Le propriétaire MOUHAMED NDAO publiera ici ses prochaines annonces, arrivages et vidéos exclusives.
              </p>
              <button
                onClick={() => setActiveTab('vehicules')}
                className="px-4 py-2 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs"
              >
                Voir les véhicules en stock
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Announcement Carousel Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="font-semibold text-emerald-400">
                  Publication {currentAnnIndex + 1} sur {filteredAnnouncements.length} par MOUHAMED NDAO
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentAnnIndex((prev) => (prev - 1 + filteredAnnouncements.length) % filteredAnnouncements.length)
                    }
                    className="p-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-white transition"
                    title="Annonce précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentAnnIndex((prev) => (prev + 1) % filteredAnnouncements.length)}
                    className="p-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-white transition"
                    title="Annonce suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Announcement Post Card */}
              <div className="w-full bg-[#071E26] rounded-3xl border border-[#133e4c] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {/* Visual Media Section (Image or Video) */}
                <div className="w-full md:w-3/5 bg-black/60 relative min-h-[360px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
                  {currentAnnouncement.videoUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <video
                        src={currentAnnouncement.videoUrl}
                        controls
                        className="w-full max-h-[440px] rounded-2xl object-cover"
                        poster={currentAnnouncement.imageUrl}
                      />
                    </div>
                  ) : currentAnnouncement.imageUrl ? (
                    <img
                      src={currentAnnouncement.imageUrl}
                      alt={currentAnnouncement.titre}
                      className="w-full h-full object-cover min-h-[360px]"
                    />
                  ) : (
                    <div className="text-center p-8 text-slate-500">
                      <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span>Publication sans média</span>
                    </div>
                  )}

                  {/* Category & Owner Tag Overlay */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="bg-[#00c9a7] text-[#071E26] text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg">
                      {currentAnnouncement.categorie || 'Annonce NDAO\'AUTO'}
                    </span>
                    <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                      Par Mouhamed Ndao
                    </span>
                  </div>

                  {currentAnnouncement.prixFcfa && (
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-emerald-400 font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-xl border border-emerald-500/40 shadow-lg">
                      {currentAnnouncement.prixFcfa.toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </div>

                {/* Details & Actions Section */}
                <div className="w-full md:w-2/5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                  {/* Top info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {new Date(currentAnnouncement.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: currentAnnouncement.titre,
                              text: `${currentAnnouncement.description} - NDAO'AUTO Sénégal`,
                              url: window.location.href,
                            }).catch(() => {});
                          }
                        }}
                        className="text-slate-400 hover:text-white p-1"
                        title="Partager cette annonce"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight font-['Cabinet_Grotesk',sans-serif]">
                      {currentAnnouncement.titre}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentAnnouncement.description}
                    </p>
                  </div>

                  {/* Social Counters (Real Likes & Real Comments) */}
                  <div className="flex items-center gap-4 py-2 border-y border-[#133e4c]/70 text-xs text-slate-300">
                    {/* Like button with real count */}
                    <button
                      onClick={() => handleToggleLikeAnnouncement(currentAnnouncement.id)}
                      className="flex items-center gap-1.5 hover:text-red-400 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedAnnouncements[currentAnnouncement.id]
                            ? 'text-red-500 fill-red-500'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className="font-bold">
                        {announcementLikes[currentAnnouncement.id] ?? currentAnnouncement.likes}
                      </span>
                      <span className="text-slate-400">J'aime</span>
                    </button>

                    {/* Comment button with drawer */}
                    <button
                      onClick={() => handleOpenComments(currentAnnouncement.id)}
                      className="flex items-center gap-1.5 hover:text-[#00c9a7] transition"
                    >
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span>Commentaires</span>
                    </button>
                  </div>

                  {/* The 4 Bottom Buttons requested by user: Intéressé, Pas intéressé, Commander, Envoyer un message */}
                  <div className="space-y-2.5 pt-1">
                    {/* Row 1: Intéressé & Pas intéressé */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleInterest(currentAnnouncement.id, 'interesse')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          interestedMap[currentAnnouncement.id]
                            ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                            : 'bg-[#0c2f3b] border-[#1f5060] text-slate-200 hover:bg-[#123e4c]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${interestedMap[currentAnnouncement.id] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                        <span>{interestedMap[currentAnnouncement.id] ? 'Intéressé(e) ✓' : 'Intéressé'}</span>
                      </button>

                      <button
                        onClick={() => handleInterest(currentAnnouncement.id, 'pas_interesse')}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          notInterestedMap[currentAnnouncement.id]
                            ? 'bg-slate-900 border-slate-700 text-slate-400'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:text-white hover:bg-black/70'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Pas intéressé</span>
                      </button>
                    </div>

                    {/* Row 2: Commander & Envoyer un message */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const linkedVeh = currentAnnouncement.vehiculeId
                            ? vehicles.find((v) => v.id === currentAnnouncement.vehiculeId)
                            : vehicles[0];
                          if (linkedVeh) onOpenOrder(linkedVeh);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] text-xs font-black shadow-md hover:brightness-110 transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Commander</span>
                      </button>

                      <button
                        onClick={() => onOpenMessage(undefined, currentAnnouncement)}
                        className="py-2.5 px-3 rounded-xl bg-[#005c4b] hover:bg-[#00705a] border border-[#00a884]/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Envoyer un message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VÉHICULES EN STOCK (Screen 2 from reference image) */}
      {/* ========================================================================= */}
      {activeTab === 'vehicules' && currentVehicle && (
        <div className="space-y-4">
          {/* Carousel controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-semibold text-emerald-400">
              Véhicule {currentVehIndex + 1} sur {filteredVehicles.length} ({currentVehicle.categorie})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentVehIndex((prev) => (prev - 1 + filteredVehicles.length) % filteredVehicles.length)
                }
                className="p-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-white transition"
                title="Véhicule précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentVehIndex((prev) => (prev + 1) % filteredVehicles.length)}
                className="p-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-white transition"
                title="Véhicule suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Vehicle Feed Card faithfully styled to Screen 2 from reference image */}
          <div
            className="w-full min-h-[500px] sm:min-h-[560px] rounded-3xl relative overflow-hidden flex flex-col justify-between p-5 sm:p-8 shadow-2xl border border-[#133e4c]"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(7, 30, 38, 0.4), rgba(7, 30, 38, 0.96)), url(${
                currentVehicle.images[0] ||
                'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Headline Slogan matching reference image */}
            <div className="pt-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-lg tracking-tight font-['Cabinet_Grotesk',sans-serif]">
                Plus loin<br />
                Plus propre<br />
                Même passion
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#00c9a7] text-[#071E26] px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {currentVehicle.categorie}
                </span>
                <span className="text-sm font-extrabold bg-black/70 backdrop-blur-md text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                  {currentVehicle.prixFcfa.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-xs font-semibold bg-[#071E26]/80 text-slate-200 px-3 py-1 rounded-full border border-slate-600">
                  {currentVehicle.etat} • {currentVehicle.localisation}
                </span>
              </div>
            </div>

            {/* Bottom Vehicle Info + The 4 Interaction Buttons */}
            <div className="space-y-4 max-w-xl">
              <div
                className="cursor-pointer group"
                onClick={() => onSelectVehicle(currentVehicle)}
              >
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 group-hover:text-[#00c9a7] transition">
                  <span>{currentVehicle.marque} {currentVehicle.modele} {currentVehicle.annee}</span>
                  <ChevronRight className="w-5 h-5 text-[#00c9a7] group-hover:translate-x-1 transition" />
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
                  {currentVehicle.description}
                </p>
              </div>

              {/* The 4 Action Buttons as requested */}
              <div className="space-y-2.5 max-w-md">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleInterest(currentVehicle.id, 'interesse')}
                    className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                      interestedMap[currentVehicle.id]
                        ? 'bg-emerald-900/70 border-emerald-400 text-emerald-300'
                        : 'bg-[#00c9a7]/20 border-2 border-[#00c9a7] text-[#00c9a7] hover:bg-[#00c9a7] hover:text-[#071E26]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${interestedMap[currentVehicle.id] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                    <span>{interestedMap[currentVehicle.id] ? 'Intéressé(e) ✓' : 'Intéressé'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (filteredVehicles.length > 1) {
                        setCurrentVehIndex((prev) => (prev + 1) % filteredVehicles.length);
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl bg-black/50 border border-slate-600/80 text-slate-300 hover:bg-black/80 hover:text-white text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Pas intéressé</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onOpenOrder(currentVehicle)}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] text-[#071E26] text-xs sm:text-sm font-black shadow-lg shadow-[#00c9a7]/30 hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Commander</span>
                  </button>

                  <button
                    onClick={() => onOpenMessage(currentVehicle)}
                    className="py-3 px-4 rounded-xl bg-[#0c2b36] hover:bg-[#113947] border border-[#1c4d5c] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 text-[#00c9a7]" />
                    <span>Envoyer un message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL COMMENTS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {activeCommentAnnId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071E26] border border-[#133e4c] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#133e4c] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#00c9a7]" />
                <span>Commentaires de l'annonce</span>
              </h3>
              <button
                onClick={() => setActiveCommentAnnId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#133e4c]/50">
              {loadingComments ? (
                <p className="text-xs text-slate-400 text-center py-4">Chargement des commentaires...</p>
              ) : commentsList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Soyez le premier à commenter cette publication de MOUHAMED NDAO.
                </p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{c.userName}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2.5 pt-2 border-t border-[#133e4c]">
              {!user && (
                <input
                  type="text"
                  placeholder="Votre nom complet..."
                  value={commentAuthorName}
                  onChange={(e) => setCommentAuthorName(e.target.value)}
                  className="w-full bg-[#041217] text-xs text-white rounded-xl px-3 py-2 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                  required
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Écrivez un commentaire..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-[#041217] text-xs text-white rounded-xl px-3.5 py-2.5 border border-[#133e4c] outline-none focus:border-[#00c9a7]"
                  required
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] hover:bg-emerald-400 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
