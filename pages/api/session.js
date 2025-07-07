// pages/api/session.js
import { getSession, setSession, initializeDefaultSession } from '../../lib/store.js';

// Sesión fija para Martin & Isi
const FIXED_SESSION_ID = 'martin-isi';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Siempre inicializar/devolver la sesión fija
      const session = await initializeDefaultSession();
      
      console.log('Sesión Martin & Isi inicializada:', FIXED_SESSION_ID);
      
      res.status(201).json({ 
        success: true,
        sessionId: FIXED_SESSION_ID,
        message: 'Sesión Martin & Isi lista',
        data: session
      });
    } catch (error) {
      console.error('Error inicializando sesión fija:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  } else if (req.method === 'GET') {
    try {
      const { sessionId } = req.query;
      
      // Solo permitimos acceso a la sesión de Martin & Isi
      if (sessionId !== FIXED_SESSION_ID) {
        return res.status(404).json({ 
          success: false,
          error: 'Solo la sesión de Martin & Isi está disponible',
          redirect: `/session/${FIXED_SESSION_ID}`
        });
      }
      
      // Intentar obtener la sesión, si no existe la creamos
      let session = await getSession(FIXED_SESSION_ID);
      
      if (!session) {
        session = await initializeDefaultSession();
      }
      
      // Obtener los mensajes de la sesión
      const { getMessages } = await import('../../lib/store.js');
      const messages = await getMessages(FIXED_SESSION_ID);
      
      console.log('Sesión Martin & Isi encontrada. Mensajes:', messages.length);
      
      res.status(200).json({
        success: true,
        id: session.id,
        name: session.name,
        active: session.active,
        created_at: session.created_at,
        messages: messages || [],
        totalMessages: messages ? messages.length : 0
      });
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}