// lib/utils.js

// Generar WhatsApp link
export function generateWhatsAppLink(messages, sessionName) {
  const messageText = `🇺🇸 *${sessionName}* - Mensajes de Despedida\n\n` +
    messages.map((msg, index) => 
      `${index + 1}. *${msg.author}*: "${msg.text}"`
    ).join('\n\n') +
    `\n\n¡Que tengan un viaje increíble! 🗽✈️`;

  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/?text=${encodedText}`;
}

// Formatear fecha
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Validar contraseña admin
export function validateAdminPassword(password) {
  return password === process.env.ADMIN_PASSWORD;
}

// Generar ID único para sesiones
export function generateSessionId() {
  return Math.random().toString(36).substring(2, 10).toLowerCase();
}

// Sanitizar texto
export function sanitizeText(text) {
  return text.trim().substring(0, 500); // Máximo 500 caracteres
}

// Verificar si es admin (para usar en pages)
export function isAdminAuthenticated(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const token = authHeader.split(' ')[1];
  if (!token) return false;
  
  try {
    // Simple verificación - en producción usarías JWT
    return Buffer.from(token, 'base64').toString() === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

// Generar token admin simple
export function generateAdminToken(password) {
  if (password !== process.env.ADMIN_PASSWORD) {
    throw new Error('Invalid password');
  }
  return Buffer.from(password).toString('base64');
}

// Contar palabras
export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

// Obtener estadísticas de texto
export function getTextStats(messages) {
  const totalMessages = messages.length;
  const totalWords = messages.reduce((acc, msg) => acc + countWords(msg.text), 0);
  const avgWordsPerMessage = totalMessages > 0 ? Math.round(totalWords / totalMessages) : 0;
  
  const tipCounts = messages.reduce((acc, msg) => {
    const tip = msg.tip || 'Sin propina';
    acc[tip] = (acc[tip] || 0) + 1;
    return acc;
  }, {});

  return {
    totalMessages,
    totalWords,
    avgWordsPerMessage,
    tipCounts,
    uniqueAuthors: [...new Set(messages.map(msg => msg.author))].length
  };
}

// Validar email simple
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generar colores aleatorios para gráficos
export function generateColors(count) {
  const colors = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// Crear datos para descargar
export function createDownloadData(messages, sessionName) {
  const data = {
    session: sessionName,
    exportDate: new Date().toISOString(),
    totalMessages: messages.length,
    messages: messages.map(msg => ({
      author: msg.author,
      text: msg.text,
      tip: msg.tip,
      date: msg.created_at
    }))
  };
  
  return JSON.stringify(data, null, 2);
}

// Detectar dispositivo móvil
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}