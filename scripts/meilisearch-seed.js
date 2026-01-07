/*
Seed Meilisearch with channels and videos JSON from fetch-rss-channels.js output.
Usage: MEILI_HOST=http://127.0.0.1:7700 MEILI_KEY=masterKey node scripts/meilisearch-seed.js < rss-output.json
Requires: npm i meilisearch (or include in project deps)
*/

import { MeiliSearch } from 'meilisearch';
import fs from 'fs';

const MEILI_HOST = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_KEY || '';
const client = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });

async function main() {
  const raw = await fs.promises.readFile(0, 'utf8'); // stdin
  const arr = JSON.parse(raw);
  // Prepare channels and videos docs
  const channels = arr.map(c => ({ id: c.channelId, title: c.title, description: c.description }));
  const videos = arr.flatMap(c => c.videos.map(v => ({ id: v.id, title: v.title, published: v.published, link: v.link, channelId: c.channelId, channelTitle: c.title })));

  // Create or update indexes
  await client.index('channels').updateSettings({ searchableAttributes: ['title', 'description'], displayedAttributes: ['id','title','description'] }).catch(()=>{});
  await client.index('videos').updateSettings({ searchableAttributes: ['title'], displayedAttributes: ['id','title','published','link','channelId','channelTitle'] }).catch(()=>{});

  console.log('Indexing channels:', channels.length);
  await client.index('channels').addDocuments(channels);
  console.log('Indexing videos:', videos.length);
  await client.index('videos').addDocuments(videos);

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
