import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface InscriptionClientScreenProps {
  onSuccess?: () => void;
  initialMode?: 'register' | 'login' | 'recover';
}

export const InscriptionClientScreen: React.FC<InscriptionClientScreenProps> = ({
  onSuccess,
  initialMode = 'register',
}) => {
  const { register, login, user, logout } = useAuth();
  const [mode, setMode] = useState<'register' | 'login' | 'recover'>(initialMode);

  // Register state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [recoverStep, setRecoverStep] = useState<1 | 2 | 3 | 4>(1);
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoveryId, setRecoveryId] = useState('');
  const [recoverCode, setRecoverCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoverInfo, setRecoverInfo] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill owner credentials helper
  const fillOwnerCredentials = () => {
    setLoginIdentifier('777308383');
    setLoginPassword('nda8383auto');
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation.');
      return;
    }

    try {
      setLoading(true);
      await register({
        nom,
        prenom,
        telephone,
        email: email || undefined,
        password,
        acceptTerms,
      });
      setSuccessMsg('Compte créé avec succès !');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(loginIdentifier, loginPassword);
      setSuccessMsg('Connexion réussie !');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Identifiant ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Recovery Step 1
  const handleRecoverRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!recoverIdentifier.trim()) {
      setError('Veuillez saisir votre numéro ou votre e-mail.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestRecovery(recoverIdentifier);
      setRecoverInfo(res.message);
      if (res.previewCode) {
        setRecoverCode(res.previewCode);
      }
      if (res.recoveryId) {
        setRecoveryId(res.recoveryId);
      }
      setRecoverStep(2);
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // Recovery Step 2
  const handleRecoverVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.verifyRecoveryCode(recoveryId || recoverIdentifier, recoverCode);
      setResetToken(res.resetToken);
      setRecoverStep(3);
    } catch (err: any) {
      setError(err.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  // Recovery Step 3
  const handleRecoverReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmNewPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      await api.resetPassword(resetToken, newPassword);
      setRecoverStep(4);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#071E26] flex flex-col justify-between text-white p-4 overflow-y-auto scrollbar-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header with App Logo */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0c313b] to-[#041217] border border-[#00c9a7] flex items-center justify-center shadow-md">
          <div className="w-6 h-6 rounded-full bg-[#071E26] flex items-center justify-center font-black text-sm text-white">
            N
          </div>
        </div>
        <span className="text-lg font-black tracking-tight">
          NDAO’<span className="text-[#00c9a7]">AUTO</span>
        </span>
      </div>

      {/* Main Card Content */}
      <div className="flex-1">
        {/* If user is already connected */}
        {user && (
          <div className="space-y-4 py-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#00c9a7] font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00c9a7]" />
                {user.role === 'owner' ? 'Propriétaire Officiel NDAO’AUTO' : 'Client Connecté'}
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">Vous êtes déjà connecté</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Votre session est active. Vous pouvez consulter vos informations ou vous déconnecter.
              </p>
            </div>

            <div className="bg-[#0b2731] border border-[#164b5b] rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-[#05171d] p-3.5 rounded-xl border border-[#113845] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Prénom</span>
                  <span className="font-extrabold text-white text-base break-words">{user.prenom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Nom</span>
                  <span className="font-extrabold text-white text-base break-words">{user.nom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Téléphone</span>
                  <span className="font-bold text-[#00c9a7] text-xs">{user.telephone || 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">E-mail</span>
                  <span className="text-slate-300 text-xs truncate block" title={user.email}>{user.email || 'Non renseigné'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>

                {onSuccess && (
                  <button
                    type="button"
                    onClick={onSuccess}
                    className="w-full py-2.5 rounded-xl bg-[#0c2f3b] hover:bg-[#144757] text-[#00c9a7] font-bold text-xs border border-[#1a5567] transition flex items-center justify-center cursor-pointer"
                  >
                    <span>Continuer vers l’application</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode: REGISTER */}
        {!user && mode === 'register' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-white">Créer un compte</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Rejoignez NDAO’AUTO et trouvez votre véhicule idéal.
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-2.5">
              {/* Nom */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
              </div>

              {/* Prénom */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
              </div>

              {/* Téléphone with Senegal flag +221 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <span>🇸🇳</span> +221
                  </span>
                </div>
                <input
                  type="tel"
                  placeholder="77 123 45 67"
                  value={telephone.replace('+221 ', '')}
                  onChange={(e) => setTelephone('+221 ' + e.target.value.replace('+221 ', ''))}
                  className="w-full pl-24 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
              </div>

              {/* Email (optional) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="E-mail (facultatif)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                />
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Conditions check */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#194553] text-[#00c9a7] focus:ring-0 bg-[#0c2833]"
                />
                <span className="text-[10px] text-slate-300 leading-tight">
                  J'accepte les <span className="text-[#00c9a7] underline">Conditions d'utilisation</span> et la{' '}
                  <span className="text-[#00c9a7] underline">Politique de confidentialité</span> de NDAO'AUTO.
                </span>
              </label>

              {/* Submit CTA button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-bold text-xs tracking-wide shadow-lg shadow-[#00c9a7]/20 transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Création en cours...' : 'S’inscrire'}
              </button>
            </form>

            {/* Switch to login */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[11px] text-slate-300 hover:text-white"
              >
                Vous avez déjà un compte ? <span className="text-[#00c9a7] font-semibold underline">Se connecter</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode: LOGIN */}
        {!user && mode === 'login' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-white">Connexion</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Accédez à votre espace NDAO’AUTO sécurisé.
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Numéro (+221 77...) ou E-mail"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('recover');
                    setRecoverStep(1);
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-[#00c9a7] transition underline"
                >
                  Mot de passe oublié ?
                </button>

                {/* Quick Owner shortcut helper */}
                <button
                  type="button"
                  onClick={fillOwnerCredentials}
                  className="text-emerald-400/80 hover:text-emerald-300 font-medium"
                >
                  Identifiants Propriétaire
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b094] hover:brightness-110 text-[#071E26] font-bold text-xs tracking-wide shadow-lg shadow-[#00c9a7]/20 transition flex items-center justify-center gap-1.5"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[11px] text-slate-300 hover:text-white"
              >
                Nouveau chez NDAO’AUTO ? <span className="text-[#00c9a7] font-semibold underline">Créer un compte</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode: RECOVER (4-step security flow according to Section 5) */}
        {!user && mode === 'recover' && (
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                <KeyRound className="w-5 h-5 text-[#00c9a7]" />
                Récupération sécurisée
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Procédure officielle de récupération de compte NDAO'AUTO.
              </p>
            </div>

            {/* Stepper bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      recoverStep === step
                        ? 'bg-[#00c9a7] text-[#071E26]'
                        : recoverStep > step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#10303b] text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && <div className="w-8 h-0.5 bg-[#143d4b] mx-1"></div>}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Step 1: Identification */}
            {recoverStep === 1 && (
              <form onSubmit={handleRecoverRequest} className="space-y-3">
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Étape 1 : Identification</strong>. Saisissez le numéro de téléphone ou l'e-mail associé à votre compte.
                </p>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: +221 777 308 383"
                    value={recoverIdentifier}
                    onChange={(e) => setRecoverIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00c9a7]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs"
                >
                  {loading ? 'Vérification...' : 'Continuer'}
                </button>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {recoverStep === 2 && (
              <form onSubmit={handleRecoverVerify} className="space-y-3">
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Étape 2 : Vérification</strong>. Saisissez le code temporaire à 6 chiffres.
                </p>
                {recoverInfo && (
                  <div className="p-2 bg-[#0c313e] rounded-lg border border-[#1d5263] text-[10px] text-emerald-300">
                    {recoverInfo}
                  </div>
                )}
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={recoverCode}
                  onChange={(e) => setRecoverCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-white focus:outline-none focus:border-[#00c9a7]"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs"
                >
                  {loading ? 'Validation...' : 'Valider le code'}
                </button>
              </form>
            )}

            {/* Step 3: New password */}
            {recoverStep === 3 && (
              <form onSubmit={handleRecoverReset} className="space-y-3">
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Étape 3 : Réinitialisation</strong>. Définissez votre nouveau mot de passe sécurisé.
                </p>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c2833] border border-[#194553] rounded-xl text-xs text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            )}

            {/* Step 4: Confirmation */}
            {recoverStep === 4 && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm">Mot de passe réinitialisé</h3>
                <p className="text-xs text-slate-300">
                  Votre nouveau mot de passe est désormais actif. Vous pouvez vous reconnecter en toute sécurité.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00c9a7] text-[#071E26] font-bold text-xs mt-2"
                >
                  Se connecter maintenant
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security badge at bottom */}
      <div className="pt-3 border-t border-[#0e313d] flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Données chiffrées & conformes aux normes sénégalaises</span>
      </div>
    </div>
  );
};
