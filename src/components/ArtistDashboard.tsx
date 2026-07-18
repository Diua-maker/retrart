import React, { useState, useEffect } from "react";
import { Artist, Artwork, Order, ChatConversation, ChatMessage, Language, translations } from "../types";
import { DBManager } from "../lib/db";
import { compressImage } from "../lib/imageCompressor";
import {
  BarChart3,
  User,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Heart,
  Users,
  Check,
  X,
  Send,
  MessageCircle,
  TrendingUp,
  MapPin,
  Camera,
  Star,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  UserX
} from "lucide-react";

interface ArtistDashboardProps {
  artistId: string;
  language: Language;
  onNavigate: (view: "home" | "search" | "profile" | "dashboard" | "admin" | "map", id?: string) => void;
  onUserUpdate?: (user: { id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string }) => void;
}

type TabType = "stats" | "profile" | "portfolio" | "orders" | "chat" | "settings";

export default function ArtistDashboard({ artistId, language, onNavigate, onUserUpdate }: ArtistDashboardProps) {
  const t = translations[language];

  // Primary state loaded from DB
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Load state on mount/change
  useEffect(() => {
    const artObj = DBManager.getArtists().find(a => a.id === artistId);
    if (artObj) {
      setArtist(artObj);
      setArtworks(DBManager.getArtworks().filter(aw => aw.artistId === artistId));
      setOrders(DBManager.getOrders(artistId));
      setConversations(DBManager.getConversations(artistId));
    }
  }, [artistId, activeTab]);

  // Tab 1: Profile Editing States
  const [editArtisticName, setEditArtisticName] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editProvince, setEditProvince] = useState("Maputo Cidade");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const [editExperienceYears, setEditExperienceYears] = useState(0);
  const [editSpecialties, setEditSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (artist) {
      setEditArtisticName(artist.artisticName);
      setEditFullName(artist.fullName || "");
      setEditBio(artist.bio);
      setEditCity(artist.location.city);
      setEditProvince(artist.location.province);
      setEditWhatsapp(artist.whatsapp);
      setEditInstagram(artist.socials.instagram || "");
      setEditFacebook(artist.socials.facebook || "");
      setEditAvatarUrl(artist.avatarUrl);
      setTempAvatarUrl(artist.avatarUrl);
      setEditCoverUrl(artist.coverUrl);
      setEditExperienceYears(artist.experienceYears);
      setEditSpecialties(artist.specialties);
    }
  }, [artist]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    const updated = DBManager.updateArtistProfile(artistId, {
      artisticName: editArtisticName,
      fullName: editFullName,
      bio: editBio,
      location: { city: editCity, province: editProvince },
      whatsapp: editWhatsapp,
      socials: { instagram: editInstagram, facebook: editFacebook },
      avatarUrl: editAvatarUrl,
      coverUrl: editCoverUrl,
      experienceYears: Number(editExperienceYears),
      specialties: editSpecialties
    });

    if (updated) {
      setArtist(updated);
      setProfileSuccessMsg(language === "pt" ? "Perfil atualizado com sucesso!" : "Profile updated successfully!");
      if (onUserUpdate) {
        onUserUpdate({
          id: artistId,
          role: "artist",
          name: editArtisticName,
          avatarUrl: editAvatarUrl
        });
      }
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !editSpecialties.includes(newSpecialty.trim())) {
      setEditSpecialties([...editSpecialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (spec: string) => {
    setEditSpecialties(editSpecialties.filter(s => s !== spec));
  };


  // Tab 2: Portfolio Work Management States
  const [isPublishing, setIsPublishing] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubDesc, setPubDesc] = useState("");
  const [pubTechnique, setPubTechnique] = useState("Grafite");
  const [pubStyle, setPubStyle] = useState("Hiperrealismo");
  const [pubDimensions, setPubDimensions] = useState("A3 (29.7 x 42 cm)");
  const [pubAvailability, setPubAvailability] = useState<Artwork["availability"]>("available");
  const [pubPrice, setPubPrice] = useState("");
  const [pubImageUrls, setPubImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);

  // Reorder Image Array (Move Up/Down)
  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const updated = [...pubImageUrls];
    if (direction === "up" && index > 0) {
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
    } else if (direction === "down" && index < updated.length - 1) {
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
    }
    setPubImageUrls(updated);
  };

  const handleAddImageToWork = () => {
    if (newImageUrl.trim() && !pubImageUrls.includes(newImageUrl.trim())) {
      setPubImageUrls([...pubImageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImageFromWork = (index: number) => {
    if (pubImageUrls.length > 1) {
      setPubImageUrls(pubImageUrls.filter((_, idx) => idx !== index));
    }
  };

  const handlePublishArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    if (editingWorkId) {
      // Edit mode
      DBManager.updateArtwork(editingWorkId, {
        title: pubTitle,
        description: pubDesc,
        technique: pubTechnique,
        style: pubStyle,
        dimensions: pubDimensions,
        availability: pubAvailability,
        price: pubPrice ? Number(pubPrice) : undefined,
        imageUrls: pubImageUrls
      });
    } else {
      // Publish new mode
      DBManager.addArtwork({
        artistId: artist.id,
        artistName: artist.artisticName,
        artistAvatar: artist.avatarUrl,
        title: pubTitle,
        description: pubDesc,
        technique: pubTechnique,
        style: pubStyle,
        dimensions: pubDimensions,
        availability: pubAvailability,
        price: pubPrice ? Number(pubPrice) : undefined,
        imageUrls: pubImageUrls,
        isFeatured: false,
        createdAt: new Date().toISOString()
      });
    }

    // Reset Form
    setIsPublishing(false);
    setEditingWorkId(null);
    setPubTitle("");
    setPubDesc("");
    setPubPrice("");
    setPubImageUrls(["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"]);
    // Reload artworks list
    setArtworks(DBManager.getArtworks().filter(aw => aw.artistId === artistId));
  };

  const handleEditArtworkClick = (aw: Artwork) => {
    setEditingWorkId(aw.id);
    setPubTitle(aw.title);
    setPubDesc(aw.description);
    setPubTechnique(aw.technique);
    setPubStyle(aw.style);
    setPubDimensions(aw.dimensions);
    setPubAvailability(aw.availability);
    setPubPrice(aw.price ? String(aw.price) : "");
    setPubImageUrls(aw.imageUrls);
    setIsPublishing(true);
  };

  const handleDeleteArtwork = (awId: string) => {
    if (confirm(language === "pt" ? "Tem a certeza que deseja eliminar esta obra do seu portfólio?" : "Are you sure you want to delete this artwork from your portfolio?")) {
      DBManager.deleteArtwork(awId);
      setArtworks(artworks.filter(a => a.id !== awId));
    }
  };


  // Tab 3: Order Management
  const handleUpdateOrderStatus = (id: string, status: Order["status"]) => {
    DBManager.updateOrderStatus(id, status);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));

    // Send visual notification
    const order = orders.find(o => o.id === id);
    if (order) {
      // In a real app we notify the client, here we can log or show notification
    }
  };


  // Tab 4: Chats & Messaging
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState("");

  const activeConv = conversations.find(c => c.id === selectedConvId);

  useEffect(() => {
    if (selectedConvId) {
      setChatMessages(DBManager.getMessages(selectedConvId));
      DBManager.markChatAsRead(selectedConvId, "artist");
    }
  }, [selectedConvId]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !newMsgText.trim() || !artist) return;

    const conv = conversations.find(c => c.id === selectedConvId);
    if (!conv) return;

    // Send Message
    const msg = DBManager.sendChatMessage(
      selectedConvId,
      artist.id,
      conv.visitorName,
      conv.visitorContact,
      artist.id,
      artist.artisticName,
      newMsgText.trim()
    );

    setChatMessages([...chatMessages, msg]);
    setNewMsgText("");

    // Simulate smart auto-reply from client after 3 seconds for demonstration!
    setTimeout(() => {
      const reply = DBManager.sendChatMessage(
        selectedConvId,
        artist.id,
        conv.visitorName,
        conv.visitorContact,
        "visitor",
        conv.visitorName,
        language === "pt"
          ? `Perfeito, Sr. ${artist.artisticName}! Obrigado pelo retorno rápido. Vou aguardar pelas novidades!`
          : `Perfect, Mr. ${artist.artisticName}! Thank you for the quick reply. I will look forward to hearing from you!`
      );
      if (selectedConvId === conv.id) {
        setChatMessages(prev => [...prev, reply]);
      }
    }, 4000);
  };


  // Tab 5: Account Settings
  const [settEmail, setSettEmail] = useState(artist?.email || "coana@retratistas.co.mz");
  const [settPass, setSettPass] = useState("********");
  const [settingSuccess, setSettingSuccess] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingSuccess(language === "pt" ? "Definições de segurança salvas!" : "Security settings saved!");
    setTimeout(() => setSettingSuccess(null), 3000);
  };

  const handleDeactivate = () => {
    if (confirm(language === "pt" ? "Deseja realmente desativar o seu perfil? Esta ação é irreversível." : "Do you really want to deactivate your profile? This action is irreversible.")) {
      DBManager.adminRemoveArtist(artistId);
      alert(language === "pt" ? "Perfil desativado!" : "Profile deactivated!");
      onNavigate("home");
      window.location.reload();
    }
  };


  if (!artist) {
    return (
      <div className="text-center py-24 text-white bg-neutral-950 min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dashboard calculations
  const mostPopularArtwork = artworks.length > 0
    ? artworks.reduce((prev, current) => (prev.likesCount > current.likesCount) ? prev : current)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      
      {/* Cover and Avatar Layout Header */}
      <div className="relative border-b border-neutral-800 bg-neutral-950">
        {/* Background Cover Image container */}
        <div className="absolute inset-0 h-48 md:h-64 overflow-hidden">
              {artist.coverUrl ? (
                <img src={artist.coverUrl} alt="Capa" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-neutral-800" />
              )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>
        
        {/* Profile Content: positioned relatively so it flows in document order and pushes content below! */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-36 pb-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:items-end text-center md:text-left">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => setAvatarModalOpen(true)}
              title={language === "pt" ? "Clique para alterar a foto" : "Click to change photo"}
            >
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={artist.artisticName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-neutral-950 bg-neutral-900 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-800 border-4 border-neutral-950 flex items-center justify-center text-neutral-500 font-bold text-3xl uppercase font-serif">
                  {artist.artisticName.substring(0, 2)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center group-hover:opacity-100 opacity-100 md:opacity-0 transition-opacity">
                <Camera size={20} className="text-amber-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className="text-xl md:text-3xl font-bold font-sans tracking-tight text-white shadow-sm">
                  {artist.artisticName}
                </h1>
                {artist.isVerified && (
                  <span className="bg-amber-500 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" title="Artista Verificado Oficial">
                    ★ {language === "pt" ? "Verificado" : "Verified"}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-neutral-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <MapPin size={12} className="text-amber-500" />
                {artist.location.city}, {artist.location.province}
              </p>
            </div>
          </div>

          <button
            id="go-profile-public"
            onClick={() => onNavigate("profile", artist.id)}
            className="px-5 py-2.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-xs font-bold transition-all flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-sm self-stretch md:self-auto justify-center cursor-pointer"
          >
            <Eye size={14} />
            {language === "pt" ? "Visualizar Perfil Público" : "View Public Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Navigation Links Dashboard */}
          <div className="lg:col-span-3 space-y-2">
            <button
              id="tab-stats"
              onClick={() => setActiveTab("stats")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "stats"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <BarChart3 size={16} />
              <span>{language === "pt" ? "Estatísticas" : "Analytics"}</span>
            </button>

            <button
              id="tab-profile"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "profile"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <User size={16} />
              <span>{language === "pt" ? "Editar Perfil" : "Edit Profile"}</span>
            </button>

            <button
              id="tab-portfolio"
              onClick={() => setActiveTab("portfolio")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "portfolio"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <ImageIcon size={16} />
              <span>{t.portfolio}</span>
            </button>

            <button
              id="tab-orders"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "orders"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={16} />
                <span>{t.orders}</span>
              </div>
              {orders.filter(o => o.status === "pending").length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === "orders" ? "bg-neutral-950 text-amber-500 font-extrabold" : "bg-amber-500 text-neutral-950"
                }`}>
                  {orders.filter(o => o.status === "pending").length}
                </span>
              )}
            </button>

            <button
              id="tab-chat"
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "chat"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={16} />
                <span>{t.chat}</span>
              </div>
              {conversations.filter(c => c.unreadCountArtist > 0).length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === "chat" ? "bg-neutral-950 text-amber-500 font-extrabold" : "bg-amber-500 text-neutral-950"
                }`}>
                  {conversations.filter(c => c.unreadCountArtist > 0).length}
                </span>
              )}
            </button>

            <button
              id="tab-settings"
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-left transition-all ${
                activeTab === "settings"
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              }`}
            >
              <Settings size={16} />
              <span>{t.settings}</span>
            </button>
          </div>

          {/* Right Side Content Display */}
          <div className="lg:col-span-9">
            
            {/* T1: STATS / ANALYTICS */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t.views}</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-white">{artist.stats.viewsCount}</h3>
                    <Eye size={36} className="absolute right-3 bottom-3 text-neutral-800/60" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t.likes}</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-amber-500">{artist.stats.likesCount}</h3>
                    <Heart size={36} className="absolute right-3 bottom-3 text-neutral-800/60 fill-neutral-850" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t.followers}</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-white">{artist.stats.followersCount}</h3>
                    <Users size={36} className="absolute right-3 bottom-3 text-neutral-800/60" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Cliques WhatsApp</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-green-500">{artist.stats.whatsappClicks}</h3>
                    <MessageCircle size={36} className="absolute right-3 bottom-3 text-neutral-800/60" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{language === "pt" ? "Total de Obras" : "Total Artworks"}</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-white">{artworks.length}</h3>
                    <ImageIcon size={36} className="absolute right-3 bottom-3 text-neutral-800/60" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Classificação Média</p>
                    <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-2 text-amber-500 flex items-center gap-1">
                      {artist.ratingAverage} <Star size={18} className="fill-amber-500 text-amber-500 inline" />
                    </h3>
                  </div>

                </div>

                {/* Popular Artwork Showcase */}
                {mostPopularArtwork ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                    <img
                      src={mostPopularArtwork.imageUrls[0]}
                      alt={mostPopularArtwork.title}
                      className="w-32 h-32 rounded-xl object-cover border border-neutral-800 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-amber-500 font-mono font-bold uppercase">
                        <TrendingUp size={12} />
                        <span>Obra Mais Popular / Most Popular</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1 truncate">{mostPopularArtwork.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1 truncate">{mostPopularArtwork.technique} • {mostPopularArtwork.style}</p>
                      <div className="flex gap-4 mt-4 text-xs font-mono text-neutral-400">
                        <span className="flex items-center gap-1"><Heart size={12} className="text-amber-500 fill-amber-500" /> {mostPopularArtwork.likesCount} Adoros</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {mostPopularArtwork.viewsCount} Cliques</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500">
                    <p className="text-xs italic">{language === "pt" ? "Publique a sua primeira obra para ver dados de destaque!" : "Publish your first artwork to see highlight data!"}</p>
                  </div>
                )}
              </div>
            )}


            {/* T2: EDIT PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                
                {profileSuccessMsg && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-xl flex items-center gap-2">
                    <Check size={16} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Nome Artístico</label>
                    <input
                      type="text"
                      required
                      value={editArtisticName}
                      onChange={(e) => setEditArtisticName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Nome Completo (Opcional)</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Cidade</label>
                    <input
                      type="text"
                      required
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Província</label>
                    <select
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="Maputo Cidade">Maputo Cidade</option>
                      <option value="Maputo Província">Maputo Província</option>
                      <option value="Gaza">Gaza</option>
                      <option value="Inhambane">Inhambane</option>
                      <option value="Sofala">Sofala</option>
                      <option value="Manica">Manica</option>
                      <option value="Tete">Tete</option>
                      <option value="Zambézia">Zambézia</option>
                      <option value="Nampula">Nampula</option>
                      <option value="Cabo Delgado">Cabo Delgado</option>
                      <option value="Niassa">Niassa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Biografia</label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl p-4 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Anos de Experiência</label>
                    <input
                      type="number"
                      value={editExperienceYears}
                      onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Contacto WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                      placeholder="Ex: +258841234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">
                      {language === "pt" ? "Foto de Perfil (Ficheiro JPG, PNG, JPEG)" : "Profile Photo (JPG, PNG, JPEG File)"}
                    </label>
                    <div className="flex items-center gap-3">
                      {editAvatarUrl && (
                        <img 
                          src={editAvatarUrl} 
                          alt="Previsualização" 
                          className="w-11 h-11 rounded-full object-cover border-2 border-neutral-800 bg-neutral-950 flex-shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const compressed = await compressImage(reader.result as string);
                              setEditAvatarUrl(compressed);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-amber-500 hover:file:bg-neutral-750 file:cursor-pointer cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Foto de Capa (Cover URL)</label>
                    <input
                      type="url"
                      value={editCoverUrl}
                      onChange={(e) => setEditCoverUrl(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Nome Instagram (Opcional)</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      placeholder="Ex: @seu_instagram"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Página Facebook (Opcional)</label>
                    <input
                      type="text"
                      value={editFacebook}
                      onChange={(e) => setEditFacebook(e.target.value)}
                      placeholder="Ex: facebook.com/sua_pagina"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                {/* Specialties Tags manager */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wide">Especialidades Artísticas</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editSpecialties.map(spec => (
                      <span key={spec} className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {spec}
                        <button type="button" onClick={() => handleRemoveSpecialty(spec)} className="text-amber-500 hover:text-white font-bold font-mono">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-specialty-input"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Ex: Grafite, Hiperrealismo, Lápis Pastel"
                      className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-2.5 outline-none"
                    />
                    <button
                      type="button"
                      id="add-specialty-btn"
                      onClick={handleAddSpecialty}
                      className="bg-neutral-800 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex justify-end">
                  <button
                    type="submit"
                    id="save-profile-btn"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all"
                  >
                    Guardar Alterações
                  </button>
                </div>
              </form>
            )}


            {/* T3: MANAGING PORTFOLIO */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                
                {/* Switch view if publishing / editing */}
                {isPublishing ? (
                  <form onSubmit={handlePublishArtwork} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        {editingWorkId ? "Editar Obra de Arte" : "Publicar Nova Obra de Arte"}
                      </h3>
                      <button
                        type="button"
                        id="cancel-publish-btn"
                        onClick={() => { setIsPublishing(false); setEditingWorkId(null); }}
                        className="text-xs text-neutral-400 hover:text-white"
                      >
                        {t.cancel}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Título da Obra *</label>
                        <input
                          type="text"
                          required
                          value={pubTitle}
                          onChange={(e) => setPubTitle(e.target.value)}
                          placeholder="Ex: Olhar de Esperança"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Técnica Usada *</label>
                        <select
                          value={pubTechnique}
                          onChange={(e) => setPubTechnique(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        >
                          <option value="Grafite">Grafite (Graphite)</option>
                          <option value="Carvão">Carvão (Charcoal)</option>
                          <option value="Óleo sobre Tela">Óleo sobre Tela (Oil Canvas)</option>
                          <option value="Acrílico">Acrílico (Acrylic)</option>
                          <option value="Aguarela">Aguarela (Watercolor)</option>
                          <option value="Lápis de Cor">Lápis de Cor (Colored Pencil)</option>
                          <option value="Pastel Seco">Pastel Seco (Soft Pastel)</option>
                          <option value="Digital">Arte Digital (Digital)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Descrição / História da Obra *</label>
                      <textarea
                        required
                        rows={3}
                        value={pubDesc}
                        onChange={(e) => setPubDesc(e.target.value)}
                        placeholder="Descreva a obra, o papel usado, o conceito ou a história por trás..."
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl p-4 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Estilo Artístico *</label>
                        <select
                          value={pubStyle}
                          onChange={(e) => setPubStyle(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        >
                          <option value="Hiperrealismo">Hiperrealismo</option>
                          <option value="Realismo">Realismo</option>
                          <option value="Impressionismo">Impressionismo</option>
                          <option value="Surrealismo">Surrealismo</option>
                          <option value="Pop Art">Pop Art</option>
                          <option value="Digital Art">Digital Art</option>
                          <option value="Afrofuturismo">Afrofuturismo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Dimensões *</label>
                        <input
                          type="text"
                          required
                          value={pubDimensions}
                          onChange={(e) => setPubDimensions(e.target.value)}
                          placeholder="Ex: A3 (29.7 x 42 cm)"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Disponibilidade *</label>
                        <select
                          value={pubAvailability}
                          onChange={(e) => setPubAvailability(e.target.value as Artwork["availability"])}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        >
                          <option value="available">Disponível para Venda</option>
                          <option value="commissionOnly">Apenas Encomendas</option>
                          <option value="sold">Vendido / Coleção Privada</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Preço Opcional (MZN)</label>
                        <input
                          type="number"
                          value={pubPrice}
                          onChange={(e) => setPubPrice(e.target.value)}
                          placeholder="Ex: 12000"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                    </div>

                    {/* Image Organizer section (multiple photos drag/reorder layout) */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wide">
                        Imagens da Obra (Organize a sequência)
                      </label>
                      <div className="space-y-3 mb-4">
                        {pubImageUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                            <img src={url} alt="" className="w-12 h-12 rounded object-cover border border-neutral-800 flex-shrink-0" referrerPolicy="no-referrer" />
                            <span className="text-[10px] text-neutral-500 font-mono flex-1 truncate">{url}</span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, "up")}
                                className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-30 text-amber-500"
                                title="Mover para cima"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === pubImageUrls.length - 1}
                                onClick={() => handleMoveImage(idx, "down")}
                                className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-30 text-amber-500"
                                title="Mover para baixo"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={pubImageUrls.length <= 1}
                                onClick={() => handleRemoveImageFromWork(idx)}
                                className="p-1.5 hover:bg-neutral-800 rounded text-red-500 disabled:opacity-30"
                                title="Remover"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          id="new-image-url-input"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Adicione um link de imagem (Ex: de Unsplash)"
                          className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-2.5 outline-none"
                        />
                        <button
                          type="button"
                          id="add-image-url-btn"
                          onClick={handleAddImageToWork}
                          className="bg-neutral-800 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          Inserir Link
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        id="form-cancel-btn"
                        onClick={() => { setIsPublishing(false); setEditingWorkId(null); }}
                        className="px-5 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 text-xs font-bold transition-all"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        id="form-submit-btn"
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all"
                      >
                        {editingWorkId ? "Atualizar Obra" : "Publicar Obra"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {/* Artworks List Grid */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Obras no seu Portfólio ({artworks.length})</h3>
                      <button
                        id="publish-new-btn"
                        onClick={() => setIsPublishing(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Adicionar Obra</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {artworks.map(aw => (
                        <div key={aw.id} id={`artwork-dash-item-${aw.id}`} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-4 hover:border-neutral-700 transition-colors">
                          <img
                            src={aw.imageUrls[0]}
                            alt={aw.title}
                            className="w-20 h-20 rounded-xl object-cover border border-neutral-800 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white truncate">{aw.title}</h4>
                              <p className="text-[10px] text-neutral-400 truncate">{aw.technique} • {aw.style}</p>
                              <div className="flex gap-3 text-[10px] font-mono text-neutral-500 mt-1">
                                <span>{aw.likesCount} ❤️</span>
                                <span>{aw.viewsCount} 👁️</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                id={`edit-artwork-${aw.id}`}
                                onClick={() => handleEditArtworkClick(aw)}
                                className="text-[10px] font-bold text-amber-500 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Edit2 size={10} /> Editar
                              </button>
                              <button
                                id={`delete-artwork-${aw.id}`}
                                onClick={() => handleDeleteArtwork(aw.id)}
                                className="text-[10px] font-bold text-red-500 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                <Trash2 size={10} /> Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {artworks.length === 0 && (
                        <div className="col-span-2 text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800/60 text-neutral-500">
                          <p className="text-xs italic">Nenhuma obra cadastrada no seu portfólio. Clique no botão de adicionar acima para começar!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* T4: ORDERS COMMISSION MANAGER */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de Encomendas de Retratos ({orders.length})</h3>

                <div className="space-y-4">
                  {orders.map(o => (
                    <div
                      key={o.id}
                      id={`order-manager-item-${o.id}`}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{o.clientName}</span>
                            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              o.status === "pending"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : o.status === "accepted"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : o.status === "completed"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {o.status === "pending" ? t.pending : o.status === "accepted" ? t.accepted : o.status === "completed" ? t.completed : t.declined}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Contacto: {o.clientContact} • Enviado em: {new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>

                        {o.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              id={`decline-order-${o.id}`}
                              onClick={() => handleUpdateOrderStatus(o.id, "declined")}
                              className="px-3 py-1.5 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Recusar
                            </button>
                            <button
                              id={`accept-order-${o.id}`}
                              onClick={() => handleUpdateOrderStatus(o.id, "accepted")}
                              className="px-3 py-1.5 bg-amber-500 text-neutral-950 rounded-lg text-[10px] font-bold transition-all"
                            >
                              Aceitar e Iniciar
                            </button>
                          </div>
                        )}

                        {o.status === "accepted" && (
                          <button
                            id={`complete-order-${o.id}`}
                            onClick={() => handleUpdateOrderStatus(o.id, "completed")}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-neutral-950 rounded-lg text-[10px] font-bold transition-all"
                          >
                            Marcar como Concluído
                          </button>
                        )}
                      </div>

                      <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-2">
                          <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Tipo de Retrato:</strong> {o.portraitType}</p>
                          <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Descrição:</strong> {o.description}</p>
                          <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Prazo Desejado:</strong> {o.deadline}</p>
                          {o.budget && <p className="text-xs text-neutral-400"><strong className="text-neutral-200">Orçamento:</strong> {o.budget.toLocaleString()} MZN</p>}
                        </div>

                        {/* Reference Photo thumbnail display */}
                        <div className="flex flex-col items-center justify-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase mb-2">Imagem de Referência</span>
                          {o.referencePhotoUrl ? (
                            <img
                              src={o.referencePhotoUrl}
                              alt="Referência"
                              className="w-16 h-16 rounded object-cover border border-neutral-800"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 text-[10px]">
                              Sem foto
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500">
                      <p className="text-xs italic">Nenhum pedido de encomenda recebido até ao momento.</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* T5: CHAT SYSTEM */}
            {activeTab === "chat" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[550px]">
                
                {/* Inbox Left List */}
                <div className="md:col-span-4 border-r border-neutral-800 flex flex-col">
                  <div className="p-4 border-b border-neutral-800 bg-neutral-950/60">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Conversas</h4>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(c => {
                      const isActive = c.id === selectedConvId;
                      return (
                        <button
                          key={c.id}
                          id={`conv-btn-${c.id}`}
                          onClick={() => setSelectedConvId(c.id)}
                          className={`w-full text-left p-4 border-b border-neutral-800/50 flex items-center justify-between transition-all ${
                            isActive ? "bg-amber-500/10 text-white" : "hover:bg-neutral-800/40 text-neutral-300"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate block">{c.visitorName}</span>
                              {c.unreadCountArtist > 0 && (
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
                      <p className="text-xs text-neutral-500 italic p-6 text-center">Nenhuma conversa ativa.</p>
                    )}
                  </div>
                </div>

                {/* Chat window Right */}
                <div className="md:col-span-8 flex flex-col bg-neutral-950/40 justify-between">
                  {selectedConvId && activeConv ? (
                    <>
                      {/* Active header */}
                      <div className="p-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">{activeConv.visitorName}</h4>
                          <span className="text-[9px] text-neutral-500 font-mono">Contacto: {activeConv.visitorContact}</span>
                        </div>
                      </div>

                      {/* Messages Flow */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col">
                        {chatMessages.map(m => {
                          const isMe = m.senderId === artistId;
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

                      {/* Chat Input */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex gap-2">
                        <input
                          type="text"
                          id="chat-reply-input"
                          required
                          value={newMsgText}
                          onChange={(e) => setNewMsgText(e.target.value)}
                          placeholder="Escreva a sua resposta..."
                          className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                        />
                        <button
                          type="submit"
                          id="chat-send-btn"
                          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-3 rounded-xl transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                      <MessageSquare size={36} className="opacity-20 mb-2" />
                      <p className="text-xs italic">Selecione uma conversa ao lado para responder aos seus clientes.</p>
                    </div>
                  )}
                </div>

              </div>
            )}


            {/* T6: SETTINGS & ACCOUNT CONFIGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                
                <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-neutral-800">Definições da Conta</h3>

                  {settingSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2">
                      <Check size={16} />
                      <span>{settingSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Endereço de Email</label>
                      <input
                        type="email"
                        required
                        value={settEmail}
                        onChange={(e) => setSettEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1 uppercase tracking-wide">Nova Palavra-passe</label>
                      <input
                        type="password"
                        required
                        value={settPass}
                        onChange={(e) => setSettPass(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex justify-end">
                    <button
                      type="submit"
                      id="save-settings-btn"
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-bold transition-all"
                    >
                      Atualizar Definições
                    </button>
                  </div>
                </form>

                {/* Deactivate account */}
                <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Zona de Perigo</h4>
                  <p className="text-xs text-neutral-400 mb-4">Ao desativar a sua conta, o seu perfil e todas as suas obras de arte publicadas serão permanentemente removidos da plataforma RetrArt Moz.</p>
                  <button
                    id="deactivate-account-btn"
                    onClick={handleDeactivate}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <UserX size={14} />
                    <span>Desativar Minha Conta Artística</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Change Avatar Modal Popup */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              id="close-avatar-modal"
              onClick={() => setAvatarModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Camera size={18} className="text-amber-500" />
              <span>{language === "pt" ? "Carregar Foto de Perfil" : "Upload Profile Photo"}</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              {language === "pt"
                ? "Selecione ou arraste um arquivo de imagem (JPG, PNG ou JPEG) do seu aparelho."
                : "Select or drag an image file (JPG, PNG or JPEG) from your device."}
            </p>

            <div className="space-y-4">
              {/* Drag and Drop Zone */}
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
                      setTempAvatarUrl(compressed);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <input
                  type="file"
                  id="modal-avatar-file-input"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const compressed = await compressImage(reader.result as string);
                        setTempAvatarUrl(compressed);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="modal-avatar-file-input" className="cursor-pointer block space-y-3">
                  {tempAvatarUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={tempAvatarUrl}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-amber-500 shadow-xl mb-2"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-amber-500 font-bold block bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        {language === "pt" ? "Alterar Ficheiro" : "Change File"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <Camera size={36} className="text-amber-500/70 mb-2" />
                      <span className="text-xs font-bold block">
                        {language === "pt" ? "Clique para escolher ou arraste" : "Click to select or drag & drop"}
                      </span>
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        JPG, PNG, JPEG, WEBP (Max. 5MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  id="cancel-avatar-btn"
                  onClick={() => setAvatarModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-all"
                >
                  {language === "pt" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="button"
                  id="save-avatar-btn"
                  disabled={!tempAvatarUrl}
                  onClick={() => {
                    const updated = DBManager.updateArtistProfile(artistId, {
                      ...artist,
                      avatarUrl: tempAvatarUrl
                    });
                    if (updated) {
                      setArtist(updated);
                      setEditAvatarUrl(tempAvatarUrl);
                      if (onUserUpdate) {
                        onUserUpdate({
                          id: artistId,
                          role: "artist",
                          name: artist?.artisticName || "",
                          avatarUrl: tempAvatarUrl
                        });
                      }
                      setAvatarModalOpen(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-xs font-bold transition-all"
                >
                  {language === "pt" ? "Guardar Foto" : "Save Photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
