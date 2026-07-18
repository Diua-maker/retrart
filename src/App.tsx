import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MainShowcase from "./components/MainShowcase";
import ShowcaseSearch from "./components/ShowcaseSearch";
import MozambiqueMap from "./components/MozambiqueMap";
import ArtistProfileView from "./components/ArtistProfileView";
import ArtistDashboard from "./components/ArtistDashboard";
import ClientDashboard from "./components/ClientDashboard";
import AdminPanel from "./components/AdminPanel";
import ArtworkDetailModal from "./components/ArtworkDetailModal";
import OrderModal from "./components/OrderModal";
import AuthModal from "./components/AuthModal";
import { DBManager } from "./lib/db";
import { Artist, Artwork, Language } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, ShieldAlert } from "lucide-react";

type ActiveView = "home" | "search" | "profile" | "dashboard" | "admin" | "map";

export default function App() {
  // Global Application State
  const [language, setLanguage] = useState<Language>("pt");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [currentUser, setCurrentUser] = useState<{ id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string } | null>(null);

  // Navigation
  const [currentView, setCurrentView] = useState<ActiveView>("home");
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  
  // Showcase filter context (when clicking a category on home screen)
  const [searchFilters, setSearchFilters] = useState<{ province?: string; technique?: string; style?: string } | null>(null);

  // Modals state
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artistForOrder, setArtistForOrder] = useState<Artist | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Shared Data Loaded from DBManager
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Sync data on startup
    setArtists(DBManager.getArtists());
    setArtworks(DBManager.getArtworks());

    // Pull real-time content from Firestore on startup if available
    DBManager.syncFromFirestore().then(() => {
      setArtists(DBManager.getArtists());
      setArtworks(DBManager.getArtworks());
    });

    // Auto-detect browser theme preference or default to dark
    const savedTheme = localStorage.getItem("retratistas_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedLang = localStorage.getItem("retratistas_lang") as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }

    const savedUser = localStorage.getItem("retratistas_session");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("retratistas_lang", lang);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("retratistas_theme", nextTheme);
  };

  const handleUserUpdate = (updatedUser: { id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string }) => {
    setCurrentUser(updatedUser);
  };

  const handleLoginSuccess = (user: { id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string }) => {
    // Attempt to load current avatar if not present
    let finalUser = { ...user };
    if (!finalUser.avatarUrl) {
      if (finalUser.role === "user") {
        try {
          const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
          const matched = commonUsers.find((u: any) => u.id === finalUser.id);
          if (matched && matched.avatarUrl) {
            finalUser.avatarUrl = matched.avatarUrl;
          }
        } catch (_) {}
      } else if (finalUser.role === "artist") {
        try {
          const artistsList = DBManager.getArtists();
          const matched = artistsList.find((a: any) => a.id === finalUser.id);
          if (matched && matched.avatarUrl) {
            finalUser.avatarUrl = matched.avatarUrl;
          }
        } catch (_) {}
      }
    }

    setCurrentUser(finalUser);
    localStorage.setItem("retratistas_session", JSON.stringify(finalUser));
    DBManager.addLoginLog(finalUser);
    showToast(
      language === "pt"
        ? `Bem-vindo de volta, ${finalUser.name}!`
        : `Welcome back, ${finalUser.name}!`,
      "success"
    );
    if (finalUser.role === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("retratistas_session");
    showToast(
      language === "pt" ? "Sessão terminada com sucesso." : "Logged out successfully.",
      "success"
    );
    setCurrentView("home");
  };

  const handleNavigate = (view: ActiveView, id?: string) => {
    setCurrentView(view);
    if (view === "profile" && id) {
      setSelectedArtistId(id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToSearch = (initialFilters?: { province?: string; technique?: string; style?: string }) => {
    setSearchFilters(initialFilters || null);
    setCurrentView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeArtistObj = selectedArtistId ? artists.find(a => a.id === selectedArtistId) : null;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === "light" ? "bg-neutral-50 text-neutral-900" : "bg-neutral-950 text-white"
    }`}>
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl border bg-neutral-900 text-white text-xs font-bold border-neutral-800"
          >
            {toastMessage.type === "success" ? (
              <CheckCircle size={16} className="text-amber-500" />
            ) : (
              <ShieldAlert size={16} className="text-red-500" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Navigation Header */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Viewport Router with fade layout animations */}
      <main className="min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedArtistId || "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* 1. HOME VIEW */}
            {currentView === "home" && (
              <MainShowcase
                artists={artists}
                artworks={artworks}
                language={language}
                onSelectArtist={(id) => handleNavigate("profile", id)}
                onSelectArtwork={(aw) => setSelectedArtwork(aw)}
                onNavigateToSearch={handleNavigateToSearch}
                onNavigateToMap={() => handleNavigate("map")}
              />
            )}

            {/* 2. SEARCH & DISCOVER VIEW */}
            {currentView === "search" && (
              <ShowcaseSearch
                artists={artists}
                artworks={artworks}
                language={language}
                initialFilters={searchFilters}
                onSelectArtist={(id) => handleNavigate("profile", id)}
                onSelectArtwork={(aw) => setSelectedArtwork(aw)}
              />
            )}

            {/* 3. ARTISTS MAP EXPLORER */}
            {currentView === "map" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
                <h2 className="text-2xl font-bold font-sans text-center">
                  {language === "pt" ? "Geolocalização de Retratistas" : "Portrait Painters Geolocation"}
                </h2>
                <MozambiqueMap
                  artists={artists}
                  language={language}
                  onSelectArtist={(id) => handleNavigate("profile", id)}
                />
              </div>
            )}

            {/* 4. PUBLIC PROFILE */}
            {currentView === "profile" && activeArtistObj && (
              <ArtistProfileView
                artist={activeArtistObj}
                language={language}
                currentUser={currentUser}
                onOpenAuth={() => setAuthModalOpen(true)}
                onNavigateBack={() => handleNavigate("home")}
                onOpenOrderModal={(art) => setArtistForOrder(art)}
                onOpenChat={(art) => {
                  if (currentUser) {
                    if (currentUser.role === "user") {
                      const conversationId = `conv_${art.id}_${currentUser.id}`;
                      const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
                      const matched = commonUsers.find((u: any) => u.id === currentUser.id);
                      const email = matched ? matched.email : (currentUser.id === "user_sara" ? "sara@gmail.com" : currentUser.id);
                      
                      DBManager.sendChatMessage(
                        conversationId,
                        art.id,
                        currentUser.name,
                        email,
                        "visitor",
                        currentUser.name,
                        language === "pt" ? `Olá ${art.artisticName}, gostaria de encomendar um retrato seu!` : `Hello ${art.artisticName}, I would love to commission a portrait from you!`
                      );
                    }
                    handleNavigate("dashboard");
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                onSelectArtwork={(aw) => setSelectedArtwork(aw)}
              />
            )}

            {/* 5. ARTIST DASHBOARD */}
            {currentView === "dashboard" && currentUser && currentUser.role === "artist" && (
              <ArtistDashboard
                artistId={currentUser.id}
                language={language}
                onNavigate={handleNavigate}
                onUserUpdate={handleUserUpdate}
              />
            )}

            {/* 5b. CLIENT DASHBOARD */}
            {currentView === "dashboard" && currentUser && currentUser.role === "user" && (() => {
              const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
              const matched = commonUsers.find((u: any) => u.id === currentUser.id);
              const email = matched ? matched.email : (currentUser.id === "user_sara" ? "sara@gmail.com" : currentUser.id);
              return (
                <ClientDashboard
                  userId={currentUser.id}
                  userName={currentUser.name}
                  userEmail={email}
                  language={language}
                  onNavigate={handleNavigate}
                  onUserUpdate={handleUserUpdate}
                />
              );
            })()}

            {/* 6. PLATFORM MODERATION ADMIN PANEL */}
            {currentView === "admin" && currentUser && currentUser.role === "admin" && (
              <AdminPanel
                language={language}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-12 text-center text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="font-sans font-medium text-neutral-200">
            © 2026 RetrArt Moz. Todos os direitos reservados.
          </p>
          <p className="text-neutral-500 font-sans max-w-lg mx-auto">
            {language === "pt"
              ? "A maior plataforma de encomendas e galeria de retratistas em Moçambique."
              : "The premier custom portrait painting platform and portrait artists gallery of Mozambique."}
          </p>
          <div className="flex justify-center gap-4 text-amber-500 font-semibold">
            <button onClick={() => handleNavigate("home")}>{language === "pt" ? "Página Inicial" : "Home"}</button>
            <span>•</span>
            <button onClick={() => handleNavigate("search")}>{language === "pt" ? "Vitrine Artística" : "Showcase"}</button>
            <span>•</span>
            <button onClick={() => handleNavigate("map")}>{language === "pt" ? "Mapa Geográfico" : "Interactive Map"}</button>
          </div>
        </div>
      </footer>

      {/* Global Modal Windows Renderers */}
      
      {/* 1. Artwork Detailed view */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          artists={artists}
          language={language}
          currentUser={currentUser}
          onClose={() => setSelectedArtwork(null)}
          onSelectArtist={(id) => handleNavigate("profile", id)}
          onOpenOrderModal={(art) => setArtistForOrder(art)}
          onOpenChat={(art) => {
            if (currentUser) {
              if (currentUser.role === "user") {
                const conversationId = `conv_${art.id}_${currentUser.id}`;
                const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
                const matched = commonUsers.find((u: any) => u.id === currentUser.id);
                const email = matched ? matched.email : (currentUser.id === "user_sara" ? "sara@gmail.com" : currentUser.id);
                
                DBManager.sendChatMessage(
                  conversationId,
                  art.id,
                  currentUser.name,
                  email,
                  "visitor",
                  currentUser.name,
                  language === "pt" 
                    ? `Olá ${art.artisticName}, adorei o seu retrato '${selectedArtwork?.title || ""}' e gostaria de falar sobre ele!` 
                    : `Hello ${art.artisticName}, I loved your portrait '${selectedArtwork?.title || ""}' and wanted to chat about it!`
                );
              }
              handleNavigate("dashboard");
            } else {
              setAuthModalOpen(true);
            }
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {/* 2. Commission portrait Request */}
      {artistForOrder && (
        <OrderModal
          artist={artistForOrder}
          language={language}
          currentUser={currentUser}
          onClose={() => setArtistForOrder(null)}
          onSuccess={() => {
            setArtistForOrder(null);
            showToast(
              language === "pt"
                ? "Pedido de Encomenda enviado com sucesso!"
                : "Commission request sent successfully!",
              "success"
            );
          }}
        />
      )}

      {/* 3. Authentication dialog */}
      {authModalOpen && (
        <AuthModal
          language={language}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}
