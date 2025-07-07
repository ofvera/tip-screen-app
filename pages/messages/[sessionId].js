// pages/messages/[sessionId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ShareButtons from '../../components/ShareButtons.js';

export default function MessagesViewer() {
  const router = useRouter();
  const { sessionId } = router.query;
  
  const [messages, setMessages] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Redirigir a Martin & Isi si es otra sesión
      if (sessionId !== 'martin-isi') {
        router.replace('/messages/martin-isi');
        return;
      }
      fetchMessages();
    }
  }, [sessionId, router]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for session:', sessionId);
      const response = await fetch(`/api/messages?sessionId=${sessionId}`);
      const data = await response.json();
      
      console.log('Messages API response:', data);
      
      if (data.success && response.ok) {
        setMessages(data.messages || []);
        setSessionData(data);
        setLoading(false);
        setError(false);
      } else {
        console.error('Error fetching messages:', data.error);
        setError(true);
        setErrorMessage(data.error || 'Sesión no encontrada');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(true);
      setErrorMessage('Error de conexión');
      setLoading(false);
    }
  };

  const refreshMessages = () => {
    setLoading(true);
    setError(false);
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-800 font-semibold text-sm sm:text-base">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center border-4 border-blue-700">
          <div className="text-4xl sm:text-6xl mb-4">🇺🇸</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
            Session Not Found
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {errorMessage || 'The session you are looking for does not exist.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={fetchMessages}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-colors mb-2 text-sm sm:text-base"
            >
              🔄 Try Again
            </button>
            <Link 
              href="/"
              className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm sm:text-base"
            >
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Martin & Isi - Farewell Messages</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-700 p-3 sm:p-4">
        {/* Estrellas decorativas */}
        <div className="absolute top-4 left-4 text-yellow-400 text-xl sm:text-2xl">⭐</div>
        <div className="absolute top-8 right-8 text-yellow-400 text-lg sm:text-xl">⭐</div>
        <div className="absolute bottom-8 left-8 text-yellow-400 text-lg sm:text-xl">⭐</div>
        <div className="absolute bottom-4 right-4 text-yellow-400 text-xl sm:text-2xl">⭐</div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header con temática USA */}
          <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-4 border-blue-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <span className="text-2xl sm:text-3xl mr-2">🇺🇸</span>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
                    Martin & Isi
                  </h1>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">
                  Farewell Messages
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Heading to the Land of the Free! 🗽
                </p>
                <p className="text-xs sm:text-sm text-blue-600 font-semibold">
                  {messages.length} message{messages.length !== 1 ? 's' : ''} total
                </p>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={refreshMessages}
                  className="flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Botones de compartir */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-yellow-400">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              📤 Compartir Mensajes
            </h3>
            <ShareButtons 
              messages={messages}
              sessionName={sessionData?.sessionName || 'Martin & Isi - USA Farewell'}
              sessionId={sessionId}
            />
          </div>

          {/* Navigation con colores USA */}
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-red-300">
            <div className="flex justify-center gap-2 sm:gap-4">
              <Link
                href="/session/martin-isi"
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm transition-colors text-center"
              >
                💌 Leave Message
              </Link>
              <Link
                href="/"
                className="flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm transition-colors text-center"
              >
                🏠 Home
              </Link>
            </div>
          </div>

          {/* Messages Display */}
          {messages.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center border-4 border-yellow-400">
              <div className="text-4xl sm:text-6xl mb-4">🦅</div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">
                No Messages Yet
              </h2>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                Be the first to wish Martin & Isi good luck in the USA!
              </p>
              <Link
                href="/session/martin-isi"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm sm:text-base"
              >
                ✍️ Write First Message
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 transform hover:scale-105 transition-transform border-l-4 border-red-600"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center mb-1">
                        <span className="text-blue-700 text-lg sm:text-xl mr-2">👤</span>
                        <h3 className="font-bold text-base sm:text-lg text-gray-800">
                          {message.author}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                        message.tip && message.tip.includes('Cagao') 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {message.tip || 'Sin propina'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-3 sm:p-4 border-l-2 border-blue-600">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      "{message.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer patriótico */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border-4 border-yellow-400">
              <div className="flex justify-center space-x-2 mb-2">
                <span className="text-red-600 text-lg sm:text-xl">❤️</span>
                <span className="text-blue-700 text-lg sm:text-xl">🤍</span>
                <span className="text-blue-700 text-lg sm:text-xl">💙</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                Created on {sessionData?.createdAt ? new Date(sessionData.createdAt).toLocaleDateString('en-US') : ''}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                May your American dream come true! 🦅🗽
              </p>
            </div>
          </div>
        </div>

        {/* Elementos decorativos móviles */}
        <div className="fixed top-16 left-2 text-red-500 text-base sm:text-xl animate-bounce">🎈</div>
        <div className="fixed top-20 right-2 text-blue-600 text-base sm:text-xl animate-bounce delay-1000">🎈</div>
      </div>
    </>
  );
}