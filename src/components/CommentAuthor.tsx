import React from 'react';

type Props = {
  authorName: string;
  isOwner?: boolean;
  shortId?: string;
  children?: React.ReactNode; // If provided, replaces the rendering of authorName (e.g. for Popover trigger)
};

export default function CommentAuthor({ authorName, isOwner, shortId, children }: Props) {
  return (
    <span className="inline-flex items-center flex-wrap gap-1">
      {isOwner ? (
        <span className="owner-prefix">うｐ主</span>
      ) : (
        <span className="text-[var(--fg-secondary)] text-sm">名無しさん</span>
      )}
      
      <span className="text-[var(--fg-primary)]">
        {children || authorName}
      </span>
      
    </span>
  );
}
