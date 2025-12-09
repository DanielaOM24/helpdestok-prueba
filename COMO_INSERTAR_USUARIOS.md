# 📝 Cómo Insertar Usuarios en MongoDB

## 📋 Usuarios Listos para Insertar

El archivo `usuarios.json` contiene 4 usuarios listos para insertar en MongoDB.

### 👤 Usuarios:

1. **Juan Pérez** (Cliente)
   - Email: `cliente@test.com`
   - Contraseña: `cliente123`

2. **María García** (Cliente)
   - Email: `maria@test.com`
   - Contraseña: `cliente123`

3. **Carlos Rodríguez** (Agente)
   - Email: `agente@test.com`
   - Contraseña: `agente123`

4. **Ana Martínez** (Agente)
   - Email: `ana@test.com`
   - Contraseña: `agente123`

## 🚀 Método 1: MongoDB Compass (Más Fácil)

1. **Abre MongoDB Compass**
2. **Conéctate a tu base de datos** (la que tienes en `MONGODB_URI`)
3. **Selecciona la base de datos** `helpdeskpro` (o créala si no existe)
4. **Crea la colección** `users` (si no existe)
5. **Click en "ADD DATA" → "Insert Document"**
6. **Copia y pega cada usuario del archivo `usuarios.json`**:

```json
{
  "name": "Juan Pérez",
  "email": "cliente@test.com",
  "password": "$2b$10$XSaWZz1/3MHXShTW1rrE3.NPlMZQ4Zh7HotowY7fJsERFg9KPuFY6",
  "role": "client"
}
```

7. **Repite para los 4 usuarios**

## 🚀 Método 2: MongoDB Shell (mongosh)

1. **Abre la terminal**
2. **Conéctate a MongoDB**:
   ```bash
   mongosh "mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/helpdeskpro"
   ```
   (Reemplaza con tu connection string)

3. **Inserta los usuarios**:
   ```javascript
   use helpdeskpro

   db.users.insertMany([
     {
       "name": "Juan Pérez",
       "email": "cliente@test.com",
       "password": "$2b$10$XSaWZz1/3MHXShTW1rrE3.NPlMZQ4Zh7HotowY7fJsERFg9KPuFY6",
       "role": "client"
     },
     {
       "name": "María García",
       "email": "maria@test.com",
       "password": "$2b$10$XSaWZz1/3MHXShTW1rrE3.NPlMZQ4Zh7HotowY7fJsERFg9KPuFY6",
       "role": "client"
     },
     {
       "name": "Carlos Rodríguez",
       "email": "agente@test.com",
       "password": "$2b$10$P74GqqSH.Xiw4GAUZMFq7eswDglaDxVKb6/yVm3mH1ftxazGbWSHu",
       "role": "agent"
     },
     {
       "name": "Ana Martínez",
       "email": "ana@test.com",
       "password": "$2b$10$P74GqqSH.Xiw4GAUZMFq7eswDglaDxVKb6/yVm3mH1ftxazGbWSHu",
       "role": "agent"
     }
   ])
   ```

## 🚀 Método 3: Importar desde Archivo JSON

1. **Abre la terminal**
2. **Usa mongoimport**:
   ```bash
   mongoimport --uri="mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/helpdeskpro" \
     --collection=users \
     --file=usuarios.json \
     --jsonArray
   ```

## ✅ Verificar que se Insertaron

En MongoDB Compass o mongosh:

```javascript
db.users.find().pretty()
```

Deberías ver los 4 usuarios.

## 🎯 Después de Insertar

1. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

2. **Abre el navegador**: `http://localhost:3000`

3. **Inicia sesión con**:
   - Cliente: `cliente@test.com` / `cliente123`
   - Agente: `agente@test.com` / `agente123`

## 📝 Nota Importante

- Las contraseñas están hasheadas con bcrypt
- Los usuarios deben tener exactamente estos campos: `name`, `email`, `password`, `role`
- El campo `role` debe ser `"client"` o `"agent"`
- MongoDB creará automáticamente `_id`, `createdAt` y `updatedAt` si usas timestamps

