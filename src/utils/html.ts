// Simple HTML entity decoder for common named and numeric entities.
// This decoder will apply replacements iteratively to handle cases where
// input may be encoded multiple times (e.g. &amp;amp; -> &amp; -> &).
export function decodeHtml(input: string | undefined): string {
  if (!input) return '';

  function singleDecode(s: string) {
    // Fast common replacements
    const common = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
    // Decode numeric entities (decimal & hex)
    return common.replace(/&#(x?[0-9A-Fa-f]+);/g, (_m, code) => {
      let n = 0;
      if (code.startsWith('x') || code.startsWith('X')) {
        n = parseInt(code.slice(1), 16);
      } else {
        n = parseInt(code, 10);
      }
      if (Number.isNaN(n)) return '';
      try {
        return String.fromCodePoint(n);
      } catch (e) {
        return '';
      }
    });
  }

  // Iterate until stable or until max iterations to avoid infinite loops
  let prev = input;
  for (let i = 0; i < 5; i++) {
    const next = singleDecode(prev);
    if (next === prev) return next;
    prev = next;
  }
  return prev;
}
