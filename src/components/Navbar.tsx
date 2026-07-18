import React, { useState, useEffect } from "react";
import { Language, Notification, translations } from "../types";
import { DBManager } from "../lib/db";
import { Bell, Globe, Moon, Sun, User, LogOut, CheckCircle, Shield, Menu, X, Home, MapPin, LogIn } from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  currentUser: { id: string; role: 'artist' | 'admin' | 'user'; name: string; avatarUrl?: string } | null;
  onLogout: () => void;
  onNavigate: (view: "home" | "search" | "profile" | "dashboard" | "admin" | "map", artistId?: string) => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  currentUser,
  onLogout,
  onNavigate,
  onOpenAuth
}: NavbarProps) {
  const t = translations[language];

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Get user specific notifications
      const list = DBManager.getNotifications(currentUser.id);
      setNotifications(list);

      // Periodically refresh notifications
      const timer = setInterval(() => {
        setNotifications(DBManager.getNotifications(currentUser.id));
      }, 5000);
      return () => clearInterval(timer);
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    DBManager.markNotificationAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      DBManager.markAllNotificationsAsRead(currentUser.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-neutral-900 border-b border-neutral-800 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo Brand */}
          <div className="flex items-center gap-8">
            <button
              id="brand-logo"
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="h-9 w-9 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-neutral-950 font-mono tracking-tighter text-lg transition-transform group-hover:rotate-12 duration-300 overflow-hidden">
                {DBManager.getPlatformLogo() ? (
                  <img
                    src={DBManager.getPlatformLogo()}
                    alt="Logo"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  "R"
                )}
              </div>
              <div>
                <span className="text-sm font-bold tracking-widest text-white uppercase font-sans group-hover:text-amber-500 transition-colors">
                  RetrArt
                </span>
                <span className="text-[9px] font-bold block text-amber-500 font-mono tracking-widest leading-none">
                  MOZ
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-sans">
              <button
                id="nav-home"
                onClick={() => onNavigate("home")}
                className="text-neutral-300 hover:text-amber-500 transition-colors py-2 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Home size={15} />
                <span>Página inicial</span>
              </button>
              <button
                id="nav-mapa"
                onClick={() => onNavigate("map")}
                className="text-neutral-300 hover:text-amber-500 transition-colors py-2 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin size={15} />
                <span>Mapa de artistas</span>
              </button>
            </div>
          </div>

          {/* Right: Controls & User Menu */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Switcher */}
            <button
              id="lang-switcher"
              onClick={() => onLanguageChange(language === "pt" ? "en" : "pt")}
              className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold font-mono"
              title="Mudar idioma / Switch language"
            >
              <Globe size={16} />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Toggle (Light/Dark mode simulated) */}
            <button
              id="theme-toggler"
              onClick={onThemeToggle}
              className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all"
              title={theme === "light" ? "Modo Escuro" : "Modo Claro"}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Notifications Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  id="notifications-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all relative"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-amber-500 text-neutral-950 rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 text-white animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                        {t.notifications}
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          id="mark-all-read-btn"
                          onClick={handleMarkAllRead}
                          className="text-[9px] text-neutral-400 hover:text-amber-500 font-semibold"
                        >
                          {language === "pt" ? "Marcar todas como lidas" : "Mark all as read"}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            id={`notif-item-${n.id}`}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                              n.isRead
                                ? "bg-neutral-900/30 border-transparent text-neutral-400"
                                : "bg-neutral-900 border-neutral-800 text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-bold text-amber-500">{n.title}</span>
                              {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                            </div>
                            <p className="text-xs">{n.description}</p>
                            <span className="text-[8px] text-neutral-500 block mt-1 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-500 italic text-center py-6">
                          {language === "pt" ? "Sem novas notificações" : "No new notifications"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Session Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
                <button
                  id="dashboard-user-btn"
                  onClick={() => {
                    if (currentUser.role === "admin") {
                      onNavigate("admin");
                    } else {
                      onNavigate("dashboard");
                    }
                  }}
                  className="flex items-center gap-2 hover:bg-neutral-800 px-3.5 py-2 rounded-full border border-neutral-800 transition-all cursor-pointer group"
                >
                  {currentUser.role === "admin" ? (
                    <Shield size={14} className="text-amber-500" />
                  ) : currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="h-6 w-6 rounded-full object-cover border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-neutral-800 text-xs font-bold flex items-center justify-center text-amber-500 border border-neutral-700">
                      {currentUser.name[0]}
                    </div>
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold block max-w-[100px] truncate group-hover:text-amber-500 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="text-[8px] text-neutral-500 font-mono block">
                      {currentUser.role === "admin" ? "ADMIN" : (currentUser.role === "user" ? "CLIENTE" : "ARTISTA")}
                    </span>
                  </div>
                </button>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-all"
                  title={t.logout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={onOpenAuth}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn size={13} />
                <span>login</span>
              </button>
            )}

          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center gap-3">
            <button
              id="lang-switcher-mobile"
              onClick={() => onLanguageChange(language === "pt" ? "en" : "pt")}
              className="p-2 text-xs font-bold text-amber-500 font-mono"
            >
              {language.toUpperCase()}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-4 space-y-4 text-center">
          <button
            id="mobile-nav-home"
            onClick={() => { onNavigate("home"); setMobileMenuOpen(false); }}
            className="w-full text-neutral-300 hover:text-amber-500 font-semibold py-2 flex items-center justify-center gap-1.5 text-sm"
          >
            <Home size={16} />
            <span>Página inicial</span>
          </button>
          <button
            id="mobile-nav-map"
            onClick={() => { onNavigate("map"); setMobileMenuOpen(false); }}
            className="w-full text-neutral-300 hover:text-amber-500 font-semibold py-2 flex items-center justify-center gap-1.5 text-sm"
          >
            <MapPin size={16} />
            <span>Mapa de artistas</span>
          </button>

          {currentUser ? (
            <div className="border-t border-neutral-800 pt-4 space-y-3">
              <p className="text-xs text-neutral-500 font-mono">
                {currentUser.role === "admin" ? "ADMINISTRADOR" : (currentUser.role === "user" ? "CLIENTE CONECTADO" : "ARTISTA CONECTADO")}
              </p>
              <button
                id="mobile-nav-dashboard"
                onClick={() => {
                  onNavigate(currentUser.role === "admin" ? "admin" : "dashboard");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-amber-500 py-2 rounded-xl text-xs font-bold block"
              >
                {currentUser.role === "admin" ? "Painel Admin" : (currentUser.role === "user" ? "Meu Painel de Cliente" : t.dashboard)}
              </button>
              <button
                id="mobile-nav-logout"
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full text-red-400 hover:bg-neutral-900 py-2 rounded-xl text-xs font-semibold block"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <button
              id="mobile-login-btn"
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full bg-amber-500 text-neutral-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 block"
            >
              <LogIn size={14} />
              <span>login</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
