export type Role = 'owner' | 'client';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  role: Role;
}

export type Category = 'Voitures' | 'Motos' | 'Motos électriques' | 'Tricycles' | 'Autres véhicules';

export interface Vehicle {
  id: string;
  categorie: Category;
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
  categorie?: Category | 'Toutes';
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

export interface ClientContact {
  clientId: string;
  clientName: string;
  clientPhone: string;
  conversationId: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhone?: string;
  senderRole: Role;
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
  identifier: string;
  userName: string;
  code?: string;
  token?: string;
  statut: 'En attente' | 'Vérification nécessaire' | 'Autorisé' | 'Refusé' | 'Utilisé';
  expiresAt: string;
  createdAt: string;
}

export interface DashboardStats {
  annoncesActives: number;
  vues7Jours: number;
  messagesNonLus: number;
  commandesEnCours: number;
}
