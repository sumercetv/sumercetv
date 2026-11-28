// Celular colombiano: 10 dígitos que empiezan por 3. Acepta espacios, guiones, paréntesis
// y prefijo +57 / 57. Devuelve el formato normalizado +57XXXXXXXXXX o null si no es válido.
export function normalizeColombianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  return /^3\d{9}$/.test(digits) ? `+57${digits}` : null;
}
export const PHONE_ERROR = 'Escribe un celular colombiano de 10 dígitos que empiece por 3.';
