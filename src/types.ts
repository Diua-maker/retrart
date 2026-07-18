/**
 * Types & Translations for Vitrine de Retratistas Moçambique
 */

export type Language = 'pt' | 'en';

export interface Translation {
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  findArtist: string;
  becomeArtist: string;
  recentWorks: string;
  mostLoved: string;
  featuredArtists: string;
  weeklyTrends: string;
  categories: string;
  allProvinces: string;
  allTechniques: string;
  allStyles: string;
  searchAndFilter: string;
  orderPortrait: string;
  noArtworksFound: string;
  views: string;
  likes: string;
  followers: string;
  experience: string;
  years: string;
  location: string;
  specialties: string;
  contactWhatsApp: string;
  sendOrder: string;
  reviews: string;
  writeReview: string;
  comments: string;
  addComment: string;
  aboutMe: string;
  otherWorks: string;
  verified: string;
  dashboard: string;
  portfolio: string;
  orders: string;
  chat: string;
  settings: string;
  admin: string;
  login: string;
  register: string;
  logout: string;
  title: string;
  description: string;
  technique: string;
  style: string;
  dimensions: string;
  availability: string;
  price: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  publishWork: string;
  active: string;
  featured: string;
  mapTitle: string;
  mapSub: string;
  available: string;
  commissionOnly: string;
  sold: string;
  clientName: string;
  clientContact: string;
  portraitType: string;
  deadline: string;
  budget: string;
  referencePhoto: string;
  status: string;
  pending: string;
  accepted: string;
  declined: string;
  completed: string;
  notifications: string;
}

export const translations: Record<Language, Translation> = {
  pt: {
    heroTitle: "RetrArt Moz — Galeria de Retratistas",
    heroSub: "Encontre os mais talentosos artistas nacionais, aprecie obras magníficas e encomende retratos personalizados em grafite, carvão, óleo e muito mais.",
    searchPlaceholder: "Pesquise por artista, técnica, cidade ou estilo...",
    findArtist: "Encontrar um Retratista",
    becomeArtist: "Divulgar Meu Trabalho",
    recentWorks: "Obras Recentes",
    mostLoved: "Obras Mais Adoradas",
    featuredArtists: "Artistas em Destaque",
    weeklyTrends: "Tendências da Semana",
    categories: "Categorias de Técnicas",
    allProvinces: "Todas as Províncias",
    allTechniques: "Todas as Técnicas",
    allStyles: "Todos os Estilos",
    searchAndFilter: "Pesquisar e Filtrar",
    orderPortrait: "Encomendar Retrato",
    noArtworksFound: "Nenhuma obra encontrada com os filtros selecionados.",
    views: "Visualizações",
    likes: "Adoros",
    followers: "Seguidores",
    experience: "Experiência",
    years: "anos",
    location: "Localização",
    specialties: "Especialidades",
    contactWhatsApp: "Contactar via WhatsApp",
    sendOrder: "Enviar Pedido de Encomenda",
    reviews: "Avaliações e Comentários",
    writeReview: "Avaliar Artista",
    comments: "Comentários",
    addComment: "Escrever um comentário...",
    aboutMe: "Sobre o Artista",
    otherWorks: "Outras Obras do Artista",
    verified: "Artista Verificado",
    dashboard: "Painel do Artista",
    portfolio: "Gerir Portfólio",
    orders: "Encomendas",
    chat: "Chat Mensagens",
    settings: "Definições",
    admin: "Administração",
    login: "Iniciar Sessão",
    register: "Criar Conta",
    logout: "Sair",
    title: "Título",
    description: "Descrição",
    technique: "Técnica",
    style: "Estilo",
    dimensions: "Dimensões",
    availability: "Disponibilidade",
    price: "Preço (MZN)",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Apagar",
    edit: "Editar",
    publishWork: "Publicar Obra",
    active: "Ativo",
    featured: "Destacado",
    mapTitle: "Mapa de Artistas de Moçambique",
    mapSub: "Explore geograficamente onde se encontram os nossos retratistas e clique para conhecer as suas galerias.",
    available: "Disponível para Venda",
    commissionOnly: "Apenas por Encomenda",
    sold: "Vendido / Privado",
    clientName: "Seu Nome completo",
    clientContact: "Seu Contacto (WhatsApp ou Email)",
    portraitType: "Tipo de Retrato (Ex: Individual, Casal, Família, Pet)",
    deadline: "Prazo Desejado",
    budget: "Orçamento Estimado (MZN, opcional)",
    referencePhoto: "Foto de Referência (URL ou Ficheiro)",
    status: "Estado",
    pending: "Pendente",
    accepted: "Aceite",
    declined: "Recusado",
    completed: "Concluído",
    notifications: "Notificações",
  },
  en: {
    heroTitle: "RetrArt Moz — Portrait Showcase of Mozambique",
    heroSub: "Find the most talented national artists, appreciate magnificent artworks, and commission custom portraits in graphite, charcoal, oil, and more.",
    searchPlaceholder: "Search by artist, technique, city or style...",
    findArtist: "Find a Portrait Painter",
    becomeArtist: "Showcase My Work",
    recentWorks: "Recent Artworks",
    mostLoved: "Most Loved Artworks",
    featuredArtists: "Featured Artists",
    weeklyTrends: "Weekly Trends",
    categories: "Technique Categories",
    allProvinces: "All Provinces",
    allTechniques: "All Techniques",
    allStyles: "All Styles",
    searchAndFilter: "Search & Filter",
    orderPortrait: "Commission Portrait",
    noArtworksFound: "No artworks found matching the selected filters.",
    views: "Views",
    likes: "Likes",
    followers: "Followers",
    experience: "Experience",
    years: "years",
    location: "Location",
    specialties: "Specialties",
    contactWhatsApp: "Contact via WhatsApp",
    sendOrder: "Send Commission Request",
    reviews: "Reviews and Feedback",
    writeReview: "Review Artist",
    comments: "Comments",
    addComment: "Write a comment...",
    aboutMe: "About the Artist",
    otherWorks: "Other Artworks by Artist",
    verified: "Verified Artist",
    dashboard: "Artist Dashboard",
    portfolio: "Manage Portfolio",
    orders: "Commissions",
    chat: "Internal Chat",
    settings: "Settings",
    admin: "Administration",
    login: "Log In",
    register: "Sign Up",
    logout: "Log Out",
    title: "Title",
    description: "Description",
    technique: "Technique",
    style: "Style",
    dimensions: "Dimensions",
    availability: "Availability",
    price: "Price (MZN)",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    publishWork: "Publish Artwork",
    active: "Active",
    featured: "Featured",
    mapTitle: "Mozambique Artists Map",
    mapSub: "Explore geographically where our portrait painters are based and click to view their galleries.",
    available: "Available for Sale",
    commissionOnly: "Commission Only",
    sold: "Sold / Private Collection",
    clientName: "Your Full Name",
    clientContact: "Your Contact (WhatsApp or Email)",
    portraitType: "Portrait Type (e.g., Single, Couple, Family, Pet)",
    deadline: "Desired Deadline",
    budget: "Estimated Budget (MZN, optional)",
    referencePhoto: "Reference Photo (URL or File)",
    status: "Status",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
    notifications: "Notifications",
  }
};

export interface Artist {
  id: string;
  artisticName: string;
  fullName?: string;
  email: string;
  location: {
    city: string;
    province: string;
  };
  bio: string;
  specialties: string[];
  experienceYears: number;
  avatarUrl: string;
  coverUrl: string;
  whatsapp: string;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  stats: {
    worksCount: number;
    likesCount: number;
    viewsCount: number;
    followersCount: number;
    whatsappClicks: number;
  };
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  ratingAverage: number;
}

export interface Artwork {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  title: string;
  description: string;
  technique: string;
  style: string;
  dimensions: string;
  availability: 'available' | 'commissionOnly' | 'sold';
  price?: number;
  imageUrls: string[]; // Supports multiple images
  likesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  artistId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  artworkId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Order {
  id: string;
  artistId: string;
  clientName: string;
  clientContact: string;
  portraitType: string;
  description: string;
  referencePhotoUrl: string;
  deadline: string;
  budget?: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  clientId?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string; // 'visitor' or artistId
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  artistId: string;
  visitorName: string;
  visitorContact: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountArtist: number;
  unreadCountVisitor: number;
}

export interface Notification {
  id: string;
  userId: string; // artistId or 'admin'
  type: 'follow' | 'like' | 'comment' | 'order' | 'message' | 'update' | 'artwork';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // artworkId, orderId, etc.
}

export interface LoginLog {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'artist' | 'admin' | 'user';
  timestamp: string;
  ipAddress?: string;
  browser?: string;
}

