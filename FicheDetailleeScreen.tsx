import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ShoppingCart,
  Share2,
  CheckCircle2,
  Car,
  Fuel,
  Gauge,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Vehicle } from '../types';

interface FicheDetailleeScreenProps {
  vehicle: Vehicle;
  onBack?: () => void;
  onContactSeller?: (v: Vehicle) => void;
  onOrder?: (v: Vehicle) => void;
}

export const FicheDetailleeScreen: React.FC<FicheDetailleeScreenProps> = ({
  vehicle,
  onBack,
  onContactSeller,
  onOrder,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [
    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between border-b border-[#0f3643] pb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-[#0c2b36] hover:bg-[#123e4d] text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour au catalogue</span>
            </button>
          )}
          <span className="text-sm font-bold text-slate-300">
            {vehicle.categorie} &gt; <strong className="text-white">{vehicle.marque} {vehicle.modele}</strong>
          </span>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${vehicle.marque} ${vehicle.modele} - NDAO'AUTO`,
                text: `${vehicle.prixFcfa.toLocaleString('fr-FR')} FCFA chez NDAO'AUTO Sénégal`,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
          className="p-2 rounded-xl bg-[#0c2f3b] text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Partager l'annonce</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Photos Gallery matching Screen 3 from reference image */}
        <div className="lg:col-span-7 space-y-3">
          <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-[#0c2833] border border-[#143e4c] shadow-2xl relative group">
            <img
              src={images[selectedImgIdx] || images[0]}
              alt={`${vehicle.marque} ${vehicle.modele}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#071E26]/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {vehicle.disponibilite}
              </span>
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-slate-200 border border-slate-600 text-xs font-bold">
                {vehicle.etat}
              </span>
            </div>
          </div>

          {/* Mini-thumbnails carousel matching reference image */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIdx(idx)}
                className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                  selectedImgIdx === idx
                    ? 'border-[#00c9a7] scale-105 shadow-lg shadow-[#00c9a7]/20'
                    : 'border-[#143e4c] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Vehicle Details & Specs Table matching Screen 3 from reference image */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {vehicle.marque} {vehicle.modele}
              </h2>
              {vehicle.version && (
                <p className="text-xs text-slate-400 mt-0.5">{vehicle.version}</p>
              )}

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-[#00c9a7] tracking-tight">
                  {vehicle.prixFcfa.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#113a47] text-slate-200 text-xs font-semibold border border-[#1b5061]">
                  {vehicle.etat}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {vehicle.disponibilite}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0c2a34] text-slate-300 text-xs font-medium border border-[#174655]">
                  Dakar, Sénégal 🇸🇳
                </span>
              </div>
            </div>

            {/* Informations Générales Section Table */}
            <div className="bg-[#0b2832]/80 rounded-2xl p-4 border border-[#164352] space-y-3 shadow-lg">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 border-b border-[#143d4a] pb-2">
                Informations générales
              </h3>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Catégorie :</span>
                  <span className="font-bold text-white">{vehicle.categorie}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Marque :</span>
                  <span className="font-bold text-white">{vehicle.marque}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Modèle :</span>
                  <span className="font-bold text-white">{vehicle.modele}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Année :</span>
                  <span className="font-bold text-white">{vehicle.annee}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Kilométrage :</span>
                  <span className="font-bold text-white">
                    {vehicle.kilometrage ? `${vehicle.kilometrage.toLocaleString('fr-FR')} km` : '0 km'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Carburant :</span>
                  <span className="font-bold text-white">{vehicle.carburant || 'Diesel'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Boîte de vitesses :</span>
                  <span className="font-bold text-white">{vehicle.boiteVitesses || 'Automatique'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Couleur :</span>
                  <span className="font-bold text-white">{vehicle.couleur || 'Noir'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Localisation :</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00c9a7]" />
                    {vehicle.localisation || 'Dakar'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">État :</span>
                  <span className="font-bold text-emerald-300">{vehicle.etat}</span>
                </div>
              </div>

              {vehicle.description && (
                <div className="pt-2 border-t border-[#143d4a]">
                  <span className="text-slate-400 text-[11px] block mb-0.5">Description :</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{vehicle.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs matching Screen 3 from reference image */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => onContactSeller && onContactSeller(vehicle)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-extrabold text-sm tracking-wide shadow-xl shadow-[#00c9a7]/20 transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Contacter le vendeur</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onOrder && onOrder(vehicle)}
                className="py-3 px-4 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1b5061] text-[#00c9a7] font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Commander / Offre</span>
              </button>

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`py-3 px-4 rounded-xl border transition flex items-center justify-center gap-2 text-xs font-bold ${
                  isFavorite
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-[#0b2832] border-[#164352] text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Dans vos favoris' : 'Favoris'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
