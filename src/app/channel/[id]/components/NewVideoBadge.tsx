'use client';

import { useEffect, useState } from 'react';
import { Badge } from 'antd';
import { getAllChannels } from '@/utils/indexeddb';

export default function NewVideoBadge({ channelId, publishedDate }: { channelId: string; publishedDate: string }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const checkIfNew = async () => {
      const channels = await getAllChannels();
      const channel = channels.find(ch => ch.id === channelId);
      
      if (!channel || !channel.lastVisited) {
        setIsNew(false);
        return;
      }

      const publishedTime = new Date(publishedDate).getTime();
      const lastVisitedTime = channel.lastVisited;

      if (publishedTime > lastVisitedTime) {
        setIsNew(true);
      }
    };

    checkIfNew();
  }, [channelId, publishedDate]);

  if (!isNew) return null;

  return <Badge count="New" style={{ backgroundColor: '#f5222d' }} />;
}
