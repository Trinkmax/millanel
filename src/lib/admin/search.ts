/* Búsqueda segura para los filtros `.or()` de PostgREST.

   Problema: si interpolás el término crudo en `name.ilike.%${q}%`, una coma
   o un paréntesis en el texto (ej. "García, Ana" o "Acqua) di Gio") rompe la
   gramática del .or() de PostgREST → 400 → la búsqueda "no encuentra nada".
   Solución: envolver el valor entre comillas dobles (ahí la coma y los
   paréntesis son literales) y escapar backslash y comillas. */

export function ilikePattern(term: string): string {
  const escaped = term.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

/** Máximo de un integer de Postgres (int4). Sirve para no mandar a
 *  `fragrance_number.eq` un número que desborde y dispare un 400. */
export const PG_INT4_MAX = 2147483647;
