# HelpDeskPro - Sistema de Gestión de Tickets

Sistema de gestión de tickets de soporte técnico construido con Next.js, TypeScript, MongoDB y Tailwind CSS.

## Descripción

HelpDeskPro es una aplicación web interna que permite gestionar de forma eficiente los tickets de soporte, usuarios (clientes y agentes), respuestas, notificaciones por correo y tareas programadas de recordatorio.

## Tecnologías Utilizadas

- Next.js 16
- TypeScript
- MongoDB + Mongoose
- Tailwind CSS
- Axios
- JWT (JSON Web Tokens)
- Nodemailer
- Node-cron
- bcryptjs

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 18 o superior
- npm o yarn
- MongoDB (local o cuenta en MongoDB Atlas)
- Cuenta de correo electrónico para SMTP (Gmail, Outlook, etc.)

## Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd prueba
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB - URI de conexión a la base de datos
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/helpdeskpro?retryWrites=true&w=majority

# JWT Secret - Clave secreta para tokens de autenticación (genera una aleatoria)
JWT_SECRET=tu-secret-key-super-segura-minimo-32-caracteres

# SMTP - Configuración para envío de correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret para cron jobs
CRON_SECRET=cron-secret-key-aleatoria
```

#### Cómo Obtener Cada Variable:

**MONGODB_URI:**
- Opción 1 (MongoDB Atlas - Recomendado): 
  1. Ve a https://www.mongodb.com/cloud/atlas
  2. Crea una cuenta gratuita
  3. Crea un cluster (FREE)
  4. Crea un usuario de base de datos
  5. Whitelist tu IP (0.0.0.0/0 para desarrollo)
  6. Copia la connection string y reemplaza `<password>` con tu contraseña
  7. Agrega `/helpdeskpro` antes del `?` y `?retryWrites=true&w=majority` al final

- Opción 2 (MongoDB Local):
  - Si tienes MongoDB instalado localmente: `mongodb://localhost:27017/helpdeskpro`

**JWT_SECRET:**
- Genera cualquier string largo y aleatorio (mínimo 32 caracteres)
- Ejemplo: `openssl rand -base64 32` o usa un generador online

**SMTP (Para Gmail):**
1. Ve a tu cuenta de Google
2. Activa la Verificación en 2 pasos
3. Ve a Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones
4. Genera una nueva contraseña de aplicación
5. Usa esa contraseña en `SMTP_PASS` (NO tu contraseña normal de Gmail)

**NEXT_PUBLIC_APP_URL:**
- Para desarrollo: `http://localhost:3000`
- Para producción: tu dominio

**CRON_SECRET:**
- Cualquier string seguro para proteger el endpoint de cron jobs

### Paso 4: Crear Usuarios en la Base de Datos

Tienes dos opciones:

**Opción A: Usar el archivo JSON proporcionado**

1. Abre MongoDB Compass o usa mongosh
2. Conéctate a tu base de datos
3. Ve a la base de datos `helpdeskpro`
4. Crea la colección `users` (si no existe)
5. Inserta los siguientes documentos:

```json
{
  "name": "Cliente Test",
  "email": "cliente@test.com",
  "password": "$2b$10$gN1Dm9FZbzfvwt8BLqKYBObw9j8nOfLNLfReyq2hPD.mpKwm1lWlC",
  "role": "client"
}
```

```json
{
  "name": "Agente Test",
  "email": "agente@test.com",
  "password": "$2b$10$7.xJLJ2C6vCqgtjmMvv1ieuD7Kqc.iUH3OSnvTyZCbXMDKICTU3K.",
  "role": "agent"
}
```

**Opción B: Registrarse desde la aplicación**

1. Ejecuta la aplicación (ver siguiente paso)
2. Ve a `/register`
3. Crea una cuenta (Cliente o Agente)
4. Inicia sesión

**Credenciales de prueba (si usas Opción A):**
- Cliente: `cliente@test.com` / `cliente123`
- Agente: `agente@test.com` / `agente123`

### Paso 5: Ejecutar el Proyecto

**Modo Desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

**Modo Producción:**

```bash
npm run build
npm start
```

## Uso de la Aplicación

### Login

1. Abre `http://localhost:3000` en tu navegador
2. Serás redirigido a `/login`
3. Ingresa tus credenciales:
   - Email: `cliente@test.com` o `agente@test.com`
   - Contraseña: `cliente123` o `agente123`

### Panel de Cliente

Una vez iniciado sesión como cliente:

- Ver tus tickets
- Crear nuevos tickets
- Ver detalle de tickets
- Agregar comentarios a tus tickets
- Editar título y descripción de tus tickets

### Panel de Agente

Una vez iniciado sesión como agente:

- Ver todos los tickets
- Filtrar tickets por estado y prioridad
- Ver detalle de tickets
- Tomar tickets (asignarse)
- Cambiar estado de tickets
- Editar título, descripción y prioridad de tickets
- Agregar comentarios/respuestas
- Cerrar tickets

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── tickets/      # CRUD de tickets
│   │   ├── comments/     # Comentarios
│   │   └── cron/         # Cron jobs
│   ├── dashboard/
│   │   ├── client/       # Panel cliente
│   │   └── agent/        # Panel agente
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── tickets/          # Detalle de tickets
├── components/
│   ├── ui/               # Componentes UI reutilizables
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx   # Context de autenticación
├── lib/
│   ├── mongodb.ts        # Conexión MongoDB
│   ├── auth.ts           # Utilidades JWT
│   └── email.ts          # Servicio de correo
├── models/               # Modelos Mongoose
│   ├── User.ts
│   ├── Ticket.ts
│   └── Comment.ts
└── services/             # Servicios Axios
    ├── api.ts
    ├── ticketService.ts
    └── commentService.ts
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Funcionalidades Principales

### Gestión de Tickets

- Crear tickets con título, descripción y prioridad
- Editar tickets (título, descripción, prioridad)
- Cambiar estado de tickets (abierto, en progreso, resuelto, cerrado)
- Filtrar tickets por estado y prioridad
- Ver detalle completo de tickets

### Sistema de Comentarios

- Agregar comentarios a tickets
- Ver historial de comentarios en orden cronológico
- Clientes y agentes pueden comentar

### Autenticación y Roles

- Sistema de login y registro
- Dos roles: Cliente y Agente
- Protección de rutas según rol
- Gestión de sesión con Context API

### Notificaciones por Correo

- Correo al crear ticket
- Correo cuando agente responde
- Correo al cerrar ticket

### Cron Jobs

- Recordatorios automáticos para tickets sin respuesta
- Endpoint: `/api/cron/reminders`

## Solución de Problemas

### Error: "Cannot connect to MongoDB"

- Verifica que MongoDB esté corriendo (si es local)
- Revisa la URI en `.env.local`
- Si usas Atlas, verifica que tu IP esté en la whitelist
- Verifica que la contraseña en la URI sea correcta

### Error: "Credenciales inválidas"

- Verifica que los usuarios existan en la base de datos
- Revisa que las contraseñas estén correctamente hasheadas
- Asegúrate de usar las credenciales correctas

### Error: "SMTP authentication failed"

- Para Gmail, asegúrate de usar una "Contraseña de aplicación", no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activada
- Revisa que `SMTP_USER` y `SMTP_PASS` sean correctos

### Error: "JWT_SECRET is not defined"

- Verifica que `.env.local` exista en la raíz del proyecto
- Reinicia el servidor después de crear/modificar `.env.local`

### Los correos no se envían

- Verifica las credenciales SMTP en `.env.local`
- Revisa la consola del servidor para ver errores
- Los correos solo se envían si SMTP está configurado correctamente

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| MONGODB_URI | URI de conexión a MongoDB | mongodb+srv://... |
| JWT_SECRET | Clave secreta para JWT | string-aleatorio-largo |
| SMTP_HOST | Servidor SMTP | smtp.gmail.com |
| SMTP_PORT | Puerto SMTP | 587 |
| SMTP_USER | Email del remitente | tu-email@gmail.com |
| SMTP_PASS | Contraseña SMTP | contraseña-de-aplicacion |
| NEXT_PUBLIC_APP_URL | URL de la aplicación | http://localhost:3000 |
| CRON_SECRET | Secret para cron jobs | string-seguro |

## Notas Importantes

- Las contraseñas se hashean con bcrypt antes de guardarse
- Los tokens JWT expiran en 7 días
- Los correos solo se envían si SMTP está configurado
- El cron job requiere que la aplicación esté ejecutándose
- Los usuarios se crean directamente en MongoDB o mediante registro

## Datos del Coder

- Nombre: [Tu Nombre]
- Clan: [Tu Clan]
- Correo: [Tu Correo]
- Documento: [Tu Documento]

## Licencia

Este proyecto es una prueba técnica.

