// components/MessageImage.js
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function MessageImage({ messages, sessionName, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const contentRef = useRef(null);

  const generateImage = async () => {
    if (!contentRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        height: contentRef.current.scrollHeight,
        width: contentRef.current.scrollWidth
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setImageUrl(dataUrl);
    } catch (error) {
      console.error('Error generando imagen:', error);
      alert('Error al generar la imagen. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `${sessionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_mensajes.png`;
    link.href = imageUrl;
    link.click();
  };

  const shareImage = async () => {
    if (!imageUrl) return;

    try {
      // Convertir dataURL a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `${sessionName}_mensajes.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${sessionName} - Mensajes de Despedida`,
          text: '¡Mira todos estos hermosos mensajes!',
          files: [file]
        });
      } else {
        // Fallback: descargar
        downloadImage();
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      downloadImage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-screen overflow-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            📸 Generar Imagen
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content to capture */}
        <div className="p-6">
          <div 
            ref={contentRef}
            className="bg-gradient-to-br from-red-600 via-white to-blue-700 p-8 rounded-2xl"
            style={{ minHeight: '600px', maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Header de la imagen */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🇺🇸</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {sessionName}
              </h1>
              <p className="text-xl text-blue-700 font-semibold">
                Mensajes de Despedida
              </p>
              <p className="text-gray-600 mt-2">
                {messages.length} mensaje{messages.length !== 1 ? 's' : ''} • {new Date().toLocaleDateString('es-CL')}
              </p>
            </div>

            {/* Mensajes */}
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🦗</div>
                  <p className="text-gray-600 text-xl">
                    Aún no hay mensajes...
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {message.author}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        message.tip && message.tip.includes('Cagao') 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {message.tip || 'Sin propina'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        "{message.text}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer de la imagen */}
            <div className="mt-8 text-center">
              <div className="flex justify-center space-x-2 mb-2">
                <span className="text-red-600 text-2xl">❤️</span>
                <span className="text-blue-700 text-2xl">🤍</span>
                <span className="text-blue-700 text-2xl">💙</span>
              </div>
              <p className="text-gray-600 font-semibold">
                ¡Que tengan un viaje increíble al país de los sueños! 🗽✨
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!imageUrl ? (
              <button
                onClick={generateImage}
                disabled={generating}
                className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>📸</span>
                    <span>Generar Imagen</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadImage}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <span>⬇️</span>
                  <span>Descargar</span>
                </button>
                <button
                  onClick={shareImage}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <span>📤</span>
                  <span>Compartir</span>
                </button>
                <button
                  onClick={() => setImageUrl(null)}
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <span>🔄</span>
                  <span>Nueva Imagen</span>
                </button>
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>✅ Imagen generada exitosamente</p>
              <p>Puedes descargarla o compartirla directamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}