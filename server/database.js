const mysql = require('mysql2/promise');

// Configura los datos de conexión a tu base de datos MySQL (ajusta usuario y contraseña si es necesario)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Si tienes contraseña ponla aquí
  database: 'tesisciroalegria',
  waitForConnections: true,
  connectionLimit: 10,
});

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


async function initialize() {
  try {
    // Crea la tabla teachers si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dni VARCHAR(255) UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        activo TINYINT(1) DEFAULT 1,
        scheduled_start TIME DEFAULT NULL,
        scheduled_end TIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea la tabla attendance si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT,
        date DATE,
        entry_time TIME DEFAULT NULL,
        entry_status VARCHAR(255) DEFAULT NULL,
        exit_time TIME DEFAULT NULL,
        exit_status VARCHAR(255) DEFAULT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )
    `);

    // Comprueba si existe el usuario admin
    const [rows] = await pool.query('SELECT * FROM teachers WHERE dni = ?', ['admin']);
    if (rows.length === 0) {
      const plainPw = 'admin123';
      let hashed = plainPw;
      if (bcrypt) {
        try {
          hashed = bcrypt.hashSync(plainPw, 10);
        } catch (err) {
          console.warn('Error al hashear contraseña, guardando en texto plano.');
        }
      } else {
        console.warn('Admin creado con contraseña en texto plano.');
      }
      await pool.query(
        `INSERT INTO teachers (dni, first_name, last_name, email, password, activo) VALUES (?, ?, ?, ?, ?, 1)`,
        ['admin', 'Admin', 'User', 'admin@example.com', hashed]
      );
      console.log('Usuario admin creado por primera vez.');
    }
  } catch (err) {
    console.error('Error en la inicialización:', err.message);
    throw err;
  }
}

module.exports = { pool, initialize };
