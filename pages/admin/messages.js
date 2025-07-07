// pages/admin/messages.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout.js';
import { formatDate, getTextStats } from '../../lib/utils.js';
import Cookies from 'js-cookie';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, by-session
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, filter, searchTerm, selectedSession]);

  const fetchMessages = async () => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch('/api/messages?sessionId=martin-isi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        setError(data.error || 'Error cargando mensajes');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch('/api/admin/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Filtro por sesión
    if (selectedSession !== 'all') {
      filtered = filtered.filter(msg => msg.session_id === selectedSession);
    }

    // Filtro por tiempo
    if (filter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(msg => new Date(msg.created_at) > sevenDaysAgo);
    }

    // Búsqueda de texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.text.toLowerCase().includes(term) ||
        msg.author.toLowerCase().includes(term) ||
        (msg.tip && msg.tip.toLowerCase().includes(term))
      );
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredMessages(filtered);
  };

  const refreshMessages = () => {
    setLoading(true);
    setError('');
    fetchMessages();
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`/api/admin/messages?messageId=${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchMessages();
      } else {
        alert('Error eliminando mensaje: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error de conexión');
    }
  };

  const exportMessages = () => {
    const csvContent = [
      ['Fecha', 'Autor', 'Mensaje', 'Propina', 'Sesión'],
      ...filteredMessages.map(msg => [
        new Date(msg.created_at).toLocaleString('es-CL'),
        msg.author,
        `"${msg.text.replace(/"/g, '""')}"`, // Escape quotes for CSV
        msg.tip || 'Sin propina',
        msg.session_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mensajes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = getTextStats(filteredMessages);

  if (loading) {
    return (
      <AdminLayout title="Ver Mensajes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mensajes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Ver Mensajes - Admin Panel</title>
      </Head>

      <AdminLayout title="💬 Ver Mensajes">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Todos los Mensajes
              </h2>
              <p className="text-gray-600">
                Revisa, filtra y gestiona todos los mensajes de despedida
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={refreshMessages}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🔄 Actualizar
              </button>
              <button
                onClick={exportMessages}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                📊 Exportar CSV
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">❌</span>
                {error}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-3 mr-4">
                  <span className="text-2xl text-white">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-lg p-3 mr-4">
                  <span className="text-2xl text-white">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Palabras</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWords}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3 mr-4">
                  <span className="text-2xl text-white">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Autores Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.uniqueAuthors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 rounded-lg p-3 mr-4">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio Palabras</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgWordsPerMessage}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar en mensajes
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar por texto, autor o propina..."
                />
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtro de tiempo
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los tiempos</option>
                  <option value="recent">Últimos 7 días</option>
                </select>
              </div>

              {/* Session Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtro por sesión
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas las sesiones</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {filteredMessages.length} de {messages.length} mensajes
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSelectedSession('all');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                🗑️ Limpiar filtros
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Mensajes ({filteredMessages.length})
              </h3>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay mensajes para mostrar
                </h3>
                <p className="text-gray-600">
                  {messages.length === 0 
                    ? 'Aún no se han enviado mensajes'
                    : 'Prueba ajustando los filtros'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message, index) => (
                  <div key={message.id || index} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {message.author}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            message.tip && message.tip.includes('Cagao') 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {message.tip || 'Sin propina'}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-3">
                          "{message.text}"
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {formatDate(message.created_at)}</span>
                          <span>📊 {message.text.split(' ').length} palabras</span>
                          <span>🎯 {message.session_id}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}