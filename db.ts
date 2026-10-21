import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  passwordHash: string;
  salt: string;
  role: 'owner' | 'client';
  createdAt: string;
}

export interface VehicleComment {
  id: string;
  vehiculeId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  categorie: 'Voitures' | 'Motos' | 'Motos électriques' | 'Tricycles' | 'Autres véhicules';
  marque: string;
  modele: string;
  version?: string;
  annee: number;
  prixFcfa: number;
  etat: 'Neuf' | 'Occasion';
  disponibilite: 'Disponible' | 'Réservé' | 'Vendu';
  quantiteStock: number;
  statut: 'Publié' | 'Brouillon' | 'Dépublié';
  kilometrage?: number;
  carburant?: 'Diesel' | 'Essence' | 'Électrique' | 'Hybride' | 'Autre';
  boiteVitesses?: 'Automatique' | 'Manuelle';
  puissance?: string;
  couleur?: string;
  places?: number;
  localisation: string;
  autonomieKm?: number;
  capaciteChargeKg?: number;
  description: string;
  images: string[];
  videoUrl?: string;
  vues: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  titre: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  prixFcfa?: number;
  categorie?: 'Voitures' | 'Motos' | 'Motos électriques' | 'Tricycles' | 'Autres véhicules' | 'Toutes';
  vehiculeId?: string;
  likes: number;
  interessesCount: number;
  pasInteressesCount: number;
  createdAt: string;
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  text: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhone?: string;
  senderRole: 'owner' | 'client';
  receiverId: string;
  text?: string;
  type: 'text' | 'voice' | 'media';
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  voiceDurationSeconds?: number;
  replyToMessageId?: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  editedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  vehiculeId: string;
  vehiculeTitre: string;
  vehiculeImage: string;
  clientId: string;
  clientNom: string;
  clientTelephone: string;
  prixAfficheFcfa: number;
  prixProposeFcfa?: number;
  typeDemande: 'Achat direct' | 'Négociation' | 'Demande essai';
  statut: 'En attente' | 'En discussion' | 'Acceptée' | 'Refusée';
  messageClient?: string;
  reponseProprietaire?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryRequest {
  id: string;
  identifier: string; // phone or email
  userName: string;
  code?: string;
  token?: string;
  statut: 'En attente' | 'Vérification nécessaire' | 'Autorisé' | 'Refusé' | 'Utilisé';
  expiresAt: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  vehicles: Vehicle[];
  comments: VehicleComment[];
  announcements: Announcement[];
  announcementComments: AnnouncementComment[];
  messages: ChatMessage[];
  orders: PurchaseOrder[];
  recoveryRequests: RecoveryRequest[];
  stats: {
    totalVues: number;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'ndao_auto.db.json');

// Security helper: PBKDF2 hash password
export function hashPassword(password: string, existingSalt?: string): { salt: string; hash: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

// Initial seed with clean data (Owner: MOUHAMED NDAO, real inventory, zero fake messages, zero fake recovery requests)
function getInitialData(): DatabaseSchema {
  const ownerPass = hashPassword('nda8383auto');

  const ownerUser: User = {
    id: 'owner-ndao',
    nom: 'NDAO',
    prenom: 'MOUHAMED',
    telephone: '+221 777 308 383',
    email: 'mouhamed.ndao@ndao-auto.sn',
    passwordHash: ownerPass.hash,
    salt: ownerPass.salt,
    role: 'owner',
    createdAt: new Date().toISOString(),
  };

  const vehicles: Vehicle[] = [
    {
      id: 'v-landcruiser-prado',
      categorie: 'Voitures',
      marque: 'Toyota',
      modele: 'Land Cruiser Prado',
      version: 'TX-L 2.8 D-4D',
      annee: 2020,
      prixFcfa: 12500000,
      etat: 'Occasion',
      disponibilite: 'Disponible',
      quantiteStock: 1,
      statut: 'Publié',
      kilometrage: 85000,
      carburant: 'Diesel',
      boiteVitesses: 'Automatique',
      puissance: '177 ch',
      couleur: 'Noir Métallisé',
      places: 7,
      localisation: 'Dakar, Sénégal',
      description: 'Très bon état, véhicule bien entretenu. Climatisation tri-zone, jantes alliage, révision complète effectuée à Dakar.',
      images: [
        'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      ],
      vues: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'v-moto-electrique-x1',
      categorie: 'Motos',
      marque: 'NDAO E-Vision',
      modele: 'Moto électrique X1',
      version: 'Hyper Carbon Edition',
      annee: 2024,
      prixFcfa: 1850000,
      etat: 'Neuf',
      disponibilite: 'Disponible',
      quantiteStock: 4,
      statut: 'Publié',
      kilometrage: 0,
      carburant: 'Électrique',
      boiteVitesses: 'Automatique',
      puissance: '5000W / 110 km/h',
      autonomieKm: 140,
      couleur: 'Bleu Métal & Carbone',
      localisation: 'Dakar - Plateau, Sénégal',
      description: 'Plus loin. Plus propre. Même passion. Puissance, autonomie et liberté. Batterie lithium amovible 72V rechargeable sur prise 220V.',
      images: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      ],
      vues: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'v-toyota-yaris-2019',
      categorie: 'Voitures',
      marque: 'Toyota',
      modele: 'Yaris',
      version: '1.3 VVT-i Confort',
      annee: 2019,
      prixFcfa: 7500000,
      etat: 'Occasion',
      disponibilite: 'Disponible',
      quantiteStock: 1,
      statut: 'Publié',
      kilometrage: 62000,
      carburant: 'Essence',
      boiteVitesses: 'Manuelle',
      puissance: '99 ch',
      couleur: 'Blanc Glacier',
      places: 5,
      localisation: 'Dakar, Almadies',
      description: 'Très économique, climatisation d\'origine, carnet d\'entretien disponible, idéale pour circulation urbaine.',
      images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      ],
      vues: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'v-tricycle-cargo-250',
      categorie: 'Tricycles',
      marque: 'Dayang / SenCargo',
      modele: 'Tricycle Cargo Pro 250cc',
      version: 'Benne Hydraulique Renforcée',
      annee: 2024,
      prixFcfa: 2200000,
      etat: 'Neuf',
      disponibilite: 'Disponible',
      quantiteStock: 3,
      statut: 'Publié',
      kilometrage: 0,
      carburant: 'Essence',
      boiteVitesses: 'Manuelle',
      puissance: '250 cc',
      capaciteChargeKg: 1200,
      couleur: 'Bleu Royal',
      localisation: 'Dakar - Thiaroye, Sénégal',
      description: 'Tricycle utilitaire ultra robuste, benne basculante renforcée, capacité réelle 1200 kg.',
      images: [
        'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&w=1200&q=80',
      ],
      vues: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      titre: 'Arrivage Spécial Toyota Land Cruiser Prado à Dakar',
      description: 'MOUHAMED NDAO vous présente ce magnifique Toyota Prado TX-L 2020 disponible immédiatement au showroom de Dakar. Visite et essai sur rendez-vous.',
      imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80',
      prixFcfa: 12500000,
      categorie: 'Voitures',
      vehiculeId: 'v-landcruiser-prado',
      likes: 0,
      interessesCount: 0,
      pasInteressesCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      titre: 'Nouvelles Motos Électriques NDAO E-Vision disponibles !',
      description: 'Rejoignez la mobilité propre au Sénégal avec notre modèle X1 Carbon. 140 km d\'autonomie, économique et silencieuse. Garantie 1 an avec pièces de rechange.',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      prixFcfa: 1850000,
      categorie: 'Motos',
      vehiculeId: 'v-moto-electrique-x1',
      likes: 0,
      interessesCount: 0,
      pasInteressesCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [ownerUser],
    vehicles,
    comments: [],
    announcements,
    announcementComments: [],
    messages: [], // Clean start - NO fake messages!
    orders: [], // Clean start - NO fake orders!
    recoveryRequests: [], // Clean start - NO fake recovery requests!
    stats: {
      totalVues: 0,
    },
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.comments) parsed.comments = [];
        if (!parsed.announcements) parsed.announcements = [];
        if (!parsed.announcementComments) parsed.announcementComments = [];
        if (!parsed.messages) parsed.messages = [];
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.recoveryRequests) parsed.recoveryRequests = [];
        return parsed;
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  public save() {
    this.saveData(this.data);
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save ndao_auto db:', err);
    }
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserByIdentifier(identifier: string): User | undefined {
    const clean = identifier.replace(/[\s\-+]/g, '').toLowerCase();
    return this.data.users.find(u => {
      const cleanPhone = u.telephone.replace(/[\s\-+]/g, '').toLowerCase();
      const cleanEmail = u.email ? u.email.toLowerCase() : '';
      return cleanPhone === clean || cleanPhone.endsWith(clean) || clean.endsWith(cleanPhone) || cleanEmail === clean;
    });
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUserPassword(userId: string, newHash: string, newSalt: string) {
    const u = this.findUserById(userId);
    if (u) {
      u.passwordHash = newHash;
      u.salt = newSalt;
      this.save();
    }
  }

  // Vehicles
  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.data.vehicles.find(v => v.id === id);
  }

  public addVehicle(v: Vehicle) {
    this.data.vehicles.unshift(v);
    this.save();
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>) {
    const idx = this.data.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.vehicles[idx] = { ...this.data.vehicles[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.vehicles[idx];
    }
    return null;
  }

  public deleteVehicle(id: string): boolean {
    const initialLen = this.data.vehicles.length;
    this.data.vehicles = this.data.vehicles.filter(v => v.id !== id);
    if (this.data.vehicles.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public incrementVehicleView(id: string) {
    const v = this.getVehicleById(id);
    if (v) {
      v.vues += 1;
      this.data.stats.totalVues += 1;
      this.save();
    }
  }

  public toggleVehicleLike(id: string, increment: boolean): number {
    const v = this.getVehicleById(id);
    if (v) {
      v.likes = Math.max(0, v.likes + (increment ? 1 : -1));
      this.save();
      return v.likes;
    }
    return 0;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  public getAnnouncementById(id: string): Announcement | undefined {
    return this.data.announcements.find(a => a.id === id);
  }

  public addAnnouncement(a: Announcement) {
    this.data.announcements.unshift(a);
    this.save();
  }

  public deleteAnnouncement(id: string): boolean {
    const len = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter(a => a.id !== id);
    if (this.data.announcements.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  public likeAnnouncement(id: string, increment: boolean): number {
    const a = this.getAnnouncementById(id);
    if (a) {
      a.likes = Math.max(0, a.likes + (increment ? 1 : -1));
      this.save();
      return a.likes;
    }
    return 0;
  }

  public setAnnouncementInterest(id: string, interest: 'interesse' | 'pas_interesse'): { interessesCount: number; pasInteressesCount: number } {
    const a = this.getAnnouncementById(id);
    if (a) {
      if (interest === 'interesse') {
        a.interessesCount = (a.interessesCount || 0) + 1;
      } else {
        a.pasInteressesCount = (a.pasInteressesCount || 0) + 1;
      }
      this.save();
      return { interessesCount: a.interessesCount, pasInteressesCount: a.pasInteressesCount };
    }
    return { interessesCount: 0, pasInteressesCount: 0 };
  }

  public getAnnouncementComments(announcementId: string): AnnouncementComment[] {
    return (this.data.announcementComments || []).filter(c => c.announcementId === announcementId);
  }

  public addAnnouncementComment(comment: AnnouncementComment) {
    if (!this.data.announcementComments) this.data.announcementComments = [];
    this.data.announcementComments.push(comment);
    this.save();
  }

  // Messaging (WhatsApp style - real conversations only)
  public getMessages(conversationId?: string): ChatMessage[] {
    if (!conversationId) return this.data.messages;
    return this.data.messages.filter(m => m.conversationId === conversationId);
  }

  public getConversations(): Array<{
    clientId: string;
    clientName: string;
    clientPhone: string;
    conversationId: string;
    lastMessageText: string;
    lastMessageTime: string;
    unreadCount: number;
    totalMessages: number;
  }> {
    const map = new Map<string, {
      clientId: string;
      clientName: string;
      clientPhone: string;
      conversationId: string;
      lastMessageText: string;
      lastMessageTime: string;
      unreadCount: number;
      totalMessages: number;
    }>();

    for (const msg of this.data.messages) {
      const clientId = msg.senderRole === 'client' ? msg.senderId : msg.receiverId;
      if (!clientId || clientId === 'owner-ndao') continue;

      const client = this.findUserById(clientId);
      const clientName = client ? `${client.prenom} ${client.nom}` : msg.senderName;
      const clientPhone = client ? client.telephone : (msg.senderPhone || 'Numéro non renseigné');

      const existing = map.get(clientId);
      const unreadInc = (msg.senderRole === 'client' && msg.status !== 'read') ? 1 : 0;

      if (!existing) {
        map.set(clientId, {
          clientId,
          clientName,
          clientPhone,
          conversationId: msg.conversationId,
          lastMessageText: msg.type === 'voice' ? '🎤 Note vocale' : (msg.text || 'Média'),
          lastMessageTime: msg.createdAt,
          unreadCount: unreadInc,
          totalMessages: 1,
        });
      } else {
        existing.lastMessageText = msg.type === 'voice' ? '🎤 Note vocale' : (msg.text || 'Média');
        existing.lastMessageTime = msg.createdAt;
        existing.unreadCount += unreadInc;
        existing.totalMessages += 1;
      }
    }

    return Array.from(map.values());
  }

  public addMessage(msg: ChatMessage) {
    this.data.messages.push(msg);
    this.save();
  }

  public updateMessage(id: string, senderId: string, newText: string): ChatMessage | null {
    const msg = this.data.messages.find(m => m.id === id);
    if (!msg) return null;
    if (msg.senderId !== senderId) {
      throw new Error('Action non autorisée: seul l\'auteur peut modifier ce message.');
    }
    msg.text = newText;
    msg.editedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    this.save();
    return msg;
  }

  public deleteMessage(id: string, senderId: string): boolean {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    const msg = this.data.messages[idx];
    if (msg.senderId !== senderId) {
      throw new Error('Action non autorisée: seul l\'auteur peut supprimer ce message.');
    }
    this.data.messages.splice(idx, 1);
    this.save();
    return true;
  }

  // Orders
  public getOrders(): PurchaseOrder[] {
    return this.data.orders;
  }

  public addOrder(o: PurchaseOrder) {
    this.data.orders.unshift(o);
    this.save();
  }

  public updateOrderStatus(id: string, statut: PurchaseOrder['statut'], reponseProprietaire?: string): PurchaseOrder | null {
    const o = this.data.orders.find(ord => ord.id === id);
    if (o) {
      o.statut = statut;
      if (reponseProprietaire) o.reponseProprietaire = reponseProprietaire;
      o.updatedAt = new Date().toISOString();
      this.save();
      return o;
    }
    return null;
  }

  // Recovery requests
  public getRecoveryRequests(): RecoveryRequest[] {
    return this.data.recoveryRequests;
  }

  public addRecoveryRequest(r: RecoveryRequest) {
    this.data.recoveryRequests.unshift(r);
    this.save();
  }

  public updateRecoveryStatus(id: string, statut: RecoveryRequest['statut']): RecoveryRequest | null {
    const r = this.data.recoveryRequests.find(req => req.id === id);
    if (r) {
      r.statut = statut;
      this.save();
      return r;
    }
    return null;
  }

  public getStats() {
    const publishedVehicles = this.data.vehicles.filter(v => v.statut === 'Publié').length;
    const unreadMessages = this.data.messages.filter(m => m.senderRole === 'client' && m.status !== 'read').length;
    const pendingOrders = this.data.orders.filter(o => o.statut === 'En attente' || o.statut === 'En discussion').length;

    return {
      annoncesActives: publishedVehicles,
      vues7Jours: this.data.stats.totalVues,
      messagesNonLus: unreadMessages,
      commandesEnCours: pendingOrders,
    };
  }
}

export const db = new Database();
