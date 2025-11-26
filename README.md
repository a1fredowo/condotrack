# 📦 CondoTrack

**Sistema de Gestión de Encomiendas para Condominios**

🌐 **Demo en vivo:** [https://condotrack.vercel.app](https://condotrack.vercel.app)

---

## 📋 Descripción

CondoTrack es una aplicación web moderna diseñada para optimizar la gestión de encomiendas en edificios y condominios. El sistema permite a los conserjes registrar paquetes de manera eficiente, notificar automáticamente a los residentes y validar retiros mediante códigos QR únicos.

La plataforma cuenta con un sistema de roles que diferencia las funcionalidades disponibles para administradores, conserjes y residentes, garantizando una experiencia personalizada y segura para cada tipo de usuario.

---

## 🚀 Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Estilos** | Tailwind CSS 4 |
| **Base de datos** | PostgreSQL (Supabase) |
| **Autenticación** | JWT + bcrypt |
| **QR** | qrcode + html5-qrcode |
| **Notificaciones** | Resend (Email) |
| **Deploy** | Vercel |

---

## 👥 Funcionalidades por Rol

### 🔐 Administrador

| Funcionalidad | Descripción |
|---------------|-------------|
| **Gestión de usuarios** | Crear, editar y eliminar usuarios del sistema |
| **Panel de encomiendas** | Visualizar todas las encomiendas del condominio |
| **Estadísticas generales** | Métricas de entregas, tiempos promedio y tendencias |
| **Centro de notificaciones** | Enviar avisos masivos o individuales a residentes |
| **Scanner QR** | Validar códigos QR para confirmar retiros |

### 🛎️ Conserje

| Funcionalidad | Descripción |
|---------------|-------------|
| **Registrar encomiendas** | Ingresar paquetes seleccionando residentes registrados o nuevos destinatarios |
| **Filtros avanzados** | Buscar por departamento, transportista, estado o fecha |
| **Notificar residentes** | Enviar correos personalizados avisando que su encomienda está lista |
| **Scanner QR** | Escanear códigos QR para marcar encomiendas como entregadas |
| **Exportar datos** | Descargar historial de encomiendas en formato CSV |
| **Gestión de incidencias** | Reportar y dar seguimiento a paquetes con problemas |

### 🏠 Residente

| Funcionalidad | Descripción |
|---------------|-------------|
| **Mis encomiendas** | Ver historial de paquetes recibidos (pendientes y retirados) |
| **Generar código QR** | Crear QR temporal (válido por 30 minutos) para retiro seguro |
| **Notificaciones** | Recibir avisos por email cuando llega una encomienda |
| **Estado en tiempo real** | Consultar el estado actual de cada paquete |

---

## 🎯 Características Destacadas

- ✅ **Registro inteligente**: Autocompletado de datos al seleccionar residentes registrados
- ✅ **QR temporal**: Códigos con expiración de 30 minutos para mayor seguridad
- ✅ **Notificaciones por email**: Correos personalizados con detalles de la encomienda
- ✅ **Responsive**: Diseño adaptable a dispositivos móviles y desktop
- ✅ **Modo oscuro**: Interfaz con tema oscuro moderno
- ✅ **Filtros en tiempo real**: Búsqueda instantánea sin recargar la página
- ✅ **Exportación CSV**: Descarga de datos para reportes externos

---

## 📸 Vista Previa

La aplicación cuenta con:

- **Panel del conserje** con registro rápido de encomiendas
- **Dashboard de estadísticas** con métricas visuales
- **Centro de notificaciones** para comunicación con residentes
- **Scanner QR** integrado para validación de retiros
- **Vista de mis encomiendas** para residentes

---

## 👨‍💻 Autor

**Alfredo Hernández**

- GitHub: [@a1fredowo](https://github.com/a1fredowo)
- Proyecto: [condotrack](https://github.com/a1fredowo/condotrack)

---

## 📄 Licencia

Este proyecto fue desarrollado como demostración de capacidades técnicas en desarrollo web full-stack.

---

<p align="center">
  <strong>🏢 CondoTrack</strong> - Gestión de encomiendas simplificada
</p>
