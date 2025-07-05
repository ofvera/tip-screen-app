// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Meta tags para mobile/tablet */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tip Screen" />
        
        {/* Favicon y iconos */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Fuentes optimizadas */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Meta tags adicionales */}
        <meta name="description" content="App divertida para despedidas con sistema de propinas" />
        <meta name="keywords" content="despedida, amigos, propinas, mensajes" />
        <meta name="author" content="SoothSayer Technologies" />
        
        {/* Open Graph para compartir */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tip Screen - Despedida de Amigos" />
        <meta property="og:description" content="Deja tu mensaje en nuestra despedida" />
        <meta property="og:site_name" content="Tip Screen" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Tip Screen - Despedida de Amigos" />
        <meta name="twitter:description" content="Deja tu mensaje en nuestra despedida" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}