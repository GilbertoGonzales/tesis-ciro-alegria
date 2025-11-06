const express = require('express');
const { db } = require('../database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Registrar asistencia
router.post('/', authenticateToken, (req, res) => {
  const { teacher_id, fecha, hora_entrada, hora_salida, estado, observaciones } = req.body;

  if (!teacher_id || !fecha) {
    return res.status(400).json({ error: 'ID de docente y fecha son requeridos' });
  }

  const query = `
    INSERT INTO attendance (teacher_id, fecha, hora_entrada, hora_salida, estado, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [teacher_id, fecha, hora_entrada, hora_salida, estado || 'presente', observaciones], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ya existe un registro de asistencia para este docente en esta fecha' });
      }
      return res.status(500).json({ error: 'Error al registrar asistencia' });
    }
    res.status(201).json({ id: this.lastID, message: 'Asistencia registrada exitosamente' });
  });
});

// Obtener asistencias con filtros
router.get('/', authenticateToken, (req, res) => {
  const { fecha, teacher_id, fecha_inicio, fecha_fin } = req.query;
  
  let query = `
    SELECT a.*, t.nombre, t.apellido, t.dni, t.especialidad
    FROM attendance a
    JOIN teachers t ON a.teacher_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (fecha) {
    query += ' AND a.fecha = ?';
    params.push(fecha);
  }

  if (teacher_id) {
    query += ' AND a.teacher_id = ?';
    params.push(teacher_id);
  }

  if (fecha_inicio && fecha_fin) {
    query += ' AND a.fecha BETWEEN ? AND ?';
    params.push(fecha_inicio, fecha_fin);
  }

  query += ' ORDER BY a.fecha DESC, t.apellido, t.nombre';

  db.all(query, params, (err, records) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener registros de asistencia' });
    }
    res.json(records);
  });
});

// Obtener asistencia por ID
router.get('/:id', authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, t.nombre, t.apellido, t.dni, t.especialidad
    FROM attendance a
    JOIN teachers t ON a.teacher_id = t.id
    WHERE a.id = ?
  `;

  db.get(query, [req.params.id], (err, record) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener registro de asistencia' });
    }
    if (!record) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(record);
  });
});

// Actualizar asistencia
router.put('/:id', authenticateToken, (req, res) => {
  const { hora_entrada, hora_salida, estado, observaciones } = req.body;

  const query = `
    UPDATE attendance 
    SET hora_entrada = ?, hora_salida = ?, estado = ?, observaciones = ?
    WHERE id = ?
  `;

  db.run(query, [hora_entrada, hora_salida, estado, observaciones, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar asistencia' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ message: 'Asistencia actualizada exitosamente' });
  });
});

// Eliminar asistencia
router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM attendance WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar asistencia' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ message: 'Asistencia eliminada exitosamente' });
  });
});

// Estadísticas de asistencia
router.get('/stats/summary', authenticateToken, (req, res) => {
  const { fecha_inicio, fecha_fin, teacher_id } = req.query;
  
  let query = `
    SELECT 
      estado,
      COUNT(*) as total
    FROM attendance
    WHERE 1=1
  `;
  const params = [];

  if (fecha_inicio && fecha_fin) {
    query += ' AND fecha BETWEEN ? AND ?';
    params.push(fecha_inicio, fecha_fin);
  }

  if (teacher_id) {
    query += ' AND teacher_id = ?';
    params.push(teacher_id);
  }

  query += ' GROUP BY estado';

  db.all(query, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
    res.json(stats);
  });
});

module.exports = router;
