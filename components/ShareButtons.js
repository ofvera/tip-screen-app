// components/ShareButtons.js
import { useState } from 'react';
import { generateWhatsAppLink } from '../lib/utils.js';
import MessageImage from './MessageImage.js';

export default function ShareButtons({ messages, sessionName, sessionId }) {
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [copying, setCopying] = useState(false);

  // Generar link de WhatsApp
  const handleWhatsAppShare = () => {
    if (messages.length === 0) {
      alert('No hay mensajes para compartir aún.');
      return;
    }

    const whatsappUrl = generateWhatsAppLink(messages, sessionName);
    
    // Abrir WhatsApp
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  };

  // Copiar link de la sesión
  const handleCopyLink = async () => {
    setCopying(true);
    const url = `${window.location.origin}/session/${sessionId}`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('¡Link copiado al portapapeles!');
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('¡Link copiado al portapapeles!');
      }
    } catch (err) {
      console.error('Error copiando link:', err);
      alert('No se pudo copiar automáticamente. URL: ' + url);
    } finally {
      setCopying(false);
    }
  };

  // Compartir nativo (si está disponible)
  const handleNativeShare = async () => {
    if (messages.length === 0) {
      alert('No hay mensajes para compartir aún.');
      return;
    }

    const url = `${window.location.origin}/messages/${sessionId}`;
    const text = `🇺🇸 ${sessionName} - ¡Mira todos los mensajes de despedida!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionName,
          text: text,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          // Fallback to copy link
          handleCopyLink();
        }
      }
    } else {
      // Fallback para navegadores sin soporte nativo
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Botones principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          disabled={messages.length === 0}
        >
          <span className="text-xl">📱</span>
          <span className="text-sm sm:text-base">WhatsApp</span>
        </button>

        {/* Generar Imagen */}
        <button
          onClick={() => setShowImageGenerator(true)}
          className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          disabled={messages.length === 0}
        >
          <span className="text-xl">🖼️</span>
          <span className="text-sm sm:text-base">Imagen</span>
        </button>
      </div>

      {/* Botones secundarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Compartir nativo */}
        <button
          onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <span>📤</span>
          <span>Compartir Link</span>
        </button>

        {/* Copiar link */}
        <button
          onClick={handleCopyLink}
          disabled={copying}
          className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <span>{copying ? '⏳' : '📋'}</span>
          <span>{copying ? 'Copiando...' : 'Copiar Link'}</span>
        </button>
      </div>

      {/* Información adicional */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>
          <strong>WhatsApp:</strong> Envía los mensajes como texto
        </p>
        <p>
          <strong>Imagen:</strong> Crea una imagen bonita para descargar
        </p>
        {messages.length === 0 && (
          <p className="text-amber-600 font-semibold">
            ⚠️ Aún no hay mensajes para compartir
          </p>
        )}
      </div>

      {/* Generador de imagen (modal) */}
      {showImageGenerator && (
        <MessageImage
          messages={messages}
          sessionName={sessionName}
          onClose={() => setShowImageGenerator(false)}
        />
      )}
    </div>
  );
}