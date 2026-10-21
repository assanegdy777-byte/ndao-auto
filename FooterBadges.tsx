import React from 'react';
import { ShieldCheck, Cloud, Clock, Wifi, Lock, TrendingUp } from 'lucide-react';

export const FooterBadges: React.FC = () => {
  const badges = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Compte sécurisé',
      desc: 'Hachage des mots de passe',
    },
    {
      icon: <Cloud className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Hébergement permanent',
      desc: 'et fiable',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Service NDAO’AUTO',
      desc: 'Direct propriétaire 7j/7',
    },
    {
      icon: <Wifi className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Connexion Internet',
      desc: 'pour messagerie et annonces',
    },
    {
      icon: <Lock className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Aucune donnée sensible',
      desc: 'non protégée',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#00c9a7]" />,
      title: 'Une plateforme évolutive',
      desc: 'pour l’avenir',
    },
  ];

  return (
    <footer className="w-full bg-[#041217] border-t border-[#0e313d] text-white py-8 px-4 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Guarantees Row matching bottom banner of reference poster */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className="bg-[#071E26] rounded-2xl p-4 border border-[#113845] flex flex-col items-center text-center space-y-1.5 shadow-md hover:border-[#00c9a7]/40 transition group"
            >
              <div className="p-2.5 rounded-full bg-[#0c2f3b] border border-[#164959] group-hover:scale-110 transition">
                {b.icon}
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">{b.title}</h4>
              <p className="text-[10px] text-slate-400 leading-tight">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Brand Bottom Slogan with Senegal Flag */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0a2630] text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00c9a7] text-[#071E26] font-black text-xs flex items-center justify-center">
              N
            </div>
            <span className="font-extrabold text-white">NDAO’AUTO</span>
            <span>—</span>
            <span className="italic text-slate-300">Ensemble vers un avenir plus propre</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Partout dans le monde 🌍</span>
            <span>•</span>
            <span>Propriétaire : <strong className="text-white">MOUHAMED NDAO</strong></span>
            <span>•</span>
            <span className="text-[#00c9a7]">+221 777 308 383</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
