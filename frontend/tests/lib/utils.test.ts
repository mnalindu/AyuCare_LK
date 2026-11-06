import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateForInput } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classNames)', () => {
    it('merges class names correctly', () => {
      const result = cn('px-4 py-2', 'bg-white', { 'text-danger': true, 'opacity-50': false });
      expect(result).toContain('px-4');
      expect(result).toContain('bg-white');
      expect(result).toContain('text-danger');
      expect(result).not.toContain('opacity-50');
    });

    it('resolves conflicting Tailwind classes in favor of last one', () => {
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });
  });

  describe('formatDate', () => {
    it('returns fallback dash for empty or null dates', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
      expect(formatDate('')).toBe('—');
    });

    it('formats ISO dates into Sri Lanka readable format', () => {
      const result = formatDate('1990-04-15');
      expect(result).toContain('1990');
      expect(result).toContain('Apr');
    });
  });

  describe('formatDateForInput', () => {
    it('returns empty string for nullish values', () => {
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput('')).toBe('');
    });

    it('extracts YYYY-MM-DD from ISO string', () => {
      expect(formatDateForInput('1990-04-15T00:00:00.000Z')).toBe('1990-04-15');
    });
  });
});

