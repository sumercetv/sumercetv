// Configuración central de datos del negocio que NO se editan desde /admin.
// Los canales comerciales (WhatsApp, correo y teléfono comercial) siguen en /admin → Configuración.
// Regla: nunca inventar datos. Un campo vacío simplemente no se muestra al público.

export const SITE = {
  name: 'SUMERCÉ TV',
  city: 'Chiquinquirá',
  region: 'Boyacá',
  country: 'CO',

  // Responsable del tratamiento de datos (Ley 1581 de 2012). PENDIENTE: completar con datos reales.
  responsible: {
    legalName: '', // Razón social exacta, p. ej. "Nombre S.A.S."
    nit: '', // NIT con dígito de verificación
    address: '', // Dirección física de notificaciones
    email: '', // Correo para consultas y reclamos de datos personales
    phone: '', // Teléfono de atención de datos personales
  },

  // Aviso de privacidad: cambia la versión cada vez que cambie el contenido de /privacidad.
  // La versión se guarda con cada lead como prueba del texto que aceptó el titular.
  privacy: {
    version: '1.0',
    effectiveDate: '2026-11-27', // AAAA-MM-DD, fecha desde la que rige esta versión
  },
} as const;

export type ResponsibleField = keyof typeof SITE.responsible;

// Datos mínimos que exige el aviso de privacidad para identificar al responsable.
export function missingResponsibleData(): ResponsibleField[] {
  return (Object.keys(SITE.responsible) as ResponsibleField[]).filter(key => !SITE.responsible[key].trim());
}

export const privacyComplete = () => missingResponsibleData().length === 0;
