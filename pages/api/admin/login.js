// pages/api/admin/login.js
import { validateAdminPassword, generateAdminToken } from '../../../lib/utils.js';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password requerido'
        });
      }

      // Validar contraseña
      if (!validateAdminPassword(password)) {
        console.log('Intento de login fallido con password:', password.substring(0, 3) + '***');
        return res.status(401).json({
          success: false,
          error: 'Contraseña incorrecta'
        });
      }

      // Generar token
      const token = generateAdminToken(password);

      console.log('Login admin exitoso');

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        token: token,
        expiresIn: '24h' // Info para el frontend
      });

    } catch (error) {
      console.error('Error en login admin:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}