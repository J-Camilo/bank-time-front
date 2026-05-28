# BOTIme — Frontend

Interfaz web de la plataforma de intercambio de servicios comunitarios **Banco de Tiempo**. Los usuarios publican habilidades, solicitan servicios de otros y pagan con créditos de tiempo en lugar de dinero.

---

## Stack

| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | Framework UI |
| Vite 7 | Bundler y dev server |
| Tailwind CSS 3 | Estilos utilitarios |
| React Router v6 | Enrutamiento SPA |
| Redux Toolkit | Estado global (sesión de usuario) |
| Axios | Cliente HTTP con interceptores JWT |
| Framer Motion | Animaciones |
| Recharts | Gráficas de créditos |
| Day.js | Manejo de fechas |
| Ant Design Icons + Lucide | Íconos |

---

## Estructura del proyecto

```
src/
├── App.tsx                    # Rutas, guards de autenticación y layout principal
├── main.tsx                   # Entry point — monta React + Redux Provider
├── index.css                  # Variables CSS globales y clases utilitarias propias
│
├── pages/                     # Una página por ruta
│   ├── Login.tsx              # Autenticación
│   ├── Register.tsx           # Registro con selección de departamento/ciudad
│   ├── Dashboard.tsx          # Resumen de créditos y actividad reciente
│   ├── Inicio.tsx             # Feed de publicaciones con filtros y búsqueda
│   ├── Intercambios.tsx       # Vista de calendario de intercambios propios
│   ├── SolicitudesEnviadas.tsx
│   ├── SolicitudesRecibidas.tsx
│   ├── Historial.tsx          # Movimientos de créditos con gráfica
│   ├── Perfil.tsx             # Perfil propio con valoraciones recibidas
│   └── Admin.tsx              # Panel de administración (solo admins)
│
├── components/
│   ├── Modals/
│   │   ├── ConfirmarModal.tsx     # Confirmar participación en intercambio / ver valoraciones
│   │   ├── CancelacionModal.tsx   # Cancelar intercambio con advertencia de penalización
│   │   ├── ValoracionModal.tsx    # Calificar intercambio completado (1–5 estrellas)
│   │   ├── SolicitudModal.tsx     # Enviar solicitud a una publicación
│   │   └── PublicacionFormModal.tsx # Crear / editar publicación propia
│   ├── PublicacionCard/           # Card de publicación reutilizable
│   └── ui/
│       ├── Modal.tsx              # Wrapper de modal con backdrop
│       ├── Select.tsx             # Dropdown personalizado con búsqueda opcional
│       └── Toast.tsx              # Notificaciones temporales (éxito / error)
│
├── services/                  # Una función por módulo de API
│   ├── auth.ts
│   ├── usuarios.ts
│   ├── publicaciones.ts
│   ├── solicitudes.ts
│   ├── intercambios.ts
│   ├── valoraciones.ts
│   ├── notificaciones.ts
│   ├── categorias.ts
│   └── admin.ts
│
├── store/                     # Redux Toolkit
│   ├── index.ts               # configureStore
│   └── slices/authSlice.ts    # Estado del usuario autenticado
│
├── config/
│   └── axiosGlobal.ts         # Instancia de Axios con interceptores de token
│
└── ui/                        # Componentes de layout global
    ├── Nav.tsx                # Barra de navegación lateral
    └── TopBar.tsx             # Barra superior con notificaciones (polling 30s)
```

---

## Rutas de la aplicación

| Ruta | Componente | Requiere auth |
|---|---|---|
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Sí |
| `/inicio` | Inicio | Sí |
| `/intercambios` | Intercambios | Sí |
| `/solicitudes/enviadas` | SolicitudesEnviadas | Sí |
| `/solicitudes/mis` | SolicitudesRecibidas | Sí |
| `/historial` | Historial | Sí |
| `/perfil` | Perfil | Sí |
| `/admin` | Admin | Sí + es_admin |

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://bank-time-ten.vercel.app/api/v1
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `https://bank-time-ten.vercel.app/api/v1` |

> **Nota:** Las variables `VITE_*` se embeben en el bundle en tiempo de build. Cambiarlas requiere reconstruir la imagen.

---

## Instalación y desarrollo

**Requisitos:** Node.js 20+

```bash
npm install
cp .env.example .env      # ajustar VITE_API_URL si es necesario
npm run dev               # dev server en http://localhost:5173
```

### Otros comandos

```bash
npm run build     # compilar TypeScript + generar dist/
npm run preview   # previsualizar el build de producción localmente
```

---

## Autenticación

La sesión se maneja con dos tokens JWT:

- **`accessToken`** (15 min) — se envía en cada request como `Authorization: Bearer <token>`
- **`refreshToken`** (7 días) — se usa para renovar el access token automáticamente

El interceptor en `src/config/axiosGlobal.ts` maneja la renovación transparente. Si el refresh también falla, cierra sesión y redirige a `/login`.

Los tokens se almacenan en `localStorage`. El estado del usuario se hidrata desde Redux Toolkit al cargar la app.

---

## Flujo de créditos

Cada usuario recibe **8 créditos** al registrarse.

- **Prestar un servicio** → gana créditos (`GANANCIA`)
- **Recibir un servicio** → pierde créditos (`CONSUMO`)
- **Cancelar tarde** (menos de 3 días antes) → penalización (`PENALIZACION`)

El historial de movimientos se consulta en `/historial` con gráfica de los últimos 15 días.

---

## Deploy con Docker

```bash
# Desde esta carpeta
docker compose up --build
```

El frontend queda disponible en `http://localhost` (puerto 80) servido por nginx.

La imagen se llama `botime-frontend` y usa un build multi-stage: Node 20 compila el proyecto con Vite, nginx sirve el `dist/` estático en la imagen final.

La URL de la API está embebida en el bundle en tiempo de build (`VITE_API_URL`). Para cambiarla editar `args.VITE_API_URL` en el [`docker-compose.yml`](./docker-compose.yml) antes de correr el build.
