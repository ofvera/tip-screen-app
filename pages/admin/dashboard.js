// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout.js';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Error cargando estadísticas');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    setLoading(true);
    setError('');
    fetchStats();
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            🔄 Reintentar
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Admin Panel</title>
      </Head>

      <AdminLayout title="📊 Dashboard">
        <div className="space-y-6">
          {/* Header con refresh */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Resumen General
              </h2>
              <p className="text-gray-600">
                Vista general de la actividad en la app
              </p>
            </div>
            <button
              onClick={refreshStats}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔄 Actualizar
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Sesiones"
              value={stats?.overview.totalSessions || 0}
              icon="🎯"
              color="blue"
            />
            <StatCard
              title="Sesiones Activas"
              value={stats?.overview.activeSessions || 0}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Total Mensajes"
              value={stats?.overview.totalMessages || 0}
              icon="💬"
              color="purple"
            />
            <StatCard
              title="Mensajes Recientes"
              value={stats?.overview.recentMessages || 0}
              icon="📈"
              color="yellow"
              subtitle="Últimos 7 días"
            />
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Promedios
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mensajes por sesión:</span>
                  <span className="font-semibold">{stats?.overview.averageMessagesPerSession || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mensajes por día:</span>
                  <span className="font-semibold">{stats?.overview.messagesPerDay || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Días activos:</span>
                  <span className="font-semibold">{stats?.overview.daysSinceFirst || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✍️ Análisis de Texto
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total palabras:</span>
                  <span className="font-semibold">{stats?.textAnalysis.totalWords || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Promedio por mensaje:</span>
                  <span className="font-semibold">{stats?.textAnalysis.avgWordsPerMessage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Autores únicos:</span>
                  <span className="font-semibold">{stats?.textAnalysis.uniqueAuthors || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🕒 Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Primer mensaje:</span>
                  <p className="font-semibold text-xs">
                    {stats?.timeline.firstMessage ? 
                      new Date(stats.timeline.firstMessage).toLocaleDateString('es-CL') : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Último mensaje:</span>
                  <p className="font-semibold text-xs">
                    {stats?.timeline.lastMessage ? 
                      new Date(stats.timeline.lastMessage).toLocaleDateString('es-CL') : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Autores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏆 Top Autores
            </h3>
            {stats?.topAuthors && stats.topAuthors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topAuthors.slice(0, 6).map((author, index) => (
                  <div key={author.author} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{author.author}</p>
                      <p className="text-sm text-gray-600">{author.count} mensaje{author.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de autores aún</p>
            )}
          </div>

          {/* Sesiones */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                🎯 Sesiones Activas
              </h3>
              <Link
                href="/admin/sessions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
            {stats?.sessionsData && stats.sessionsData.length > 0 ? (
              <div className="space-y-3">
                {stats.sessionsData.slice(0, 3).map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{session.sessionName}</h4>
                      <p className="text-sm text-gray-600">ID: {session.sessionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{session.messageCount} mensajes</p>
                      <p className="text-xs text-gray-500">
                        {session.active ? '✅ Activa' : '❌ Inactiva'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay sesiones aún</p>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/sessions"
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-semibold text-blue-900">Gestionar Sesiones</p>
                  <p className="text-sm text-blue-700">Crear, editar, activar/desactivar</p>
                </div>
              </Link>
              
              <Link
                href="/admin/messages"
                className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-green-900">Ver Mensajes</p>
                  <p className="text-sm text-green-700">Revisar todos los mensajes</p>
                </div>
              </Link>

              <a
                href="/messages/martin-isi"
                target="_blank"
                className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="font-semibold text-purple-900">Ver App Pública</p>
                  <p className="text-sm text-purple-700">Abrir en nueva pestaña</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colors[color]} rounded-lg p-3 mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}