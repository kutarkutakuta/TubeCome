'use client';

import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import { linkify } from '@/utils/linkify';

export default function FullDescriptionDrawer({ description }: { description?: string }) {
  const [open, setOpen] = useState(false);

  if (!description) return null;

  return (
    <>
      <Button size="small" onClick={() => setOpen(true)} className="ml-2 align-baseline">
        説明全文
      </Button>
      <Drawer title="説明文" placement="right" onClose={() => setOpen(false)} open={open} width={520}>
        <div className="whitespace-pre-wrap text-sm">
          {linkify(description)}
        </div>
      </Drawer>
    </>
  );
}
