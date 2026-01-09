'use client';

import { useEffect } from 'react';

export default function CaptureVideoListClient({ list, channelId }: { list: Array<{ id: string; title?: string }>; channelId?: string }) {
  useEffect(() => {
    try {
      const payload = { list, channelId, ts: Date.now() };
      sessionStorage.setItem('tubecome:video-list', JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [list, channelId]);

  return null;
}
