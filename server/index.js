const express = require('express');
const cors = require('cors');
const { initialize } = require('./database');

function normalizeRouter(mod, name) {
  if (!mod) return null;
  // módulo ya es un router/función middleware
  if (typeof mod === 'function' || (mod && typeof mod.handle === 'function')) return mod;
  // soportar export default
  if (mod.default && (typeof mod.default === 'function' || (mod.default && typeof mod.default.handle === 'function'))) return mod.default;
  // soportar export { router }
  if (mod.router && (typeof mod.router === 'function' || (mod.router && typeof mod.router.handle === 'function'))) return mod.router;
  console.error(`Invalid router exported from ${name}. Expected an Express Router or middleware function.`);
  return null;
}

// rutas (asegúrate que existan esos archivos)
const authMod = require('./routes/auth');
const teachersMod = require('./routes/teachers');
const attendanceMod = require('./routes/attendance');

const authRouter = normalizeRouter(authMod, './routes/auth');
const teachersRouter = normalizeRouter(teachersMod, './routes/teachers');
const attendanceRouter = normalizeRouter(attendanceMod, './routes/attendance');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rutas API (verificar que cada router sea válido antes de usar)
if (authRouter) app.use('/api/auth', authRouter);
else console.warn('Skipping /api/auth route: invalid router.');

if (teachersRouter) app.use('/api/teachers', teachersRouter);
else console.warn('Skipping /api/teachers route: invalid router.');

if (attendanceRouter) app.use('/api/attendance', attendanceRouter);
else console.warn('Skipping /api/attendance route: invalid router.');

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

initialize()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} in use. Stop the process using it or set PORT env var.`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
      }
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });