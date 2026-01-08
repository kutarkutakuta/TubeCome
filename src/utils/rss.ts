// Fetch channel RSS and count new videos since lastVisited timestamp
// Uses server-side API route to avoid CORS issues
export async function countNewVideos(channelId: string, lastVisited?: number): Promise<number> {
  try {
    const params = new URLSearchParams({ channelId });
    if (lastVisited) params.set('lastVisited', String(lastVisited));
    
    const res = await fetch(`/api/channel-new-count?${params.toString()}`);
    if (!res.ok) return 0;
    
    const json = await res.json();
    return json.count || 0;
  } catch (err) {
    console.error(`Failed to fetch new count for channel ${channelId}:`, err);
    return 0;
  }
}
