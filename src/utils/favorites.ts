export const FAVORITES_KEY = 'tubecome-favorites';

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (e) {
    return [];
  }
}

export function saveFavorites(list: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    // notify other components
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  } catch (e) {}
}

export function addFavorite(channel: string) {
  const list = getFavorites();
  if (!list.includes(channel)) {
    list.unshift(channel);
    saveFavorites(list);
  }
}

export function removeFavorite(channel: string) {
  const list = getFavorites().filter((c) => c !== channel);
  saveFavorites(list);
}
