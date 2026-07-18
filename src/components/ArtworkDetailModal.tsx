import React, { useState, useEffect } from "react";
import { Artwork, Artist, Comment, Language, translations } from "../types";
import { DBManager } from "../lib/db";
import { X, Heart, Star, ShoppingBag, MessageSquare, Trash, Calendar, Maximize2, Share2, Tag, Layers, Compass, CheckCircle } from "lucide-react";

interface ArtworkDetailModalProps {
  artwork: Artwork;
  artists: Artist[];
  language: Language;
  currentUser: { id: string; role: 'artist' | 'admin' | 'user'; name: string } | null;
  onClose: () => void;
  onSelectArtist: (artistId: string) => void;
  onOpenOrderModal: (artist: Artist) => void;
  onOpenChat: (artist: Artist) => void;
  onOpenAuth: () => void;
}

export default function ArtworkDetailModal({
  artwork,
  artists,
  language,
  currentUser,
  onClose,
  onSelectArtist,
  onOpenOrderModal,
  onOpenChat,
  onOpenAuth
}: ArtworkDetailModalProps) {
  const t = translations[language];
  const artist = artists.find(a => a.id === artwork.artistId);

  // States
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  
  const [likesCount, setLikesCount] = useState(artwork.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Load and init likes/comments
  useEffect(() => {
    // Increment views locally
    const artworks = DBManager.getArtworks();
    const awIndex = artworks.findIndex(a => a.id === artwork.id);
    if (awIndex > -1) {
      artworks[awIndex].viewsCount += 1;
      DBManager.saveArtworks(artworks);
    }

    setComments(DBManager.getComments(artwork.id));
    setHasLiked(DBManager.getLikes().includes(artwork.id));
    setIsFavorite(DBManager.getFavorites().includes(artwork.id));
  }, [artwork.id]);

  const handleLike = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const res = DBManager.toggleLike(artwork.id);
    setLikesCount(res.likesCount);
    setHasLiked(res.hasLiked);
  };

  const handleFavorite = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isFav = DBManager.toggleFavorite(artwork.id);
    setIsFavorite(isFav);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    const commenterName = currentUser.name;

    const added = DBManager.addComment({
      artworkId: artwork.id,
      userName: commenterName,
      text: newCommentText.trim()
    });

    setComments([...comments, added]);
    setNewCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    DBManager.deleteComment(commentId);
    setComments(comments.filter(c => c.id !== commentId));
  };

  // Determine permissions
  const isOwner = currentUser?.role === "artist" && currentUser.id === artwork.artistId;
  const isAdmin = currentUser?.role === "admin";
  const canDeleteComments = isOwner || isAdmin;

  // Formatting date
  const publishDate = new Date(artwork.createdAt).toLocaleDateString(
    language === "pt" ? "pt-MZ" : "en-US",
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start md:items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-5xl relative shadow-2xl flex flex-col md:flex-row h-auto md:max-h-[90vh] overflow-hidden my-4 md:my-0">
        
        {/* Close Button Floating */}
        <button
          id="close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-neutral-400 hover:text-white bg-black/60 p-2.5 rounded-full backdrop-blur-md hover:bg-neutral-800 transition-all"
        >
          <X size={20} />
        </button>

        {/* Left Section: Immersive Visuals */}
        <div className="w-full md:w-3/5 bg-neutral-950 p-6 flex flex-col justify-between border-r border-neutral-800 relative">
          
          {/* Main Artwork Frame */}
          <div className="flex-1 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden rounded-2xl bg-neutral-900/40 border border-neutral-800/60 relative group">
            <img
              src={artwork.imageUrls[activeImageIndex] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"}
              alt={artwork.title}
              className="max-w-full max-h-[480px] object-contain transition-all duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Quick Interactions floating inside */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-mono backdrop-blur-md border border-white/10">
                {artwork.dimensions}
              </span>
              <div className="flex gap-2 pointer-events-auto">
                <button
                  id="action-like"
                  onClick={handleLike}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    hasLiked
                      ? "bg-amber-500 border-amber-500 text-neutral-950"
                      : "bg-black/60 border-white/10 text-white hover:bg-neutral-800"
                  }`}
                >
                  <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
                </button>
                <button
                  id="action-favorite"
                  onClick={handleFavorite}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    isFavorite
                      ? "bg-amber-500 border-amber-500 text-neutral-950"
                      : "bg-black/60 border-white/10 text-white hover:bg-neutral-800"
                  }`}
                >
                  <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>

          {/* Multiple Image Thumbnails (if any) */}
          {artwork.imageUrls.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto py-1 justify-center">
              {artwork.imageUrls.map((url, index) => (
                <button
                  key={index}
                  id={`thumb-image-${index}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === index ? "border-amber-500 scale-105" : "border-neutral-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Technical Specs Overlay footer */}
          <div className="grid grid-cols-2 gap-y-2 sm:flex sm:items-center sm:justify-between mt-4 text-xs font-mono text-neutral-400 border-t border-neutral-900 pt-3">
            <span className="flex items-center gap-1.5">
              <Layers size={12} className="text-amber-500" />
              {artwork.technique}
            </span>
            <span className="flex items-center gap-1.5">
              <Compass size={12} className="text-amber-500" />
              {artwork.style}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 size={12} className="text-amber-500" />
              {artwork.dimensions}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-500" />
              {publishDate}
            </span>
          </div>
        </div>

        {/* Right Section: Details, Artist Info, and Socials */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between md:max-h-[90vh] md:overflow-y-auto custom-scrollbar bg-neutral-900">
          
          <div className="space-y-6">
            {/* Title and Pricing */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  artwork.availability === "available"
                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                    : artwork.availability === "commissionOnly"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : "bg-neutral-800 border-neutral-700 text-neutral-400"
                }`}>
                  {artwork.availability === "available"
                    ? t.available
                    : artwork.availability === "commissionOnly"
                    ? t.commissionOnly
                    : t.sold}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  ID: {artwork.id}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white font-sans tracking-tight mb-2">
                {artwork.title}
              </h2>

              {artwork.price && (
                <p className="text-xl font-bold font-mono text-amber-500">
                  {artwork.price.toLocaleString("pt-MZ")} MZN
                </p>
              )}

              {/* Explicit Action Buttons with Labels */}
              <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-neutral-800/60">
                <button
                  id="btn-detail-like"
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    hasLiked
                      ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-md shadow-amber-500/10 hover:bg-amber-600 hover:border-amber-600"
                      : "border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-950/20 hover:bg-neutral-900/40"
                  }`}
                >
                  <Heart size={14} className={hasLiked ? "fill-current" : ""} />
                  <span>{hasLiked ? (language === "pt" ? "Gostei" : "Liked") : (language === "pt" ? "Gostar" : "Like")} ({likesCount})</span>
                </button>

                <button
                  id="btn-detail-favorite"
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isFavorite
                      ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-md shadow-amber-500/10 hover:bg-amber-600 hover:border-amber-600"
                      : "border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 bg-neutral-950/20 hover:bg-neutral-900/40"
                  }`}
                >
                  <Star size={14} className={isFavorite ? "fill-current" : ""} />
                  <span>{isFavorite ? (language === "pt" ? "Nos Favoritos" : "In Favorites") : (language === "pt" ? "Favoritar" : "Add to Favorites")}</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-neutral-950/40 border border-neutral-800/40 rounded-2xl p-4">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {artwork.description}
              </p>
            </div>

            {/* Artist Small Card Card */}
            {artist && (
              <div className="border border-neutral-800 rounded-2xl p-4 flex items-center justify-between bg-neutral-950/20 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onClose(); onSelectArtist(artist.id); }}>
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.artisticName}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 font-bold text-xs uppercase font-serif">
                      {artist.artisticName.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-bold text-white hover:text-amber-500 transition-colors">
                        {artist.artisticName}
                      </h4>
                      {artist.isVerified && (
                        <CheckCircle size={14} className="text-amber-500 fill-neutral-950" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      {artist.location.city}, {artist.location.province}
                    </p>
                    {/* Tiny rating indicator */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500">{artist.ratingAverage}</span>
                    </div>
                  </div>
                </div>

                <button
                  id="view-artist-profile-btn"
                  onClick={() => { onClose(); onSelectArtist(artist.id); }}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-[10px] font-semibold transition-all font-sans"
                >
                  {language === "pt" ? "Ver Galeria" : "View Gallery"}
                </button>
              </div>
            )}

            {/* Comments Area */}
            <div className="border-t border-neutral-800/80 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" />
                {t.comments} ({comments.length})
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} id={`comment-item-${c.id}`} className="bg-neutral-950/30 border border-neutral-800/60 rounded-xl p-3 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-200">{c.userName}</span>
                        <span className="text-[9px] font-mono text-neutral-500">
                          {new Date(c.createdAt).toLocaleDateString(language === "pt" ? "pt-MZ" : "en-US")}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">{c.text}</p>
                      
                      {/* Delete comment (owner or admin only) */}
                      {canDeleteComments && (
                        <button
                          id={`delete-comment-btn-${c.id}`}
                          onClick={() => handleDeleteComment(c.id)}
                          className="absolute right-2 bottom-2 text-neutral-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                          title="Apagar comentário"
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic py-2">
                    {language === "pt" ? "Seja o primeiro a comentar!" : "Be the first to comment!"}
                  </p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="comment-text-input"
                    value={newCommentText}
                    onChange={(e) => {
                      if (!currentUser) {
                        onOpenAuth();
                      } else {
                        setNewCommentText(e.target.value);
                      }
                    }}
                    onFocus={() => {
                      if (!currentUser) {
                        onOpenAuth();
                      }
                    }}
                    placeholder={t.addComment}
                    className="flex-1 bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 text-xs text-white rounded-lg px-3 py-2.5 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    id="submit-comment-btn"
                    className="bg-neutral-800 hover:bg-amber-500 text-neutral-400 hover:text-neutral-950 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    OK
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* CTA Footer Actions */}
          {artist && (
            <div className="pt-6 border-t border-neutral-800/80 mt-6 grid grid-cols-2 gap-3 bg-neutral-900">
              <button
                id="cta-chat"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    onClose();
                    onOpenChat(artist);
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-500 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={14} />
                {language === "pt" ? "Iniciar Chat" : "Open Chat"}
              </button>
              
              <button
                id="cta-order"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    onClose();
                    onOpenOrderModal(artist);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={14} />
                {t.orderPortrait}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
