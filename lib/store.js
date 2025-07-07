// lib/store.js
import { db } from './supabase.js';

// Funciones de compatibilidad para mantener la API existente
// Ahora todo se guarda en Supabase en lugar de memoria

export async function getSession(sessionId) {
  try {
    return await db.getSession(sessionId);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(sessionId, sessionData) {
  try {
    // Si la sesión existe, actualizarla; si no, crearla
    const existing = await getSession(sessionId);
    
    if (existing) {
      return await db.updateSession(sessionId, sessionData);
    } else {
      const newSession = {
        id: sessionId,
        name: sessionData.name || 'Despedida de Amigos',
        active: true,
        created_at: new Date().toISOString()
      };
      return await db.createSession(newSession);
    }
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}

export async function getAllSessions() {
  try {
    return await db.getAllSessions();
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return [];
  }
}

export async function deleteSession(sessionId) {
  try {
    return await db.updateSession(sessionId, { active: false });
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// Funciones específicas para mensajes
export async function addMessage(sessionId, messageData) {
  try {
    const message = {
      session_id: sessionId,
      author: messageData.autor || messageData.author || 'Anónimo',
      text: messageData.texto || messageData.text,
      tip: messageData.propina || messageData.tip || 'Sin propina',
      created_at: new Date().toISOString()
    };
    
    return await db.createMessage(message);
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

export async function getMessages(sessionId) {
  try {
    return await db.getMessages(sessionId);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function getAllMessages() {
  try {
    return await db.getAllMessages();
  } catch (error) {
    console.error('Error getting all messages:', error);
    return [];
  }
}

// Inicializar la sesión fija de Martin & Isi si no existe
export async function initializeDefaultSession() {
  const FIXED_SESSION_ID = 'martin-isi';
  
  try {
    let session = await getSession(FIXED_SESSION_ID);
    
    if (!session) {
      console.log('Inicializando sesión fija para Martin & Isi en Supabase');
      session = await setSession(FIXED_SESSION_ID, {
        id: FIXED_SESSION_ID,
        name: 'Martin & Isi - USA Farewell',
        active: true
      });
    }
    
    return session;
  } catch (error) {
    console.error('Error initializing default session:', error);
    throw error;
  }
}

// Función para migrar datos del store en memoria (si es necesario)
export async function migrateFromMemoryStore(memoryData) {
  try {
    console.log('Migrando datos del store en memoria a Supabase...');
    
    for (const [sessionId, sessionData] of memoryData.entries()) {
      // Crear la sesión
      await setSession(sessionId, sessionData);
      
      // Migrar los mensajes
      if (sessionData.messages && sessionData.messages.length > 0) {
        for (const message of sessionData.messages) {
          await addMessage(sessionId, message);
        }
      }
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}