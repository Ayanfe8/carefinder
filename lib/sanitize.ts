import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ALLOWED_TAGS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'br'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Converts Markdown to HTML and strips all dangerous content.
 * Safe tags (p, strong, em, ul, ol, li, a, h1-h4, br) are preserved.
 * <script> tags, inline event handlers, and all other unsafe HTML are stripped.
 */
export function sanitizeMarkdown(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS, ALLOWED_ATTR });
}
