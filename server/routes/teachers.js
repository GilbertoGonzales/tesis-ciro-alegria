const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Obtener lista de docentes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers WHERE activo = 1');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener docente por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo docente
router.post('/', async (req, res) => {
  const { dni, first_name, last_name, email, telefono, especialidad, activo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO teachers (dni, first_name, last_name, email, telefono, especialidad, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dni, first_name, last_name, email, telefono, especialidad, activo || 1]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar docente sin borrar campos no enviados
router.put('/:id', async (req, res) => {
  const { dni, first_name, last_name, email, telefono, especialidad, activo } = req.body;

  try {
    // Obtener datos actuales del docente
    const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    const current = rows[0];

    // Usar valor nuevo o el viejo si el nuevo está vacío o no definido
    const updatedDni = dni !== undefined && dni !== '' ? dni : current.dni;
    const updatedFirstName = first_name !== undefined && first_name !== '' ? first_name : current.first_name;
    const updatedLastName = last_name !== undefined && last_name !== '' ? last_name : current.last_name;
    const updatedEmail = email !== undefined && email !== '' ? email : current.email;
    const updatedTelefono = telefono !== undefined && telefono !== '' ? telefono : current.telefono;
    const updatedEspecialidad = especialidad !== undefined && especialidad !== '' ? especialidad : current.especialidad;
    const updatedActivo = typeof activo !== 'undefined' ? activo : current.activo;

    // Actualizar registro
    const [result] = await pool.query(
      `UPDATE teachers SET dni = ?, first_name = ?, last_name = ?, email = ?, telefono = ?, especialidad = ?, activo = ? WHERE id = ?`,
      [updatedDni, updatedFirstName, updatedLastName, updatedEmail, updatedTelefono, updatedEspecialidad, updatedActivo, req.params.id]
    );

    res.json({ updated: result.affectedRows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Desactivar docente
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE teachers SET activo = 0 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.json({ deactivated: result.affectedRows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
