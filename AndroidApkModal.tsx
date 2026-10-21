import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  X,
  QrCode,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';
import QRCode from 'qrcode';

interface AndroidApkModalProps {
  onClose: () => void;
  initialTab?: 'qr' | 'pwa' | 'apk';
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ onClose, initialTab = 'qr' }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'qr'>(initialTab);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Public Shared URL accessible without Google Workspace / AI Studio authentication:
  // Converts internal private 'ais-dev-' to public shared 'ais-pre-'
  const publicAppUrl =
    typeof window !== 'undefined' && window.location.href.includes('ais-dev-')
      ? window.location.href.split('#')[0].replace('ais-dev-', 'ais-pre-')
      : 'https://ais-pre-w5b67kyfmqkv4gmvpayr5j-960383717357.europe-west2.run.app';

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    QRCode.toDataURL(
      publicAppUrl,
      {
        width: 280,
        margin: 2,
        color: {
          dark: '#071E26',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [publicAppUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallPwa = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        alert('Application NDAO’AUTO installée avec succès sur votre écran d\'accueil Android !');
      }
    } else {
      alert(
        'Pour installer NDAO’AUTO sur Android :\n1. Ouvrez cette page dans Google Chrome sur votre téléphone.\n2. Appuyez sur le menu (les 3 points en haut à droite).\n3. Choisissez "Ajouter à l\'écran d\'accueil" ou "Installer l\'application".'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#071E26] border-2 border-[#164b5b] rounded-3xl overflow-hidden shadow-2xl text-white font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#041318] border-b border-[#0f3643] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00c9a7]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              Application Android & Installation — NDAO’AUTO 🇸🇳
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#0f3643] px-6 bg-[#061920]">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-[#00c9a7] text-[#00c9a7]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Installation Immédiate (Android PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-[#00c9a7] text-[#00c9a7]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scanner QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-[#00c9a7] text-[#00c9a7]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Compilation APK Natif (Capacitor)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/50 rounded-2xl border border-emerald-500/40 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Installation Progressive Web App (PWA) 100% fonctionnelle</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L'application NDAO’AUTO est dotée d'un <strong>Web App Manifest officiel</strong> (<code className="text-emerald-300">/manifest.json</code>), de son logo stylisé et d'un affichage autonome (<code className="text-emerald-300">display: standalone</code>). Sur Android, elle s'installe directement sur l'écran d'accueil sans passer par le store, sans barre d'adresse navigateur, et supporte la caméra WebRTC, le micro pour les messages vocaux et les données persistantes.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Procédure d'installation sur votre téléphone Android :</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    Ouvrez le lien officiel dans <strong>Google Chrome</strong> sur votre smartphone Android.
                  </li>
                  <li>
                    Cliquez sur le bouton ci-dessous <strong>« Installer sur Android »</strong> ou appuyez sur les <strong>3 points verticaux</strong> en haut à droite du navigateur.
                  </li>
                  <li>
                    Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                  </li>
                  <li>
                    L'icône NDAO’AUTO avec son badge officiel s'installe sur le tiroir d'applications et l'écran d'accueil de votre téléphone !
                  </li>
                </ol>
              </div>

              <button
                onClick={handleInstallPwa}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-extrabold text-xs tracking-wide shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'application sur Android maintenant</span>
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-[#0a2732] rounded-2xl border border-[#144354] space-y-2">
                <p className="text-xs text-slate-300">
                  Scannez ce QR Code avec l'appareil photo de votre smartphone Android pour ouvrir directement la plateforme officielle partout dans le monde <strong>NDAO’AUTO</strong> et l'installer.
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl w-fit mx-auto border-4 border-[#00c9a7]">
                <img
                  src={qrDataUrl || '/ndao-auto-qr-code.png'}
                  alt="QR Code NDAO'AUTO Android"
                  className="w-60 h-60 object-contain"
                />
                <span className="text-[12px] font-black text-[#071E26] mt-2 tracking-wide">
                  NDAO’AUTO 🇸🇳 — MOUHAMED NDAO
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Scan direct pour téléchargement & installation Android
                </span>
              </div>

              {/* Action Buttons below QR */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="/ndao-auto-qr-code.png"
                  download="NDAO_AUTO_QR_CODE.png"
                  className="px-4 py-2.5 rounded-xl bg-[#00c9a7] hover:bg-[#00b094] text-[#071E26] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'image QR Code (.PNG)</span>
                </a>

                <a
                  href={publicAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#0e3b48] hover:bg-[#165062] text-white font-bold text-xs flex items-center gap-2 border border-[#1d5b70] transition"
                >
                  <ExternalLink className="w-4 h-4 text-[#00c9a7]" />
                  <span>Ouvrir l'application Android</span>
                </a>
              </div>

              {/* Verified HTTPS Link */}
              <div className="p-3 bg-black/60 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-left">
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block">Lien public officiel vérifié :</span>
                  <span className="text-[11px] font-mono text-[#00c9a7] select-all truncate block">
                    {publicAppUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#0c313d] hover:bg-[#144555] text-slate-200 hover:text-white flex items-center gap-1.5 transition text-[11px] flex-shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0c2f3b] rounded-2xl border border-[#164757] space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#00c9a7]">
                  <Terminal className="w-5 h-5 flex-shrink-0" />
                  <span>Transparence technique : Packaging APK Natif</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conformément à l'article 17 du cahier des charges, nous ne simulons pas l'existence d'un binaire APK non généré. Cet environnement d'exécution Cloud Web (Linux container sans SDK Android lourd de 15 Go) exécute le serveur Node/Express et le client React/Vite. La configuration Capacitor (<code className="text-[#00c9a7]">capacitor.config.json</code>) avec identifiant <strong className="text-white">sn.ndaoauto.app</strong> et le script <code className="text-[#00c9a7]">scripts/build-apk.sh</code> sont fournis dans le code source pour compiler l'APK autonome en local sur n'importe quel ordinateur disposant d'Android Studio ou Gradle.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Procédure exacte pour générer le fichier .APK :</h4>
                <div className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-700 space-y-1.5 overflow-x-auto">
                  <p className="text-slate-400"># 1. Compiler les assets de production</p>
                  <p className="text-white font-bold">npm run build</p>
                  <p className="text-slate-400 mt-2"># 2. Exécuter le script automatisé</p>
                  <p className="text-white font-bold">chmod +x scripts/build-apk.sh && ./scripts/build-apk.sh</p>
                  <p className="text-slate-400 mt-2"># 3. Le fichier .APK autonome est généré sous :</p>
                  <p className="text-emerald-400 font-bold">android/app/build/outputs/apk/debug/app-debug.apk</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Détails de configuration de l'application :</span>
                </div>
                <p>• Nom de l'application : <strong>NDAO’AUTO</strong></p>
                <p>• Package ID : <strong>sn.ndaoauto.app</strong></p>
                <p>• Propriétaire officiel : <strong>MOUHAMED NDAO</strong></p>
                <p>• Devise et Marché : <strong>FCFA — Sénégal 🇸🇳</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#041318] border-t border-[#0f3643] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-[#00c9a7]" />
            <span>Application officielle prête pour test et déploiement</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00b094] text-[#071E26] font-bold text-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
