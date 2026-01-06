# TubeCome (ちゅーこめ)

個人YouTuber向けの YouTube コメント全文分析ツール。

## 概要

YouTube Data API v3 を利用して特定のチャンネルの直近動画（最大10件）のコメントを取得し、Supabase に保存して可視化・感情分析を行います。
感情分析には Supabase Edge Functions と TensorFlow.js (BERTモデル) を使用します。

## 技術スタック

- **Frontend/Framework**: Next.js (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **API**: YouTube Data API v3
- **Analysis**: Supabase Edge Functions + TensorFlow.js / Transformers.js

## セットアップ手順

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   `.env.local` ファイルを開き、以下の値を設定してください。
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase プロジェクトの Anon Key
   - `YOUTUBE_API_KEY`: Google Cloud Console で取得した YouTube Data API のキー

3. **Supabase テーブル作成**
   Supabase の SQL Editor で以下のテーブルを作成・更新してください。

   ```sql
   -- Videos Table
   create table videos (
     id text primary key, -- YouTube video id
     title text,
     thumbnail_url text,
     channel_id text,
     channel_title text,
     published_at timestamp with time zone,
     inserted_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Comments Table (既存の場合は ALTER TABLE でカラム追加)
   create table comments (
     id text primary key, -- YouTube comment id
     video_id text not null references videos(id), -- 外部キー制約を追加する場合
     text_display text,
     text_original text,
     author_display_name text,
     author_profile_image_url text,
     like_count integer default 0,
     published_at timestamp with time zone,
     updated_at timestamp with time zone,
     sentiment_score float,        -- 感情スコア (-1.0 ~ 1.0 または 0.0 ~ 1.0)
     sentiment_label text,         -- 感情ラベル (POSITIVE, NEGATIVE, etc.)
     inserted_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```

   **既存テーブルへのカラム追加用 SQL:**
   ```sql
   alter table comments add column sentiment_score float;
   alter table comments add column sentiment_label text;
   ```

4. **Edge Function のセットアップ (オプション)**
   `supabase/functions/analyze-sentiment` に感情分析のコードが含まれています。
   Supabase CLI を使用してデプロイする場合:
   ```bash
   supabase functions deploy analyze-sentiment
   ```
   ※ `.env` ファイルの設定が必要です。

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 実装方針

- 過剰な抽象化は避け、関数ベースで実装する。
- 外部ライブラリは最小限に留める。
- データ取得は Supabase Client を直接使用する。

## ライセンス

MIT
