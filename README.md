# TubeCome Retro Edition

Windows 2000 / 2ch style retro responsive layout.

## Features
- Classic Windows 2000 aesthetic
- Responsive design: Sidebar on Desktop, Bottom Menu on Mobile
- Next.js 16 + Tailwind CSS

## Usage
Run `npm run dev` to start.

## Meilisearch + RSS prototype

1. Start Meilisearch (Docker):

```bash
# run Meilisearch
docker run -it --rm -p 7700:7700 getmeili/meilisearch:latest
```

2. Fetch channel RSS into JSON:

```bash
# optionally set CHANNELS env to comma-separated channel IDs
CHANNELS="UC_x5XG1OV2P6uZZ5FSM9Ttw" node scripts/fetch-rss-channels.js > rss-output.json
```

3. Seed Meilisearch:

```bash
MEILI_HOST=http://127.0.0.1:7700 MEILI_KEY=masterKey node scripts/meilisearch-seed.js < rss-output.json
```

4. Start Next.js dev (`npm run dev`) and query:

- Search videos: GET `/api/search?q=retro&type=videos`
- Search channels: GET `/api/search?q=google&type=channels`

This prototype uses RSS + Meilisearch to avoid YouTube API quota for search/discovery.

