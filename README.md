# 📚 Biblioteca Escolar API

API REST para gestión de biblioteca escolar con NestJS, Drizzle ORM y PostgreSQL.

**Prueba práctica EMPRESOFT PERÚ S.A.C.** | Ref: BIB-R10

## 🎯 Características

- ✅ Autenticación JWT
- ✅ Control de roles y permisos
- ✅ CRUD de libros, estudiantes, préstamos y multas
- ✅ Borrado lógico con timestamps
- ✅ Validación de datos con class-validator
- ✅ Documentación Swagger
- ✅ Base de datos PostgreSQL con Drizzle ORM

## 📋 Requisitos

- Node.js v18+
- npm o yarn
- PostgreSQL 12+
- Postman (para pruebas)

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/spitionnsanchez-code/biblioteca-escolar-api.git
cd biblioteca-escolar-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:
```env
APP_BUILD=BIB-R10
PORT=3051
DATABASE_URL=postgresql://user:password@localhost:5432/prueba_biblioteca
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h
NODE_ENV=development
```

4. Generar y ejecutar migraciones:
```bash
npm run migration:generate
npm run migration:push
```

## 🏃 Ejecución

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm run build
npm run prod
```

La API estará disponible en: `http://localhost:3051`

Swagger Docs: `http://localhost:3051/docs`

## 📊 Modelo de Datos

**6 Tablas:**
- `roles` - Catálogo de roles
- `users` - Usuarios del sistema
- `books` - Catálogo de libros
- `students` - Registro de estudiantes
- `loans` - Préstamos de libros
- `fines` - Multas por retraso

## 🔐 Roles disponibles

- `ADMIN` - Acceso total
- `LIBRARIAN` - Gestión de libros y préstamos
- `STUDENT` - Consulta de préstamos propios

## 📝 Endpoints principales

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Libros (CRUD completo)
- `GET /books` - Listar todos
- `GET /books/:id` - Obtener uno
- `POST /books` - Crear
- `PATCH /books/:id` - Actualizar
- `DELETE /books/:id` - Eliminar (lógico)

### Estudiantes (CRUD completo)
- `GET /students` - Listar todos
- `GET /students/:id` - Obtener uno
- `POST /students` - Crear
- `PATCH /students/:id` - Actualizar
- `DELETE /students/:id` - Eliminar (lógico)

### Préstamos (Create + List)
- `GET /loans` - Listar todos
- `POST /loans` - Crear

### Multas (Create + List)
- `GET /fines` - Listar todas
- `POST /fines` - Crear

## 🧪 Testing

```bash
npm test
npm run test:cov
```

## 📚 Documentación

La documentación de la API está disponible en `/docs` (Swagger UI).

## 📦 Estructura del Proyecto

```
src/
├── auth/              # Autenticación JWT
├── roles/             # Gestión de roles
├── users/             # Gestión de usuarios
├── books/             # Gestión de libros
├── students/          # Gestión de estudiantes
├── loans/             # Gestión de préstamos
├── fines/             # Gestión de multas
├── drizzle/
│   ├── schema/        # Schemas de Drizzle
│   ├── migrations/    # Migraciones generadas
│   └── drizzle.service.ts
├── common/            # Guards, decorators, filters
├── app.module.ts      # Módulo principal
└── main.ts            # Entrada de la aplicación
```

## 📄 Licencia

MIT

## 👤 Autor

spitionnsanchez-code

---

**Construido con ❤️ para EMPRESOFT PERÚ S.A.C.**
