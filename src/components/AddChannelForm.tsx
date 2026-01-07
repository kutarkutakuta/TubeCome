'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { addFavorite as idbAddFavorite } from '@/utils/indexeddb';

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
      await idbAddFavorite(channelId, channelTitle);
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
        label="チャンネル URL / ID を登録"
        rules={[{ required: true, message: 'URLかIDを入力してください' }]}
      >
        <Input placeholder="チャンネルURLかチャンネルID (例: UC...)" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          追加
        </Button>
      </Form.Item>
    </Form>
  );
}
