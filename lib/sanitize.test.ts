import { describe, it, expect } from 'vitest';
import { sanitizeMarkdown } from './sanitize';

describe('sanitizeMarkdown — XSS prevention', () => {
  it('strips <script> tags completely', () => {
    const result = sanitizeMarkdown('<script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips inline event handlers', () => {
    const result = sanitizeMarkdown('<p onclick="evil()">Click me</p>');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('evil');
  });

  it('strips onerror on img tags', () => {
    const result = sanitizeMarkdown('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
  });

  it('preserves <p> tags', () => {
    const result = sanitizeMarkdown('Hello world');
    expect(result).toContain('<p>');
    expect(result).toContain('Hello world');
  });

  it('preserves <strong> from Markdown bold', () => {
    const result = sanitizeMarkdown('**bold text**');
    expect(result).toContain('<strong>');
    expect(result).toContain('bold text');
  });

  it('preserves <em> from Markdown italic', () => {
    const result = sanitizeMarkdown('_italic text_');
    expect(result).toContain('<em>');
    expect(result).toContain('italic text');
  });

  it('preserves <ul> and <li> from Markdown lists', () => {
    const result = sanitizeMarkdown('- item one\n- item two');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('item one');
  });

  it('preserves safe <a> tags from Markdown links', () => {
    const result = sanitizeMarkdown('[Visit](https://example.com)');
    expect(result).toContain('<a');
    expect(result).toContain('href="https://example.com"');
  });

  it('strips javascript: href', () => {
    const result = sanitizeMarkdown('[Click](javascript:alert(1))');
    expect(result).not.toContain('javascript:');
  });

  it('returns empty string for empty input', () => {
    const result = sanitizeMarkdown('');
    expect(result.trim()).toBe('');
  });
});
