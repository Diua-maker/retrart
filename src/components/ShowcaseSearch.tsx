import React, { useState, useMemo, useEffect } from "react";
import { Artist, Artwork, Language, translations } from "../types";
import { Search, MapPin, Layers, Compass, SlidersHorizontal, Check, Star, ShieldCheck } from "lucide-react";

interface ShowcaseSearchProps {
  artists: Artist[];
  artworks: Artwork[];
  language: Language;
  initialFilters: { province?: string; technique?: string; style?: string } | null;
  onSelectArtist: (artistId: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export default function ShowcaseSearch({
  artists,
  artworks,
  language,
  initialFilters,
  onSelectArtist,
  onSelectArtwork
}: ShowcaseSearchProps) {
  const t = translations[language];

  // Dynamic filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  
  // Tab control: view matching artworks or matching artists
  const [viewMode, setViewMode] = useState<"artworks" | "artists">("artworks");

  // Load initial filters if redirected from home screen categories
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.province) setSelectedProvince(initialFilters.province);
      if (initialFilters.technique) setSelectedTechnique(initialFilters.technique);
      if (initialFilters.style) setSelectedStyle(initialFilters.style);
    }
  }, [initialFilters]);

  // Unique options for filters
  const provinces = ["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];
  const techniques = ["Grafite", "Carvão", "Óleo sobre Tela", "Acrílico", "Aguarela", "Lápis de Cor", "Pastel Seco", "Digital"];
  const styles = ["Hiperrealismo", "Realismo", "Impressionismo", "Surrealismo", "Pop Art", "Digital Art", "Afrofuturismo"];

  // Filter approved artists first
  const approvedArtists = useMemo(() => artists.filter(a => a.isApproved), [artists]);

  // Dynamic filter logic (Client side, instant without reload)
  const filteredArtworks = useMemo(() => {
    return artworks.filter(aw => {
      const matchQuery = !searchQuery.trim() ||
        aw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aw.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aw.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Find artist profile for location check
      const artProfile = artists.find(a => a.id === aw.artistId);
      const matchProvince = !selectedProvince || (artProfile?.location.province === selectedProvince);
      
      const matchTechnique = !selectedTechnique || (aw.technique === selectedTechnique);
      const matchStyle = !selectedStyle || (aw.style === selectedStyle);

      return matchQuery && matchProvince && matchTechnique && matchStyle;
    });
  }, [artworks, artists, searchQuery, selectedProvince, selectedTechnique, selectedStyle]);

  const filteredArtists = useMemo(() => {
    return approvedArtists.filter(art => {
      const matchQuery = !searchQuery.trim() ||
        art.artisticName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.fullName && art.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        art.bio.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProvince = !selectedProvince || (art.location.province === selectedProvince);
      const matchTechnique = !selectedTechnique || art.specialties.includes(selectedTechnique);
      const matchStyle = !selectedStyle || art.specialties.some(s => s.toLowerCase() === selectedStyle.toLowerCase()) || art.bio.toLowerCase().includes(selectedStyle.toLowerCase());

      return matchQuery && matchProvince && matchTechnique && matchStyle;
    });
  }, [approvedArtists, searchQuery, selectedProvince, selectedTechnique, selectedStyle]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProvince("");
    setSelectedTechnique("");
    setSelectedStyle("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="pb-6 border-b border-neutral-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif tracking-normal text-white">{t.searchAndFilter}</h1>
            <p className="text-xs text-neutral-400 mt-1">Explore as galerias dos retratistas de Moçambique através de filtros instantâneos.</p>
          </div>

          {/* Quick results view switcher tabs */}
          <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 self-stretch md:self-auto">
            <button
              id="switch-view-artworks"
              onClick={() => setViewMode("artworks")}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                viewMode === "artworks" ? "bg-amber-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              {language === "pt" ? "Obras Encontradas" : "Found Artworks"} ({filteredArtworks.length})
            </button>
            <button
              id="switch-view-artists"
              onClick={() => setViewMode("artists")}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                viewMode === "artists" ? "bg-amber-500 text-neutral-950" : "text-neutral-400 hover:text-white"
              }`}
            >
              {language === "pt" ? "Artistas Encontrados" : "Found Artists"} ({filteredArtists.length})
            </button>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Live keyword query input */}
            <div className="relative">
              <input
                type="text"
                id="search-query-filter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "pt" ? "Nome, técnica, estilo..." : "Name, technique, style..."}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

            {/* Province selection dropdown */}
            <div>
              <select
                id="filter-province-select"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
              >
                <option value="">{t.allProvinces}</option>
                {provinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Technique selection dropdown */}
            <div>
              <select
                id="filter-technique-select"
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
              >
                <option value="">{t.allTechniques}</option>
                {techniques.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Style selection dropdown */}
            <div>
              <select
                id="filter-style-select"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
              >
                <option value="">{t.allStyles}</option>
                {styles.map(sty => (
                  <option key={sty} value={sty}>{sty}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Clean filters button row */}
          {(searchQuery || selectedProvince || selectedTechnique || selectedStyle) && (
            <div className="flex justify-end pt-2">
              <button
                id="clear-all-filters-btn"
                onClick={handleClearFilters}
                className="text-xs text-amber-500 hover:text-white font-mono font-bold"
              >
                {language === "pt" ? "Limpar Todos os Filtros ×" : "Clear All Filters ×"}
              </button>
            </div>
          )}
        </div>

        {/* RESULTS GRID VIEWPORT */}
        
        {/* Render Matching Artworks */}
        {viewMode === "artworks" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredArtworks.map(aw => (
                <div
                  key={aw.id}
                  id={`search-artwork-grid-${aw.id}`}
                  onClick={() => onSelectArtwork(aw)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="h-48 overflow-hidden relative bg-neutral-950/40">
                    <img src={aw.imageUrls[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-500 uppercase">{aw.technique}</span>
                      {aw.price && <span className="text-white font-bold">{aw.price.toLocaleString()} MZN</span>}
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors truncate">{aw.title}</h4>
                    <p className="text-[10px] text-neutral-400 truncate">{aw.artistName}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="text-center py-24 bg-neutral-900/40 border border-neutral-800/60 rounded-3xl text-neutral-500 italic font-sans">
                {t.noArtworksFound}
              </div>
            )}
          </div>
        )}

        {/* Render Matching Artists */}
        {viewMode === "artists" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredArtists.map(art => (
                <div
                  key={art.id}
                  id={`search-artist-grid-${art.id}`}
                  onClick={() => onSelectArtist(art.id)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 rounded-2xl p-6 cursor-pointer group text-center flex flex-col items-center justify-between transition-all"
                >
                  <div className="space-y-4 w-full">
                    <img src={art.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-neutral-800 group-hover:border-amber-500/40 transition-colors" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                        {art.artisticName}
                        {art.isVerified && <ShieldCheck size={14} className="text-amber-500" />}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1 flex items-center justify-center gap-1">
                        <MapPin size={10} />
                        {art.location.city}, {art.location.province}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 max-w-xs mx-auto">{art.bio}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-800/60 w-full flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>{art.stats.worksCount} Obras</span>
                    <span>★ {art.ratingAverage}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-24 bg-neutral-900/40 border border-neutral-800/60 rounded-3xl text-neutral-500 italic font-sans">
                {language === "pt" ? "Nenhum artista encontrado com os filtros selecionados." : "No artists found matching selected filters."}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
