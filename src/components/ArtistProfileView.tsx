import React, { useState, useEffect } from "react";
import { Artist, Artwork, Review, Language, translations } from "../types";
import { DBManager } from "../lib/db";
import {
  MapPin,
  Calendar,
  MessageSquare,
  Share2,
  Heart,
  Users,
  Eye,
  CheckCircle,
  Star,
  Layers,
  Compass,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Search
} from "lucide-react";

interface ArtistProfileViewProps {
  artist: Artist;
  language: Language;
  currentUser: { id: string; role: 'artist' | 'admin' | 'user'; name: string } | null;
  onOpenAuth: () => void;
  onNavigateBack: () => void;
  onOpenOrderModal: (artist: Artist) => void;
  onOpenChat: (artist: Artist) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export default function ArtistProfileView({
  artist,
  language,
  currentUser,
  onOpenAuth,
  onNavigateBack,
  onOpenOrderModal,
  onOpenChat,
  onSelectArtwork
}: ArtistProfileViewProps) {
  const t = translations[language];

  // Profile-specific interactive state
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followersCount, setFollowersCount] = useState(artist.stats.followersCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [ratingAverage, setRatingAverage] = useState(artist.ratingAverage);

  // New review form
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [isViewingAvatar, setIsViewingAvatar] = useState(false);

  useEffect(() => {
    // Record profile view
    DBManager.recordProfileView(artist.id);

    // Fetch data
    setArtworks(DBManager.getArtworks().filter(a => a.artistId === artist.id));
    setReviews(DBManager.getReviews(artist.id));
    setIsFollowing(DBManager.getFollows().includes(artist.id));
  }, [artist.id]);

  const handleFollowToggle = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = DBManager.toggleFollow(artist.id);
    setFollowersCount(res.followersCount);
    setIsFollowing(res.isFollowing);
  };

  const handleWhatsAppClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    DBManager.recordWhatsAppClick(artist.id);
    // Open standard whatsapp layout with greeting
    const text = encodeURIComponent(
      language === "pt"
        ? `Olá Sr. ${artist.artisticName}, encontrei o seu portfólio na plataforma RetrArt Moz e gostaria de solicitar um orçamento!`
        : `Hello Mr. ${artist.artisticName}, I found your portfolio on the RetrArt Moz platform and would love to request a quote!`
    );
    window.open(`https://wa.me/${artist.whatsapp.replace(/\+/g, "")}?text=${text}`, "_blank");
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newReviewComment.trim()) return;

    const reviewerName = currentUser.name || "Cliente";

    const added = DBManager.addReview({
      artistId: artist.id,
      reviewerName: reviewerName,
      rating: newReviewRating,
      comment: newReviewComment.trim()
    });

    setReviews([added, ...reviews]);
    
    // Recalculate average rating locally
    const artists = DBManager.getArtists();
    const updatedArtist = artists.find(a => a.id === artist.id);
    if (updatedArtist) {
      setRatingAverage(updatedArtist.ratingAverage);
    }

    setReviewSuccess(language === "pt" ? "Avaliação enviada com sucesso!" : "Review submitted successfully!");
    setNewReviewComment("");
    setNewReviewRating(5);
    setTimeout(() => setReviewSuccess(null), 3000);
  };

  const formattedJoinDate = new Date(artist.createdAt).toLocaleDateString(
    language === "pt" ? "pt-MZ" : "en-US",
    { year: 'numeric', month: 'long' }
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      
      {/* Header Banner Cover */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={artist.coverUrl}
          alt={artist.artisticName}
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        
        {/* Navigate back button */}
        <button
          id="back-profile-btn"
          onClick={onNavigateBack}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{language === "pt" ? "Voltar à Vitrine" : "Back to Showcase"}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Artist Details Dashboard Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative">
              
              {/* Profile Avatar & Identity */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-neutral-800/60">
                <div 
                  className="relative group cursor-pointer mb-4"
                  onClick={() => setIsViewingAvatar(true)}
                  title={language === "pt" ? "Ver foto de perfil ampliada" : "View expanded profile picture"}
                >
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.artisticName}
                      className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-neutral-950 bg-neutral-900 shadow-xl transition-all duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-neutral-800 border-4 border-neutral-950 flex items-center justify-center text-neutral-500 font-bold text-3xl uppercase font-serif">
                      {artist.artisticName.substring(0, 2)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search size={22} className="text-amber-500" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-center">
                  <h2 className="text-xl md:text-2xl font-serif tracking-normal text-white">{artist.artisticName}</h2>
                  {artist.isVerified && (
                    <ShieldCheck size={18} className="text-amber-500 fill-neutral-950" title="Verificado Oficial" />
                  )}
                </div>
                {artist.fullName && <p className="text-xs text-neutral-400 font-medium mt-0.5">{artist.fullName}</p>}
                
                <p className="text-xs text-neutral-400 mt-2 flex items-center justify-center gap-1">
                  <MapPin size={12} className="text-amber-500" />
                  {artist.location.city}, {artist.location.province}
                </p>

                {/* Rating average display */}
                <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  <span>{ratingAverage}</span>
                  <span className="text-neutral-500 font-mono">•</span>
                  <span className="text-neutral-400 font-sans font-medium">{reviews.length} {language === "pt" ? "avaliações" : "reviews"}</span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2 py-5 border-b border-neutral-800/60 text-center">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider">{t.recentWorks}</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{artworks.length}</p>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider">{t.followers}</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{followersCount}</p>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-mono tracking-wider">{t.likes}</span>
                  <p className="text-lg font-bold font-mono text-amber-500 mt-1">{artist.stats.likesCount}</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="py-5 border-b border-neutral-800/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">{t.specialties}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {artist.specialties.map(spec => (
                    <span key={spec} className="text-[10px] font-semibold bg-neutral-950 border border-neutral-800 hover:border-amber-500/20 text-neutral-300 px-3 py-1 rounded-full transition-all">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Profile Details / About */}
              <div className="py-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">{t.aboutMe}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{artist.bio}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar size={14} className="text-amber-500" />
                  <span>{language === "pt" ? `Membro desde ${formattedJoinDate}` : `Member since ${formattedJoinDate}`}</span>
                </div>
                <div className="text-xs text-neutral-400">
                  <strong>{t.experience}:</strong> {artist.experienceYears} {t.years}
                </div>
              </div>

              {/* Interactions Call to Actions */}
              <div className="space-y-3 pt-4">
                {/* HUGE WHATSAPP BUTTON */}
                <button
                  id="contact-whatsapp-profile-btn"
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-neutral-950 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} fill="currentColor" />
                  <span>{t.contactWhatsApp}</span>
                </button>

                {/* Follow & Commission Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="follow-artist-profile-btn"
                    onClick={handleFollowToggle}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      isFollowing
                        ? "bg-amber-500 border-amber-500 text-neutral-950"
                        : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/40 hover:text-amber-500"
                    }`}
                  >
                    {isFollowing ? (language === "pt" ? "A Seguir" : "Following") : (language === "pt" ? "Seguir" : "Follow")}
                  </button>

                  <button
                    id="order-portrait-profile-btn"
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth();
                      } else {
                        onOpenOrderModal(artist);
                      }
                    }}
                    className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all"
                  >
                    {t.orderPortrait}
                  </button>
                </div>

                <button
                  id="chat-artist-profile-btn"
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                    } else {
                      onOpenChat(artist);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-bold transition-all"
                >
                  {language === "pt" ? "Conversar por Chat Interno" : "Chat on Internal Messenger"}
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Complete Gallery & Feedback / Reviews */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif tracking-normal text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
                <Layers size={18} className="text-amber-500" />
                <span>Galeria Completa ({artworks.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artworks.map(aw => (
                  <div
                    key={aw.id}
                    id={`artwork-card-profile-${aw.id}`}
                    onClick={() => onSelectArtwork(aw)}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Visual Photo */}
                    <div className="h-60 overflow-hidden relative bg-neutral-950/40 border-b border-neutral-800/80">
                      <img
                        src={aw.imageUrls[0]}
                        alt={aw.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-[10px] bg-amber-500 text-neutral-950 font-bold px-2 py-1 rounded-full uppercase">
                          {language === "pt" ? "Ver Detalhes" : "View Details"}
                        </span>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="p-4 space-y-1 bg-neutral-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono">{aw.technique}</span>
                        {aw.price && (
                          <span className="text-xs font-bold font-mono text-white">{aw.price.toLocaleString()} MZN</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors truncate">{aw.title}</h4>
                      <p className="text-[10px] text-neutral-400 truncate">{aw.style} • {aw.dimensions}</p>
                    </div>
                  </div>
                ))}

                {artworks.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-neutral-500 italic">
                    {language === "pt" ? "Nenhuma obra publicada nesta galeria." : "No artworks published in this gallery."}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif tracking-normal text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
                <Star size={18} className="text-amber-500" />
                <span>{t.reviews} ({reviews.length})</span>
              </h3>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">{t.writeReview}</h4>

                {reviewSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wide">Autor da Avaliação</label>
                    <div 
                      className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-4 py-3 font-semibold flex items-center gap-2 cursor-pointer"
                      onClick={() => !currentUser && onOpenAuth()}
                    >
                      <div className={`w-2 h-2 rounded-full ${currentUser ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
                      {currentUser ? currentUser.name : (language === "pt" ? "Conecte-se para avaliar" : "Log in to review")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wide">Classificação *</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-amber-500 rounded-xl px-4 py-3 outline-none"
                    >
                      <option value={5}>★★★★★ (5/5)</option>
                      <option value={4}>★★★★☆ (4/5)</option>
                      <option value={3}>★★★☆☆ (3/5)</option>
                      <option value={2}>★★☆☆☆ (2/5)</option>
                      <option value={1}>★☆☆☆☆ (1/5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wide">Comentário / Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Conte como foi a sua experiência encomendando retratos com este artista..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl p-4 outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="submit-review-btn"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-xl transition-all"
                  >
                    Enviar Avaliação
                  </button>
                </div>
              </form>

              {/* Review Feed list */}
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} id={`review-item-${r.id}`} className="bg-neutral-900 border border-neutral-800/60 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{r.reviewerName}</span>
                        <span className="text-[9px] text-neutral-500 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} size={12} className="fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Profile Picture Expand Lightbox Modal */}
      {isViewingAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setIsViewingAvatar(false)}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2.5 rounded-full bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 transition-all z-50 cursor-pointer"
            title={language === "pt" ? "Fechar" : "Close"}
          >
            <X size={20} />
          </button>
          
          <div 
            className="max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl relative bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={artist.avatarUrl} 
              alt={artist.artisticName} 
              className="max-w-full max-h-[80vh] object-contain block mx-auto rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="p-4 bg-neutral-950/90 border-t border-neutral-900 text-center">
              <p className="text-sm font-bold text-white">{artist.artisticName}</p>
              <p className="text-xs text-neutral-400 mt-1">{artist.fullName || ""}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
