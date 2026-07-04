# Backend de Sanmarkiosko 🎓🛒 API

Este es el backend del proyecto **Sanmarkiosko**, un mercado estudiantil diseñado para la comunidad de la Universidad Nacional Mayor de San Marcos (UNMSM).
El backend está construido con **Express.js**, **TypeScript** y utiliza una base de datos **PostgreSQL** alojada en **Supabase**.

---

## 🛠️ Requisitos previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Cuenta en [Supabase](https://supabase.com/) con un proyecto de base de datos creado.

---

## 🚀 Instalar y Correr el Servidor Localmente

Sigue estos pasos para poner en marcha el backend en tu entorno de desarrollo local.

### 1. Instalar dependencias
Desde la carpeta raíz del backend (`backend-sanmarkiosko`), ejecuta:
```bash
npm install
```

### 2. Configurar base de datos en Supabase
1. Dirígete a tu panel de **Supabase**.
2. Entra en la sección de **SQL Editor** (menú izquierdo).
3. Haz clic en **New query** (Nueva consulta).
4. Copia el contenido completo del archivo [database.sql](file:///C:/Users/Mihae/programacion/activos/sanmarkiosko/backend-sanmarkiosko/database.sql) de este proyecto y pégalo en el editor.
5. Presiona el botón **Run** (Ejecutar) para crear las tablas, índices, restricciones y triggers necesarios.

### 3. Configurar variables de entorno
Crea un archivo llamado `.env` en la raíz de `backend-sanmarkiosko` (copiando el contenido de `.env.example`):
```bash
cp .env.example .env
```
Abre el archivo `.env` y define las siguientes variables:
- **`DATABASE_URL`**: Tu URI de conexión directa de Supabase PostgreSQL (Proyecto -> Settings -> Database -> Connection string -> URI). Asegúrate de reemplazar `[YOUR-PASSWORD]` por la contraseña real de tu base de datos de Supabase.
- **`JWT_SECRET`**: Una palabra clave o frase larga aleatoria para firmar las sesiones de usuario.
- **`PORT`**: Puerto en el que correrá el API (por defecto: `5000`).

### 4. Sembrar datos de prueba (Seeding)
Puedes poblar tu base de datos con los usuarios, anuncios de prueba y transacciones iniciales (los mismos que venían en `data.ts` en el prototipo del frontend) ejecutando:
```bash
npm run seed
```
> **Nota de Prueba:** Al sembrar los datos, podrás iniciar sesión inmediatamente en la plataforma usando:
> - **Correo:** `juan@unmsm.edu.pe`
> - **Contraseña:** `password123`

### 5. Ejecutar en modo desarrollo
Inicia el servidor de Express.js con recarga en caliente (hot reload):
```bash
npm run dev
```
El servidor backend se ejecutará en [http://localhost:5000](http://localhost:5000).  
Puedes probar la ruta de salud base en `http://localhost:5000/api/health`.

---

## 📁 Estructura del Proyecto

El backend implementa una arquitectura limpia y modular dividida por responsabilidades:

- `database.sql`: Script de creación y estructura de base de datos PostgreSQL.
- `src/`
  - `index.ts`: Punto de entrada del servidor, valida la conexión de la BD y levanta el puerto HTTP.
  - `app.ts`: Inicializa Express, monta middlewares globales (CORS, parser JSON) y rutas principales.
  - `config/`: Configuración del entorno (`environment.ts`) y del pool de conexión PostgreSQL (`db.ts`).
  - `middleware/`: Middlewares para autenticación por JWT (`auth.middleware.ts`) y control de errores unificado (`error.middleware.ts`).
  - `controllers/`: Lógica de negocio (controladores) de Autenticación, Anuncios, Perfiles, Favoritos y Actividad.
  - `routes/`: Enrutamiento HTTP que mapea los endpoints a sus respectivos controladores y middlewares.
  - `seeds/`: Script `seed.ts` para rellenar la base de datos con datos de prueba iniciales.

---

## 📡 Endpoints del API

Todas las llamadas al API deben hacerse con el prefijo `/api` (ej: `http://localhost:5000/api/listings`).
Los endpoints que requieren autenticación necesitan una cabecera HTTP:
`Authorization: Bearer <TOKEN_JWT_RECIBIDO_EN_LOGIN_O_REGISTRO>`

### 🔑 1. Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Cuerpo de Petición (Body JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Registra a un estudiante. | `{ name, email, password, faculty?, career?, year?, bio? }` |
| **POST** | `/login` | Inicia sesión y devuelve un token JWT. | `{ email, password }` |
| **GET** | `/me` 🔒 | Obtiene la información del usuario autenticado actual. | *(Ninguno, requiere header Authorization)* |

### 🛒 2. Anuncios (`/api/listings`)
| Método | Ruta | Descripción | Parámetros Query / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Lista anuncios activos (boosted primero). | Queries opcionales: `q` (búsqueda), `category`, `sellerId` |
| **GET** | `/:id` | Muestra el detalle de un anuncio específico con datos del vendedor. | *(Ninguno)* |
| **POST** | `/` 🔒 | Crea un nuevo anuncio de venta o servicio. | `{ title, description, price, category, imageUrl? }` |
| **PUT** | `/:id` 🔒 | Actualiza un anuncio propio (título, precio, estado, etc.). | `{ title?, description?, price?, category?, imageUrl?, status? }` |
| **DELETE**| `/:id` 🔒 | Elimina un anuncio de forma permanente. | *(Propietario del anuncio)* |
| **POST** | `/:id/boost` 🔒| Destaca un anuncio propio en la cima de búsquedas. | *(Propietario del anuncio)* |

### 👤 3. Perfiles de Estudiantes (`/api/users`)
| Método | Ruta | Descripción | Body JSON |
| :--- | :--- | :--- | :--- |
| **GET** | `/stats` 🔒 | Obtiene métricas del panel (anuncios activos, promedio calificación, total ventas). | *(Ninguno)* |
| **GET** | `/:id` | Perfil público de un estudiante con sus datos e historial de anuncios activos. | *(Ninguno)* |
| **PUT** | `/profile` 🔒| Permite editar la información de perfil propia. | `{ name?, faculty?, career?, year?, bio?, avatarUrl? }` |

### 📈 4. Actividad (`/api/activity`)
| Método | Ruta | Descripción | Body JSON |
| :--- | :--- | :--- | :--- |
| **GET** | `/sales` 🔒 | Obtiene todos los anuncios publicados por mí (historial de ventas). | *(Ninguno)* |
| **GET** | `/purchases` 🔒| Obtiene mi historial de compras de comedor, artículos, etc. | *(Ninguno)* |
| **POST** | `/buy` 🔒 | Simula compra/reserva de un anuncio (crea transacción y marca anuncio 'Vendido'). | `{ listingId }` |

### ❤️ 5. Favoritos (`/api/favorites`)
| Método | Ruta | Descripción | Body JSON |
| :--- | :--- | :--- | :--- |
| **GET** | `/` 🔒 | Lista los anuncios que el usuario ha guardado. | *(Ninguno)* |
| **POST** | `/toggle` 🔒| Agrega o elimina un anuncio de la lista de guardados. | `{ listingId }` |
