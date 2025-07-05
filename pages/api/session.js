// pages/api/session.js
import { getSession, setSession } from '../../lib/store.js';

// Sesión fija para Martin & Isi
const FIXED_SESSION_ID = 'martin-isi';
const FIXED_SESSION_DATA = {
  id: FIXED_SESSION_ID,
  name: 'Martin & Isi - USA Farewell',
  createdAt: new Date().toISOString(),
  messages: []
};

// Inicializar la sesión fija si no existe
function initializeFixedSession() {
  let session = getSession(FIXED_SESSION_ID);
  if (!session) {
    console.log('Inicializando sesión fija para Martin & Isi');
    session = { ...FIXED_SESSION_DATA };
    setSession(FIXED_SESSION_ID, session);
  }
  return session;
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Para compatibilidad, pero siempre devuelve la sesión fija
    try {
      const session = initializeFixedSession();
      
      console.log('Sesión fija inicializada:', FIXED_SESSION_ID);
      
      res.status(201).json({ 
        success: true,
        sessionId: FIXED_SESSION_ID,
        message: 'Sesión Martin & Isi lista'
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
      
      const session = initializeFixedSession();
      
      console.log('Sesión Martin & Isi encontrada. Mensajes:', session.messages?.length || 0);
      res.status(200).json({
        success: true,
        ...session
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