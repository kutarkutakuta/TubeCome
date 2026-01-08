import React from 'react';

export function linkify(text?: string): React.ReactNode {
  if (!text) return null;

  const regex = /(https?:\/\/[0-9A-Za-z-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[0-9A-Za-z-._~:/?#[\]@!$&'()*+,;=%]+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) {
      nodes.push(text.slice(lastIndex, idx));
    }
    const url = match[0];
    const href = url.startsWith('http') ? url : `https://${url}`;
    nodes.push(React.createElement('a', { key: `link-${key++}`, href, target: '_blank', rel: 'noreferrer', className: 'text-blue-600 underline' }, url));
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  // Replace newlines in string nodes with <br /> elements
  const final: React.ReactNode[] = [];
  nodes.forEach((n, i) => {
    if (typeof n === 'string') {
      const parts = n.split(/\n/);
      parts.forEach((p, j) => {
        if (j > 0) final.push(React.createElement('br', { key: `br-${i}-${j}` }));
        if (p) final.push(p);
      });
    } else {
      final.push(n);
    }
  });

  return React.createElement(React.Fragment, null, ...final);
}
