'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { addChannel as idbAddChannel } from '@/utils/indexeddb';

export default function AddChannelForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function onFinish(values: { input: string }) {
    setLoading(true);
    try {
      const res = await fetch('/api/resolve-channel', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ input: values.input })
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json?.error || 'resolve_failed');
        return;
      }
      const channelId = json.channelId;
      const channelTitle = json.channelTitle || channelId;
      if (!channelId) {
        message.error('channel_not_found');
        return;
      }
      await idbAddChannel(channelId, channelTitle);
      message.success(`登録しました: ${channelTitle}`);
      form.resetFields();
    } catch (err) {
      message.error(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="input"
        rules={[{ required: true, message: 'URLかIDを入力してください' }]}
      >
        <div className="flex items-center gap-3">
          <Input className="flex-1" placeholder="チャンネルURLまたはチャンネルID" onPressEnter={() => form.submit()} />
          <Button type="primary" htmlType="submit" loading={loading} aria-label="チャンネル追加">
            追加
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}
