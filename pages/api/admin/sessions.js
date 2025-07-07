// pages/api/admin/sessions.js
import { getAllSessions, setSession, deleteSession } from '../../../lib/store.js';
import { isAdminAuthenticated, generateSessionId } from '../../../lib/utils.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verificar autenticación admin
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Login requerido.'
    });
  }

  try {
    if (req.method === 'GET') {
      // Obtener todas las sesiones
      const sessions = await getAllSessions();
      
      // Agregar estadísticas a cada sesión
      const { getMessages } = await import('../../../lib/store.js');
      const sessionsWithStats = await Promise.all(
        sessions.map(async (session) => {
          const messages = await getMessages(session.id);
          return {
            ...session,
            messageCount: messages.length,
            lastMessage: messages.length > 0 ? messages[messages.length - 1].created_at : null
          };
        })
      );

      res.status(200).json({
        success: true,
        sessions: sessionsWithStats,
        total: sessionsWithStats.length
      });

    } else if (req.method === 'POST') {
      // Crear nueva sesión
      const { name, id } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Nombre de sesión requerido'
        });
      }

      const sessionId = id || generateSessionId();
      const sessionData = {
        id: sessionId,
        name: name.trim(),
        active: true
      };

      const newSession = await setSession(sessionId, sessionData);

      console.log('Nueva sesión creada por admin:', sessionId);

      res.status(201).json({
        success: true,
        message: 'Sesión creada exitosamente',
        session: newSession
      });

    } else if (req.method === 'PUT') {
      // Actualizar sesión existente
      const { sessionId, name, active } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'SessionId requerido'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (active !== undefined) updateData.active = active;

      const updatedSession = await setSession(sessionId, updateData);

      console.log('Sesión actualizada por admin:', sessionId);

      res.status(200).json({
        success: true,
        message: 'Sesión actualizada exitosamente',
        session: updatedSession
      });

    } else if (req.method === 'DELETE') {
      // Desactivar sesión
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'SessionId requerido'
        });
      }

      await deleteSession(sessionId);

      console.log('Sesión desactivada por admin:', sessionId);

      res.status(200).json({
        success: true,
        message: 'Sesión desactivada exitosamente'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Error en admin/sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}