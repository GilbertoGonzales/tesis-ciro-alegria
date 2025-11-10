const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();

// POST /api/auth/login
// acepta { dni } o { username } o { email } + password
router.post('/login', async (req, res) => {
  const identifier = (req.body.dni || req.body.username || req.body.email || '').toString().trim();
  const password = req.body.password;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Buscar por dni o email en la tabla teachers (MySQL)
    const [rows] = await pool.query(
      'SELECT * FROM teachers WHERE dni = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar password (bcrypt si está hasheado; si no, fallback a comparación directa)
    let validPassword = false;
    try {
      validPassword = bcrypt.compareSync(password, user.password);
    } catch (e) {
      validPassword = false;
    }
    if (!validPassword) {
      // fallback: contraseña almacenada en texto plano
      if (user.password === password) validPassword = true;
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      dni: user.dni,
      first_name: user.first_name,
      last_name: user.last_name,
      role: 'teacher'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        dni: user.dni,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        activo: user.activo // campo actualizado según tu BD
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
