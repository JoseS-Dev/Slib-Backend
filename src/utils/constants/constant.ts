// Record para los estados de las copias físicas de los libros
export const RecordPhysicalCopyStatus: Record<string, string[]> = {
  Disponible: ['Prestado', 'Extraviado', 'Dañado'],
  Prestado: ['Extraviado', 'Dañado', 'Disponible'],
  Extraviado: ['Disponible'],
  Dañado: ['Mantenimiento', 'Disponible'],
  Mantenimiento: ['Disponible', 'Dañado'],
};

// Record para los estados de las solicitudes de libros
export const RecordRequestStatus: Record<string, string[]> = {
  Pendiente: ['Aprobada', 'Rechazada'],
  Aprobada: ['Cancelada'],
  Rechazada: [],
  Cancelada: [],
};

// Record para los estados de los préstamos de libros
export const RecordLoanStatus: Record<string, string[]> = {
  Activo: ['Finalizado', 'Vencido'],
  Finalizado: [],
  Vencido: ['Finalizado'],
};
