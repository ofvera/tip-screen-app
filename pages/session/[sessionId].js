// pages/session/[sessionId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function SessionPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [selectedTip, setSelectedTip] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [isStingy, setIsStingy] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      // Redirigir a Martin & Isi si es otra sesión
      if (sessionId !== 'martin-isi') {
        router.replace('/session/martin-isi');
        return;
      }
      fetchSessionData();
    }
  }, [sessionId, router]);

  const fetchSessionData = async () => {
    try {
      console.log('Fetching session data for:', sessionId);
      const response = await fetch(`/api/session?sessionId=${sessionId}`);
      const data = await response.json();
      
      console.log('Session API response:', data);
      
      if (data.success && response.ok) {
        setSessionData(data);
        setTotalMessages(data.messages?.length || 0);
        setCurrentScreen('tip');
      } else {
        console.error('Session not found or error:', data.error);
        setError(data.error || 'Sesión no encontrada');
        setCurrentScreen('error');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Error de conexión');
      setCurrentScreen('error');
    }
  };

  const handleTipSelect = (tipValue) => {
    setSelectedTip(tipValue);
    setIsStingy(false);
    setCurrentScreen('message');
  };

  const handleNoTip = () => {
    setIsStingy(true);
    setCurrentScreen('message');
  };

  const handleCustomTip = () => {
    if (customAmount && parseFloat(customAmount) > 0) {
      setSelectedTip(`${customAmount}%`);
      setIsStingy(false);
      setCurrentScreen('message');
    }
  };

  const handleSubmitMessage = async () => {
    if (!message.trim()) {
      setError('Por favor escribe un mensaje');
      return;
    }

    try {
      console.log('Enviando mensaje:', {
        sessionId,
        autor: author || 'Anónimo',
        texto: message,
        propina: isStingy ? 'Cagao certificado 🤡' : selectedTip,
      });

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          autor: author || 'Anónimo',
          texto: message,
          propina: isStingy ? 'Cagao certificado 🤡' : selectedTip,
        }),
      });

      const data = await response.json();
      console.log('Message API response:', data);

      if (data.success && response.ok) {
        setTotalMessages(data.totalMessages);
        setCurrentScreen('success');
        
        setTimeout(() => {
          resetForm();
          setCurrentScreen('tip');
        }, 4000);
      } else {
        console.error('Error saving message:', data.error);
        setError(data.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error de conexión al enviar el mensaje');
    }
  };

  const resetForm = () => {
    setSelectedTip('');
    setCustomAmount('');
    setMessage('');
    setAuthor('');
    setIsStingy(false);
    setError('');
  };

  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Cargando despedida...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">😵</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
            Despedida no encontrada
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {error || 'El código que ingresaste no existe o ha expirado.'}
          </p>
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm sm:text-base"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (currentScreen === 'tip') {
    return (
      <>
        <Head>
          <title>Tip Screen - {sessionData?.name}</title>
        </Head>
        
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Leave a tip?
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                Martin & Isi Session
              </p>
              <p className="text-xs sm:text-sm text-blue-600">
                {totalMessages} mensaje{totalMessages !== 1 ? 's' : ''} enviado{totalMessages !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Botones de propina - responsive grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => handleTipSelect('15%')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-6 sm:py-8 px-2 sm:px-4 rounded-lg text-lg sm:text-2xl transition-colors touch-manipulation"
              >
                15%
              </button>
              <button
                onClick={() => handleTipSelect('20%')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-6 sm:py-8 px-2 sm:px-4 rounded-lg text-lg sm:text-2xl transition-colors touch-manipulation"
              >
                20%
              </button>
              <button
                onClick={() => handleTipSelect('25%')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-6 sm:py-8 px-2 sm:px-4 rounded-lg text-lg sm:text-2xl transition-colors touch-manipulation"
              >
                25%
              </button>
            </div>
            
            {/* Custom tip - responsive input */}
            <div className="mb-4 sm:mb-6">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Custom %"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 bg-blue-500 text-white placeholder-blue-200 font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-lg text-lg sm:text-xl text-center touch-manipulation"
                />
                <button
                  onClick={handleCustomTip}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-sm sm:text-lg transition-colors touch-manipulation"
                >
                  OK
                </button>
              </div>
            </div>
            
            {/* Navigation buttons - responsive */}
            <div className="text-center space-y-3 sm:space-y-4">
              <button
                onClick={handleNoTip}
                className="text-gray-600 hover:text-gray-800 underline text-base sm:text-lg transition-colors touch-manipulation"
              >
                No tip
              </button>
              
              <div className="pt-3 sm:pt-4 border-t">
                <Link
                  href={`/messages/martin-isi`}
                  className="text-blue-600 hover:text-blue-800 text-sm sm:text-base transition-colors touch-manipulation"
                >
                  👀 Ver mensajes enviados
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentScreen === 'message') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full">
          {isStingy ? (
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
                ¡Cagao detectado! 🤡
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Ya que no das propina, al menos escribe algo bonito...
              </p>
            </div>
          ) : (
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
                ¡Gracias por el {selectedTip}! 🎉
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Ahora escribe tu dedicatoria para la despedida
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <input
              type="text"
              placeholder="Tu nombre"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg text-base sm:text-lg touch-manipulation"
            />
            
            <textarea
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError('');
              }}
              rows={4}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg text-base sm:text-lg resize-none touch-manipulation"
            />
            
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentScreen('tip')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-lg text-base sm:text-lg transition-colors touch-manipulation"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitMessage}
                disabled={!message.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-lg text-base sm:text-lg transition-colors touch-manipulation"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
            ¡Mensaje enviado!
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Gracias por tu dedicatoria para la despedida
          </p>
          <p className="text-sm text-blue-600 mb-4">
            Total de mensajes: {totalMessages}
          </p>
          <div className="text-xs sm:text-sm text-gray-500">
            Volviendo al inicio en unos segundos...
          </div>
        </div>
      </div>
    );
  }
}