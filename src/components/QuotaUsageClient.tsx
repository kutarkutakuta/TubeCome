"use client";

import React, { useEffect, useState } from 'react';

export default function QuotaUsageClient() {
  const [quotaInfo, setQuotaInfo] = useState<{ total?: number; globalTotal?: number; warnThreshold?: number; errorThreshold?: number; globalErrorThreshold?: number; clientIp?: string } | null>(null);

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

  if (!quotaInfo) {
    return (
      <div className="text-sm text-[var(--fg-secondary)]">
        API使用量: 読み込み中…
      </div>
    );
  }

  const renderQuotaBar = (label: string, current: number, max: number) => {
    const percentage = Math.min(100, (current / max) * 100);
    
    let barColor = 'bg-green-500';
    if (current >= max) {
      barColor = 'bg-red-500';
    } else if (current >= max * 0.8) {
      barColor = 'bg-yellow-500';
    }

    return (
      <div className="mb-4">
        <div className="font-bold mb-1">{label}</div>
        <div className="text-xs text-[var(--fg-secondary)] mb-1">
          {current.toLocaleString()} / {max.toLocaleString()}
        </div>
        <div className="h-6 border-2 border-gray-400 bg-gray-100 relative overflow-hidden" title={`使用量: ${current} / 最大: ${max}`}>
          <div 
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-[var(--fg-secondary)] mt-1 text-right">
          {percentage.toFixed(1)}%
        </div>
      </div>
    );
  };

  const total = quotaInfo.total ?? 0;
  const globalTotal = quotaInfo.globalTotal ?? 0;
  const errorThreshold = quotaInfo.errorThreshold ?? 5000;
  const globalErrorThreshold = quotaInfo.globalErrorThreshold ?? 10000;

  return (
    <div className="text-sm">
      {renderQuotaBar('API使用量（本日・全体）', globalTotal, globalErrorThreshold)}
      {renderQuotaBar('API使用量（本日・あなた）', total, errorThreshold)}
    </div>
  );
}
