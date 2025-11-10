// ...existing code...
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let bcrypt;
try {
  bcrypt = require('bcrypt'); // intenta bcrypt nativo
} catch (e) {
  try {
    bcrypt = require('bcryptjs'); // fallback para Windows sin compilación
  } catch (e2) {
    bcrypt = null;
    console.warn('bcrypt / bcryptjs no disponibles. Las contraseñas se guardarán en texto plano temporalmente.');
  }
}

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function initialize() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dni TEXT UNIQUE,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          password TEXT,
          is_active INTEGER DEFAULT 1,
          scheduled_start TEXT,
          scheduled_end TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `, (err) => {
        if (err) console.error('create teachers error:', err.message);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER,
          date TEXT,
          entry_time TEXT,
          entry_status TEXT,
          exit_time TEXT,
          exit_status TEXT,
          notes TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY(teacher_id) REFERENCES teachers(id)
        )
      `, (err) => {
        if (err) console.error('create attendance error:', err.message);
      });

      // seed mínimo: crear admin si no existe (dni = 'admin')
      db.get('SELECT * FROM teachers WHERE dni = ?', ['admin'], (err, row) => {
        if (err) {
          console.error('DB error checking admin:', err.message);
          return reject(err);
        }
        if (!row) {
          const plainPw = 'admin123';
          if (bcrypt) {
            try {
              const hashed = bcrypt.hashSync(plainPw, 10);
              db.run(
                `INSERT INTO teachers (dni, first_name, last_name, email, password, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
                ['admin', 'Admin', 'User', 'admin@example.com', hashed],
                (iErr) => {
                  if (iErr) {
                    console.error('Error creando admin:', iErr.message);
                    return reject(iErr);
                  }
                  return resolve();
                }
              );
            } catch (hErr) {
              console.error('Error hasheando contraseña admin:', hErr.message);
              // intentar insertar en texto plano como fallback
              db.run(
                `INSERT INTO teachers (dni, first_name, last_name, email, password, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
                ['admin', 'Admin', 'User', 'admin@example.com', plainPw],
                (iErr2) => {
                  if (iErr2) return reject(iErr2);
                  console.warn('Admin creado con contraseña en texto plano por fallback.');
                  return resolve();
                }
              );
            }
          } else {
            db.run(
              `INSERT INTO teachers (dni, first_name, last_name, email, password, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
              ['admin', 'Admin', 'User', 'admin@example.com', plainPw],
              (iErr) => {
                if (iErr) {
                  console.error('Error creando admin (texto plano):', iErr.message);
                  return reject(iErr);
                }
                console.warn('Admin creado con contraseña en texto plano.');
                return resolve();
              }
            );
          }
        } else {
          // admin ya existe
          return resolve();
        }
      });
    });
  });
}

module.exports = { db, initialize };
// ...existing code...