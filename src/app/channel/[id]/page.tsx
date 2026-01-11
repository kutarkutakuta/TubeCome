import React from 'react';
import MarkChannelVisited from '@/app/channel/[id]/components/MarkChannelVisited';
import QuotaLimitCheck from '@/components/QuotaLimitCheck';
import ChannelClientView from '@/app/channel/[id]/components/ChannelClientView';

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ChannelPage({ params }: Props) {
  const { id } = await params as { id: string };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <QuotaLimitCheck />
      <MarkChannelVisited channelId={id} />
      <ChannelClientView channelId={id} />
    </div>
  );
}











