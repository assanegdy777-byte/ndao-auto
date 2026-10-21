import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, AlertCircle, X, DollarSign, Send, ShieldCheck } from 'lucide-react';
import { Vehicle } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CommandeModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CommandeModal: React.FC<CommandeModalProps> = ({
  vehicle,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [typeDemande, setTypeDemande] = useState<'Achat direct' | 'Négociation' | 'Demande essai'>('Achat direct');
  const [prixPropose, setPrixPropose] = useState(String(vehicle.prixFcfa));
  const [nom, setNom] = useState(user ? `${user.prenom} ${user.nom}` : '');
  const [telephone, setTelephone] = useState(user?.telephone || '+221 ');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !telephone.trim()) {
      setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    try {
      setLoading(true);
      await api.createOrder({
        vehiculeId: vehicle.id,
        prixProposeFcfa: typeDemande === 'Négociation' ? parseInt(prixPropose.replace(/\s/g, ''), 10) : vehicle.prixFcfa,
        typeDemande,
        messageClient: message,
        nom,
        telephone,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#071E26] border-2 border-[#164b5b] rounded-3xl overflow-hidden shadow-2xl text-white font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#041318] border-b border-[#0f3643] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00c9a7]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              {typeDemande === 'Négociation' ? 'Faire une offre / Négociation' : 'Demande d’achat NDAO’AUTO'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Demande transmise avec succès !</h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Votre proposition pour le <strong>{vehicle.marque} {vehicle.modele}</strong> a été enregistrée dans la base de données NDAO'AUTO. M. MOUHAMED NDAO vous contactera via la messagerie interne ou au {telephone}.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Vehicle mini-card */}
            <div className="p-3 bg-[#0b2832] rounded-2xl border border-[#164757] flex items-center gap-3">
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <img src={vehicle.images[0]} alt={vehicle.modele} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">{vehicle.marque} {vehicle.modele}</h4>
                <p className="text-xs font-extrabold text-[#00c9a7]">
                  Prix officiel : {vehicle.prixFcfa.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[10px] text-slate-400">{vehicle.etat} • {vehicle.localisation}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-500/50 text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Request Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Achat direct', label: 'Achat direct' },
                { id: 'Négociation', label: 'Négociation' },
                { id: 'Demande essai', label: 'Demande d’essai' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTypeDemande(t.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                    typeDemande === t.id
                      ? 'bg-[#00c9a7] text-[#071E26] border-[#00c9a7]'
                      : 'bg-[#0c2b36] text-slate-300 border-[#164757] hover:bg-[#113a48]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {typeDemande === 'Négociation' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Votre proposition de prix (FCFA) *
                </label>
                <input
                  type="text"
                  value={prixPropose}
                  onChange={(e) => setPrixPropose(e.target.value)}
                  placeholder="Ex: 12000000"
                  className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Téléphone (+221) *</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Message pour le propriétaire (optionnel)</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Précisez votre disponibilité pour un essai ou les conditions de paiement..."
                className="w-full px-3 py-2 bg-[#0b2832] border border-[#164757] rounded-xl text-xs text-white resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-bold text-xs tracking-wide shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>{loading ? 'Transmission...' : 'Envoyer la demande à M. Mouhamed Ndao'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
