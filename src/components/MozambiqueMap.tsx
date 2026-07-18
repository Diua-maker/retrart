import React, { useState } from "react";
import { Artist, Language } from "../types";
import { MapPin, Users, ChevronRight, Eye } from "lucide-react";

interface MozambiqueMapProps {
  artists: Artist[];
  language: Language;
  onSelectArtist: (artistId: string) => void;
}

interface ProvinceMeta {
  id: string;
  name: string;
  x: number; // percentage coordinate for map node
  y: number;
}

const provinces: ProvinceMeta[] = [
  { id: "Niassa", name: "Niassa", x: 65, y: 15 },
  { id: "Cabo Delgado", name: "Cabo Delgado", x: 80, y: 12 },
  { id: "Nampula", name: "Nampula", x: 78, y: 30 },
  { id: "Zambézia", name: "Zambézia", x: 62, y: 45 },
  { id: "Tete", name: "Tete", x: 42, y: 35 },
  { id: "Manica", name: "Manica", x: 45, y: 55 },
  { id: "Sofala", name: "Sofala", x: 50, y: 65 },
  { id: "Inhambane", name: "Inhambane", x: 45, y: 80 },
  { id: "Gaza", name: "Gaza", x: 30, y: 82 },
  { id: "Maputo Província", name: "Maputo Província", x: 22, y: 90 },
  { id: "Maputo Cidade", name: "Maputo Cidade", x: 20, y: 94 }
];

export default function MozambiqueMap({ artists, language, onSelectArtist }: MozambiqueMapProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Group artists by province
  const getProvinceArtists = (provName: string) => {
    return artists.filter(a => a.location.province.toLowerCase() === provName.toLowerCase() && a.isApproved);
  };

  const totalApprovedArtists = artists.filter(a => a.isApproved).length;

  return (
    <div id="mozambique-map" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -top-24 w-96 h-96 bg-neutral-100/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Heading & Province List */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold">
                {language === "pt" ? "GEOLOCALIZAÇÃO ARTÍSTICA" : "ARTISTIC GEOLOCATION"}
              </p>
            </div>
            <h3 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white mb-2">
              {language === "pt" ? "Mapa Interativo de Retratistas" : "Interactive Map of Portrait Painters"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              {language === "pt"
                ? "Encontre retratistas profissionais nas diversas províncias de Moçambique. Clique num ponto ou selecione uma região para conhecer os artistas."
                : "Find professional portrait painters across Mozambique's provinces. Click on a point or select a region to explore our artists."}
            </p>

            {/* General Count Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium mb-6">
              <Users size={14} />
              <span>
                {totalApprovedArtists} {language === "pt" ? "Artistas Verificados no País" : "Verified Artists in the Country"}
              </span>
            </div>
          </div>

          {/* Quick list of provinces with counts */}
          <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {provinces.map(prov => {
              const count = getProvinceArtists(prov.name).length;
              const isSelected = selectedProvince === prov.name;

              return (
                <button
                  key={prov.id}
                  id={`province-btn-${prov.id.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setSelectedProvince(isSelected ? null : prov.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-500"
                      : "hover:bg-neutral-800 border border-transparent text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className={isSelected ? "text-amber-500" : "text-neutral-500"} />
                    <span className="text-xs font-medium font-sans">{prov.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      count > 0 ? "bg-amber-500/20 text-amber-500 font-bold" : "bg-neutral-800 text-neutral-500"
                    }`}>
                      {count}
                    </span>
                    <ChevronRight size={12} className="text-neutral-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Dynamic Province Detail (if any is selected) */}
        <div className="lg:col-span-3 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-neutral-300 mb-3 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <MapPin size={14} className="text-amber-500" />
              <span>{selectedProvince || (language === "pt" ? "Selecione uma Província" : "Select a Province")}</span>
            </h4>

            {selectedProvince ? (
              <div className="space-y-3">
                {getProvinceArtists(selectedProvince).length > 0 ? (
                  getProvinceArtists(selectedProvince).map(art => (
                    <div
                      key={art.id}
                      id={`map-artist-card-${art.id}`}
                      className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex items-center gap-3 hover:border-amber-500/40 transition-all cursor-pointer group"
                      onClick={() => onSelectArtist(art.id)}
                    >
                      <img
                        src={art.avatarUrl}
                        alt={art.artisticName}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h5 className="text-xs font-semibold text-white truncate group-hover:text-amber-500 transition-colors">
                            {art.artisticName}
                          </h5>
                          {art.isVerified && (
                            <span className="text-[10px] text-amber-500" title="Verificado">★</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{art.specialties.join(", ")}</p>
                      </div>
                      <Eye size={12} className="text-neutral-500 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic py-6 text-center">
                    {language === "pt" ? "Nenhum retratista registado nesta região." : "No portrait painters registered in this region."}
                  </p>
                )
              }
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <Users size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs italic">
                  {language === "pt"
                    ? "Selecione uma província no mapa ou lista para ver os artistas."
                    : "Select a province on the map or list to view the artists."}
                </p>
              </div>
            )}
          </div>

          {selectedProvince && getProvinceArtists(selectedProvince).length > 0 && (
            <div className="text-[10px] text-neutral-500 text-center pt-2">
              {language === "pt" ? "Clique no artista para abrir a galeria" : "Click artist to view gallery"}
            </div>
          )}
        </div>

        {/* Right Column: Visual Interactive Map (SVG based elegant rendering) */}
        <div className="lg:col-span-4 bg-neutral-950/40 rounded-2xl border border-neutral-800/40 p-4 flex items-center justify-center min-h-[350px] relative">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full max-h-[360px] text-neutral-700 select-none"
          >
            {/* Minimal SVG stylized shape representing Mozambique outline/flow */}
            <path
              d="M 22 96 C 21 92, 23 88, 25 86 C 28 84, 32 84, 35 81 C 38 78, 44 78, 45 74 C 46 70, 48 66, 45 62 C 42 58, 41 54, 43 50 C 45 46, 52 44, 58 42 C 64 40, 71 35, 76 30 C 81 25, 83 18, 80 12 C 77 6, 68 8, 64 12 C 60 16, 58 22, 54 26 C 50 30, 44 32, 40 34 C 36 36, 32 38, 30 42 C 28 46, 30 50, 32 54 L 34 58 C 34 58, 30 62, 28 66 C 26 70, 24 74, 21 78 C 18 82, 17 88, 19 92 Z"
              fill="none"
              stroke="#262626"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Highlighting selected state outline */}
            <path
              d="M 22 96 C 21 92, 23 88, 25 86 C 28 84, 32 84, 35 81 C 38 78, 44 78, 45 74 C 46 70, 48 66, 45 62 C 42 58, 41 54, 43 50 C 45 46, 52 44, 58 42 C 64 40, 71 35, 76 30 C 81 25, 83 18, 80 12 C 77 6, 68 8, 64 12 C 60 16, 58 22, 54 26 C 50 30, 44 32, 40 34 C 36 36, 32 38, 30 42 C 28 46, 30 50, 32 54 L 34 58 C 34 58, 30 62, 28 66 C 26 70, 24 74, 21 78 C 18 82, 17 88, 19 92 Z"
              fill="url(#mapGrad)"
              className="transition-all duration-700"
            />

            {/* Gradient definition */}
            <defs>
              <radialGradient id="mapGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#262626" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Province Dots & Connectors */}
            {provinces.map(prov => {
              const count = getProvinceArtists(prov.name).length;
              const isSelected = selectedProvince === prov.name;

              return (
                <g key={prov.id} className="cursor-pointer" onClick={() => setSelectedProvince(isSelected ? null : prov.name)}>
                  {/* Subtle hover pulse */}
                  {isSelected && (
                    <circle
                      cx={prov.x}
                      cy={prov.y}
                      r="5"
                      className="fill-amber-500/20 animate-ping"
                    />
                  )}
                  {/* Outer circle */}
                  <circle
                    cx={prov.x}
                    cy={prov.y}
                    r={isSelected ? "3" : "2"}
                    className={`transition-all duration-300 stroke-neutral-900 stroke-[0.5px] ${
                      isSelected ? "fill-amber-500" : count > 0 ? "fill-white" : "fill-neutral-700"
                    }`}
                  />
                  {/* Label for selected */}
                  {isSelected && (
                    <text
                      x={prov.x}
                      y={prov.y - 4}
                      textAnchor="middle"
                      className="fill-amber-500 text-[3.5px] font-sans font-bold"
                    >
                      {prov.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map instructions floating key */}
          <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-neutral-800/80 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-400 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>{language === "pt" ? "Província Ativa" : "Active Province"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              <span>{language === "pt" ? "Com Retratistas" : "With Painters"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
              <span>{language === "pt" ? "Sem Registos" : "No Painters Yet"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
