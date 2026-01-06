# TubeCome (ちゅーこめ)

個人YouTuber向けの YouTube コメント全文分析ツール。

## 概要

YouTube Data API v3 を利用して特定の動画のコメントを取得し、Supabase に保存して可視化・分析を行います。
MVP（Minimum Viable Product）として、手動実行を前提としたシンプルな設計になっています。

## 技術スタック

- **Frontend/Framework**: Next.js (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **API**: YouTube Data API v3

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
   Supabase の SQL Editor で以下のテーブルを作成してください（例）。
   ```sql
   create table comments (
     id text primary key, -- YouTube comment id
     video_id text not null,
     text_display text,
     text_original text,
     author_display_name text,
     author_profile_image_url text,
     like_count integer default 0,
     published_at timestamp with time zone,
     updated_at timestamp with time zone,
     inserted_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 実装方針

- 過剰な抽象化は避け、関数ベースで実装する。
- 外部ライブラリは最小限に留める。
- データ取得は Supabase Client を直接使用する。

## ライセンス

MIT
