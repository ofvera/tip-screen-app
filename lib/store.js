// lib/store.js
// Store global simple para compartir datos entre APIs

// Inicializar store global si no existe
if (!global.appStore) {
  global.appStore = {
    sessions: new Map(),
  };
}

export const store = global.appStore;

// Helper functions
export function getSession(sessionId) {
  return store.sessions.get(sessionId);
}

export function setSession(sessionId, sessionData) {
  store.sessions.set(sessionId, sessionData);
  return sessionData;
}

export function getAllSessions() {
  return Array.from(store.sessions.values());
}

export function deleteSession(sessionId) {
  return store.sessions.delete(sessionId);
}