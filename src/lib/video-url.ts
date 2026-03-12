/**
 * Extract YouTube video ID from common URL formats.
 * Returns embed URL for use in iframe, or null if not a supported YouTube URL.
 */
export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  let id: string | null = null;
  try {
    if (u.includes("youtube.com/watch?v=")) {
      const m = u.match(/[?&]v=([^&]+)/);
      id = m ? m[1] : null;
    } else if (u.includes("youtu.be/")) {
      const m = u.match(/youtu\.be\/([^?&#]+)/);
      id = m ? m[1] : null;
    } else if (u.includes("youtube.com/embed/")) {
      const m = u.match(/youtube\.com\/embed\/([^?&#]+)/);
      id = m ? m[1] : null;
    }
  } catch {
    return null;
  }
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
