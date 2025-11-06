const express = require('express');
const { db } = require('../database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Obtener todos los docentes
router.get('/', authenticateToken, (req, res) => {
  const query = req.query.activo !== undefined 
    ? 'SELECT * FROM teachers WHERE activo = ? ORDER BY apellido, nombre'
    : 'SELECT * FROM teachers ORDER BY apellido, nombre';
  
  const params = req.query.activo !== undefined ? [req.query.activo] : [];

  db.all(query, params, (err, teachers) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener docentes' });
    }
    res.json(teachers);
  });
});

// Obtener un docente por ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM teachers WHERE id = ?', [req.params.id], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener docente' });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json(teacher);
  });
});

// Crear nuevo docente
router.post('/', authenticateToken, (req, res) => {
  const { dni, nombre, apellido, email, telefono, especialidad } = req.body;

  if (!dni || !nombre || !apellido) {
    return res.status(400).json({ error: 'DNI, nombre y apellido son requeridos' });
  }

  const query = `
    INSERT INTO teachers (dni, nombre, apellido, email, telefono, especialidad)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [dni, nombre, apellido, email, telefono, especialidad], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'El DNI o email ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear docente' });
    }
    res.status(201).json({ id: this.lastID, message: 'Docente creado exitosamente' });
  });
});

// Actualizar docente
router.put('/:id', authenticateToken, (req, res) => {
  const { dni, nombre, apellido, email, telefono, especialidad, activo } = req.body;

  const query = `
    UPDATE teachers 
    SET dni = ?, nombre = ?, apellido = ?, email = ?, telefono = ?, especialidad = ?, activo = ?
    WHERE id = ?
  `;

  db.run(query, [dni, nombre, apellido, email, telefono, especialidad, activo, req.params.id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'El DNI o email ya existe' });
      }
      return res.status(500).json({ error: 'Error al actualizar docente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json({ message: 'Docente actualizado exitosamente' });
  });
});

// Eliminar docente (soft delete)
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('UPDATE teachers SET activo = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar docente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json({ message: 'Docente desactivado exitosamente' });
  });
});

module.exports = router;
