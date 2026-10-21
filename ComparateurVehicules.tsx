import React, { useState } from 'react';
import { ArrowLeftRight, Check, X, ShoppingCart, MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { Vehicle } from '../types';

interface ComparateurVehiculesProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  onOpenOrder: (v: Vehicle) => void;
  onOpenMessage: (v: Vehicle) => void;
  onClose?: () => void;
}

export const ComparateurVehicules: React.FC<ComparateurVehiculesProps> = ({
  vehicles,
  onSelectVehicle,
  onOpenOrder,
  onOpenMessage,
  onClose,
}) => {
  // Default vehicles to compare
  const [v1Id, setV1Id] = useState<string>(vehicles[0]?.id || '');
  const [v2Id, setV2Id] = useState<string>(vehicles[1]?.id || vehicles[0]?.id || '');

  const v1 = vehicles.find((v) => v.id === v1Id) || vehicles[0];
  const v2 = vehicles.find((v) => v.id === v2Id) || vehicles[1] || vehicles[0];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#071E26] rounded-3xl border-2 border-[#164757] overflow-hidden shadow-2xl font-['Plus_Jakarta_Sans',sans-serif] text-white my-4">
      {/* Header */}
      <div className="bg-[#041318] px-6 py-4 border-b border-[#0f3643] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0b2f3b] text-[#00c9a7]">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
              Comparateur de Véhicules NDAO’AUTO 🇸🇳
            </h3>
            <p className="text-xs text-slate-300">
              Comparez les prix officiels en FCFA, caractéristiques et disponibilités côte-à-côte.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0c2f3b] hover:bg-[#123e4c] text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-[#05171d] border-b border-[#0f3643] grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Premier véhicule :</label>
          <select
            value={v1Id}
            onChange={(e) => setV1Id(e.target.value)}
            className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marque} {v.modele} ({v.prixFcfa.toLocaleString('fr-FR')} FCFA)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Second véhicule :</label>
          <select
            value={v2Id}
            onChange={(e) => setV2Id(e.target.value)}
            className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marque} {v.modele} ({v.prixFcfa.toLocaleString('fr-FR')} FCFA)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[550px] space-y-4">
          {/* Header Row: Images & Titles */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b border-[#0f3643]">
            {/* Vehicle 1 */}
            <div className="space-y-2">
              <div className="h-44 rounded-2xl overflow-hidden bg-black relative border border-[#143e4c]">
                <img src={v1.images[0]} alt={v1.modele} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#071E26]/90 text-emerald-300 font-bold text-[10px]">
                  {v1.disponibilite}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">{v1.marque} {v1.modele}</h4>
              <p className="text-xl font-black text-[#00c9a7]">
                {v1.prixFcfa.toLocaleString('fr-FR')} FCFA
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onOpenOrder(v1)}
                  className="flex-1 py-2 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Commander</span>
                </button>
                <button
                  onClick={() => onOpenMessage(v1)}
                  className="px-3 py-2 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1c4d5c] text-slate-200 text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="space-y-2">
              <div className="h-44 rounded-2xl overflow-hidden bg-black relative border border-[#143e4c]">
                <img src={v2.images[0]} alt={v2.modele} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#071E26]/90 text-emerald-300 font-bold text-[10px]">
                  {v2.disponibilite}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">{v2.marque} {v2.modele}</h4>
              <p className="text-xl font-black text-[#00c9a7]">
                {v2.prixFcfa.toLocaleString('fr-FR')} FCFA
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onOpenOrder(v2)}
                  className="flex-1 py-2 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Commander</span>
                </button>
                <button
                  onClick={() => onOpenMessage(v2)}
                  className="px-3 py-2 rounded-xl bg-[#0c2f3b] hover:bg-[#123e4c] border border-[#1c4d5c] text-slate-200 text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Specs Rows */}
          {[
            { label: 'Catégorie', val1: v1.categorie, val2: v2.categorie },
            { label: 'État', val1: v1.etat, val2: v2.etat },
            { label: 'Année', val1: v1.annee, val2: v2.annee },
            {
              label: 'Kilométrage',
              val1: v1.kilometrage ? `${v1.kilometrage.toLocaleString('fr-FR')} km` : '0 km',
              val2: v2.kilometrage ? `${v2.kilometrage.toLocaleString('fr-FR')} km` : '0 km',
            },
            { label: 'Carburant / Énergie', val1: v1.carburant || 'Diesel', val2: v2.carburant || 'Diesel' },
            { label: 'Boîte de vitesses', val1: v1.boiteVitesses || 'Automatique', val2: v2.boiteVitesses || 'Automatique' },
            { label: 'Localisation', val1: v1.localisation, val2: v2.localisation },
            {
              label: 'Équipements & Particularités',
              val1: v1.autonomieKm ? `Autonomie ${v1.autonomieKm} km` : v1.places ? `${v1.places} places` : 'Standard',
              val2: v2.autonomieKm ? `Autonomie ${v2.autonomieKm} km` : v2.places ? `${v2.places} places` : 'Standard',
            },
          ].map((row, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl grid grid-cols-12 text-xs items-center ${
                i % 2 === 0 ? 'bg-[#09222b]' : 'bg-[#071E26]'
              }`}
            >
              <div className="col-span-4 text-slate-400 font-semibold">{row.label}</div>
              <div className="col-span-4 font-bold text-white">{row.val1}</div>
              <div className="col-span-4 font-bold text-white">{row.val2}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
