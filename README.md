# CondoTrack - Sistema de Gestión de EncomiendasThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Sistema moderno para la gestión de encomiendas en condominios, construido con Next.js 15, Supabase y PostgreSQL.## Getting Started



## 🚀 TecnologíasFirst, run the development server:



- **Frontend**: Next.js 15 (App Router), React 19, TypeScript```bash

- **Backend**: Supabase (PostgreSQL)npm run dev

- **ORM**: Prisma# or

- **Estilos**: Tailwind CSS 4yarn dev

- **Validación**: ESLint# or

pnpm dev

## 📋 Prerrequisitos# or

bun dev

- Node.js 20+ ```

- npm o pnpm

- Cuenta de Supabase (gratuita en [supabase.com](https://supabase.com))Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## ⚙️ Configuración del ProyectoYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



### 1. Clonar el repositorioThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



```bash## Learn More

git clone https://github.com/a1fredowo/condotrack.git

cd condotrackTo learn more about Next.js, take a look at the following resources:

```

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

### 2. Instalar dependencias- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



```bashYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

npm install

```## Deploy on Vercel



### 3. Configurar SupabaseThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



1. Crea un nuevo proyecto en [Supabase](https://supabase.com/dashboard)Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

2. Ve a **Settings** > **API** y copia:
   - Project URL
   - anon/public key
3. Ve a **Settings** > **Database** y copia el Connection String (URI)

### 4. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env.local
```

Edita `.env.local` y completa con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
DATABASE_URL=postgresql://postgres:tu-password@db.tu-proyecto.supabase.co:5432/postgres
```

### 5. Ejecutar migraciones de base de datos

```bash
# Genera el cliente de Prisma
npx prisma generate

# Crea las tablas en Supabase
npx prisma db push

# (Opcional) Pobla la base de datos con datos de prueba
npx tsx prisma/seed.ts
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
condotrack/
├── src/
│   ├── app/                    # Páginas y rutas (App Router)
│   │   ├── encomiendas/        # ✅ Migrado a Supabase
│   │   ├── estadisticas/       # TODO: Migrar a Supabase
│   │   ├── notificaciones/     # TODO: Migrar a Supabase
│   │   └── qr/                 # Generación de códigos QR
│   ├── components/             # Componentes reutilizables
│   │   ├── forms/              # Formularios
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # Componentes UI base
│   ├── lib/                    # Utilidades y configuración
│   │   ├── api/                # Funciones de API
│   │   │   ├── encomiendas.ts # CRUD de encomiendas
│   │   │   ├── usuarios.ts    # CRUD de usuarios
│   │   │   └── departamentos.ts # CRUD de departamentos
│   │   ├── supabase.ts         # Cliente de Supabase
│   │   └── utils.ts            # Utilidades generales
│   └── data/                   # ⚠️ Deprecated (usar API)
│       └── mock-data.ts        # Datos mock (reemplazado)
├── prisma/
│   ├── schema.prisma           # Schema de base de datos
│   └── seed.ts                 # Script de seed
└── public/                     # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Construye la aplicación
npm start                # Inicia servidor de producción

# Base de datos
npx prisma studio        # Abre Prisma Studio (GUI para DB)
npx prisma db push       # Sincroniza schema con la DB
npx prisma generate      # Genera cliente de Prisma
npx tsx prisma/seed.ts   # Ejecuta seed de datos

# Calidad de código
npm run lint             # Ejecuta ESLint
```

## 📊 Modelos de Datos

### Departamento
- `id`: ID autoincrementable
- `numero`: Número del departamento (único)
- `torre`: Torre del edificio (A, B, C, D)

### Usuario
- `id`: UUID
- `nombre`: Nombre completo
- `email`: Email único
- `departamentoId`: Referencia a Departamento

### Encomienda
- `id`: UUID
- `codigo`: Código de seguimiento (único)
- `transportista`: Empresa de transporte
- `residenteId`: Referencia a Usuario
- `fechaRecepcion`: Fecha y hora de recepción
- `estado`: pendiente | entregado | incidencia
- `prioridad`: normal | urgente

### Notificacion
- `id`: UUID
- `encomiendaId`: Referencia a Encomienda
- `medio`: correo | app | sms
- `mensaje`: Contenido del mensaje
- `entregada`: Boolean
- `enviadoEn`: Timestamp

## 🎯 Funcionalidades

### ✅ Implementado

- **Panel de Encomiendas**
  - Registro de nuevas encomiendas
  - Filtros por departamento, transportista, estado y fecha
  - Exportación a CSV
  - Vista de incidencias activas
  - Próximos retiros coordinados

### 🚧 En Desarrollo

- **Estadísticas**
  - Migración a datos reales de Supabase
  - Gráficos de tendencias
  - Métricas en tiempo real

- **Notificaciones**
  - Migración a tabla de Notificaciones
  - Integración con servicios de email/SMS
  - Plantillas personalizables

- **Sistema QR**
  - Generación de códigos QR únicos
  - Validación en conserjería

## 🔐 Seguridad

- Las credenciales de Supabase nunca deben subirse a Git
- `.env.local` está en `.gitignore` por defecto
- Usa Row Level Security (RLS) en Supabase para producción

## 🐛 Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
```

### Error de conexión a Supabase

1. Verifica que las variables de entorno estén correctas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Revisa los logs en Supabase Dashboard

### Errores de Prisma

```bash
# Regenera el cliente de Prisma
npx prisma generate

# Resetea la base de datos (⚠️ ELIMINA TODOS LOS DATOS)
npx prisma db push --force-reset
```

## 📝 Próximos Pasos

1. ✅ Migrar módulo de Encomiendas a Supabase
2. 🔄 Migrar módulo de Estadísticas
3. 🔄 Migrar módulo de Notificaciones  
4. 🔜 Implementar autenticación de usuarios
5. 🔜 Agregar Row Level Security (RLS)
6. 🔜 Sistema de generación y validación QR
7. 🔜 Panel de administración
8. 🔜 Deploy a producción

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## 📄 Licencia

Este proyecto es privado y está en desarrollo activo.

## 📧 Contacto

- GitHub: [@a1fredowo](https://github.com/a1fredowo)
- Repositorio: [condotrack](https://github.com/a1fredowo/condotrack)

---

**Nota**: Este proyecto usa Next.js 15 con App Router. Asegúrate de estar familiarizado con las convenciones de App Router si vas a contribuir.
