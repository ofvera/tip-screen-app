// pages/api/messages.js
import { getSession, addMessage, getMessages } from '../../lib/store.js';
import { sanitizeText } from '../../lib/utils.js';

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
      // Guardar nuevo mensaje
      const { sessionId, autor, texto, propina } = req.body;
      
      console.log('Datos recibidos:', { sessionId, autor, texto, propina });
      
      if (!sessionId || !texto) {
        return res.status(400).json({ 
          success: false,
          error: 'SessionId y texto son requeridos' 
        });
      }
      
      // Verificar que la sesión existe
      const session = await getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Sesión no encontrada'
        });
      }
      
      // Sanitizar datos de entrada
      const messageData = {
        autor: (autor?.trim() || 'Anónimo').substring(0, 50),
        texto: sanitizeText(texto),
        propina: (propina || 'Sin propina').substring(0, 50)
      };
      
      // Agregar mensaje a la base de datos
      const newMessage = await addMessage(sessionId, messageData);
      
      // Obtener el total actualizado de mensajes
      const allMessages = await getMessages(sessionId);
      
      console.log('Mensaje guardado exitosamente:', newMessage.id);
      console.log('Total mensajes en sesión:', allMessages.length);
      
      res.status(201).json({ 
        success: true,
        message: 'Mensaje guardado exitosamente',
        messageId: newMessage.id,
        totalMessages: allMessages.length,
        data: newMessage
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
      
      // Verificar que la sesión existe
      const session = await getSession(sessionId);
      if (!session) {
        return res.status(404).json({ 
          success: false,
          error: 'Sesión no encontrada' 
        });
      }
      
      // Obtener mensajes
      const messages = await getMessages(sessionId);
      
      console.log('Mensajes encontrados:', messages.length);
      
      res.status(200).json({
        success: true,
        sessionId: session.id,
        sessionName: session.name,
        messages: messages,
        totalMessages: messages.length,
        createdAt: session.created_at,
        active: session.active
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