// pages/api/messages.js
import { getSession, setSession } from '../../lib/store.js';

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
    try {
      // Guardar nuevo mensaje
      const { sessionId, autor, texto, propina } = req.body;
      
      console.log('Datos recibidos:', { sessionId, autor, texto, propina });
      
      if (!sessionId || !texto) {
        return res.status(400).json({ 
          success: false,
          error: 'SessionId y texto son requeridos' 
        });
      }
      
      let session = getSession(sessionId);
      
      // Si no existe la sesión, la creamos (fallback)
      if (!session) {
        console.log('Sesión no encontrada, creando nueva:', sessionId);
        session = {
          id: sessionId,
          name: 'Despedida de Amigos',
          createdAt: new Date().toISOString(),
          messages: []
        };
      }
      
      const newMessage = {
        id: Date.now().toString(),
        autor: autor?.trim() || 'Anónimo',
        texto: texto.trim(),
        propina: propina || 'Sin propina',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString('es-CL', {
          timeZone: 'America/Santiago',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      session.messages.push(newMessage);
      setSession(sessionId, session);
      
      console.log('Mensaje guardado exitosamente:', newMessage.id);
      console.log('Total mensajes en sesión:', session.messages.length);
      
      res.status(201).json({ 
        success: true,
        message: 'Mensaje guardado exitosamente',
        messageId: newMessage.id,
        totalMessages: session.messages.length
      });
      
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
    
  } else if (req.method === 'GET') {
    try {
      // Obtener mensajes de una sesión
      const { sessionId } = req.query;
      
      if (!sessionId) {
        return res.status(400).json({ 
          success: false,
          error: 'SessionId requerido' 
        });
      }
      
      const session = getSession(sessionId);
      if (!session) {
        console.log('Sesión no encontrada para mensajes:', sessionId);
        return res.status(404).json({ 
          success: false,
          error: 'Sesión no encontrada' 
        });
      }
      
      console.log('Mensajes encontrados:', session.messages?.length || 0);
      
      res.status(200).json({
        success: true,
        sessionId: session.id,
        sessionName: session.name,
        messages: session.messages || [],
        totalMessages: session.messages?.length || 0,
        createdAt: session.createdAt
      });
      
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
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