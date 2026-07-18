import React, { useState, useMemo } from "react";
import { Artist, Artwork, Language, translations } from "../types";
import { DBManager } from "../lib/db";
import { Search, MapPin, Layers, Compass, Star, Heart, Eye, ArrowRight, ShieldCheck, ChevronRight, MessageSquare, Flame } from "lucide-react";

interface MainShowcaseProps {
  artists: Artist[];
  artworks: Artwork[];
  language: Language;
  onSelectArtist: (artistId: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onNavigateToSearch: (initialFilters?: { province?: string; technique?: string; style?: string }) => void;
  onNavigateToMap: () => void;
}

export default function MainShowcase({
  artists,
  artworks,
  language,
  onSelectArtist,
  onSelectArtwork,
  onNavigateToSearch,
  onNavigateToMap
}: MainShowcaseProps) {
  const t = translations[language];

  // General search term
  const [searchTerm, setSearchTerm] = useState("");

  const approvedArtists = useMemo(() => artists.filter(a => a.isApproved), [artists]);

  // Filters for dynamic matching
  const filteredArtworks = useMemo(() => {
    let list = artworks;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter(
        aw =>
          aw.title.toLowerCase().includes(term) ||
          aw.artistName.toLowerCase().includes(term) ||
          aw.technique.toLowerCase().includes(term) ||
          aw.style.toLowerCase().includes(term)
      );
    }
    return list;
  }, [artworks, searchTerm]);

  // Categories of techniques
  const techniques = [
    { name: "Grafite", count: artworks.filter(a => a.technique === "Grafite").length, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
    { name: "Carvão", count: artworks.filter(a => a.technique === "Carvão").length, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
    { name: "Óleo sobre Tela", count: artworks.filter(a => a.technique === "Óleo sobre Tela").length, image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200" },
    { name: "Acrílico", count: artworks.filter(a => a.technique === "Acrílico").length, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200" },
    { name: "Aguarela", count: artworks.filter(a => a.technique === "Aguarela").length, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
    { name: "Digital", count: artworks.filter(a => a.technique === "Digital").length, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" }
  ];

  // Recently Added
  const recentArtworks = useMemo(() => {
    return [...artworks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [artworks]);

  // Most Loved / Adoradas
  const mostLovedArtworks = useMemo(() => {
    return [...artworks].sort((a, b) => b.likesCount - a.likesCount).slice(0, 4);
  }, [artworks]);

  // Weekly Trends / Tendências da semana (using highest views as trend trigger)
  const trendsOfWeek = useMemo(() => {
    return [...artworks].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 3);
  }, [artworks]);

  // Featured Artists
  const featuredArtists = useMemo(() => {
    return approvedArtists.filter(a => a.isFeatured).slice(0, 3);
  }, [approvedArtists]);

  return (
    <div className="space-y-16 pb-16 bg-neutral-950 text-white font-sans">
      
      {/* Hero Header Banner */}
      <div className="relative bg-neutral-900 border-b border-neutral-800/80 overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${DBManager.getPlatformImage()})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent" />
        
        {/* Subtle decorative gold line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 via-neutral-900 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl text-left space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold">
                {language === "pt" ? "A MAIOR VITRINE DE MOÇAMBIQUE" : "MOZAMBIQUE'S PREMIER PORTRAIT PORTAL"}
              </p>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif tracking-normal text-white leading-tight">
              {t.heroTitle}
            </h1>
            
            <p className="text-sm md:text-base text-neutral-400 font-sans leading-relaxed">
              {t.heroSub}
            </p>

            {/* Live Search Input Box */}
            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  id="live-search-hero-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-neutral-950/90 border border-neutral-800 hover:border-neutral-700 focus:border-amber-500 focus:ring-0 text-sm text-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-all placeholder:text-neutral-500"
                />
              </div>

              <button
                id="search-trigger-btn"
                onClick={() => onNavigateToSearch()}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-8 py-4 rounded-2xl text-xs font-extrabold transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.findArtist}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-neutral-400">
              <span className="text-neutral-500">{language === "pt" ? "Filtros rápidos:" : "Quick links:"}</span>
              <button onClick={() => onNavigateToSearch({ province: "Maputo Cidade" })} className="hover:text-amber-500 transition-colors">Maputo</button>
              <span className="text-neutral-700">•</span>
              <button onClick={() => onNavigateToSearch({ technique: "Grafite" })} className="hover:text-amber-500 transition-colors">Grafite</button>
              <span className="text-neutral-700">•</span>
              <button onClick={() => onNavigateToSearch({ technique: "Carvão" })} className="hover:text-amber-500 transition-colors">Carvão</button>
              <span className="text-neutral-700">•</span>
              <button onClick={() => onNavigateToSearch({ technique: "Óleo sobre Tela" })} className="hover:text-amber-500 transition-colors">Óleo</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* IF USER ENTERED SEARCH, SHOW RESULTS DYNAMICALLY */}
        {searchTerm.trim() ? (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-neutral-800 pb-2">
              Resultados da Pesquisa para: "{searchTerm}" ({filteredArtworks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filteredArtworks.map(aw => (
                <div
                  key={aw.id}
                  id={`search-card-item-${aw.id}`}
                  onClick={() => onSelectArtwork(aw)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all"
                >
                  <img src={aw.imageUrls[0]} alt="" className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <span className="text-[10px] text-amber-500 font-mono font-bold block mb-1">{aw.technique}</span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors truncate">{aw.title}</h4>
                    <p className="text-[9px] text-neutral-500 truncate">{aw.artistName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 1. WEEKLY TRENDS (Tendências da semana) - Beautiful slider layout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-amber-500" />
                  <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">{t.weeklyTrends}</h3>
                </div>
                <button onClick={() => onNavigateToSearch()} className="text-xs text-neutral-400 hover:text-amber-500 font-semibold flex items-center gap-1">
                  {language === "pt" ? "Explorar Todas" : "Explore All"} <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendsOfWeek.map(aw => (
                  <div
                    key={aw.id}
                    id={`trend-card-item-${aw.id}`}
                    onClick={() => onSelectArtwork(aw)}
                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 rounded-3xl overflow-hidden cursor-pointer group relative h-96 flex flex-col justify-end p-6 transition-all"
                  >
                    <img src={aw.imageUrls[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="text-[9px] font-mono tracking-widest uppercase text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 inline-block">
                        {aw.technique}
                      </span>
                      <h4 className="text-lg font-bold text-white tracking-tight">{aw.title}</h4>
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-neutral-400 text-xs">
                        <img src={aw.artistAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{aw.artistName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. RECENT WORKS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">{t.recentWorks}</h3>
                <button onClick={() => onNavigateToSearch()} className="text-xs text-neutral-400 hover:text-amber-500 font-semibold flex items-center gap-1">
                  {language === "pt" ? "Ver Vitrine" : "View Showcase"} <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {recentArtworks.map(aw => (
                  <div
                    key={aw.id}
                    id={`recent-card-item-${aw.id}`}
                    onClick={() => onSelectArtwork(aw)}
                    className="bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={aw.imageUrls[0]} alt={aw.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase text-amber-500">{aw.technique}</span>
                        {aw.price && <span className="text-[10px] font-bold text-white">{aw.price.toLocaleString()} MT</span>}
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors truncate">{aw.title}</h4>
                      <p className="text-[9px] text-neutral-400 truncate">{aw.artistName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. FEATURED ARTISTS (Artistas em destaque) */}
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">{t.featuredArtists}</h3>
                <button onClick={() => onNavigateToSearch()} className="text-xs text-neutral-400 hover:text-amber-500 font-semibold flex items-center gap-1">
                  {language === "pt" ? "Ver Todos os Retratistas" : "View All Painters"} <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArtists.map(art => (
                  <div
                    key={art.id}
                    id={`featured-artist-item-${art.id}`}
                    onClick={() => onSelectArtist(art.id)}
                    className="bg-neutral-950 border border-neutral-800/60 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer group text-center flex flex-col items-center justify-between"
                  >
                    <div className="space-y-4">
                      <img src={art.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-neutral-800 group-hover:border-amber-500/40 transition-colors" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1 justify-center">
                          {art.artisticName}
                          {art.isVerified && <ShieldCheck size={14} className="text-amber-500" />}
                        </h4>
                        <p className="text-[10px] text-neutral-500 mt-1">{art.location.city}, {art.location.province}</p>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2 max-w-xs mx-auto px-2">{art.bio}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-900 w-full flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>{art.stats.worksCount} Obras</span>
                      <span>★ {art.ratingAverage} ({art.stats.followersCount} seg)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. MOST LOVED (Obras mais adoradas) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">{t.mostLoved}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {mostLovedArtworks.map(aw => (
                  <div
                    key={aw.id}
                    id={`loved-card-item-${aw.id}`}
                    onClick={() => onSelectArtwork(aw)}
                    className="bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={aw.imageUrls[0]} alt={aw.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full text-[9px] font-mono text-amber-500 flex items-center gap-1 backdrop-blur-md">
                        <Heart size={10} className="fill-amber-500" />
                        <span>{aw.likesCount}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[9px] font-mono uppercase text-amber-500">{aw.technique}</span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors truncate">{aw.title}</h4>
                      <p className="text-[9px] text-neutral-400 truncate">{aw.artistName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. CATEGORIES OF TECHNIQUES */}
            <div className="space-y-6">
              <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">{t.categories}</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {techniques.map(tech => (
                  <div
                    key={tech.name}
                    id={`category-item-${tech.name.toLowerCase().replace(" ", "-")}`}
                    onClick={() => onNavigateToSearch({ technique: tech.name })}
                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 rounded-2xl p-4 text-center cursor-pointer transition-all group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-neutral-950/80 group-hover:bg-neutral-950/60 transition-colors z-0" />
                    <img src={tech.image} alt="" className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-30" />
                    
                    <div className="relative z-10 py-6">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors">{tech.name}</h4>
                      <p className="text-[10px] text-neutral-400 mt-1">{tech.count} {language === "pt" ? "obras" : "works"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. FIND A PORTRAIT PAINTER CTA ROW */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-serif tracking-normal text-white">Deseja encomendar um retrato sob medida?</h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-sans">Encontre os melhores retratistas do país de forma simples. Escolha a técnica, estabeleça o orçamento e o prazo ideal, e receba a sua obra-prima em sua casa.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
                <button
                  id="cta-discover-map"
                  onClick={onNavigateToMap}
                  className="px-6 py-3 border border-neutral-700 hover:border-amber-500 text-neutral-300 hover:text-amber-500 rounded-xl text-xs font-bold transition-all text-center"
                >
                  {language === "pt" ? "Ver Mapa Interativo" : "View Interactive Map"}
                </button>
                <button
                  id="cta-discover-painters"
                  onClick={() => onNavigateToSearch()}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-extrabold transition-all text-center"
                >
                  {t.findArtist}
                </button>
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
}
