import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  ChevronLeft,
  Play,
  Pause,
  Copy,
  Edit3,
  Reply,
  Trash2,
  X,
  Smile,
  Camera,
  MoreVertical,
  User as UserIcon,
  Search,
  MessageSquare,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, Vehicle, ClientContact, Announcement } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface MessagerieScreenProps {
  vehicle?: Vehicle | null;
  announcement?: Announcement | null;
  onBack?: () => void;
}

export const MessagerieScreen: React.FC<MessagerieScreenProps> = ({
  vehicle,
  announcement,
  onBack,
}) => {
  const { user, isOwner } = useAuth();

  // Contact list for owner
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ClientContact | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // Messages in current active conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');

  // Audio voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Context menu for messages
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState<ChatMessage | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);

  // Scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine current conversation ID
  const currentConversationId = isOwner
    ? selectedContact
      ? selectedContact.conversationId
      : ''
    : user
    ? `conv-${user.id}`
    : 'conv-client-anon';

  // Load Contacts (if owner)
  const fetchContacts = async () => {
    if (!isOwner) return;
    try {
      setLoadingContacts(true);
      const list = await api.getConversations();
      setContacts(list);
      if (list.length > 0 && !selectedContact) {
        setSelectedContact(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Load Messages for current conversation
  const fetchMessages = async () => {
    if (isOwner && !selectedContact) {
      setMessages([]);
      return;
    }
    try {
      setLoadingMessages(true);
      const convId = isOwner ? selectedContact?.conversationId : currentConversationId;
      const list = await api.getMessages(convId);
      setMessages(list);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchContacts();
    }
  }, [isOwner]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedContact, currentConversationId, isOwner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice note recording simulation
  const startRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const finishRecording = async () => {
    clearInterval(recordingTimerRef.current);
    const duration = Math.max(1, recordingSeconds);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);

    try {
      await api.sendMessage({
        conversationId: isOwner ? selectedContact?.conversationId : currentConversationId,
        type: 'voice',
        voiceDurationSeconds: duration,
        targetClientId: isOwner ? selectedContact?.clientId : undefined,
      });
      fetchMessages();
      if (isOwner) fetchContacts();
    } catch (err) {
      console.error('Failed to send voice note', err);
    }
  };

  // Send text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMsg) {
      try {
        await api.editMessage(editingMsg.id, inputText.trim());
        setEditingMsg(null);
        setInputText('');
        fetchMessages();
      } catch (err) {
        console.error('Failed to edit message', err);
      }
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    const replyId = replyingTo?.id;
    setReplyingTo(null);

    try {
      await api.sendMessage({
        conversationId: isOwner ? selectedContact?.conversationId : currentConversationId,
        text: textToSend,
        type: 'text',
        replyToMessageId: replyId,
        targetClientId: isOwner ? selectedContact?.clientId : undefined,
      });
      fetchMessages();
      if (isOwner) fetchContacts();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Voice Playback simulation
  const togglePlayAudio = (msgId: string) => {
    if (playingMessageId === msgId) {
      setPlayingMessageId(null);
      setAudioProgress(0);
    } else {
      setPlayingMessageId(msgId);
      setAudioProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        if (p >= 100) {
          clearInterval(interval);
          setPlayingMessageId(null);
          setAudioProgress(0);
        } else {
          setAudioProgress(p);
        }
      }, 100);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    try {
      await api.deleteMessage(id);
      setSelectedMsgForMenu(null);
      fetchMessages();
    } catch (err: any) {
      alert(err.message || 'Impossible de supprimer ce message.');
    }
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(
    (c) =>
      c.clientName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.clientPhone.includes(contactSearch)
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#0b141a] border border-[#1f2c34] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[750px] font-['Segoe_UI',Helvetica,Arial,sans-serif]">
      {/* ========================================================================= */}
      {/* OWNER CONTACTS SIDEBAR (Only visible if logged in as Owner) */}
      {/* ========================================================================= */}
      {isOwner && (
        <div className="w-full md:w-80 bg-[#111b21] border-r border-[#222d34] flex flex-col h-full shrink-0">
          {/* Header */}
          <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow">
                MN
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Mouhamed Ndao</h3>
                <span className="text-[11px] text-emerald-400 font-medium">Propriétaire NDAO'AUTO</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#00a884]" />
            </div>
          </div>

          {/* Search Contacts */}
          <div className="p-2 border-b border-[#222d34]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un contact client..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-[#202c33] text-xs text-white rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-[#00a884] placeholder-slate-400"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]">
            {loadingContacts && contacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Chargement des contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 h-full">
                <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center mb-3 text-slate-300">
                  <MessageSquare className="w-6 h-6 text-[#00a884]" />
                </div>
                <p className="text-xs font-semibold text-slate-300 mb-1">Aucune discussion client</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
                  Votre boîte de messagerie est vide. Dès qu'un client vous envoie un message ou passe commande, sa conversation apparaîtra ici.
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.clientId === contact.clientId;
                return (
                  <button
                    key={contact.clientId}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-3 flex items-center gap-3 transition ${
                      isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
                      {contact.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white truncate">{contact.clientName}</h4>
                        <span className="text-[10px] text-slate-400">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{contact.lastMessageText}</p>
                      <p className="text-[10px] text-emerald-400">{contact.clientPhone}</p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#00a884] text-black text-[10px] font-bold flex items-center justify-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAT MAIN PANEL (Client or Owner active chat) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full bg-[#0b141a] relative">
        {/* WhatsApp Top Navigation Bar */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] z-10 shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-slate-300 hover:text-white p-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-sm shadow">
                {isOwner && selectedContact
                  ? selectedContact.clientName.slice(0, 2).toUpperCase()
                  : 'MN'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#202c33] rounded-full"></span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                {isOwner && selectedContact
                  ? selectedContact.clientName
                  : 'MOUHAMED NDAO'}
                {!isOwner && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Propriétaire
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#00a884] flex items-center gap-1">
                {isOwner && selectedContact
                  ? selectedContact.clientPhone
                  : '+221 777 308 383 • En ligne (Dakar, Sénégal)'}
              </p>
            </div>
          </div>

          {/* Action icon (Refresh conversation) */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#00a884]/15 text-[#00a884] font-medium border border-[#00a884]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct Propriétaire
            </span>
            <button
              onClick={() => fetchMessages()}
              className="p-2 hover:bg-[#2a3942] rounded-full transition text-[#00a884]"
              title="Actualiser les messages"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Announcement or Vehicle Context (if provided) */}
        {(vehicle || announcement) && (
          <div className="bg-[#182229] border-b border-[#222d34] px-4 py-2 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-emerald-400">Objet de la discussion :</span>
              <span className="truncate text-white">
                {vehicle
                  ? `${vehicle.marque} ${vehicle.modele} ${vehicle.annee} (${vehicle.prixFcfa.toLocaleString('fr-FR')} FCFA)`
                  : announcement?.titre}
              </span>
            </div>
            <span className="text-[10px] bg-[#00a884]/20 text-emerald-300 px-2 py-0.5 rounded shrink-0">
              {vehicle?.disponibilite || 'Annonce NDAO\'AUTO'}
            </span>
          </div>
        )}

        {/* Message Stream Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 relative"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        >
          {/* Welcome Encrypted banner like WhatsApp */}
          <div className="flex justify-center my-2">
            <span className="bg-[#182229]/90 border border-[#2a3942] text-[11px] text-amber-200/80 px-3 py-1 rounded-lg text-center max-w-md shadow-sm">
              🔒 Messagerie interne sécurisée NDAO'AUTO. Vos échanges avec MOUHAMED NDAO sont confidentiels et directs.
            </span>
          </div>

          {/* Empty State */}
          {messages.length === 0 && !loadingMessages && (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-[#202c33] flex items-center justify-center mb-3 text-[#00a884]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {isOwner
                  ? selectedContact
                    ? `Discussion avec ${selectedContact.clientName}`
                    : 'Sélectionnez un contact pour discuter'
                  : 'Commencez la discussion avec MOUHAMED NDAO'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {isOwner
                  ? 'Aucun message dans cette conversation pour le moment.'
                  : 'Posez vos questions sur la disponibilité d\'un véhicule, négociez le prix en FCFA ou demandez un rendez-vous pour un essai à Dakar.'}
              </p>
            </div>
          )}

          {/* Real Messages List */}
          {messages.map((msg) => {
            const isMe = isOwner ? msg.senderRole === 'owner' : msg.senderRole === 'client';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
              >
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedMsgForMenu(msg);
                    setMenuPosition({ x: e.clientX, y: e.clientY });
                  }}
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-md transition-all select-none relative ${
                    isMe
                      ? 'bg-[#005c4b] text-white rounded-tr-xs'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Sender Name if not me in group context */}
                  {!isMe && (
                    <div className="text-[10px] font-bold text-[#00a884] mb-0.5">
                      {msg.senderName}
                    </div>
                  )}

                  {/* Quoted Reply reference if any */}
                  {msg.replyToMessageId && (
                    <div className="mb-1.5 p-1.5 bg-black/20 rounded border-l-2 border-[#00a884] text-[11px] text-slate-300">
                      <span className="font-semibold text-emerald-300 block">Réponse au message</span>
                      <span className="truncate block opacity-80">Message cité</span>
                    </div>
                  )}

                  {/* Media Content */}
                  {msg.mediaUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-black/20">
                      <img src={msg.mediaUrl} alt="Média" className="max-h-60 w-auto object-cover rounded-lg" />
                    </div>
                  )}

                  {/* Voice Note Type */}
                  {msg.type === 'voice' ? (
                    <div className="flex items-center gap-3 py-1 min-w-[220px]">
                      <button
                        onClick={() => togglePlayAudio(msg.id)}
                        className="w-9 h-9 rounded-full bg-[#00a884] text-black flex items-center justify-center hover:scale-105 transition shrink-0 shadow"
                      >
                        {playingMessageId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden w-full mb-1">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-100"
                            style={{
                              width: playingMessageId === msg.id ? `${audioProgress}%` : '0%',
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span>0:{msg.voiceDurationSeconds ? msg.voiceDurationSeconds.toString().padStart(2, '0') : '15'}</span>
                          <span>Note vocale</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed break-words text-sm">{msg.text}</p>
                  )}

                  {/* Metadata: Time + Delivery Status */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80 float-right ml-3">
                    {msg.editedAt && <span className="italic mr-1">modifié</span>}
                    <span>{msg.createdAt}</span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-400' : 'text-slate-400'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Replying banner if active */}
        {replyingTo && (
          <div className="bg-[#182229] border-t border-[#222d34] px-4 py-2 flex items-center justify-between text-xs text-slate-300">
            <div className="border-l-2 border-[#00a884] pl-2 truncate">
              <span className="font-semibold text-emerald-400 block">Répondre à {replyingTo.senderName}</span>
              <span className="truncate block opacity-75">{replyingTo.text || 'Note vocale'}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editing banner if active */}
        {editingMsg && (
          <div className="bg-[#182229] border-t border-[#222d34] px-4 py-2 flex items-center justify-between text-xs text-amber-300">
            <span>Modification du message</span>
            <button
              onClick={() => {
                setEditingMsg(null);
                setInputText('');
              }}
              className="p-1 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Input Ribbon (WhatsApp Style) */}
        <div className="bg-[#202c33] px-3 py-2 border-t border-[#2a3942] flex items-center gap-2 shrink-0">
          {isRecordingVoice ? (
            /* Voice Recording Mode */
            <div className="flex-1 flex items-center justify-between bg-[#111b21] px-4 py-2 rounded-xl border border-red-500/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-red-400 text-xs font-semibold">Enregistrement en cours...</span>
                <span className="text-white text-xs font-mono">0:{recordingSeconds.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={finishRecording}
                  className="px-3 py-1 bg-[#00a884] text-black font-semibold text-xs rounded-lg hover:bg-emerald-400 transition"
                >
                  Envoyer le vocal
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text Mode */
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-[#2a3942] transition"
                title="Insérer un émoticône"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-[#2a3942] transition"
                title="Joindre une photo du véhicule ou document"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={
                  isOwner
                    ? `Répondre à ${selectedContact ? selectedContact.clientName : 'Client'}...`
                    : 'Écrivez votre message à Mouhamed Ndao...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#2a3942] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#00a884] placeholder-slate-400"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-emerald-400 text-black flex items-center justify-center transition shadow shrink-0"
                  title="Envoyer le message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-emerald-400 text-black flex items-center justify-center transition shadow shrink-0"
                  title="Maintenir pour enregistrer une note vocale"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Message Context Menu */}
      {selectedMsgForMenu && (
        <div
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setSelectedMsgForMenu(null)}
        >
          <div
            className="absolute bg-[#233138] border border-[#2e3f48] shadow-2xl rounded-xl p-1.5 text-xs text-white min-w-[160px] space-y-1"
            style={{
              top: Math.min(menuPosition?.y || 200, window.innerHeight - 150),
              left: Math.min(menuPosition?.x || 200, window.innerWidth - 180),
            }}
          >
            <button
              onClick={() => {
                if (selectedMsgForMenu.text) navigator.clipboard.writeText(selectedMsgForMenu.text);
                setSelectedMsgForMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#182229] rounded flex items-center gap-2 text-slate-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier</span>
            </button>
            <button
              onClick={() => {
                setReplyingTo(selectedMsgForMenu);
                setSelectedMsgForMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#182229] rounded flex items-center gap-2 text-slate-200"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Répondre</span>
            </button>
            {(selectedMsgForMenu.senderRole === 'owner' ? isOwner : !isOwner) && (
              <>
                <button
                  onClick={() => {
                    setEditingMsg(selectedMsgForMenu);
                    setInputText(selectedMsgForMenu.text || '');
                    setSelectedMsgForMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#182229] rounded flex items-center gap-2 text-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDeleteMessage(selectedMsgForMenu.id)}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-950/50 rounded flex items-center gap-2 text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
