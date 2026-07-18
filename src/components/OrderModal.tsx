import React, { useState } from "react";
import { Artist, Language, translations } from "../types";
import { DBManager } from "../lib/db";
import { X, Check, Calendar, DollarSign, Image as ImageIcon, Send, ShieldAlert } from "lucide-react";

interface OrderModalProps {
  artist: Artist;
  language: Language;
  currentUser: { id: string; role: 'artist' | 'admin' | 'user'; name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ artist, language, currentUser, onClose, onSuccess }: OrderModalProps) {
  const t = translations[language];

  // Get user details if logged in as common/standard user
  const getLoggedInUserEmail = () => {
    if (!currentUser) return "";
    const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
    const matched = commonUsers.find((u: any) => u.id === currentUser.id);
    return matched ? matched.email : currentUser.id;
  };

  // Form State
  const [clientName, setClientName] = useState(currentUser?.name || "");
  const [clientContact, setClientContact] = useState(currentUser ? getLoggedInUserEmail() : "");
  const [portraitType, setPortraitType] = useState("Retrato Individual (A3)");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [referencePhotoUrl, setReferencePhotoUrl] = useState("");
  
  // File drag-and-drop simulation
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      // Simulate file upload by creating a temporary object URL or static placeholder
      setReferencePhotoUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setReferencePhotoUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim() || !description.trim() || !deadline) {
      setErrorMsg(language === "pt" ? "Por favor, preencha todos os campos obrigatórios (*)." : "Please fill in all required fields (*).");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Create new commission request
      DBManager.addOrder({
        artistId: artist.id,
        clientName,
        clientContact,
        portraitType,
        description,
        referencePhotoUrl: referencePhotoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        deadline,
        budget: budget ? Number(budget) : undefined,
        clientId: currentUser?.role === "user" ? currentUser.id : undefined
      });

      // Also create an initial chat conversation so the artist can directly respond to them!
      const conversationId = currentUser?.role === "user" ? `conv_${artist.id}_${currentUser.id}` : `conv_${artist.id}_${Date.now()}`;
      DBManager.sendChatMessage(
        conversationId,
        artist.id,
        clientName,
        clientContact,
        "visitor",
        clientName,
        language === "pt"
          ? `[NOVO PEDIDO DE ENCOMENDA]: Olá, acabei de enviar um pedido de retrato! Tipo: ${portraitType}, Prazo: ${deadline}.`
          : `[NEW COMMISSION REQUEST]: Hello, I just sent a portrait commission request! Type: ${portraitType}, Deadline: ${deadline}.`
      );

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg(language === "pt" ? "Ocorreu um erro ao enviar o pedido." : "An error occurred while sending the request.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl">
        {/* Modal Header */}
        <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-950/80">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t.orderPortrait}
            </h3>
            <p className="text-xs text-neutral-400">
              {language === "pt" ? `Para: ${artist.artisticName}` : `To: ${artist.artisticName}`}
            </p>
          </div>
          <button
            id="close-order-modal"
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Client Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {t.clientName} <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                id="client-name-input"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Rui de Sousa"
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl px-4 py-3 transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {t.clientContact} <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                id="client-contact-input"
                required
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                placeholder="Ex: +258 84 999 0000 ou email"
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl px-4 py-3 transition-colors outline-none"
              />
            </div>
          </div>

          {/* Portrait Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {t.portraitType}
              </label>
              <select
                id="portrait-type-select"
                value={portraitType}
                onChange={(e) => setPortraitType(e.target.value)}
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 text-sm text-white rounded-xl px-4 py-3 outline-none transition-colors"
              >
                <option value="Retrato Individual (A4)">{language === "pt" ? "Retrato Individual (A4)" : "Single Portrait (A4)"}</option>
                <option value="Retrato Individual (A3)">{language === "pt" ? "Retrato Individual (A3)" : "Single Portrait (A3)"}</option>
                <option value="Retrato Individual (A2)">{language === "pt" ? "Retrato Individual (A2)" : "Single Portrait (A2)"}</option>
                <option value="Retrato de Casal / Duplo (A3)">{language === "pt" ? "Retrato de Casal / Duplo (A3)" : "Couple / Double Portrait (A3)"}</option>
                <option value="Retrato Familiar (A2 ou maior)">{language === "pt" ? "Retrato Familiar (A2 ou maior)" : "Family Portrait (A2 or larger)"}</option>
                <option value="Retrato de Animal de Estimação">{language === "pt" ? "Retrato de Animal de Estimação (Pet)" : "Pet Portrait"}</option>
                <option value="Tamanho Personalizado">{language === "pt" ? "Tamanho Personalizado" : "Custom Custom Size"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {t.deadline} <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="deadline-input"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl px-4 py-3 transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description & Reference */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
              {language === "pt" ? "Descrição Detalhada do Pedido" : "Detailed Request Description"} <span className="text-amber-500">*</span>
            </label>
            <textarea
              id="order-desc-input"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === "pt"
                  ? "Indique detalhes adicionais: se deseja fundo simples, roupas específicas, se é uma surpresa ou se pretende incluir dedicatórias na obra..."
                  : "State additional details: simple background choice, specific clothes, if it is a surprise, or if you want to write dedications..."
              }
              className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl p-4 transition-colors outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optional budget */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {t.budget}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 text-sm">
                  MT
                </div>
                <input
                  type="number"
                  id="budget-input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Ex: 15000"
                  className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl pl-10 pr-4 py-3 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Reference URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
                {language === "pt" ? "URL da Foto de Referência (Opcional)" : "Reference Photo URL (Optional)"}
              </label>
              <input
                type="url"
                id="ref-url-input"
                value={referencePhotoUrl}
                onChange={(e) => setReferencePhotoUrl(e.target.value)}
                placeholder="https://exemplo.com/minhafoto.jpg"
                className="w-full bg-neutral-950/50 border border-neutral-800 focus:border-amber-500/60 focus:ring-0 text-sm text-white rounded-xl px-4 py-3 transition-colors outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop File Area */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wide">
              {language === "pt" ? "Carregar Foto de Referência" : "Upload Reference Photo"}
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/30"
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 group-hover:text-white transition-colors">
                  <ImageIcon size={24} />
                </div>
                {uploadedFileName ? (
                  <div>
                    <p className="text-xs font-semibold text-white">{uploadedFileName}</p>
                    <p className="text-[10px] text-green-500 flex items-center justify-center gap-1 mt-1">
                      <Check size={12} /> {language === "pt" ? "Imagem adicionada!" : "Image added!"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-neutral-300 font-sans">
                      {language === "pt" ? "Arraste a foto ou clique para procurar" : "Drag & drop a photo or click to browse"}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                      PNG, JPG ou JPEG (Máx. 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-900">
            <button
              type="button"
              id="cancel-order"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              id="submit-order-btn"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {t.sendOrder}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
