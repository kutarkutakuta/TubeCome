/*
Simple RSS fetcher that reads a list of channel IDs and outputs channel metadata + recent videos.
Usage: node scripts/fetch-rss-channels.js
Requires Node 18+ (global fetch available) and 'xml2js' as a dev dependency for parsing XML.

Environment:
  - CHANNELS: comma-separated YouTube channel IDs OR file with one ID per line (optional)

Outputs to stdout JSON array of { channelId, title, description, videos: [{ id, title, published, link }] }
*/

import { parseStringPromise } from 'xml2js';
import fs from 'fs';

const CHANNELS_ENV = process.env.CHANNELS || '';
let channelIds = [];
if (CHANNELS_ENV.includes('\n') || CHANNELS_ENV.includes(',')) {
  channelIds = CHANNELS_ENV.split(/[,\n\r]+/).map(s => s.trim()).filter(Boolean);
}
if (channelIds.length === 0) {
  // you can edit this seed list or set CHANNELS env var
  channelIds = [
    'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers (example)
  ];
}

async function fetchFeed(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TubeCome/1.0 (RSS-Seed)' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const xml = await parseStringPromise(text);
  const channel = xml.feed && xml.feed['yt:channelId'] ? xml.feed : null;
  const title = xml.feed?.title?.[0] ?? null;
  const description = xml.feed?.subtitle?.[0] ?? null;
  const entries = (xml.feed?.entry || []).map(e => ({
    id: e['yt:videoId']?.[0] ?? null,
    title: e.title?.[0] ?? null,
    published: e.published?.[0] ?? null,
    link: e.link?.[0]?.$.href ?? null,
  })).filter(v => v.id);
  return { channelId, title, description, videos: entries };
}

async function main() {
  const out = [];
  for (const id of channelIds) {
    try {
      const data = await fetchFeed(id);
      out.push(data);
      console.log(`# fetched ${id}: ${data.title} (${data.videos.length} videos)`);
    } catch (err) {
      console.error(`# failed ${id}: ${err.message}`);
    }
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
