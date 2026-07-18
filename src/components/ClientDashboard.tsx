import React, { useState, useEffect } from "react";
import { Order, ChatConversation, ChatMessage, Language, translations, Artist, Notification } from "../types";
import { DBManager } from "../lib/db";
import { compressImage } from "../lib/imageCompressor";
import {
  ShoppingBag,
  MessageSquare,
  User,
  Settings,
  Send,
  ArrowRight,
  Check,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Bell,
  Trash2,
  Camera,
  Paintbrush
} from "lucide-react";

interface ClientDashboardProps {
  userId: string;
  userName: string;
  userEmail: string;
  language: Language;
  onNavigate: (view: "home" | "search" | "profile" | "dashboard" | "admin" | "map", id?: string) => void;
  onUserUpdate?: (user: { id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string }) => void;
}

type TabType = "stats" | "orders" | "chat" | "settings" | "notifications";

export default function ClientDashboard({
  userId,
  userName,
  userEmail,
  language,
  onNavigate,
  onUserUpdate
}: ClientDashboardProps) {
  const t = translations[language];

  const [orders, setOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Selected chat conversation
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState("");

  // Settings state
  const [clientDisplayName, setClientDisplayName] = useState(userName);
  const [clientEmailAddress, setClientEmailAddress] = useState(userEmail);
  const [clientAvatar, setClientAvatar] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // Load orders, conversations, notifications, avatar and artists
  useEffect(() => {
    const allOrders = DBManager.getOrders();
    // Filter orders belonging to this client (by clientId, email or name)
    const filteredOrders = allOrders.filter(
      o => o.clientId === userId || o.clientContact === userEmail || o.clientName === userName
    );
    setOrders(filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const allConvs = DBManager.getConversations();
    // Filter conversations where visitor contact is user email/id or visitor name matches
    const filteredConvs = allConvs.filter(
      c => c.visitorContact === userEmail || c.visitorContact === userId || c.visitorName === userName
    );
    setConversations(filteredConvs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));

    setArtists(DBManager.getArtists());

    // Load client notifications
    setNotifications(DBManager.getNotifications(userId));

    // Load client local avatar
    try {
      const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
      const userObj = commonUsers.find((u: any) => u.id === userId);
      if (userObj && userObj.avatarUrl) {
        setClientAvatar(userObj.avatarUrl);
      }
    } catch (_) {}
  }, [userId, userName, userEmail, activeTab]);

  // Handle selected chat messages loading and auto-refresh
  useEffect(() => {
    if (selectedConvId) {
      setChatMessages(DBManager.getMessages(selectedConvId));
      DBManager.markChatAsRead(selectedConvId, "visitor");

      const timer = setInterval(() => {
        setChatMessages(DBManager.getMessages(selectedConvId));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [selectedConvId]);

  const activeConv = conversations.find(c => c.id === selectedConvId);
  const activeArtist = activeConv ? artists.find(a => a.id === activeConv.artistId) : null;

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !newMsgText.trim() || !activeConv) return;

    const sentMsg = DBManager.sendChatMessage(
      selectedConvId,
      activeConv.artistId,
      activeConv.visitorName,
      activeConv.visitorContact,
      "visitor", // Sender is the visitor
      userName,
      newMsgText.trim()
    );

    setChatMessages(prev => [...prev, sentMsg]);
    setNewMsgText("");

    // Update conversations list with latest message
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConvId
          ? {
              ...c,
              lastMessageText: sentMsg.text,
              lastMessageAt: sentMsg.createdAt
            }
          : c
      )
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDisplayName.trim() || !clientEmailAddress.trim()) return;

    // Simulate save settings in local storage
    const customUsers = DBManager.getCommonUsers();
    const updatedUsers = customUsers.map((u: any) =>
      u.id === userId ? { ...u, name: clientDisplayName, email: clientEmailAddress, avatarUrl: clientAvatar } : u
    );
    DBManager.saveCommonUsers(updatedUsers);

    // Update active session locally
    const sessionUser = JSON.parse(localStorage.getItem("retratistas_current_user") || "null");
    if (sessionUser && sessionUser.id === userId) {
      sessionUser.name = clientDisplayName;
      sessionUser.email = clientEmailAddress;
      sessionUser.avatarUrl = clientAvatar;
      localStorage.setItem("retratistas_current_user", JSON.stringify(sessionUser));
    }

    const sessionUserMain = JSON.parse(localStorage.getItem("retratistas_session") || "null");
    if (sessionUserMain && sessionUserMain.id === userId) {
      sessionUserMain.name = clientDisplayName;
      sessionUserMain.email = clientEmailAddress;
      sessionUserMain.avatarUrl = clientAvatar;
      localStorage.setItem("retratistas_session", JSON.stringify(sessionUserMain));
    }

    if (onUserUpdate) {
      onUserUpdate({
        id: userId,
        role: "user",
        name: clientDisplayName,
        avatarUrl: clientAvatar
      });
    }

    setSettingsSuccessMsg(
      language === "pt" ? "Definições atualizadas com sucesso! Atualize a página se necessário." : "Settings updated successfully! Refresh page if needed."
    );
    setTimeout(() => setSettingsSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Dashboard section */}
        <div className="border-b border-neutral-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif tracking-normal text-white">
              {language === "pt" ? "Painel de Cliente" : "Client Dashboard"}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {language === "pt"
                ? `Bem-vindo de volta, ${userName}. Gerencie as suas encomendas e conversas com retratistas.`
                : `Welcome back, ${userName}. Manage your portrait commissions and artist chat threads.`}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate("search")}
              className="px-4 py-2 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              {language === "pt" ? "Explorar Mais Artistas" : "Explore More Artists"}
            </button>
          </div>
        </div>

        {/* Layout Tabs Menu & Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Sidebar tabs */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-1">
              
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === "stats"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <User size={16} />
                <span>{language === "pt" ? "Resumo da Conta" : "Account Summary"}</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === "orders"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <ShoppingBag size={16} />
                <span>{language === "pt" ? "Minhas Encomendas" : "My Orders"} ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === "chat"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <MessageSquare size={16} />
                <span>{language === "pt" ? "Mensagens e Chat" : "Messages & Chat"} ({conversations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === "notifications"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} />
                  <span>{language === "pt" ? "Notificações" : "Notifications"}</span>
                </div>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    activeTab === "notifications" ? "bg-neutral-950 text-amber-500 animate-pulse" : "bg-amber-500 text-neutral-950"
                  }`}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === "settings"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/40"
                }`}
              >
                <Settings size={16} />
                <span>{language === "pt" ? "Configurações" : "Settings"}</span>
              </button>

            </div>
          </div>

          {/* Right Column Content Display */}
          <div className="lg:col-span-9">
            
            {/* T1: STATS & SUMMARY SUMMARY */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Encomendas Realizadas</span>
                    <p className="text-3xl font-bold text-white mt-1 font-mono">{orders.length}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Pedidos de retrato enviados aos artistas.</p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Conversas por Chat</span>
                    <p className="text-3xl font-bold text-amber-500 mt-1 font-mono">{conversations.length}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">Canais de contacto directo activos.</p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Estado da Conta</span>
                    <p className="text-base font-bold text-green-500 mt-1.5 uppercase flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                      Ativo • Cliente
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">Acesso total a seguir, encomendar e chat.</p>
                  </div>
                </div>

                {/* Latest Activity section list */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Instruções de Utilização</h3>
                  <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                    <p>Como cliente registado na plataforma RetrArt Moz, tem acesso às seguintes funcionalidades exclusivas:</p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                      <li><strong>Seguir Artistas:</strong> Receba actualizações do perfil dos seus retratistas favoritos directamente no seu portal.</li>
                      <li><strong>Encomendas directas:</strong> Envie solicitações detalhadas de retratos com orçamento planeado, prazos e foto de referência.</li>
                      <li><strong>Chat em tempo real:</strong> Converse directamente com os artistas para alinhar detalhes da sua obra e ver o progresso do desenho.</li>
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* T2: ORDERS RECEIVED */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Pedidos de Encomenda enviados ({orders.length})</h3>

                <div className="space-y-4">
                  {orders.map(order => {
                    const artistObj = artists.find(a => a.id === order.artistId);
                    return (
                      <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 hover:border-neutral-700 transition-colors">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                                {order.portraitType}
                              </h4>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                Artista: <span className="text-amber-500 font-semibold">{artistObj?.artisticName || "Retratista"}</span> • ID: {order.id}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full text-center ${
                            order.status === "completed"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : order.status === "accepted"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : order.status === "declined"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {order.status === "pending" && "Pendente / Em Revisão"}
                            {order.status === "accepted" && "Aceite pelo Artista"}
                            {order.status === "declined" && "Recusado"}
                            {order.status === "completed" && "Concluído / Entregue"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8 space-y-3 text-xs">
                            <p className="text-neutral-300">
                              <strong className="text-neutral-400 uppercase tracking-wider text-[9px] block">Descrição do Retrato:</strong>
                              {order.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div className="space-y-0.5">
                                <span className="text-neutral-500 uppercase text-[9px] block">Prazo de Entrega:</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                  <Calendar size={12} className="text-amber-500" />
                                  {new Date(order.deadline).toLocaleDateString()}
                                </span>
                              </div>
                              {order.budget && (
                                <div className="space-y-0.5">
                                  <span className="text-neutral-500 uppercase text-[9px] block">Orçamento Máximo:</span>
                                  <span className="text-amber-500 font-bold font-mono">
                                    {order.budget.toLocaleString("pt-MZ")} MZN
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-4 flex flex-col justify-between items-end">
                            <div className="space-y-1 w-full text-right">
                              <span className="text-neutral-500 uppercase text-[9px] block">Foto de Referência:</span>
                              {order.referencePhotoUrl ? (
                                <img
                                  src={order.referencePhotoUrl}
                                  alt="Referência de retrato"
                                  className="w-24 h-24 rounded-xl object-cover border border-neutral-800 ml-auto"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-[10px]">
                                  Sem foto
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {orders.length === 0 && (
                    <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500">
                      <p className="text-xs italic">Não possui nenhum pedido de retrato ativo ou enviado.</p>
                      <button
                        onClick={() => onNavigate("search")}
                        className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Fazer Minha Primeira Encomenda
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T3: CHAT FOR CLIENT */}
            {activeTab === "chat" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[550px]">
                
                {/* Inbox Left Sidebar for Chat threads */}
                <div className="md:col-span-4 border-r border-neutral-800 flex flex-col">
                  <div className="p-4 border-b border-neutral-800 bg-neutral-950/60">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Artistas Contactados</h4>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(c => {
                      const isActive = c.id === selectedConvId;
                      const artObj = artists.find(a => a.id === c.artistId);
                      return (
                        <button
                          key={c.id}
                          id={`client-conv-btn-${c.id}`}
                          onClick={() => setSelectedConvId(c.id)}
                          className={`w-full text-left p-4 border-b border-neutral-800/50 flex items-center justify-between transition-all ${
                            isActive ? "bg-amber-500/10 text-white" : "hover:bg-neutral-800/40 text-neutral-300"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate block">
                                {artObj?.artisticName || "Artista Retratista"}
                              </span>
                              {c.unreadCountVisitor > 0 && (
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{c.lastMessageText}</p>
                          </div>
                          <ArrowRight size={12} className="text-neutral-600 flex-shrink-0 ml-2" />
                        </button>
                      );
                    })}

                    {conversations.length === 0 && (
                      <div className="p-6 text-center text-neutral-500">
                        <p className="text-xs italic">Nenhuma conversa de chat ativa com artistas.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Area Chat Frame */}
                <div className="md:col-span-8 flex flex-col bg-neutral-950/40 justify-between">
                  {selectedConvId && activeConv ? (
                    <>
                      {/* Active header */}
                      <div className="p-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activeArtist && activeArtist.avatarUrl ? (
                            <img
                              src={activeArtist.avatarUrl}
                              alt={activeArtist.artisticName}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 font-bold text-xs uppercase font-serif">
                              {activeArtist?.artisticName.substring(0, 2) || "AR"}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-white">{activeArtist?.artisticName || "Artista"}</h4>
                            <span className="text-[8px] text-neutral-500 uppercase block font-mono">
                              Anos de Experiência: {activeArtist?.experienceYears} Anos
                            </span>
                          </div>
                        </div>

                        {activeArtist && (
                          <button
                            onClick={() => onNavigate("profile", activeArtist.id)}
                            className="p-1.5 text-neutral-400 hover:text-amber-500 border border-neutral-800 hover:border-amber-500/40 rounded-lg text-[10px] transition-all flex items-center gap-1"
                          >
                            <span>Ver Perfil</span>
                            <ExternalLink size={10} />
                          </button>
                        )}
                      </div>

                      {/* Messages list flow */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
                        {chatMessages.map(m => {
                          const isMe = m.senderId === "visitor";
                          return (
                            <div
                              key={m.id}
                              className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? "bg-amber-500 text-neutral-950 self-end rounded-tr-none"
                                  : "bg-neutral-800 text-white self-start rounded-tl-none border border-neutral-700/50"
                              }`}
                            >
                              <p>{m.text}</p>
                              <span className={`text-[8px] block text-right mt-1 font-mono ${
                                isMe ? "text-neutral-900/60" : "text-neutral-500"
                              }`}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Msg Input Form */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex gap-2">
                        <input
                          type="text"
                          required
                          value={newMsgText}
                          onChange={(e) => setNewMsgText(e.target.value)}
                          placeholder="Escreva a sua resposta para o artista..."
                          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-3 rounded-xl transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                      <MessageSquare size={36} className="opacity-20 mb-2" />
                      <p className="text-xs italic">Selecione um contacto de chat ao lado para conversar.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* T4: CLIENT SETTINGS */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">Definições da Conta</h3>

                {settingsSuccessMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2">
                    <Check size={16} />
                    <span>{settingsSuccessMsg}</span>
                  </div>
                )}

                {/* Profile Picture local upload */}
                <div className="bg-neutral-950/40 p-5 border border-neutral-800 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wide">
                    {language === "pt" ? "Foto de Perfil (Ficheiro Local)" : "Profile Picture (Local File)"}
                  </label>
                  
                  <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="relative">
                      {clientAvatar ? (
                        <img 
                          src={clientAvatar} 
                          alt="Avatar" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-neutral-800 bg-neutral-900 shadow-lg" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 font-bold text-xl uppercase font-serif">
                          {clientDisplayName ? clientDisplayName.substring(0, 2) : "CL"}
                        </div>
                      )}
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          if (!file.type.startsWith("image/")) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const compressed = await compressImage(reader.result as string);
                            setClientAvatar(compressed);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                        isDragging
                          ? "border-amber-500 bg-amber-500/10 text-white"
                          : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/20 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      <input
                        type="file"
                        id="client-avatar-file-input"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const compressed = await compressImage(reader.result as string);
                              setClientAvatar(compressed);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="client-avatar-file-input" className="cursor-pointer block space-y-1">
                        <span className="text-xs font-bold block">
                          {language === "pt" ? "Arraste uma foto aqui ou clique para selecionar" : "Drag a photo here or click to select"}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          PNG, JPG, JPEG ou WEBP (Max. 5MB)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={clientDisplayName}
                      onChange={(e) => setClientDisplayName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Endereço de Email</label>
                    <input
                      type="email"
                      required
                      value={clientEmailAddress}
                      onChange={(e) => setClientEmailAddress(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-800/60">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Guardar Alterações
                  </button>
                </div>
              </form>
            )}

            {/* T5: NOTIFICATIONS PAGE */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Bell className="text-amber-500" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {language === "pt" ? "Página de Notificações" : "Notifications Page"}
                    </h3>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        DBManager.markAllNotificationsAsRead(userId);
                        setNotifications(DBManager.getNotifications(userId));
                      }}
                      className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1.5"
                    >
                      <Check size={12} />
                      <span>{language === "pt" ? "Marcar todas como lidas" : "Mark all as read"}</span>
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 space-y-2">
                    <Bell className="mx-auto text-neutral-700 mb-2 opacity-30" size={40} />
                    <p className="text-xs font-bold text-neutral-300">
                      {language === "pt" ? "Nenhuma notificação por agora" : "No notifications for now"}
                    </p>
                    <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                      {language === "pt"
                        ? "Quando os artistas que você segue alterarem informações do perfil ou publicarem novas obras, elas aparecerão aqui!"
                        : "When artists you follow update their profile or publish new artworks, they will appear here!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (isUnread) {
                              DBManager.markNotificationAsRead(notif.id);
                              setNotifications(DBManager.getNotifications(userId));
                            }
                          }}
                          className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                            isUnread
                              ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 shadow-sm"
                              : "bg-neutral-900 border-neutral-800 hover:border-neutral-700/60"
                          }`}
                        >
                          {/* Unread indicator dot */}
                          {isUnread && (
                            <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}

                          {/* Icon Accent */}
                          <div className={`p-3 rounded-xl flex-shrink-0 ${
                            notif.type === "artwork" 
                              ? "bg-amber-500/10 text-amber-500" 
                              : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {notif.type === "artwork" ? <Paintbrush size={18} /> : <User size={18} />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                                {notif.type === "artwork" 
                                  ? (language === "pt" ? "Nova Obra de Arte" : "New Artwork") 
                                  : (language === "pt" ? "Perfil Atualizado" : "Profile Updated")}
                              </span>
                              <span className="text-neutral-600">•</span>
                              <span className="text-[10px] font-mono text-neutral-500">
                                {new Date(notif.createdAt).toLocaleDateString(language === "pt" ? "pt-MZ" : "en-US", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                              {notif.description}
                            </p>

                            {/* Actions */}
                            {notif.relatedId && (
                              <div className="pt-2 flex items-center gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isUnread) {
                                      DBManager.markNotificationAsRead(notif.id);
                                    }
                                    onNavigate("profile", notif.relatedId);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <span>{language === "pt" ? "Ver Perfil do Artista" : "View Artist Profile"}</span>
                                  <ArrowRight size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
