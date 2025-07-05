// pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const joinMartinIsiSession = () => {
    setError('');
    router.push('/session/martin-isi');
  };

  const viewMessages = () => {
    setError('');
    router.push('/messages/martin-isi');
  };

  return (
    <>
      <Head>
        <title>Martin & Isi Farewell - USA Edition</title>
        <meta name="description" content="Farewell messages for Martin & Isi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-700 flex flex-col items-center justify-center p-4">
        {/* Estrellas decorativas */}
        <div className="absolute top-4 left-4 text-yellow-400 text-2xl">⭐</div>
        <div className="absolute top-8 right-8 text-yellow-400 text-xl">⭐</div>
        <div className="absolute bottom-8 left-8 text-yellow-400 text-xl">⭐</div>
        <div className="absolute bottom-4 right-4 text-yellow-400 text-2xl">⭐</div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full border-4 border-blue-700">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-6xl mb-4">🇺🇸</div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
              Martin & Isi
            </h1>
            <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
              Farewell Messages
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Leave your message for our friends heading to the USA! 🗽
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Botón principal para dejar mensaje */}
            <div className="text-center">
              <button
                onClick={joinMartinIsiSession}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg sm:text-xl transition-colors shadow-lg transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">💌</span>
                    Leave a Message
                    <span className="ml-2">💌</span>
                  </div>
                )}
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Share your thoughts, memories, and good wishes!
              </p>
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Botón para ver mensajes */}
            <div className="text-center">
              <button
                onClick={viewMessages}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 sm:py-4 px-6 rounded-xl text-base sm:text-lg transition-colors shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">👀</span>
                  View All Messages
                  <span className="ml-2">📜</span>
                </div>
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Read what others have written
              </p>
            </div>
          </div>

          {/* Footer patriótico */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="flex justify-center space-x-2 mb-2">
              <span className="text-red-600 text-lg sm:text-xl">❤️</span>
              <span className="text-blue-700 text-lg sm:text-xl">🤍</span>
              <span className="text-blue-700 text-lg sm:text-xl">💙</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Wishing you the best in the Land of the Free! 🦅
            </p>
          </div>
        </div>

        {/* Elementos decorativos móviles */}
        <div className="fixed top-16 left-2 text-red-500 text-xl animate-bounce">🎈</div>
        <div className="fixed top-20 right-2 text-blue-600 text-xl animate-bounce delay-1000">🎈</div>
      </div>
    </>
  );
}
