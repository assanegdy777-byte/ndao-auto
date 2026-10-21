import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword, User, Vehicle, ChatMessage, PurchaseOrder, RecoveryRequest, Announcement, AnnouncementComment } from './db.ts';
import { generateToken, verifyToken, revokeToken, checkRateLimit, recordFailedAttempt, clearFailedAttempts } from './auth.ts';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '15mb' }));

export const apiApp = express();
apiApp.use(express.json({ limit: '15mb' }));
apiApp.use('/api', apiRouter);
apiApp.use(apiRouter);

// Helper: extract auth token
function getAuth(req: Request) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.substring(7);
  return verifyToken(token);
}

function requireAuth(req: Request, res: Response, next: Function) {
  const auth = getAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
  }
  (req as any).user = auth.user;
  (req as any).role = auth.role;
  next();
}

function requireOwner(req: Request, res: Response, next: Function) {
  const auth = getAuth(req);
  if (!auth || auth.role !== 'owner') {
    return res.status(403).json({ error: 'Accès réservé exclusivement au propriétaire MOUHAMED NDAO.' });
  }
  (req as any).user = auth.user;
  (req as any).role = auth.role;
  next();
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Register Client
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { nom, prenom, telephone, email, password, acceptTerms } = req.body;

  if (!nom || !prenom || !telephone || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
  }

  if (!acceptTerms) {
    return res.status(400).json({ error: 'Vous devez accepter les Conditions d\'utilisation de NDAO\'AUTO.' });
  }

  // Check if identifier already exists
  const existing = db.findUserByIdentifier(telephone) || (email ? db.findUserByIdentifier(email) : null);
  if (existing) {
    return res.status(400).json({ error: 'Un compte avec ce numéro de téléphone ou cet e-mail existe déjà.' });
  }

  // Hash password
  const { salt, hash } = hashPassword(password);

  const newUser: User = {
    id: 'user-' + crypto.randomUUID(),
    nom: nom.trim(),
    prenom: prenom.trim(),
    telephone: telephone.trim(),
    email: email?.trim() || undefined,
    passwordHash: hash,
    salt,
    role: 'client', // Clients can NEVER become owner through registration
    createdAt: new Date().toISOString(),
  };

  db.addUser(newUser);
  const token = generateToken(newUser);

  return res.json({
    message: 'Compte client créé avec succès chez NDAO\'AUTO.',
    token,
    user: {
      id: newUser.id,
      nom: newUser.nom,
      prenom: newUser.prenom,
      telephone: newUser.telephone,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// Login (Universal - Owner & Client use the exact same login; Owner recognized automatically via 777308383)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Veuillez saisir votre identifiant et votre mot de passe.' });
  }

  const rate = checkRateLimit(identifier);
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Trop de tentatives de connexion échouées. Compte temporairement verrouillé pour ${rate.waitMinutes} minute(s).`,
    });
  }

  const user = db.findUserByIdentifier(identifier);
  if (!user) {
    recordFailedAttempt(identifier);
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
  }

  let valid = verifyPassword(password, user.salt, user.passwordHash);
  // Guarantee owner access with nda8383auto or ndao8383auto
  if (!valid && user.role === 'owner') {
    if (password === 'nda8383auto' || password === 'ndao8383auto' || password === 'ndao8383') {
      valid = true;
    }
  }

  if (!valid) {
    recordFailedAttempt(identifier);
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
  }

  clearFailedAttempts(identifier);
  const token = generateToken(user);

  return res.json({
    message: user.role === 'owner' ? 'Bienvenue Mouhamed NDAO (Propriétaire).' : 'Connexion réussie.',
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      email: user.email,
      role: user.role,
    },
  });
});

// Get Current User
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: auth.user.id,
      nom: auth.user.nom,
      prenom: auth.user.prenom,
      telephone: auth.user.telephone,
      email: auth.user.email,
      role: auth.user.role,
    },
  });
});

// Logout
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    revokeToken(header.substring(7));
  }
  return res.json({ message: 'Déconnexion effectuée.' });
});

// Password Recovery Step 1: Identifier
apiRouter.post('/auth/recover-request', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Numéro de téléphone ou e-mail requis.' });
  }

  const user = db.findUserByIdentifier(identifier);
  const message = 'Si ce compte existe, une procédure de vérification sécurisée a été initiée.';

  if (user) {
    // Generate temporary 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString('hex');

    const reqRecord: RecoveryRequest = {
      id: 'rec-' + crypto.randomUUID(),
      identifier: identifier.trim(),
      userName: `${user.prenom} ${user.nom}`,
      code,
      token,
      statut: 'En attente',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.addRecoveryRequest(reqRecord);

    return res.json({
      message,
      recoveryId: reqRecord.id,
      previewCode: code, // Displayed in sandbox for easy testing
    });
  }

  return res.json({ message });
});

// Password Recovery Step 2: Verify Code
apiRouter.post('/auth/recover-verify', (req: Request, res: Response) => {
  const { recoveryId, code } = req.body;
  if (!recoveryId || !code) {
    return res.status(400).json({ error: 'Code de vérification requis.' });
  }

  const reqRecord = db.getRecoveryRequests().find(r => r.id === recoveryId);
  if (!reqRecord) {
    return res.status(404).json({ error: 'Demande de récupération introuvable ou expirée.' });
  }

  if (new Date(reqRecord.expiresAt).getTime() < Date.now()) {
    reqRecord.statut = 'Refusé';
    db.save();
    return res.status(400).json({ error: 'Ce code a expiré. Veuillez refaire une demande.' });
  }

  if (reqRecord.code !== code.trim()) {
    return res.status(400).json({ error: 'Code de vérification invalide.' });
  }

  reqRecord.statut = 'Autorisé';
  db.save();

  return res.json({
    message: 'Code vérifié avec succès.',
    resetToken: reqRecord.token,
  });
});

// Password Recovery Step 3: Reset Password
apiRouter.post('/auth/recover-reset', (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
  }

  const recovery = db.getRecoveryRequests().find(r => r.token === resetToken && r.statut === 'Autorisé');
  if (!recovery) {
    return res.status(403).json({ error: 'Autorisation de réinitialisation invalide ou déjà utilisée.' });
  }

  const user = db.findUserByIdentifier(recovery.identifier);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const { salt, hash } = hashPassword(newPassword);
  db.updateUserPassword(user.id, hash, salt);

  recovery.statut = 'Utilisé';
  recovery.token = undefined;
  db.save();

  return res.json({
    message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
  });
});

// -------------------------------------------------------------
// VEHICLES CATALOG
// -------------------------------------------------------------

apiRouter.get('/vehicles', (req: Request, res: Response) => {
  const { categorie, marque, etat, minPrice, maxPrice, search, statut } = req.query;
  let list = db.getVehicles();

  const auth = getAuth(req);
  if (!auth || auth.role !== 'owner') {
    list = list.filter(v => v.statut === 'Publié');
  } else if (statut) {
    list = list.filter(v => v.statut === statut);
  }

  if (categorie && categorie !== 'Toutes' && categorie !== 'all') {
    list = list.filter(v => v.categorie.toLowerCase() === (categorie as string).toLowerCase());
  }

  if (marque) {
    list = list.filter(v => v.marque.toLowerCase().includes((marque as string).toLowerCase()));
  }

  if (etat) {
    list = list.filter(v => v.etat.toLowerCase() === (etat as string).toLowerCase());
  }

  if (minPrice) {
    const min = parseInt(minPrice as string, 10);
    if (!isNaN(min)) list = list.filter(v => v.prixFcfa >= min);
  }

  if (maxPrice) {
    const max = parseInt(maxPrice as string, 10);
    if (!isNaN(max)) list = list.filter(v => v.prixFcfa <= max);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      v =>
        v.marque.toLowerCase().includes(q) ||
        v.modele.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.categorie.toLowerCase().includes(q)
    );
  }

  return res.json(list);
});

apiRouter.get('/vehicles/:id', (req: Request, res: Response) => {
  const v = db.getVehicleById(req.params.id);
  if (!v) {
    return res.status(404).json({ error: 'Véhicule introuvable.' });
  }
  db.incrementVehicleView(v.id);
  return res.json(v);
});

// Like vehicle
apiRouter.post('/vehicles/:id/like', (req: Request, res: Response) => {
  const { increment } = req.body;
  const likes = db.toggleVehicleLike(req.params.id, increment !== false);
  return res.json({ likes });
});

// Create Vehicle (Owner only: Voitures, Motos, Tricycles)
apiRouter.post('/vehicles', requireOwner, (req: Request, res: Response) => {
  const body = req.body;
  if (!body.marque || !body.modele || !body.prixFcfa || !body.categorie) {
    return res.status(400).json({ error: 'Champs essentiels manquants (Marque, Modèle, Catégorie, Prix).' });
  }

  const newVehicle: Vehicle = {
    id: 'v-' + crypto.randomUUID(),
    categorie: body.categorie,
    marque: body.marque,
    modele: body.modele,
    version: body.version || '',
    annee: parseInt(body.annee, 10) || new Date().getFullYear(),
    prixFcfa: parseInt(body.prixFcfa, 10),
    etat: body.etat || 'Occasion',
    disponibilite: body.disponibilite || 'Disponible',
    quantiteStock: parseInt(body.quantiteStock, 10) || 1,
    statut: body.statut || 'Publié',
    kilometrage: body.kilometrage ? parseInt(body.kilometrage, 10) : undefined,
    carburant: body.carburant || 'Diesel',
    boiteVitesses: body.boiteVitesses || 'Automatique',
    puissance: body.puissance || '',
    couleur: body.couleur || '',
    places: body.places ? parseInt(body.places, 10) : undefined,
    localisation: body.localisation || 'Dakar, Sénégal',
    autonomieKm: body.autonomieKm ? parseInt(body.autonomieKm, 10) : undefined,
    capaciteChargeKg: body.capaciteChargeKg ? parseInt(body.capaciteChargeKg, 10) : undefined,
    description: body.description || '',
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: body.videoUrl || undefined,
    vues: 0,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addVehicle(newVehicle);
  return res.status(201).json(newVehicle);
});

// Update Vehicle (Owner only)
apiRouter.put('/vehicles/:id', requireOwner, (req: Request, res: Response) => {
  const updated = db.updateVehicle(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Véhicule introuvable.' });
  }
  return res.json(updated);
});

// Delete Vehicle (Owner only)
apiRouter.delete('/vehicles/:id', requireOwner, (req: Request, res: Response) => {
  const deleted = db.deleteVehicle(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Véhicule introuvable.' });
  }
  return res.json({ message: 'Véhicule supprimé avec succès.' });
});

// -------------------------------------------------------------
// ANNOUNCEMENTS / PUBLICATIONS DU PROPRIÉTAIRE
// -------------------------------------------------------------

apiRouter.get('/announcements', (req: Request, res: Response) => {
  const list = db.getAnnouncements();
  return res.json(list);
});

apiRouter.post('/announcements', requireOwner, (req: Request, res: Response) => {
  const { titre, description, imageUrl, videoUrl, prixFcfa, categorie, vehiculeId } = req.body;
  if (!titre || !description) {
    return res.status(400).json({ error: 'Titre et description requis pour publier une annonce.' });
  }

  const newAnn: Announcement = {
    id: 'ann-' + crypto.randomUUID(),
    titre: titre.trim(),
    description: description.trim(),
    imageUrl: imageUrl?.trim() || undefined,
    videoUrl: videoUrl?.trim() || undefined,
    prixFcfa: prixFcfa ? parseInt(prixFcfa, 10) : undefined,
    categorie: categorie || 'Voitures',
    vehiculeId: vehiculeId || undefined,
    likes: 0,
    interessesCount: 0,
    pasInteressesCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.addAnnouncement(newAnn);
  return res.status(201).json(newAnn);
});

apiRouter.delete('/announcements/:id', requireOwner, (req: Request, res: Response) => {
  const deleted = db.deleteAnnouncement(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Annonce introuvable.' });
  }
  return res.json({ message: 'Annonce supprimée.' });
});

apiRouter.post('/announcements/:id/like', (req: Request, res: Response) => {
  const { increment } = req.body;
  const likes = db.likeAnnouncement(req.params.id, increment !== false);
  return res.json({ likes });
});

apiRouter.post('/announcements/:id/interest', (req: Request, res: Response) => {
  const { interest } = req.body;
  if (interest !== 'interesse' && interest !== 'pas_interesse') {
    return res.status(400).json({ error: 'Type d\'intérêt invalide.' });
  }
  const result = db.setAnnouncementInterest(req.params.id, interest);
  return res.json(result);
});

apiRouter.get('/announcements/:id/comments', (req: Request, res: Response) => {
  const list = db.getAnnouncementComments(req.params.id);
  return res.json(list);
});

apiRouter.post('/announcements/:id/comments', (req: Request, res: Response) => {
  const auth = getAuth(req);
  const { text, userName } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Commentaire vide.' });
  }

  const comment: AnnouncementComment = {
    id: 'c-' + crypto.randomUUID(),
    announcementId: req.params.id,
    userId: auth?.user.id || 'client-anon',
    userName: auth ? `${auth.user.prenom} ${auth.user.nom}` : (userName || 'Client'),
    userPhone: auth?.user.telephone,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  db.addAnnouncementComment(comment);
  return res.status(201).json(comment);
});

// -------------------------------------------------------------
// INTERNAL MESSAGING (WhatsApp Style - Mouhamed Ndao & Clients)
// -------------------------------------------------------------

// Active Client contacts list for Owner (Empty if no clients messaged yet!)
apiRouter.get('/conversations', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth || auth.role !== 'owner') {
    return res.status(403).json({ error: 'Accès réservé au propriétaire.' });
  }
  const convs = db.getConversations();
  return res.json(convs);
});

apiRouter.get('/messages', (req: Request, res: Response) => {
  const { conversationId } = req.query;
  const list = db.getMessages(conversationId as string);
  return res.json(list);
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  const auth = getAuth(req);
  const { conversationId, text, type, mediaUrl, mediaType, voiceDurationSeconds, replyToMessageId, targetClientId } = req.body;

  const isOwner = auth?.role === 'owner';
  const senderId = auth?.user.id || (isOwner ? 'owner-ndao' : 'client-' + (req.ip || 'anon'));
  const senderName = auth?.user ? `${auth.user.prenom} ${auth.user.nom}` : (isOwner ? 'MOUHAMED NDAO' : 'Client NDAO\'AUTO');
  const senderPhone = auth?.user.telephone;
  const senderRole = isOwner ? 'owner' : 'client';

  // Determine conversation ID
  const effectiveConvId = conversationId || (isOwner && targetClientId ? `conv-${targetClientId}` : `conv-${senderId}`);
  const receiverId = isOwner ? (targetClientId || 'client') : 'owner-ndao';

  const newMsg: ChatMessage = {
    id: 'm-' + crypto.randomUUID(),
    conversationId: effectiveConvId,
    senderId,
    senderName,
    senderPhone,
    senderRole,
    receiverId,
    text: text?.trim(),
    type: type || 'text',
    mediaUrl,
    mediaType,
    voiceDurationSeconds,
    replyToMessageId,
    status: 'sent',
    createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };

  db.addMessage(newMsg);
  return res.status(201).json(newMsg);
});

// Edit message (only author)
apiRouter.put('/messages/:id', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth) return res.status(401).json({ error: 'Non authentifié.' });

  const { text } = req.body;
  try {
    const updated = db.updateMessage(req.params.id, auth.user.id, text);
    return res.json(updated);
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Impossible de modifier ce message.' });
  }
});

// Delete message (only author)
apiRouter.delete('/messages/:id', (req: Request, res: Response) => {
  const auth = getAuth(req);
  if (!auth) return res.status(401).json({ error: 'Non authentifié.' });

  try {
    const ok = db.deleteMessage(req.params.id, auth.user.id);
    if (!ok) return res.status(404).json({ error: 'Message introuvable.' });
    return res.json({ message: 'Message supprimé.' });
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Action non autorisée.' });
  }
});

// -------------------------------------------------------------
// ORDERS & NEGOTIATIONS
// -------------------------------------------------------------

apiRouter.get('/orders', (req: Request, res: Response) => {
  const auth = getAuth(req);
  let orders = db.getOrders();
  if (!auth || auth.role !== 'owner') {
    if (auth) {
      orders = orders.filter(o => o.clientId === auth.user.id);
    } else {
      orders = [];
    }
  }
  return res.json(orders);
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const auth = getAuth(req);
  const { vehiculeId, prixProposeFcfa, typeDemande, messageClient, nom, telephone } = req.body;

  const vehicule = db.getVehicleById(vehiculeId);
  if (!vehicule) {
    return res.status(404).json({ error: 'Véhicule introuvable.' });
  }

  const clientName = auth ? `${auth.user.prenom} ${auth.user.nom}` : nom;
  const clientPhone = auth ? auth.user.telephone : telephone;

  if (!clientName || !clientPhone) {
    return res.status(400).json({ error: 'Votre nom et votre numéro de téléphone sont requis.' });
  }

  const newOrder: PurchaseOrder = {
    id: 'ord-' + crypto.randomUUID(),
    vehiculeId: vehicule.id,
    vehiculeTitre: `${vehicule.marque} ${vehicule.modele} ${vehicule.annee}`,
    vehiculeImage: vehicule.images[0],
    clientId: auth?.user.id || 'anon-' + crypto.randomUUID().slice(0, 8),
    clientNom: clientName.trim(),
    clientTelephone: clientPhone.trim(),
    prixAfficheFcfa: vehicule.prixFcfa,
    prixProposeFcfa: prixProposeFcfa ? parseInt(prixProposeFcfa, 10) : undefined,
    typeDemande: typeDemande || 'Achat direct',
    statut: 'En attente',
    messageClient: messageClient?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addOrder(newOrder);

  // Automatically create a message notification in the chat
  const systemMsg: ChatMessage = {
    id: 'm-' + crypto.randomUUID(),
    conversationId: `conv-${newOrder.clientId}`,
    senderId: newOrder.clientId,
    senderName: newOrder.clientNom,
    senderPhone: newOrder.clientTelephone,
    senderRole: 'client',
    receiverId: 'owner-ndao',
    text: `Bonjour Mouhamed Ndao, j'ai passé une commande pour: ${newOrder.vehiculeTitre} (${newOrder.prixAfficheFcfa.toLocaleString('fr-FR')} FCFA). ${newOrder.typeDemande === 'Négociation' ? `Offre proposée: ${newOrder.prixProposeFcfa?.toLocaleString('fr-FR')} FCFA.` : ''} Merci de me recontacter au ${newOrder.clientTelephone}.`,
    type: 'text',
    status: 'sent',
    createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
  db.addMessage(systemMsg);

  return res.status(201).json({
    message: 'Votre commande a été transmise directement à MOUHAMED NDAO.',
    order: newOrder,
  });
});

apiRouter.put('/orders/:id/status', requireOwner, (req: Request, res: Response) => {
  const { statut, reponseProprietaire } = req.body;
  const updated = db.updateOrderStatus(req.params.id, statut, reponseProprietaire);
  if (!updated) {
    return res.status(404).json({ error: 'Commande introuvable.' });
  }
  return res.json(updated);
});

// -------------------------------------------------------------
// RECOVERY REQUESTS (Owner Management)
// -------------------------------------------------------------

apiRouter.get('/recovery-requests', requireOwner, (_req: Request, res: Response) => {
  return res.json(db.getRecoveryRequests());
});

apiRouter.put('/recovery-requests/:id/action', requireOwner, (req: Request, res: Response) => {
  const { action } = req.body; // 'Autoriser' | 'Refuser'
  if (action !== 'Autoriser' && action !== 'Refuser') {
    return res.status(400).json({ error: 'Action invalide.' });
  }
  const updated = db.updateRecoveryStatus(req.params.id, action === 'Autoriser' ? 'Autorisé' : 'Refusé');
  if (!updated) {
    return res.status(404).json({ error: 'Demande introuvable.' });
  }
  return res.json(updated);
});

// -------------------------------------------------------------
// DASHBOARD STATS (Owner only)
// -------------------------------------------------------------

apiRouter.get('/stats', requireOwner, (_req: Request, res: Response) => {
  return res.json(db.getStats());
});
