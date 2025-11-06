# Sistema de Asistencia para Docentes

Sistema web completo para el registro y gestión de asistencia de docentes en una Institución Educativa.

## 🚀 Características

- **Dashboard Interactivo**: Vista general con estadísticas en tiempo real
- **Gestión de Docentes**: CRUD completo para administrar información de docentes
- **Registro de Asistencia**: Sistema de registro con múltiples estados (presente, ausente, tardanza, permiso)
- **Reportes**: Generación de reportes con filtros personalizados y exportación a CSV
- **Autenticación**: Sistema de login seguro con JWT
- **Diseño Moderno**: Interfaz responsive y amigable

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
cd ceptro-ciro-alegria
```

### 2. Instalar dependencias

#### Opción A: Instalar todo de una vez
```bash
npm run install-all
```

#### Opción B: Instalar manualmente

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Editar el archivo `.env` y configurar:

```env
PORT=5000
JWT_SECRET=tu_clave_secreta_segura
NODE_ENV=development
```

## 🚀 Ejecución

### Modo Desarrollo (Backend + Frontend simultáneamente)

```bash
npm run dev
```

Esto iniciará:
- Backend en: http://localhost:5000
- Frontend en: http://localhost:3000

### Ejecutar por separado

**Solo Backend:**
```bash
npm run server
```

**Solo Frontend:**
```bash
npm run client
```

## 👤 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
ceptro-ciro-alegria/
├── server/                 # Backend (Node.js + Express)
│   ├── index.js           # Punto de entrada del servidor
│   ├── database.js        # Configuración de SQLite
│   ├── middleware/        # Middlewares (autenticación)
│   └── routes/            # Rutas de la API
│       ├── auth.js        # Autenticación
│       ├── teachers.js    # Gestión de docentes
│       └── attendance.js  # Gestión de asistencia
├── client/                # Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/    # Componentes reutilizables
│       ├── pages/         # Páginas principales
│       ├── services/      # Servicios API
│       ├── App.js         # Componente principal
│       └── index.js       # Punto de entrada
├── package.json           # Dependencias del backend
└── README.md             # Este archivo
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Docentes
- `GET /api/teachers` - Listar docentes
- `GET /api/teachers/:id` - Obtener docente por ID
- `POST /api/teachers` - Crear docente
- `PUT /api/teachers/:id` - Actualizar docente
- `DELETE /api/teachers/:id` - Desactivar docente

### Asistencia
- `GET /api/attendance` - Listar asistencias (con filtros)
- `GET /api/attendance/:id` - Obtener asistencia por ID
- `POST /api/attendance` - Registrar asistencia
- `PUT /api/attendance/:id` - Actualizar asistencia
- `DELETE /api/attendance/:id` - Eliminar asistencia
- `GET /api/attendance/stats/summary` - Obtener estadísticas

## 💾 Base de Datos

El sistema utiliza SQLite como base de datos. El archivo `asistencia.db` se crea automáticamente en la raíz del proyecto al iniciar el servidor por primera vez.

### Tablas:

1. **teachers**: Información de los docentes
2. **users**: Usuarios del sistema (administradores)
3. **attendance**: Registros de asistencia

## 🎨 Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React 18
- React Router DOM
- Axios
- Lucide React (iconos)
- date-fns (manejo de fechas)

## 📱 Características de la Interfaz

### Dashboard
- Estadísticas en tiempo real
- Contadores de docentes activos
- Resumen de asistencia del día
- Lista de asistencias recientes

### Gestión de Docentes
- Búsqueda en tiempo real
- Formulario de creación/edición
- Activación/desactivación de docentes
- Validación de datos únicos (DNI, email)

### Registro de Asistencia
- Filtros por fecha y docente
- Estados: Presente, Ausente, Tardanza, Permiso
- Registro de hora de entrada y salida
- Campo de observaciones

### Reportes
- Filtros por rango de fechas
- Filtros rápidos (mes actual, último mes, etc.)
- Estadísticas visuales
- Exportación a CSV

## 🔒 Seguridad

- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Validación de tokens en cada petición
- Protección de rutas en frontend y backend

## 🚀 Producción

Para preparar el proyecto para producción:

1. Construir el frontend:
```bash
cd client
npm run build
```

2. Configurar el servidor para servir los archivos estáticos del build

3. Cambiar `NODE_ENV=production` en el archivo `.env`

4. Usar un gestor de procesos como PM2:
```bash
npm install -g pm2
pm2 start server/index.js --name "asistencia-docentes"
```

## 📝 Notas Adicionales

- El sistema está diseñado para ser intuitivo y fácil de usar
- La base de datos SQLite es ideal para instituciones pequeñas y medianas
- Para instituciones más grandes, se recomienda migrar a PostgreSQL o MySQL
- El diseño es completamente responsive y funciona en dispositivos móviles

## 🤝 Soporte

Para reportar problemas o sugerencias, por favor contacte al administrador del sistema.

## 📄 Licencia

Este proyecto es de uso interno para la institución educativa.
