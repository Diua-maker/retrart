import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global local storage self-healing interceptor to prevent QuotaExceededError crashes
if (typeof window !== "undefined" && window.localStorage) {
  const originalSetItem = localStorage.setItem;
  
  const purgeLargeBase64Images = () => {
    try {
      console.log("Local Storage Optimizer: Checking for bloated base64 files...");
      
      const commonUsersStr = localStorage.getItem("retratistas_common_users");
      if (commonUsersStr) {
        const users = JSON.parse(commonUsersStr);
        let modified = false;
        const cleaned = users.map((u: any) => {
          if (u.avatarUrl && u.avatarUrl.startsWith("data:image/") && u.avatarUrl.length > 50000) {
            modified = true;
            return { ...u, avatarUrl: "" };
          }
          return u;
        });
        if (modified) {
          originalSetItem.call(localStorage, "retratistas_common_users", JSON.stringify(cleaned));
        }
      }

      const artistsStr = localStorage.getItem("retratistas_artists");
      if (artistsStr) {
        const artists = JSON.parse(artistsStr);
        let modified = false;
        const cleaned = artists.map((a: any) => {
          if (a.avatarUrl && a.avatarUrl.startsWith("data:image/") && a.avatarUrl.length > 50000) {
            modified = true;
            return { ...a, avatarUrl: "" };
          }
          return a;
        });
        if (modified) {
          originalSetItem.call(localStorage, "retratistas_artists", JSON.stringify(cleaned));
        }
      }

      const sessionStr = localStorage.getItem("retratistas_session");
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session && session.avatarUrl && session.avatarUrl.startsWith("data:image/") && session.avatarUrl.length > 50000) {
            session.avatarUrl = "";
            originalSetItem.call(localStorage, "retratistas_session", JSON.stringify(session));
          }
        } catch (_) {}
      }

      const currentUserStr = localStorage.getItem("retratistas_current_user");
      if (currentUserStr) {
        try {
          const currUser = JSON.parse(currentUserStr);
          if (currUser && currUser.avatarUrl && currUser.avatarUrl.startsWith("data:image/") && currUser.avatarUrl.length > 50000) {
            currUser.avatarUrl = "";
            originalSetItem.call(localStorage, "retratistas_current_user", JSON.stringify(currUser));
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error("Local Storage Optimizer failed during proactive cleaning:", err);
    }
  };

  // Run proactive cleanup immediately upon app load
  purgeLargeBase64Images();

  // Intercept all future setItem calls
  localStorage.setItem = function (key, value) {
    try {
      originalSetItem.call(localStorage, key, value);
    } catch (e: any) {
      if (
        e.name === "QuotaExceededError" ||
        e.code === 22 ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED"
      ) {
        console.warn(`Local storage quota exceeded writing key: "${key}". Running emergency purge...`);
        purgeLargeBase64Images();
        
        // If still full, clear non-essential logs and notifications
        try {
          originalSetItem.call(localStorage, "retratistas_login_history", JSON.stringify([]));
          originalSetItem.call(localStorage, "retratistas_notifications", JSON.stringify([]));
        } catch (_) {}

        // Retry writing the requested item
        try {
          originalSetItem.call(localStorage, key, value);
        } catch (retryErr) {
          console.error("Critical: Local storage still full after purge!", retryErr);
        }
      } else {
        throw e;
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
