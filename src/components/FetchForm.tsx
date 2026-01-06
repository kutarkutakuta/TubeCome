'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAndSaveComments, FetchResult } from '@/app/actions';

const initialState: FetchResult = {
  success: false,
  message: '',
};

export default function FetchForm() {
  const [state, formAction, isPending] = useActionState(fetchAndSaveComments, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.channelId) {
      router.push(`/videos?channelId=${state.channelId}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full">
      <div>
        <label htmlFor="videoId" className="block text-sm font-medium text-gray-700 mb-1">
          チャンネルID (Channel ID)
        </label>
        <input
          type="text"
          name="videoId"
          id="videoId"
          placeholder="例: UCxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          YouTubeチャンネルURLの "/channel/" の後ろの文字列です。
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '取得中...' : 'コメントを取得・保存'}
      </button>

      {state.message && (
        <div className={`p-3 rounded text-sm ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}
