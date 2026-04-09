import DOMPurify from "isomorphic-dompurify";

/** Safe HTML for dangerouslySetInnerHTML (admin-edited content from API). */
export function sanitizeLegalHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
