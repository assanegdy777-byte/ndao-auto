import {
  Vehicle,
  ChatMessage,
  PurchaseOrder,
  RecoveryRequest,
  DashboardStats,
  User,
  Announcement,
  AnnouncementComment,
  ClientContact,
} from '../types';

function getHeaders() {
  const token = localStorage.getItem('ndao_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------
  async register(data: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    password: string;
    acceptTerms: boolean;
  }): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de l\'inscription');
    if (json.token) localStorage.setItem('ndao_auth_token', json.token);
    return json;
  },

  async login(identifier: string, password: string): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la connexion');
    if (json.token) localStorage.setItem('ndao_auth_token', json.token);
    return json;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('ndao_auth_token');
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    } catch (e) {
      console.warn('Logout API failed:', e);
    } finally {
      localStorage.removeItem('ndao_auth_token');
    }
  },

  // Password Recovery Flow
  async requestRecovery(identifier: string): Promise<{ message: string; recoveryId?: string; previewCode?: string }> {
    const res = await fetch('/api/auth/recover-request', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la demande');
    return json;
  },

  async verifyRecoveryCode(recoveryId: string, code: string): Promise<{ message: string; resetToken: string }> {
    const res = await fetch('/api/auth/recover-verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recoveryId, code }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Code invalide');
    return json;
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/recover-reset', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resetToken, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Impossible de réinitialiser');
    return json;
  },

  // -------------------------------------------------------------
  // VEHICLES
  // -------------------------------------------------------------
  async getVehicles(params?: {
    categorie?: string;
    marque?: string;
    etat?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    statut?: string;
  }): Promise<Vehicle[]> {
    const query = new URLSearchParams();
    if (params?.categorie && params.categorie !== 'Toutes') query.set('categorie', params.categorie);
    if (params?.marque) query.set('marque', params.marque);
    if (params?.etat) query.set('etat', params.etat);
    if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.statut) query.set('statut', params.statut);

    const res = await fetch(`/api/vehicles?${query.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erreur de chargement des véhicules');
    return res.json();
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const res = await fetch(`/api/vehicles/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Véhicule introuvable');
    return res.json();
  },

  async toggleVehicleLike(id: string, increment: boolean): Promise<number> {
    const res = await fetch(`/api/vehicles/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ increment }),
    });
    const json = await res.json();
    return json.likes;
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur d\'ajout du véhicule');
    return json;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur de modification');
    return json;
  },

  async deleteVehicle(id: string): Promise<void> {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de suppression');
  },

  // -------------------------------------------------------------
  // ANNOUNCEMENTS / PUBLICATIONS DU PROPRIÉTAIRE
  // -------------------------------------------------------------
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch('/api/announcements', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erreur de chargement des annonces');
    return res.json();
  },

  async createAnnouncement(data: {
    titre: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    prixFcfa?: number;
    categorie?: string;
    vehiculeId?: string;
  }): Promise<Announcement> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur de publication');
    return json;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de suppression d\'annonce');
  },

  async likeAnnouncement(id: string, increment: boolean): Promise<number> {
    const res = await fetch(`/api/announcements/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ increment }),
    });
    const json = await res.json();
    return json.likes;
  },

  async setAnnouncementInterest(
    id: string,
    interest: 'interesse' | 'pas_interesse'
  ): Promise<{ interessesCount: number; pasInteressesCount: number }> {
    const res = await fetch(`/api/announcements/${id}/interest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ interest }),
    });
    return res.json();
  },

  async getAnnouncementComments(announcementId: string): Promise<AnnouncementComment[]> {
    const res = await fetch(`/api/announcements/${announcementId}/comments`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async addAnnouncementComment(
    announcementId: string,
    text: string,
    userName?: string
  ): Promise<AnnouncementComment> {
    const res = await fetch(`/api/announcements/${announcementId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, userName }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur d\'ajout du commentaire');
    return json;
  },

  // -------------------------------------------------------------
  // MESSAGING (WhatsApp Style)
  // -------------------------------------------------------------
  async getConversations(): Promise<ClientContact[]> {
    const res = await fetch('/api/conversations', { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async getMessages(conversationId?: string): Promise<ChatMessage[]> {
    const url = conversationId ? `/api/messages?conversationId=${encodeURIComponent(conversationId)}` : '/api/messages';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async sendMessage(data: {
    conversationId?: string;
    text?: string;
    type?: 'text' | 'voice' | 'media';
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
    voiceDurationSeconds?: number;
    replyToMessageId?: string;
    targetClientId?: string;
  }): Promise<ChatMessage> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de l\'envoi du message');
    return json;
  },

  async editMessage(id: string, text: string): Promise<ChatMessage> {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur de modification');
    return json;
  },

  async deleteMessage(id: string): Promise<void> {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Erreur de suppression');
  },

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  async getOrders(): Promise<PurchaseOrder[]> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async createOrder(data: {
    vehiculeId: string;
    prixProposeFcfa?: number;
    typeDemande: 'Achat direct' | 'Négociation' | 'Demande essai';
    messageClient?: string;
    nom?: string;
    telephone?: string;
  }): Promise<{ message: string; order: PurchaseOrder }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur d\'envoi de la commande');
    return json;
  },

  async updateOrderStatus(id: string, statut: PurchaseOrder['statut'], reponseProprietaire?: string): Promise<PurchaseOrder> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ statut, reponseProprietaire }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur de mise à jour du statut');
    return json;
  },

  // -------------------------------------------------------------
  // RECOVERY REQUESTS
  // -------------------------------------------------------------
  async getRecoveryRequests(): Promise<RecoveryRequest[]> {
    const res = await fetch('/api/recovery-requests', { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  async actionRecoveryRequest(id: string, action: 'Autoriser' | 'Refuser'): Promise<RecoveryRequest> {
    const res = await fetch(`/api/recovery-requests/${id}/action`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur de traitement de la demande');
    return json;
  },

  // -------------------------------------------------------------
  // STATS
  // -------------------------------------------------------------
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erreur de statistiques');
    return res.json();
  },
};
