export const BOOKMARKS_KEY = "rounds.bookmarks.v1";

export type Bookmark = { questionId: string; savedAt: string };

export function parseBookmarks(value: string | null): Bookmark[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Bookmark[];
    return Array.isArray(parsed) ? parsed.filter((bookmark) => typeof bookmark?.questionId === "string") : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(bookmarks: Bookmark[], questionId: string, savedAt = new Date().toISOString()): Bookmark[] {
  if (bookmarks.some((bookmark) => bookmark.questionId === questionId)) {
    return bookmarks.filter((bookmark) => bookmark.questionId !== questionId);
  }
  return [{ questionId, savedAt }, ...bookmarks];
}

export function bookmarkIds(bookmarks: Bookmark[]): string[] {
  return bookmarks.map((bookmark) => bookmark.questionId);
}
