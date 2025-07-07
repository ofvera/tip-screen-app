// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente para el frontend (con RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para APIs del servidor (sin RLS)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey
);

// Funciones helper para la base de datos
export const db = {
  // Sesiones
  async createSession(sessionData) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSession(sessionId) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateSession(sessionId, updates) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllSessions() {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Mensajes
  async createMessage(messageData) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert([messageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(sessionId) {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getAllMessages() {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sessions (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async deleteMessage(messageId) {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
    return true;
  },

  // Estadísticas
  async getStats() {
    const [sessionsResult, messagesResult] = await Promise.all([
      supabaseAdmin.from('sessions').select('id, name, created_at'),
      supabaseAdmin.from('messages').select('id, session_id, created_at')
    ]);

    if (sessionsResult.error) throw sessionsResult.error;
    if (messagesResult.error) throw messagesResult.error;

    const sessions = sessionsResult.data || [];
    const messages = messagesResult.data || [];

    return {
      totalSessions: sessions.length,
      totalMessages: messages.length,
      messagesPerSession: sessions.map(session => ({
        sessionId: session.id,
        sessionName: session.name,
        messageCount: messages.filter(msg => msg.session_id === session.id).length
      })),
      recentActivity: messages.slice(-10).reverse()
    };
  }
};