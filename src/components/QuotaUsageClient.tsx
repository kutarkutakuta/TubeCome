"use client";

import React, { useEffect, useState } from 'react';

export default function QuotaUsageClient() {
  const [quotaInfo, setQuotaInfo] = useState<{ total?: number; warnThreshold?: number; errorThreshold?: number; clientIp?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/quota-usage');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setQuotaInfo(json);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="text-sm text-[var(--fg-secondary)]">
      {quotaInfo ? (
        <div>
          <div>
            API使用量: {quotaInfo.total ?? 0} / 
            警告閾値: {quotaInfo.warnThreshold ?? '-'} / エラー閾値: {quotaInfo.errorThreshold ?? '-'}
          </div>
        </div>
      ) : (
        <div>API使用量: 読み込み中…</div>
      )}
    </div>
  );
}
