const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'asistencia.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de docentes
      db.run(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dni VARCHAR(20) UNIQUE NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE,
          telefono VARCHAR(20),
          especialidad VARCHAR(100),
          activo BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de usuarios (admin)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de asistencias
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          fecha DATE NOT NULL,
          hora_entrada TIME,
          hora_salida TIME,
          estado VARCHAR(20) DEFAULT 'presente',
          observaciones TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id),
          UNIQUE(teacher_id, fecha)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Crear usuario admin por defecto
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          db.run(
            'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'admin'],
            (err) => {
              if (err) console.log('Usuario admin ya existe');
              console.log('Base de datos inicializada correctamente');
              resolve();
            }
          );
        }
      });
    });
  });
};

module.exports = {
  db,
  initialize
};
