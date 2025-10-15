export type DeliveryStatus = "pendiente" | "entregado" | "incidencia";

export interface Shipment {
  id: string;
  residente: string;
  departamento: string;
  transportista: string;
  fechaRecepcion: string;
  horaRecepcion: string;
  estado: DeliveryStatus;
  codigoSeguimiento: string;
}

export interface NotificationItem {
  id: string;
  residente: string;
  departamento: string;
  mensaje: string;
  enviadaEl: string;
  canal: "correo" | "app" | "sms";
  entregada: boolean;
}

export const shipments: Shipment[] = [
  {
    id: "ENV-001",
    residente: "Ana Rodríguez",
    departamento: "Torre A · 1205",
    transportista: "Chilexpress",
    fechaRecepcion: "07 mar 2025",
    horaRecepcion: "09:15",
    estado: "pendiente",
    codigoSeguimiento: "CHX998234",
  },
  {
    id: "ENV-002",
    residente: "Carlos Martínez",
    departamento: "Torre C · 705",
    transportista: "Starken",
    fechaRecepcion: "07 mar 2025",
    horaRecepcion: "10:42",
    estado: "pendiente",
    codigoSeguimiento: "STK551240",
  },
  {
    id: "ENV-003",
    residente: "Paula Ortiz",
    departamento: "Torre B · 304",
    transportista: "Amazon Logistics",
    fechaRecepcion: "06 mar 2025",
    horaRecepcion: "18:20",
    estado: "entregado",
    codigoSeguimiento: "AMZ442819",
  },
  {
    id: "ENV-004",
    residente: "José Navarro",
    departamento: "Torre A · 809",
    transportista: "Correos de Chile",
    fechaRecepcion: "05 mar 2025",
    horaRecepcion: "14:32",
    estado: "incidencia",
    codigoSeguimiento: "CDC772391",
  },
  {
    id: "ENV-005",
    residente: "Gabriela Henríquez",
    departamento: "Torre D · 1602",
    transportista: "MercadoEnvíos",
    fechaRecepcion: "07 mar 2025",
    horaRecepcion: "11:05",
    estado: "pendiente",
    codigoSeguimiento: "MEL889231",
  },
  {
    id: "ENV-006",
    residente: "Ignacio Fuentes",
    departamento: "Torre B · 1001",
    transportista: "FedEx",
    fechaRecepcion: "06 mar 2025",
    horaRecepcion: "17:10",
    estado: "entregado",
    codigoSeguimiento: "FDX882313",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "NOT-091",
    residente: "Ana Rodríguez",
    departamento: "Torre A · 1205",
    mensaje: "Tu encomienda de Chilexpress ya está en conserjería.",
    enviadaEl: "07 mar · 09:16",
    canal: "app",
    entregada: true,
  },
  {
    id: "NOT-092",
    residente: "Carlos Martínez",
    departamento: "Torre C · 705",
    mensaje: "Nuevo paquete de Starken en recepción. Revisa tus horarios.",
    enviadaEl: "07 mar · 10:43",
    canal: "correo",
    entregada: true,
  },
  {
    id: "NOT-093",
    residente: "Paula Ortiz",
    departamento: "Torre B · 304",
    mensaje: "Recuerda confirmar la entrega una vez retires tu paquete.",
    enviadaEl: "06 mar · 18:21",
    canal: "app",
    entregada: false,
  },
  {
    id: "NOT-094",
    residente: "José Navarro",
    departamento: "Torre A · 809",
    mensaje: "Hubo una incidencia con tu paquete. Contacta conserjería.",
    enviadaEl: "05 mar · 14:35",
    canal: "sms",
    entregada: true,
  },
];

export const dashboardStats = [
  {
    label: "Encomiendas recibidas (24h)",
    value: 28,
    delta: "+12%",
    caption: "vs. semana pasada",
  },
  {
    label: "Tiempo promedio de retiro",
    value: "3h 20m",
    delta: "-18%",
    caption: "Optimizado con recordatorios",
  },
  {
    label: "Incidencias activas",
    value: 2,
    delta: "0",
    caption: "En seguimiento",
  },
];

export const weeklyTrend = [
  { day: "Lun", entregadas: 18, pendientes: 9 },
  { day: "Mar", entregadas: 22, pendientes: 5 },
  { day: "Mié", entregadas: 25, pendientes: 6 },
  { day: "Jue", entregadas: 21, pendientes: 8 },
  { day: "Vie", entregadas: 30, pendientes: 7 },
  { day: "Sáb", entregadas: 17, pendientes: 4 },
  { day: "Dom", entregadas: 12, pendientes: 3 },
];

export const towersDistribution = [
  { tower: "Torre A", activos: 12 },
  { tower: "Torre B", activos: 9 },
  { tower: "Torre C", activos: 7 },
  { tower: "Torre D", activos: 5 },
];
