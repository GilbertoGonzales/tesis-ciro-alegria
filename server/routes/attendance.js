const express = require('express');
const { pool } = require('../database'); // Usando MySQL pool
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Registrar asistencia
router.post('/', authenticateToken, async (req, res) => {
  const { teacher_id, date, entry_time, exit_time, estado, observaciones } = req.body;
  if (!teacher_id || !date) {
    return res.status(400).json({ error: 'ID de docente y fecha son requeridos' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO attendance (teacher_id, date, entry_time, exit_time, entry_status, exit_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [teacher_id, date, entry_time, exit_time, estado || 'presente', estado || 'salida', observaciones]
    );
    res.status(201).json({ id: result.insertId, message: 'Asistencia registrada exitosamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un registro de asistencia para este docente en esta fecha' });
    }
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
});

// Obtener asistencias con filtros
router.get('/', authenticateToken, async (req, res) => {
  const { date, teacher_id, date_start, date_end } = req.query;
  let query = `
    SELECT a.*, t.first_name, t.last_name, t.dni, t.email
    FROM attendance a
    JOIN teachers t ON a.teacher_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }
  if (teacher_id) {
    query += ' AND a.teacher_id = ?';
    params.push(teacher_id);
  }
  if (date_start && date_end) {
    query += ' AND a.date BETWEEN ? AND ?';
    params.push(date_start, date_end);
  }
  query += ' ORDER BY a.date DESC, t.last_name, t.first_name';
  try {
    const [records] = await pool.query(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros de asistencia' });
  }
});

// Obtener asistencia por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, t.first_name, t.last_name, t.dni, t.email
       FROM attendance a
       JOIN teachers t ON a.teacher_id = t.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registro de asistencia' });
  }
});

// Actualizar asistencia
router.put('/:id', authenticateToken, async (req, res) => {
  const { entry_time, exit_time, entry_status, exit_status, notes } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE attendance
       SET entry_time = ?, exit_time = ?, entry_status = ?, exit_status = ?, notes = ?
       WHERE id = ?`,
      [entry_time, exit_time, entry_status, exit_status, notes, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ message: 'Asistencia actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
});

// Eliminar asistencia
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM attendance WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ message: 'Asistencia eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar asistencia' });
  }
});

// Estadísticas de asistencia
router.get('/stats/summary', authenticateToken, async (req, res) => {
  const { date_start, date_end, teacher_id } = req.query;
  let query = `
    SELECT 
      entry_status as estado,
      COUNT(*) as total
    FROM attendance
    WHERE 1=1
  `;
  const params = [];
  if (date_start && date_end) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(date_start, date_end);
  }
  if (teacher_id) {
    query += ' AND teacher_id = ?';
    params.push(teacher_id);
  }
  query += ' GROUP BY entry_status';
  try {
    const [stats] = await pool.query(query, params);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
