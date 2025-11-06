# 📖 Instrucciones de Configuración Inicial

## Paso 1: Configurar Variables de Entorno

Antes de ejecutar el sistema, debes crear el archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
PORT=5000
JWT_SECRET=ciro_alegria_secret_key_2024
NODE_ENV=development
```

**Importante**: Cambia `JWT_SECRET` por una clave segura en producción.

## Paso 2: Instalar Dependencias

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm run install-all
```

Este comando instalará todas las dependencias del backend y frontend automáticamente.

## Paso 3: Iniciar el Sistema

Para iniciar tanto el backend como el frontend simultáneamente:

```bash
npm run dev
```

El sistema estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Credenciales de Acceso

- **Usuario**: admin
- **Contraseña**: admin123

## Solución de Problemas Comunes

### Error: "Cannot find module"
Ejecuta: `npm run install-all`

### Puerto ya en uso
Cambia el puerto en el archivo `.env`

### Base de datos no se crea
Verifica que tengas permisos de escritura en la carpeta del proyecto

## Contacto

Para soporte técnico, contacta al administrador del sistema.
