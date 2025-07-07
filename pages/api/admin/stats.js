// pages/api/admin/stats.js
import { getAllSessions, getAllMessages } from '../../../lib/store.js';
import { isAdminAuthenticated, getTextStats } from '../../../lib/utils.js';
import { db } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Verificar autenticación admin
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Login requerido.'
    });
  }

  try {
    // Obtener datos base
    const [sessions, allMessages] = await Promise.all([
      getAllSessions(),
      getAllMessages()
    ]);

    // Estadísticas generales
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.active).length;
    const totalMessages = allMessages.length;

    // Estadísticas de texto
    const textStats = getTextStats(allMessages);

    // Mensajes por sesión
    const messagesPerSession = sessions.map(session => {
      const sessionMessages = allMessages.filter(msg => msg.session_id === session.id);
      return {
        sessionId: session.id,
        sessionName: session.name,
        messageCount: sessionMessages.length,
        active: session.active,
        createdAt: session.created_at
      };
    });

    // Actividad reciente (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMessages = allMessages.filter(msg => 
      new Date(msg.created_at) > sevenDaysAgo
    );

    // Actividad por día (últimos 7 días)
    const dailyActivity = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyActivity[dateKey] = allMessages.filter(msg => 
        msg.created_at.startsWith(dateKey)
      ).length;
    }

    // Top autores
    const authorCounts = {};
    allMessages.forEach(msg => {
      const author = msg.author || 'Anónimo';
      authorCounts[author] = (authorCounts[author] || 0) + 1;
    });

    const topAuthors = Object.entries(authorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => ({ author, count }));

    // Distribución de propinas
    const tipDistribution = {};
    allMessages.forEach(msg => {
      const tip = msg.tip || 'Sin propina';
      tipDistribution[tip] = (tipDistribution[tip] || 0) + 1;
    });

    // Métricas de tiempo
    const now = new Date();
    const firstMessage = allMessages.length > 0 ? 
      new Date(Math.min(...allMessages.map(m => new Date(m.created_at)))) : now;
    const daysSinceFirst = Math.ceil((now - firstMessage) / (1000 * 60 * 60 * 24));
    const messagesPerDay = daysSinceFirst > 0 ? (totalMessages / daysSinceFirst).toFixed(1) : 0;

    const stats = {
      overview: {
        totalSessions,
        activeSessions,
        totalMessages,
        recentMessages: recentMessages.length,
        averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
        messagesPerDay: parseFloat(messagesPerDay),
        daysSinceFirst
      },
      textAnalysis: textStats,
      sessionsData: messagesPerSession.sort((a, b) => b.messageCount - a.messageCount),
      recentActivity: {
        last7Days: recentMessages.length,
        dailyBreakdown: dailyActivity
      },
      topAuthors,
      tipDistribution,
      timeline: {
        firstMessage: allMessages.length > 0 ? allMessages[0].created_at : null,
        lastMessage: allMessages.length > 0 ? allMessages[allMessages.length - 1].created_at : null,
        mostActiveDay: Object.entries(dailyActivity).reduce((max, [date, count]) => 
          count > max.count ? { date, count } : max, 
          { date: null, count: 0 }
        )
      }
    };

    console.log('Estadísticas generadas para admin');

    res.status(200).json({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generando estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}