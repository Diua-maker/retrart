import React, { useState } from "react";
import { Language, translations } from "../types";
import { DBManager } from "../lib/db";
import { X, Lock, Mail, User, ShieldAlert, Sparkles, MapPin, UserCheck, Shield } from "lucide-react";

interface AuthModalProps {
  language: Language;
  onClose: () => void;
  onLoginSuccess: (user: { id: string; role: 'artist' | 'admin' | 'user'; name: string }) => void;
}

export default function AuthModal({ language, onClose, onLoginSuccess }: AuthModalProps) {
  const t = translations[language];

  const [activeMode, setActiveMode] = useState<"login" | "register">("login");
  const [accountType, setAccountType] = useState<"artist" | "user">("artist");
  
  // Traditional form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Maputo");
  const [province, setProvince] = useState("Maputo Cidade");
  const [whatsapp, setWhatsapp] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg(language === "pt" ? "Por favor preencha todos os campos obrigatórios." : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      try {
        if (activeMode === "login") {
          // Check standard credential match
          const artists = DBManager.getArtists();
          
          // Check admin credentials
          const targetAdminEmail = atob("ZGl1YWNvcmFnZW0xNjRAZ21haWwuY29t");
          if (email.toLowerCase().trim() === targetAdminEmail && password === "admin123") {
            onLoginSuccess({ id: "admin_user", role: "admin", name: "Administrador Geral" });
            onClose();
            return;
          }

          // Check registered common/standard users in local storage
          const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
          const matchedUser = commonUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (matchedUser) {
            onLoginSuccess({
              id: matchedUser.id,
              role: "user",
              name: matchedUser.name
            });
            onClose();
            return;
          }

          const matchedArtist = artists.find(a => a.email.toLowerCase() === email.toLowerCase());
          if (matchedArtist) {
            onLoginSuccess({
              id: matchedArtist.id,
              role: "artist",
              name: matchedArtist.artisticName
            });
            onClose();
          } else {
            setErrorMsg(language === "pt" ? "Credenciais incorretas ou conta inexistente." : "Incorrect credentials or account does not exist.");
          }
        } else {
          // Register flow
          if (!name.trim()) {
            setErrorMsg(language === "pt" ? "Preencha o campo do nome." : "Please fill in the name field.");
            setLoading(false);
            return;
          }

          if (accountType === "artist" && !whatsapp.trim()) {
            setErrorMsg(language === "pt" ? "Preencha o número de telemóvel (WhatsApp)." : "Please fill in the WhatsApp phone number.");
            setLoading(false);
            return;
          }

          // Register standard user vs artist
          if (accountType === "user") {
            const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
            const emailExists = commonUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
            
            if (emailExists) {
              setErrorMsg(language === "pt" ? "Este email já está registado." : "This email is already registered.");
              setLoading(false);
              return;
            }

            const newUserId = "user_" + Date.now();
            const newUser = {
              id: newUserId,
              name: name.trim(),
              email: email.trim(),
              password: password,
              role: "user"
            };

            commonUsers.push(newUser);
            DBManager.saveCommonUsers(commonUsers);

            onLoginSuccess({
              id: newUserId,
              role: "user",
              name: name.trim()
            });
            onClose();
          } else {
            // Register artist
            const artists = DBManager.getArtists();
            const emailExists = artists.some(a => a.email.toLowerCase() === email.toLowerCase());
            
            if (emailExists) {
              setErrorMsg(language === "pt" ? "Este email já está registado." : "This email is already registered.");
              setLoading(false);
              return;
            }

            const newArtistId = "art_" + Date.now();
            const newArtist = {
              id: newArtistId,
              artisticName: name.trim(),
              fullName: name.trim(),
              email: email.trim(),
              location: { city: city.trim(), province },
              bio: language === "pt" ? "Artista retratista profissional." : "Professional portrait artist.",
              specialties: ["Grafite"],
              experienceYears: 1,
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
              coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
              whatsapp: whatsapp.trim(),
              socials: {},
              stats: { worksCount: 0, likesCount: 0, viewsCount: 0, followersCount: 0, whatsappClicks: 0 },
              isVerified: false,
              isApproved: false, // Pending admin approval demo!
              isFeatured: false,
              ratingAverage: 5.0,
              createdAt: new Date().toISOString()
            };

            artists.push(newArtist);
            DBManager.saveArtists(artists);

            onLoginSuccess({
              id: newArtistId,
              role: "artist",
              name: name.trim()
            });
            onClose();
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(language === "pt" ? "Ocorreu um erro na autenticação." : "An error occurred during authentication.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        
        {/* Floating Close Button */}
        <button
          id="close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-white bg-neutral-950/60 p-2 rounded-full transition-all"
        >
          <X size={16} />
        </button>

        {/* Brand visual header */}
        <div className="bg-neutral-950/80 px-6 py-6 border-b border-neutral-800 flex flex-col items-center text-center">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-neutral-950 font-mono text-lg mb-2 overflow-hidden">
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
          <h3 className="text-sm font-bold tracking-widest text-white uppercase font-sans">
            {language === "pt" ? "ACESSO À PLATAFORMA" : "PLATFORM GATEWAY"}
          </h3>
          <p className="text-[10px] text-amber-500 font-mono uppercase tracking-wider mt-0.5">
            Retratistas de Moçambique
          </p>
        </div>

        {/* Modal tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/30">
          <button
            id="auth-mode-login-tab"
            onClick={() => setActiveMode("login")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeMode === "login" ? "text-amber-500 border-b-2 border-amber-500" : "text-neutral-500 hover:text-white"
            }`}
          >
            {t.login}
          </button>
          <button
            id="auth-mode-register-tab"
            onClick={() => setActiveMode("register")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeMode === "register" ? "text-amber-500 border-b-2 border-amber-500" : "text-neutral-500 hover:text-white"
            }`}
          >
            {t.register}
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-sans">
              <ShieldAlert size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Traditional login/register forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {activeMode === "register" && (
              <>
                {/* Account Type Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1.5 uppercase tracking-wide">Tipo de Conta *</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAccountType("artist")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        accountType === "artist"
                          ? "bg-amber-500 text-neutral-950"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Artista Retratista
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("user")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        accountType === "user"
                          ? "bg-amber-500 text-neutral-950"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Cliente / Encomendar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">
                    {accountType === "artist" ? "Nome Artístico *" : "Nome Completo *"}
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3.5 text-neutral-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={accountType === "artist" ? "Ex: Sebastião Coana" : "Ex: Sara Macuácua"}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">Endereço de Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeMode === "login" ? "Ex: cliente@gmail.com ou artista@retrart.com" : "Ex: cliente@gmail.com"}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">Palavra-passe *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            {activeMode === "register" && accountType === "artist" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">Cidade *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">Província *</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
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
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">Telemóvel (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: +258 84 123 4567"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-xs text-white rounded-xl px-4 py-3 outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 py-3.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin inline-block align-middle mr-2" />
              ) : null}
              {activeMode === "login" ? t.login : t.register}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
