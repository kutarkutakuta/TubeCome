'use client';

import { useEffect, useRef } from 'react';
import { Modal } from 'antd';

export default function QuotaLimitCheck() {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent double-check in development mode
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    async function checkQuotaLimit() {
      try {
        const res = await fetch('/api/quota-usage');
        if (!res.ok) return;
        
        const data = await res.json();
        const { total = 0 } = data;
        const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '200', 10);

        // Check if any threshold exceeded
        let message = '';
        let isError = false;
        
        if (total >= errorThreshold) {
          message = `あなたの本日のAPI使用量が上限（${errorThreshold}）に達しました。\n\n明日までお待ちください。`;
          isError = true;
        }
        
        if (isError && message) {
          Modal.error({
            title: 'API使用上限に達しました',
            content: message,
            okText: 'OK'
          });
        }
      } catch (err) {
        console.error('Failed to check quota limit:', err);
      }
    }
    
    checkQuotaLimit();
  }, []);

  return null;
}
