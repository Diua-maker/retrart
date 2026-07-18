/**
 * High-performance Portfolio & Marketplace Data Engine for Retratistas Moçambique
 */
import { Artist, Artwork, Review, Comment, Order, ChatMessage, ChatConversation, Notification, LoginLog } from "../types";
import { db, isFirebaseAvailable } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

// Helper keys for local persistence
const KEYS = {
  ARTISTS: "retratistas_artists",
  ARTWORKS: "retratistas_artworks",
  REVIEWS: "retratistas_reviews",
  COMMENTS: "retratistas_comments",
  ORDERS: "retratistas_orders",
  CHATS: "retratistas_chats",
  CONVERSATIONS: "retratistas_conversations",
  NOTIFICATIONS: "retratistas_notifications",
  USER: "retratistas_current_user",
  LANG: "retratistas_language",
  FAVORITES: "retratistas_favorites",
  LIKES: "retratistas_likes",
  FOLLOWS: "retratistas_follows",
  LOGIN_HISTORY: "retratistas_login_history"
};

// Seed Data
const initialArtists: Artist[] = [];

const initialArtworks: Artwork[] = [];

const initialReviews: Review[] = [];

const initialComments: Comment[] = [];

const initialOrders: Order[] = [];

const initialConversations: ChatConversation[] = [];

const initialMessages: ChatMessage[] = [];

const initialNotifications: Notification[] = [];

const initialLoginHistory: LoginLog[] = [];

export class DBManager {
  // Bidirectional Cloud Firestore Sync Engine
  static async syncFromFirestore() {
    if (!isFirebaseAvailable || !db) return;
    try {
      const collections = [
        { key: KEYS.ARTISTS, path: "retratistas_artists" },
        { key: KEYS.ARTWORKS, path: "retratistas_artworks" },
        { key: KEYS.REVIEWS, path: "retratistas_reviews" },
        { key: KEYS.COMMENTS, path: "retratistas_comments" },
        { key: KEYS.ORDERS, path: "retratistas_orders" },
        { key: KEYS.CHATS, path: "retratistas_chats" },
        { key: KEYS.CONVERSATIONS, path: "retratistas_conversations" },
        { key: KEYS.NOTIFICATIONS, path: "retratistas_notifications" },
        { key: KEYS.LOGIN_HISTORY, path: "retratistas_login_history" },
        { key: "retratistas_common_users", path: "retratistas_common_users" }
      ];

      for (const col of collections) {
        const snap = await getDocs(collection(db, col.path));
        const items: any[] = [];
        snap.forEach(docSnap => {
          items.push({ ...docSnap.data() });
        });
        if (items.length > 0) {
          localStorage.setItem(col.key, JSON.stringify(items));
        }
      }

      // Sync configurations
      const configDoc = await getDoc(doc(db, "retrart_moz_platform_config", "general"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data.platformImage) {
          localStorage.setItem("retrart_moz_platform_image", data.platformImage);
        }
        if (data.platformLogo) {
          localStorage.setItem("retrart_moz_platform_logo", data.platformLogo);
        }
      }
      console.log("RetrArt Moz cloud synchronization completed successfully!");
    } catch (error) {
      console.warn("Failed to sync from Firestore, using offline cache:", error);
    }
  }

  private static async persistToFirestore(key: string, data: any) {
    if (!isFirebaseAvailable || !db) return;
    try {
      if (key === "retrart_moz_platform_image" || key === "retrart_moz_platform_logo") {
        await setDoc(doc(db, "retrart_moz_platform_config", "general"), {
          platformImage: localStorage.getItem("retrart_moz_platform_image") || "",
          platformLogo: localStorage.getItem("retrart_moz_platform_logo") || ""
        }, { merge: true });
        return;
      }

      let path = "";
      if (key === KEYS.ARTISTS) path = "retratistas_artists";
      else if (key === KEYS.ARTWORKS) path = "retratistas_artworks";
      else if (key === KEYS.REVIEWS) path = "retratistas_reviews";
      else if (key === KEYS.COMMENTS) path = "retratistas_comments";
      else if (key === KEYS.ORDERS) path = "retratistas_orders";
      else if (key === KEYS.CHATS) path = "retratistas_chats";
      else if (key === KEYS.CONVERSATIONS) path = "retratistas_conversations";
      else if (key === KEYS.NOTIFICATIONS) path = "retratistas_notifications";
      else if (key === KEYS.LOGIN_HISTORY) path = "retratistas_login_history";
      else if (key === "retratistas_common_users") path = "retratistas_common_users";

      if (!path) return;

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.id) {
            await setDoc(doc(db, path, item.id), item);
          }
        }
      } else if (data && data.id) {
        await setDoc(doc(db, path, data.id), data);
      }
    } catch (err) {
      console.warn("Firestore save deferred:", err);
    }
  }

  private static async deleteFromFirestore(key: string, id: string) {
    if (!isFirebaseAvailable || !db) return;
    try {
      let path = "";
      if (key === KEYS.ARTWORKS) path = "retratistas_artworks";
      else if (key === KEYS.COMMENTS) path = "retratistas_comments";
      else if (key === KEYS.ARTISTS) path = "retratistas_artists";
      if (!path) return;
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      console.warn("Firestore delete deferred:", err);
    }
  }

  private static initLocalStorage() {
    if (typeof window === "undefined") return;

    // Auto-wipe existing local storage database and login history
    const cleanKey = "retrart_moz_cleaned_v5";
    if (!localStorage.getItem(cleanKey)) {
      localStorage.removeItem(KEYS.ARTISTS);
      localStorage.removeItem(KEYS.ARTWORKS);
      localStorage.removeItem(KEYS.REVIEWS);
      localStorage.removeItem(KEYS.COMMENTS);
      localStorage.removeItem(KEYS.ORDERS);
      localStorage.removeItem(KEYS.CONVERSATIONS);
      localStorage.removeItem(KEYS.CHATS);
      localStorage.removeItem(KEYS.NOTIFICATIONS);
      localStorage.removeItem(KEYS.USER);
      localStorage.removeItem(KEYS.FAVORITES);
      localStorage.removeItem(KEYS.LIKES);
      localStorage.removeItem(KEYS.FOLLOWS);
      localStorage.removeItem(KEYS.LOGIN_HISTORY);
      localStorage.removeItem("retratistas_session");
      localStorage.removeItem("retratistas_common_users");
      localStorage.setItem(cleanKey, "true");
    }

    if (!localStorage.getItem(KEYS.ARTISTS)) {
      localStorage.setItem(KEYS.ARTISTS, JSON.stringify(initialArtists));
    }
    if (!localStorage.getItem(KEYS.ARTWORKS)) {
      localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(initialArtworks));
    }
    if (!localStorage.getItem(KEYS.REVIEWS)) {
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(initialReviews));
    }
    if (!localStorage.getItem(KEYS.COMMENTS)) {
      localStorage.setItem(KEYS.COMMENTS, JSON.stringify(initialComments));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
    }
    if (!localStorage.getItem(KEYS.CONVERSATIONS)) {
      localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(initialConversations));
    }
    if (!localStorage.getItem(KEYS.CHATS)) {
      localStorage.setItem(KEYS.CHATS, JSON.stringify(initialMessages));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    }
    if (!localStorage.getItem(KEYS.FAVORITES)) {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.LIKES)) {
      localStorage.setItem(KEYS.LIKES, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.FOLLOWS)) {
      localStorage.setItem(KEYS.FOLLOWS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.LOGIN_HISTORY)) {
      localStorage.setItem(KEYS.LOGIN_HISTORY, JSON.stringify(initialLoginHistory));
    }
    if (!localStorage.getItem("retrart_moz_history_cleared_v1")) {
      localStorage.setItem(KEYS.LOGIN_HISTORY, JSON.stringify([]));
      localStorage.setItem("retrart_moz_history_cleared_v1", "true");
    }
  }

  static getLoginHistory(): LoginLog[] {
    this.initLocalStorage();
    try {
      return JSON.parse(localStorage.getItem(KEYS.LOGIN_HISTORY) || "[]");
    } catch {
      return [];
    }
  }

  static addLoginLog(user: { id: string; role: 'artist' | 'admin' | 'user'; name: string; email?: string }) {
    const logs = this.getLoginHistory();
    const newLog: LoginLog = {
      id: "log_" + Date.now(),
      userId: user.id,
      name: user.name,
      email: user.email || (user.role === "admin" ? atob("ZGl1YWNvcmFnZW0xNjRAZ21haWwuY29t") : user.role === "artist" ? `${user.id}@retrart.com` : "client@gmail.com"),
      role: user.role,
      timestamp: new Date().toISOString(),
      ipAddress: "197.249." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255),
      browser: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 50) : "Web Browser"
    };
    logs.unshift(newLog); // Put most recent at top
    localStorage.setItem(KEYS.LOGIN_HISTORY, JSON.stringify(logs));
    this.persistToFirestore(KEYS.LOGIN_HISTORY, newLog);
  }

  static clearLoginHistory() {
    localStorage.setItem(KEYS.LOGIN_HISTORY, JSON.stringify([]));
  }

  static getCommonUsers(): any[] {
    try {
      return JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
    } catch {
      return [];
    }
  }

  static saveCommonUsers(users: any[]) {
    localStorage.setItem("retratistas_common_users", JSON.stringify(users));
    this.persistToFirestore("retratistas_common_users", users);
  }

  static getPlatformImage(): string {
    if (typeof window === "undefined") return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1600";
    return localStorage.getItem("retrart_moz_platform_image") || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1600";
  }

  static savePlatformImage(url: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("retrart_moz_platform_image", url);
    this.persistToFirestore("retrart_moz_platform_image", url);
  }

  static getPlatformLogo(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("retrart_moz_platform_logo") || "";
  }

  static savePlatformLogo(urlOrBase64: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("retrart_moz_platform_logo", urlOrBase64);
    this.persistToFirestore("retrart_moz_platform_logo", urlOrBase64);
  }

  static getArtists(): Artist[] {
    this.initLocalStorage();
    try {
      return JSON.parse(localStorage.getItem(KEYS.ARTISTS) || "[]");
    } catch {
      return initialArtists;
    }
  }

  static saveArtists(artists: Artist[]) {
    localStorage.setItem(KEYS.ARTISTS, JSON.stringify(artists));
    this.persistToFirestore(KEYS.ARTISTS, artists);
  }

  static getArtworks(): Artwork[] {
    this.initLocalStorage();
    try {
      return JSON.parse(localStorage.getItem(KEYS.ARTWORKS) || "[]");
    } catch {
      return initialArtworks;
    }
  }

  static saveArtworks(artworks: Artwork[]) {
    localStorage.setItem(KEYS.ARTWORKS, JSON.stringify(artworks));
    this.persistToFirestore(KEYS.ARTWORKS, artworks);
  }

  static getReviews(artistId?: string): Review[] {
    this.initLocalStorage();
    const reviews: Review[] = JSON.parse(localStorage.getItem(KEYS.REVIEWS) || "[]");
    if (artistId) {
      return reviews.filter(r => r.artistId === artistId);
    }
    return reviews;
  }

  static addReview(review: Omit<Review, "id" | "createdAt">): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...review,
      id: "rev_" + Date.now(),
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    this.persistToFirestore(KEYS.REVIEWS, newReview);

    // Recalculate Artist Average Rating
    const artists = this.getArtists();
    const artist = artists.find(a => a.id === review.artistId);
    if (artist) {
      const artistReviews = reviews.filter(r => r.artistId === review.artistId);
      const totalStars = artistReviews.reduce((sum, r) => sum + r.rating, 0);
      artist.ratingAverage = Number((totalStars / artistReviews.length).toFixed(1));
      this.saveArtists(artists);
    }
    return newReview;
  }

  static getComments(artworkId?: string): Comment[] {
    this.initLocalStorage();
    const comments: Comment[] = JSON.parse(localStorage.getItem(KEYS.COMMENTS) || "[]");
    if (artworkId) {
      return comments.filter(c => c.artworkId === artworkId);
    }
    return comments;
  }

  static addComment(comment: Omit<Comment, "id" | "createdAt">): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      ...comment,
      id: "comm_" + Date.now(),
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
    this.persistToFirestore(KEYS.COMMENTS, newComment);

    // Send notification to Artist
    const artworks = this.getArtworks();
    const artwork = artworks.find(aw => aw.id === comment.artworkId);
    if (artwork) {
      this.addNotification({
        userId: artwork.artistId,
        type: "comment",
        title: "Novo Comentário / New Comment",
        description: `${comment.userName} comentou em "${artwork.title}".`,
        relatedId: artwork.id
      });
    }

    return newComment;
  }

  static deleteComment(commentId: string) {
    const comments = this.getComments();
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(filtered));
    this.deleteFromFirestore(KEYS.COMMENTS, commentId);
  }

  static getOrders(artistId?: string): Order[] {
    this.initLocalStorage();
    const orders: Order[] = JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]");
    if (artistId) {
      return orders.filter(o => o.artistId === artistId);
    }
    return orders;
  }

  static addOrder(order: Omit<Order, "id" | "status" | "createdAt">): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: "order_" + Date.now(),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    this.persistToFirestore(KEYS.ORDERS, newOrder);

    // Notify Artist
    this.addNotification({
      userId: order.artistId,
      type: "order",
      title: "Nova Encomenda / New Commission Request",
      description: `${order.clientName} enviou um pedido de retrato.`,
      relatedId: newOrder.id
    });

    return newOrder;
  }

  static updateOrderStatus(orderId: string, status: Order["status"]) {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      orders[orderIndex].status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
      this.persistToFirestore(KEYS.ORDERS, orders[orderIndex]);
    }
  }

  static getConversations(artistId?: string): ChatConversation[] {
    this.initLocalStorage();
    const convs: ChatConversation[] = JSON.parse(localStorage.getItem(KEYS.CONVERSATIONS) || "[]");
    if (artistId) {
      return convs.filter(c => c.artistId === artistId);
    }
    return convs;
  }

  static getMessages(conversationId: string): ChatMessage[] {
    this.initLocalStorage();
    const messages: ChatMessage[] = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    return messages.filter(m => m.conversationId === conversationId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static sendChatMessage(conversationId: string, artistId: string, visitorName: string, visitorContact: string, senderId: string, senderName: string, text: string): ChatMessage {
    const conversations = this.getConversations();
    let conv = conversations.find(c => c.id === conversationId);
    const nowStr = new Date().toISOString();

    if (!conv) {
      conv = {
        id: conversationId,
        artistId,
        visitorName,
        visitorContact,
        lastMessageText: text,
        lastMessageAt: nowStr,
        unreadCountArtist: senderId === "visitor" ? 1 : 0,
        unreadCountVisitor: senderId !== "visitor" ? 1 : 0
      };
      conversations.push(conv);
    } else {
      conv.lastMessageText = text;
      conv.lastMessageAt = nowStr;
      if (senderId === "visitor") {
        conv.unreadCountArtist += 1;
      } else {
        conv.unreadCountVisitor += 1;
      }
    }
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
    this.persistToFirestore(KEYS.CONVERSATIONS, conv);

    const messages = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      conversationId,
      senderId,
      senderName,
      text,
      createdAt: nowStr
    };
    messages.push(newMsg);
    localStorage.setItem(KEYS.CHATS, JSON.stringify(messages));
    this.persistToFirestore(KEYS.CHATS, newMsg);

    // If sent by visitor, notify artist
    if (senderId === "visitor") {
      this.addNotification({
        userId: artistId,
        type: "message",
        title: "Mensagem de Chat / Chat Message",
        description: `${senderName}: ${text.slice(0, 40)}${text.length > 40 ? "..." : ""}`,
        relatedId: conversationId
      });
    }

    return newMsg;
  }

  static markChatAsRead(conversationId: string, role: "artist" | "visitor") {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index > -1) {
      if (role === "artist") {
        conversations[index].unreadCountArtist = 0;
      } else {
        conversations[index].unreadCountVisitor = 0;
      }
      localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
      this.persistToFirestore(KEYS.CONVERSATIONS, conversations[index]);
    }
  }

  static getNotifications(userId: string): Notification[] {
    this.initLocalStorage();
    const list: Notification[] = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
    return list.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addNotification(notif: Omit<Notification, "id" | "isRead" | "createdAt">): Notification {
    const list = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
    const newNotif: Notification = {
      ...notif,
      id: "not_" + Date.now(),
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.push(newNotif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.persistToFirestore(KEYS.NOTIFICATIONS, newNotif);
    return newNotif;
  }

  static markNotificationAsRead(notifId: string) {
    const list = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
    const index = list.findIndex((n: Notification) => n.id === notifId);
    if (index > -1) {
      list[index].isRead = true;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
      this.persistToFirestore(KEYS.NOTIFICATIONS, list[index]);
    }
  }

  static markAllNotificationsAsRead(userId: string) {
    const list = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
    const updatedNotifs: Notification[] = [];
    list.forEach((n: Notification) => {
      if (n.userId === userId) {
        n.isRead = true;
        updatedNotifs.push(n);
      }
    });
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    if (updatedNotifs.length > 0) {
      this.persistToFirestore(KEYS.NOTIFICATIONS, updatedNotifs);
    }
  }

  static getFavorites(): string[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem(KEYS.FAVORITES) || "[]");
  }

  static toggleFavorite(artworkId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(artworkId);
    let isFav = false;
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(artworkId);
      isFav = true;
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  }

  static getLikes(): string[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem(KEYS.LIKES) || "[]");
  }

  static toggleLike(artworkId: string): { likesCount: number; hasLiked: boolean } {
    const likes = this.getLikes();
    const index = likes.indexOf(artworkId);
    let hasLiked = false;

    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(artworkId);
      hasLiked = true;
    }
    localStorage.setItem(KEYS.LIKES, JSON.stringify(likes));

    // Update artwork count
    const artworks = this.getArtworks();
    const artwork = artworks.find(a => a.id === artworkId);
    if (artwork) {
      artwork.likesCount += hasLiked ? 1 : -1;
      this.saveArtworks(artworks);

      // Trigger Notification on like (if liked)
      if (hasLiked) {
        this.addNotification({
          userId: artwork.artistId,
          type: "like",
          title: "Novo Adoro / New Like ❤️",
          description: `Alguém adorou a sua obra "${artwork.title}".`,
          relatedId: artwork.id
        });
      }

      // Update artist total likes count
      const artists = this.getArtists();
      const artist = artists.find(a => a.id === artwork.artistId);
      if (artist) {
        artist.stats.likesCount += hasLiked ? 1 : -1;
        this.saveArtists(artists);
      }

      return { likesCount: artwork.likesCount, hasLiked };
    }

    return { likesCount: 0, hasLiked: false };
  }

  static getFollows(): string[] {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem(KEYS.FOLLOWS) || "[]");
  }

  static toggleFollow(artistId: string): { followersCount: number; isFollowing: boolean } {
    const follows = this.getFollows();
    const index = follows.indexOf(artistId);
    let isFollowing = false;

    if (index > -1) {
      follows.splice(index, 1);
    } else {
      follows.push(artistId);
      isFollowing = true;
    }
    localStorage.setItem(KEYS.FOLLOWS, JSON.stringify(follows));

    // Update Artist stat
    const artists = this.getArtists();
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      artist.stats.followersCount += isFollowing ? 1 : -1;
      this.saveArtists(artists);

      if (isFollowing) {
        this.addNotification({
          userId: artistId,
          type: "follow",
          title: "Novo Seguidor / New Follower 👤",
          description: "Alguém começou a seguir o seu perfil artístico.",
          relatedId: artistId
        });
      }

      return { followersCount: artist.stats.followersCount, isFollowing };
    }

    return { followersCount: 0, isFollowing: false };
  }

  static notifyFollowers(artistId: string, info: { type: 'update' | 'artwork'; title: string; description: string; relatedId?: string }) {
    const follows = this.getFollows();
    if (follows.includes(artistId)) {
      const userIdsToNotify = new Set<string>();
      userIdsToNotify.add("user_sara");

      const savedUserStr = localStorage.getItem("retratistas_session");
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (u && u.role === "user") {
            userIdsToNotify.add(u.id);
          }
        } catch (_) {}
      }

      try {
        const commonUsers = JSON.parse(localStorage.getItem("retratistas_common_users") || "[]");
        commonUsers.forEach((u: any) => {
          if (u && u.id) {
            userIdsToNotify.add(u.id);
          }
        });
      } catch (_) {}

      userIdsToNotify.forEach(userId => {
        this.addNotification({
          userId,
          type: info.type,
          title: info.title,
          description: info.description,
          relatedId: info.relatedId
        });
      });
    }
  }

  static recordProfileView(artistId: string) {
    const artists = this.getArtists();
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      artist.stats.viewsCount += 1;
      this.saveArtists(artists);
    }
  }

  static recordWhatsAppClick(artistId: string) {
    const artists = this.getArtists();
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
      artist.stats.whatsappClicks += 1;
      this.saveArtists(artists);
    }
  }

  // Artist Actions
  static addArtwork(artwork: Omit<Artwork, "id" | "likesCount" | "viewsCount">): Artwork {
    const artworks = this.getArtworks();
    const newArtwork: Artwork = {
      ...artwork,
      id: "art_" + Date.now(),
      likesCount: 0,
      viewsCount: 0
    };
    artworks.push(newArtwork);
    this.saveArtworks(artworks);

    // Update artist count
    const artists = this.getArtists();
    const artist = artists.find(a => a.id === artwork.artistId);
    if (artist) {
      artist.stats.worksCount += 1;
      this.saveArtists(artists);

      // Trigger Notification to followers
      this.notifyFollowers(artwork.artistId, {
        type: "artwork",
        title: "Nova Obra Publicada / New Artwork Published 🎨",
        description: `O artista ${artist.artisticName} que você segue publicou uma nova obra: "${newArtwork.title}".`,
        relatedId: newArtwork.id
      });
    }

    return newArtwork;
  }

  static updateArtwork(artworkId: string, updated: Partial<Artwork>): Artwork | null {
    const artworks = this.getArtworks();
    const idx = artworks.findIndex(a => a.id === artworkId);
    if (idx > -1) {
      artworks[idx] = { ...artworks[idx], ...updated };
      this.saveArtworks(artworks);
      return artworks[idx];
    }
    return null;
  }

  static deleteArtwork(artworkId: string) {
    const artworks = this.getArtworks();
    const found = artworks.find(a => a.id === artworkId);
    if (found) {
      const filtered = artworks.filter(a => a.id !== artworkId);
      this.saveArtworks(filtered);
      this.deleteFromFirestore(KEYS.ARTWORKS, artworkId);

      // Decrement artist work count
      const artists = this.getArtists();
      const artist = artists.find(a => a.id === found.artistId);
      if (artist) {
        artist.stats.worksCount = Math.max(0, artist.stats.worksCount - 1);
        this.saveArtists(artists);
      }
    }
  }

  static updateArtistProfile(artistId: string, updated: Partial<Artist>): Artist | null {
    const artists = this.getArtists();
    const idx = artists.findIndex(a => a.id === artistId);
    if (idx > -1) {
      const oldArtist = artists[idx];
      const changedFields: string[] = [];
      if (updated.bio !== undefined && updated.bio !== oldArtist.bio) changedFields.push("biografia");
      if (updated.location !== undefined && (updated.location.city !== oldArtist.location.city || updated.location.province !== oldArtist.location.province)) changedFields.push("localização");
      if (updated.avatarUrl !== undefined && updated.avatarUrl !== oldArtist.avatarUrl) changedFields.push("foto de perfil");
      if (updated.coverUrl !== undefined && updated.coverUrl !== oldArtist.coverUrl) changedFields.push("foto de capa");
      if (updated.specialties !== undefined && JSON.stringify(updated.specialties) !== JSON.stringify(oldArtist.specialties)) changedFields.push("especialidades");

      artists[idx] = { ...artists[idx], ...updated };
      this.saveArtists(artists);

      if (changedFields.length > 0) {
        const fieldsStr = changedFields.join(", ");
        this.notifyFollowers(artistId, {
          type: "update",
          title: "Atualização de Perfil / Profile Update 📝",
          description: `O artista ${oldArtist.artisticName} que você segue atualizou as suas informações (${fieldsStr}).`,
          relatedId: artistId
        });
      }

      return artists[idx];
    }
    return null;
  }

  // Admin Actions
  static adminApproveArtist(artistId: string, approved: boolean) {
    const artists = this.getArtists();
    const idx = artists.findIndex(a => a.id === artistId);
    if (idx > -1) {
      artists[idx].isApproved = approved;
      this.saveArtists(artists);
    }
  }

  static adminVerifyArtist(artistId: string, verified: boolean) {
    const artists = this.getArtists();
    const idx = artists.findIndex(a => a.id === artistId);
    if (idx > -1) {
      artists[idx].isVerified = verified;
      this.saveArtists(artists);
    }
  }

  static adminFeatureArtist(artistId: string, featured: boolean) {
    const artists = this.getArtists();
    const idx = artists.findIndex(a => a.id === artistId);
    if (idx > -1) {
      artists[idx].isFeatured = featured;
      this.saveArtists(artists);
    }
  }

  static adminRemoveArtist(artistId: string) {
    const artists = this.getArtists().filter(a => a.id !== artistId);
    this.saveArtists(artists);
    this.deleteFromFirestore(KEYS.ARTISTS, artistId);

    // Also remove their artworks
    const artworksToRem = this.getArtworks().filter(a => a.artistId === artistId);
    const artworks = this.getArtworks().filter(a => a.artistId !== artistId);
    this.saveArtworks(artworks);
    for (const art of artworksToRem) {
      this.deleteFromFirestore(KEYS.ARTWORKS, art.id);
    }
  }
}
