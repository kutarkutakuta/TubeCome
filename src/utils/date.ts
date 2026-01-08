export function formatJaShortDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const YY = String(d.getFullYear() % 100).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  return `${YY}/${MM}/${DD}`;
}

export function formatJaShortDateTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const YY = String(d.getFullYear() % 100).padStart(2, '0');
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${YY}/${MM}/${DD} ${hh}:${mm}:${ss}`;
}
