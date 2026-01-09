"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type Props = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export default function ZoomableThumbnail({ src, alt = '', width = 240, height = 135, containerClassName }: Props & { containerClassName?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className={containerClassName ?? "h-20 win-outset overflow-hidden rounded-sm bg-[var(--bg-panel)]"}>
        <div
          className="w-full h-full relative transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer"
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
        >
          <Image src={src} alt={alt} fill sizes={`${width}px`} className="object-cover" />
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={src}
              alt={alt}
              width={Math.min(1280, width * 3)}
              height={Math.min(720, height * 3)}
              className="object-contain rounded-sm"
            />
          </div>
        </div>
      )}
    </>
  );
}
