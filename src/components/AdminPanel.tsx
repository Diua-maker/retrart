import React, { useState, useEffect } from "react";
import { Artist, Artwork, Comment, Language, LoginLog } from "../types";
import { DBManager } from "../lib/db";
import { Shield, Users, Image as ImageIcon, MessageSquare, AlertTriangle, Check, X, ShieldCheck, Trash2, Eye, Star, TrendingUp, History, Bell, Send, Palette, CheckCircle } from "lucide-react";

interface AdminPanelProps {
  language: Language;
  onNavigate: (view: "home" | "search" | "profile" | "dashboard" | "admin" | "map", id?: string) => void;
}

export default function AdminPanel({ language, onNavigate }: AdminPanelProps) {
  // States
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [reports, setReports] = useState<{ id: string; type: string; description: string; targetId: string; reporterName: string }[]>([
    { id: "rep_1", type: "Obra", targetId: "artwork_sc_1", description: "Utilização indevida de foto protegida por direitos de autor.", reporterName: "Anónimo" },
    { id: "rep_2", type: "Comentário", targetId: "comm_1", description: "Comentário agressivo ou desrespeitoso.", reporterName: "Artur N." }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<"artists" | "artworks" | "comments" | "reports" | "logins" | "notifications" | "branding">("artists");

  // Notifications Form State
  const [allAccounts, setAllAccounts] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [recipient, setRecipient] = useState<string>("all");
  const [notifTitle, setNotifTitle] = useState<string>("");
  const [notifText, setNotifText] = useState<string>("");
  const [notifType, setNotifType] = useState<'follow' | 'like' | 'comment' | 'order' | 'message' | 'update' | 'artwork'>("update");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Platform Branding State
  const [platformImgUrl, setPlatformImgUrl] = useState<string>(() => DBManager.getPlatformImage());
  const [logoImgUrl, setLogoImgUrl] = useState<string>(() => DBManager.getPlatformLogo());
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [brandingSuccess, setBrandingSuccess] = useState<string | null>(null);

  const handleLogoFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(language === "pt" ? "Apenas arquivos de imagem são permitidos!" : "Only image files are allowed!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setLogoImgUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const predefinedTemplates = [
    {
      id: "maint",
      title: "Manutenção do Portal",
      description: "A nossa plataforma estará em manutenção técnica hoje das 23:00 às 00:00 para atualizações do sistema.",
      type: "update" as const
    },
    {
      id: "feature",
      title: "Nova Funcionalidade Ativada 🚀",
      description: "Agora podes usar a geolocalização interativa para encontrar retratistas perto de ti!",
      type: "update" as const
    },
    {
      id: "tips",
      title: "Dica de Sucesso: Completa o teu Perfil",
      description: "Artistas com fotos de referência reais e descrição completa têm 80% mais chances de obter encomendas diretas.",
      type: "update" as const
    },
    {
      id: "security",
      title: "Aviso de Segurança Importante",
      description: "Nunca partilhes as tuas credenciais de login. A administração nunca solicitará a tua senha por WhatsApp.",
      type: "update" as const
    }
  ];

  useEffect(() => {
    const listArt = DBManager.getArtists();
    setArtists(listArt);
    setArtworks(DBManager.getArtworks());
    setComments(DBManager.getComments());
    setLoginLogs(DBManager.getLoginHistory());

    // Gather all unique users & artists for notifications sending
    const mappedArtists = listArt.map(a => ({ id: a.id, name: a.artisticName, email: a.email, role: "artist" }));
    const mappedUsers = DBManager.getCommonUsers().map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: "user" }));
    setAllAccounts([...mappedArtists, ...mappedUsers]);
  }, [activeSubTab]);

  // Admin approval togglers
  const handleApprove = (id: string, state: boolean) => {
    DBManager.adminApproveArtist(id, state);
    setArtists(artists.map(a => a.id === id ? { ...a, isApproved: state } : a));
  };

  const handleVerify = (id: string, state: boolean) => {
    DBManager.adminVerifyArtist(id, state);
    setArtists(artists.map(a => a.id === id ? { ...a, isVerified: state } : a));
  };

  const handleFeature = (id: string, state: boolean) => {
    DBManager.adminFeatureArtist(id, state);
    setArtists(artists.map(a => a.id === id ? { ...a, isFeatured: state } : a));
  };

  const handleRemoveArtist = (id: string) => {
    if (confirm(language === "pt" ? "Deseja remover este artista e as suas obras permanentemente?" : "Do you want to remove this artist and all their works permanently?")) {
      DBManager.adminRemoveArtist(id);
      setArtists(artists.filter(a => a.id !== id));
      setArtworks(artworks.filter(aw => aw.artistId !== id));
    }
  };

  const handleDeleteArtwork = (id: string) => {
    if (confirm(language === "pt" ? "Eliminar esta obra de arte permanentemente?" : "Delete this artwork permanently?")) {
      DBManager.deleteArtwork(id);
      setArtworks(artworks.filter(aw => aw.id !== id));
    }
  };

  const handleDeleteComment = (id: string) => {
    if (confirm(language === "pt" ? "Apagar este comentário?" : "Delete this comment?")) {
      DBManager.deleteComment(id);
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleResolveReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    alert(language === "pt" ? "Denúncia resolvida!" : "Report resolved!");
  };

  const handleClearHistory = () => {
    if (confirm(language === "pt" ? "Tem a certeza que deseja limpar todo o histórico de logins de forma permanente?" : "Are you sure you want to clear all login history permanently?")) {
      DBManager.clearLoginHistory();
      setLoginLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-1.5">
              <Shield size={16} />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">Painel Administrativo Geral</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Moderação & Estatísticas RetrArt Moz</h1>
          </div>
          <button
            id="admin-home-btn"
            onClick={() => onNavigate("home")}
            className="px-4 py-2 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-xs font-bold rounded-xl transition-all"
          >
            Sair do Painel
          </button>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total de Artistas</p>
            <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-1 text-white">{artists.length}</h3>
            <Users size={32} className="absolute right-3 bottom-3 text-neutral-800/40" />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Obras Cadastradas</p>
            <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-1 text-white">{artworks.length}</h3>
            <ImageIcon size={32} className="absolute right-3 bottom-3 text-neutral-800/40" />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Comentários Ativos</p>
            <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-1 text-white">{comments.length}</h3>
            <MessageSquare size={32} className="absolute right-3 bottom-3 text-neutral-800/40" />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Denúncias Pendentes</p>
            <h3 className="text-2xl md:text-3xl font-extrabold font-mono mt-1 text-red-500">{reports.length}</h3>
            <AlertTriangle size={32} className="absolute right-3 bottom-3 text-red-950/20" />
          </div>

        </div>

        {/* Sub Navigation Admin Tabs */}
        <div className="flex border-b border-neutral-800 gap-2 mb-6 overflow-x-auto pb-1">
          <button
            id="subtab-artists"
            onClick={() => setActiveSubTab("artists")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "artists"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Artistas ({artists.length})
          </button>
          <button
            id="subtab-artworks"
            onClick={() => setActiveSubTab("artworks")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "artworks"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Obras ({artworks.length})
          </button>
          <button
            id="subtab-comments"
            onClick={() => setActiveSubTab("comments")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "comments"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Comentários ({comments.length})
          </button>
          <button
            id="subtab-reports"
            onClick={() => setActiveSubTab("reports")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "reports"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Denúncias ({reports.length})
          </button>
          <button
            id="subtab-logins"
            onClick={() => setActiveSubTab("logins")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "logins"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Histórico de Logins ({loginLogs.length})
          </button>
          <button
            id="subtab-notifications"
            onClick={() => setActiveSubTab("notifications")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "notifications"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Mensagens & Notificações
          </button>
          <button
            id="subtab-branding"
            onClick={() => setActiveSubTab("branding")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeSubTab === "branding"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Imagem da Plataforma
          </button>
        </div>

        {/* Display Active Tab Content */}
        
        {/* Sub Tab: ARTISTS MODERATION */}
        {activeSubTab === "artists" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Gerir Contas de Retratistas</h4>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {artists.map(art => (
                <div key={art.id} id={`admin-artist-item-${art.id}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {art.avatarUrl ? (
                      <img src={art.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-800" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 font-bold text-xs uppercase font-serif">
                        {art.artisticName.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {art.artisticName}
                        {art.isVerified && <ShieldCheck size={14} className="text-amber-500" />}
                      </h5>
                      <p className="text-[10px] text-neutral-400">{art.fullName || art.email} • {art.location.city}, {art.location.province}</p>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Approval toggle */}
                    <button
                      id={`approve-${art.id}`}
                      onClick={() => handleApprove(art.id, !art.isApproved)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        art.isApproved
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {art.isApproved ? "Aprovado" : "Pendente Aprovação"}
                    </button>

                    {/* Verification Toggle */}
                    <button
                      id={`verify-${art.id}`}
                      onClick={() => handleVerify(art.id, !art.isVerified)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        art.isVerified
                          ? "bg-amber-500 text-neutral-950"
                          : "border border-neutral-800 hover:border-amber-500/40 text-neutral-300"
                      }`}
                    >
                      {art.isVerified ? "Verificado" : "Dar Selo Verificado"}
                    </button>

                    {/* Feature toggler */}
                    <button
                      id={`feature-${art.id}`}
                      onClick={() => handleFeature(art.id, !art.isFeatured)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        art.isFeatured
                          ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                          : "border border-neutral-800 hover:border-neutral-700 text-neutral-400"
                      }`}
                    >
                      {art.isFeatured ? "★ Destacado" : "Destacar Artista"}
                    </button>

                    {/* Remove artist account */}
                    <button
                      id={`remove-artist-${art.id}`}
                      onClick={() => handleRemoveArtist(art.id)}
                      className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                      title="Apagar conta artística"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub Tab: ARTWORKS MODERATION */}
        {activeSubTab === "artworks" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">Moderar Obras de Arte</h4>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {artworks.map(aw => (
                <div key={aw.id} id={`admin-artwork-item-${aw.id}`} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={aw.imageUrls[0]} alt="" className="w-12 h-12 rounded object-cover border border-neutral-800" referrerPolicy="no-referrer" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{aw.title}</h5>
                      <p className="text-[10px] text-neutral-400">Por: {aw.artistName} • {aw.technique} • {aw.style}</p>
                    </div>
                  </div>

                  <button
                    id={`delete-art-${aw.id}`}
                    onClick={() => handleDeleteArtwork(aw.id)}
                    className="px-3 py-1.5 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Remover Obra
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub Tab: COMMENTS MODERATION */}
        {activeSubTab === "comments" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Moderar Comentários</h4>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {comments.map(c => (
                <div key={c.id} id={`admin-comment-item-${c.id}`} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-200">{c.userName}</span>
                      <span className="text-[9px] font-mono text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{c.text}</p>
                  </div>

                  <button
                    id={`delete-comm-${c.id}`}
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                    title="Remover comentário ofensivo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub Tab: REPORTS */}
        {activeSubTab === "reports" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Denúncias Ativas</h4>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {reports.map(r => (
                <div key={r.id} id={`admin-report-item-${r.id}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                      <AlertTriangle size={14} />
                      <span>{r.type} Denunciado (ID: {r.targetId})</span>
                    </div>
                    <p className="text-xs text-neutral-300"><strong>Motivo:</strong> {r.description}</p>
                    <p className="text-[10px] text-neutral-500">Denunciado por: {r.reporterName}</p>
                  </div>

                  <button
                    id={`resolve-${r.id}`}
                    onClick={() => handleResolveReport(r.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Check size={12} /> Marcar como Resolvida
                  </button>
                </div>
              ))}

              {reports.length === 0 && (
                <p className="text-xs text-neutral-500 italic p-6 text-center">Nenhuma denúncia pendente de resolução.</p>
              )}
            </div>
          </div>
        )}

        {/* Sub Tab: LOGINS HISTORY */}
        {activeSubTab === "logins" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Autenticações</h4>
                <p className="text-xs text-neutral-400 mt-1">Registo das últimas tentativas de login bem-sucedidas na plataforma.</p>
              </div>
              
              {loginLogs.length > 0 && (
                <button
                  id="btn-clear-login-history"
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  <span>Limpar Histórico de Logins</span>
                </button>
              )}
            </div>

            {loginLogs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 space-y-2">
                <History className="mx-auto text-neutral-700 mb-2 opacity-30" size={40} />
                <p className="text-xs font-bold text-neutral-300">Nenhum registo de login encontrado</p>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  O histórico de logins está vazio de momento ou foi limpo recentemente. Novos logins serão registados automaticamente.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Utilizador / ID</th>
                      <th className="py-3 px-4">Papel / Role</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Data & Hora</th>
                      <th className="py-3 px-4 font-mono">IP / Navegador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/40">
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="text-xs hover:bg-neutral-800/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-neutral-800 text-amber-500 flex items-center justify-center font-mono text-xs uppercase font-bold">
                            {log.name.substring(0, 2)}
                          </div>
                          <div>
                            <span>{log.name}</span>
                            <span className="block text-[9px] text-neutral-500 font-mono font-normal">ID: {log.userId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.role === "admin"
                              ? "bg-red-500/10 text-red-400 border border-red-500/25"
                              : log.role === "artist"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-300 font-mono text-[11px]">{log.email}</td>
                        <td className="py-3 px-4 text-neutral-400 font-mono">
                          {new Date(log.timestamp).toLocaleString(language === "pt" ? "pt-MZ" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </td>
                        <td className="py-3 px-4 text-[10px] text-neutral-500 font-mono">
                          <span className="block text-neutral-400">{log.ipAddress || "Unknown"}</span>
                          <span className="block text-[9px] truncate max-w-[200px]" title={log.browser}>{log.browser || "Unknown"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sub Tab: NOTIFICATIONS DISPATCHER */}
        {activeSubTab === "notifications" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                <span>Enviar Mensagens & Notificações</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Envie anúncios administrativos gerais ou mensagens direcionadas a utilizadores específicos da plataforma RetrArt Moz.
              </p>
            </div>

            {successMsg && (
              <div className="bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl p-4 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Col */}
              <div className="lg:col-span-2 space-y-4">
                {/* Predefined Templates Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Modelos Rápidos / Mensagens Pré-escritas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {predefinedTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setNotifTitle(tpl.title);
                          setNotifText(tpl.description);
                          setNotifType(tpl.type);
                        }}
                        className="p-3 text-left bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl hover:bg-neutral-900 transition-all group"
                      >
                        <p className="text-xs font-bold text-amber-500 group-hover:text-amber-400">{tpl.title}</p>
                        <p className="text-[10px] text-neutral-500 line-clamp-1 mt-1">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Destinatário
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="all">📢 Todos os Utilizadores Registados ({allAccounts.length})</option>
                    <optgroup label="Artistas Retratistas">
                      {allAccounts.filter(acc => acc.role === "artist").map(acc => (
                        <option key={acc.id} value={acc.id}>🎨 {acc.name} ({acc.email || "Sem email"})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Clientes / Visitantes Registados">
                      {allAccounts.filter(acc => acc.role === "user").map(acc => (
                        <option key={acc.id} value={acc.id}>👤 {acc.name} ({acc.email || "Sem email"})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Título do Alerta / Notificação
                  </label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Ex: Atualização Importante do Sistema..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                {/* Description Text area */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Conteúdo da Mensagem
                  </label>
                  <textarea
                    value={notifText}
                    onChange={(e) => setNotifText(e.target.value)}
                    rows={4}
                    placeholder="Escreve aqui o texto completo que o utilizador irá ver na sua barra de notificações..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!notifTitle.trim() || !notifText.trim()) {
                      alert("Por favor, preencha o título e a mensagem antes de enviar.");
                      return;
                    }

                    if (recipient === "all") {
                      // Broadcast to everyone
                      allAccounts.forEach(acc => {
                        DBManager.addNotification({
                          userId: acc.id,
                          type: notifType,
                          title: notifTitle,
                          description: notifText
                        });
                      });
                      setSuccessMsg(`Notificação em massa enviada com sucesso para todos os ${allAccounts.length} utilizadores.`);
                    } else {
                      // Send to single recipient
                      const matched = allAccounts.find(acc => acc.id === recipient);
                      DBManager.addNotification({
                        userId: recipient,
                        type: notifType,
                        title: notifTitle,
                        description: notifText
                      });
                      setSuccessMsg(`Notificação enviada com sucesso para o utilizador "${matched?.name || recipient}".`);
                    }

                    // Reset form fields
                    setNotifTitle("");
                    setNotifText("");
                    setTimeout(() => setSuccessMsg(null), 6000);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Disparar Notificação</span>
                </button>
              </div>

              {/* Tips & List Col */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-4">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Como funciona?</h5>
                <div className="space-y-3 text-[11px] text-neutral-400 leading-relaxed">
                  <p>
                    As mensagens disparadas são persistidas de forma instantânea para cada conta selecionada.
                  </p>
                  <p>
                    Assim que o utilizador correspondente navegar pela plataforma, um indicador e o contador animado serão exibidos no menu superior (Navbar) em tempo real.
                  </p>
                  <p>
                    O destinatário poderá abrir o sino, ver o conteúdo que digitou e marcar a mensagem como lida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub Tab: PLATFORM BRANDING */}
        {activeSubTab === "branding" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette size={18} className="text-amber-500" />
                <span>Imagem da Plataforma (Banner Principal)</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Substitua ou escolha o painel de fundo que será apresentado no Banner Principal (Hero Header) da página inicial.
              </p>
            </div>

            {brandingSuccess && (
              <div className="bg-green-950/30 border border-green-500/20 text-green-400 rounded-xl p-4 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle size={16} />
                <span>{brandingSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Control */}
              <div className="space-y-6">
                
                {/* 1. SECTOR: HERO HEADER IMAGE */}
                <div className="bg-neutral-950 p-4 border border-neutral-800 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette size={14} />
                    <span>1. Imagem de Fundo (Banner Principal)</span>
                  </h5>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Endereço URL da Imagem de Fundo (Banner)
                    </label>
                    <input
                      type="text"
                      value={platformImgUrl}
                      onChange={(e) => setPlatformImgUrl(e.target.value)}
                      placeholder="Cole aqui um link de imagem do Unsplash ou Web..."
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  {/* Pre-configured Presets Grid */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Escolher Preset Temático
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          name: "Ateliê de Pintura Clássica",
                          url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1600"
                        },
                        {
                          name: "Retrato Realista a Carvão",
                          url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1600"
                        },
                        {
                          name: "Estúdio de Arte Colorido",
                          url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1600"
                        },
                        {
                          name: "Ilustração Digital Abstrata",
                          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600"
                        }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPlatformImgUrl(preset.url)}
                          className={`p-2 text-left rounded-xl border text-[10px] font-medium transition-all ${
                            platformImgUrl === preset.url
                              ? "border-amber-500 bg-amber-500/10 text-amber-500"
                              : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <span className="block truncate font-bold">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. SECTOR: APP LOGO/ICON IMAGE */}
                <div className="bg-neutral-950 p-4 border border-neutral-800 rounded-2xl space-y-4">
                  <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} />
                    <span>2. Ícone / Logótipo da Aplicação (App Icon)</span>
                  </h5>
                  
                  {/* File upload drag-and-drop zone */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Enviar Ficheiro de Imagem (Dispositivo)
                    </label>
                    
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleLogoFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById("app-logo-file-input")?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        dragActive
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400"
                      }`}
                    >
                      <input
                        id="app-logo-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleLogoFile(e.target.files[0]);
                          }
                        }}
                      />
                      <ImageIcon className="mx-auto text-neutral-600 mb-1.5" size={24} />
                      <p className="text-xs font-bold text-neutral-300">Arrastar ou Clicar para Escolher</p>
                      <p className="text-[10px] text-neutral-500 mt-1">PNG, JPG ou SVG (Tamanho recomendado: 200x200px)</p>
                    </div>
                  </div>

                  {/* Input URL direct */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Ou Endereço URL de Imagem Online
                    </label>
                    <input
                      type="text"
                      value={logoImgUrl}
                      onChange={(e) => setLogoImgUrl(e.target.value)}
                      placeholder="https://exemplo.com/minha-imagem.png..."
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-2 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      DBManager.savePlatformImage(platformImgUrl);
                      DBManager.savePlatformLogo(logoImgUrl);
                      setBrandingSuccess("A identidade visual e o ícone da aplicação foram atualizados com sucesso!");
                      setTimeout(() => setBrandingSuccess(null), 6000);
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Salvar Alterações</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const defBanner = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1600";
                      const defLogo = "";
                      setPlatformImgUrl(defBanner);
                      setLogoImgUrl(defLogo);
                      DBManager.savePlatformImage(defBanner);
                      DBManager.savePlatformLogo(defLogo);
                      setBrandingSuccess("Identidade visual restaurada para os padrões originais.");
                      setTimeout(() => setBrandingSuccess(null), 4000);
                    }}
                    className="px-4 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>

              {/* Preview Col */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Pré-visualização da Identidade</h5>
                  <p className="text-[10px] text-neutral-500 mb-3">Como os logótipos e o fundo do cabeçalho principal aparecerão para os utilizadores.</p>
                </div>

                {/* LOGO ICON PREVIEW ZONE */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono font-bold uppercase text-neutral-400">Pré-visualização do Ícone (App Icon)</span>
                  <div className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-neutral-950 font-mono text-xl overflow-hidden shadow-lg">
                      {logoImgUrl ? (
                        <img
                          src={logoImgUrl}
                          alt="Logo Preview"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        "R"
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">RetrArt Moz</p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {logoImgUrl ? (logoImgUrl.startsWith("data:") ? "Ficheiro Carregado do Dispositivo" : "Link Web Online") : "Padrão Clássico ('R')"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BANNER PREVIEW ZONE */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono font-bold uppercase text-neutral-400">Pré-visualização do Fundo (Hero Banner)</span>
                  <div className="relative h-40 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-25"
                      style={{ backgroundImage: `url(${platformImgUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
                    <div className="relative z-10 text-left px-6 w-full space-y-1">
                      <p className="text-[8px] font-mono text-amber-500 font-bold tracking-widest uppercase">Visual Preview</p>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-neutral-950 font-mono text-[10px] overflow-hidden">
                          {logoImgUrl ? (
                            <img
                              src={logoImgUrl}
                              alt="Logo mini"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "R"
                          )}
                        </div>
                        <h4 className="text-xs font-bold font-serif text-white">RetrArt Moz — Galeria</h4>
                      </div>
                      <p className="text-[10px] text-neutral-400 max-w-xs">Encontre os mais talentosos artistas nacionais moçambicanos...</p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 text-center italic mt-3 font-sans">
                  Nota: As alterações serão aplicadas em todos os ecrãs e menus que exibem a marca da plataforma.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
