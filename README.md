# HelpDeskPro - Sistema de Gestión de Tickets

Sistema de gestión de tickets de soporte técnico construido con Next.js, TypeScript, MongoDB y Tailwind CSS.

## 📋 Descripción

HelpDeskPro es una aplicación web interna que permite gestionar de forma eficiente los tickets de soporte, usuarios (clientes y agentes), respuestas, notificaciones por correo y tareas programadas de recordatorio.

## ✨ Características Principales

- ✅ Gestión completa de tickets (crear, editar, cerrar)
- ✅ Sistema de autenticación con roles (cliente y agente)
- ✅ Comentarios y respuestas en tickets
- ✅ Notificaciones por correo electrónico
- ✅ Cron jobs para recordatorios automáticos
- ✅ Componentes UI reutilizables (Button, Badge, Card)
- ✅ Dashboard diferenciado por rol
- ✅ Filtros y búsqueda de tickets

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **MongoDB + Mongoose** - Base de datos
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **JWT** - Autenticación
- **Nodemailer** - Envío de correos
- **Node-cron** - Tareas programadas
- **bcryptjs** - Hash de contraseñas

## 📦 Requisitos Previos

- Node.js 18+
- MongoDB (local o Atlas)
- Cuenta de correo para SMTP (Gmail, Outlook, etc.)

## 🚀 Instalación

1. **Clona el repositorio**:
```bash
git clone <url-del-repositorio>
cd prueba
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura las variables de entorno**:
Crea un archivo `.env.local` en la raíz con:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/helpdeskpro?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=tu-secret-key-super-segura

# SMTP para correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret para cron jobs
CRON_SECRET=cron-secret-key
```

4. **Crea los usuarios en la base de datos**:
```bash
npm run init-users
```

Esto creará 4 usuarios en MongoDB:
- **Clientes**: `cliente@test.com` / `cliente123`, `maria@test.com` / `cliente123`
- **Agentes**: `agente@test.com` / `agente123`, `ana@test.com` / `agente123`

5. **Opcional: Crea datos de ejemplo (tickets y comentarios)**:
```bash
npm run seed-data
```

## 🎯 Ejecutar el Proyecto

### Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

## 📖 Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── tickets/       # CRUD de tickets
│   │   ├── comments/      # Comentarios
│   │   └── cron/          # Cron jobs
│   ├── dashboard/         # Paneles de usuario
│   │   ├── client/        # Panel cliente
│   │   └── agent/         # Panel agente
│   ├── login/             # Página de login
│   └── tickets/           # Detalle de tickets
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables
│   └── ProtectedRoute.tsx # Protección de rutas
├── contexts/              # Context API
│   └── AuthContext.tsx    # Context de autenticación
├── lib/                   # Utilidades
│   ├── mongodb.ts         # Conexión MongoDB
│   ├── auth.ts            # Utilidades JWT
│   └── email.ts           # Servicio de correo
├── models/                # Modelos Mongoose
│   ├── User.ts
│   ├── Ticket.ts
│   └── Comment.ts
├── services/              # Servicios Axios
│   ├── api.ts
│   ├── ticketService.ts
│   └── commentService.ts
└── scripts/               # Scripts de utilidad
    ├── initUsers.ts       # Inicializar usuarios
    └── seedData.ts        # Datos de ejemplo
```

## 🎮 Funcionalidades

### Para Clientes
- Crear nuevos tickets
- Ver sus propios tickets
- Agregar comentarios a sus tickets
- Recibir notificaciones por correo

### Para Agentes
- Ver todos los tickets
- Filtrar tickets por estado y prioridad
- Asignar tickets
- Cambiar estado de tickets
- Responder tickets con comentarios
- Cerrar tickets
- Recibir recordatorios de tickets sin respuesta

## 📧 Notificaciones por Correo

El sistema envía correos automáticamente cuando:
- Se crea un ticket (al cliente)
- Un agente responde un ticket (al cliente)
- Un ticket se cierra (al cliente)

## ⏰ Cron Jobs

El sistema incluye un cron job que se ejecuta diariamente para:
- Detectar tickets sin respuesta por más de 24 horas
- Enviar recordatorios a los agentes asignados

Para ejecutar manualmente:
```bash
curl -H "Authorization: Bearer cron-secret-key" http://localhost:3000/api/cron/reminders
```

## ✅ Criterios de Aceptación Cumplidos

### 4.1) Gestión de Tickets ✅
- Se puede registrar un ticket con todos los datos obligatorios
- Se puede editar el estado, prioridad y agente asignado del ticket desde el panel de agente
- Se puede cerrar un ticket marcándolo como closed
- Se pueden listar y filtrar tickets por usuario, estado y/o prioridad

### 4.2) Gestión de Usuarios, Roles y Autenticación ✅
- Existe un login funcional
- La app redirecciona correctamente según el rol (client o agent)
- Las rutas están protegidas según el rol
- El estado de sesión se maneja con Context API

### 4.3) Comentarios y UI Reutilizable ✅
- Cada ticket tiene un hilo de comentarios visible en su detalle
- Tanto clientes como agentes pueden agregar comentarios
- Las Cards de tickets se muestran con Badge(s) y Button(s)
- Las props de componentes reutilizables están tipadas

### 4.4) API, Servicios y Dashboard ✅
- La API responde correctamente a las operaciones (GET/POST/PUT/DELETE)
- Los servicios Axios consumen la API
- El Dashboard permite listar, crear, editar y responder tickets
- La app ejecuta sin errores con npm run dev

### 4.5) Notificaciones por Correo ✅
- Al crear un ticket, se genera el envío de un correo al cliente
- Cuando el agente responde un ticket, se dispara el envío de correo al cliente
- Al cerrar un ticket, se envía correo de cierre al cliente

### 4.6) Manejo de Errores y Validaciones ✅
- Errores se muestran con mensajes claros al usuario
- Las validaciones de negocio se respetan
- La aplicación no se rompe ante errores de red o de API

## 👤 Datos del Coder

- **Nombre**: [Tu Nombre]
- **Clan**: [Tu Clan]
- **Correo**: [Tu Correo]
- **Documento**: [Tu Documento]

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run init-users` - Crea usuarios en la base de datos
- `npm run seed-data` - Crea usuarios, tickets y comentarios de ejemplo

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que MongoDB esté ejecutándose
- Revisa la URI en `.env.local`

### Error al enviar correos
- Verifica las credenciales SMTP
- Para Gmail, usa una "Contraseña de aplicación"
- Revisa que el puerto SMTP sea correcto

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado
- Limpia el localStorage del navegador
- Ejecuta `npm run init-users` para crear usuarios

## 📝 Notas Importantes

- Las contraseñas se hashean con bcrypt antes de guardarse
- Los tokens JWT expiran en 7 días
- Los correos solo se envían si SMTP está configurado correctamente
- El cron job requiere que la aplicación esté ejecutándose
- Los usuarios se crean directamente en MongoDB, no desde la aplicación

## 📄 Licencia

Este proyecto es una prueba técnica.

