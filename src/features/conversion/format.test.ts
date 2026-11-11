import { describe, expect, it } from 'vitest';
import { formatBytes, isSupportedImage, savingsPercent, toWebpName, uniqueNames } from './format';

describe('toWebpName', () => {
  it('replaces the extension with .webp', () => {
    expect(toWebpName('photo.png')).toBe('photo.webp');
    expect(toWebpName('photo.final.PNG')).toBe('photo.final.webp');
    expect(toWebpName('shot.jpeg')).toBe('shot.webp');
  });

  it('appends .webp when there is no extension', () => {
    expect(toWebpName('noext')).toBe('noext.webp');
    expect(toWebpName('.hidden')).toBe('.hidden.webp');
  });

  it('removes all whitespace from the name', () => {
    expect(toWebpName('my photo 01.png')).toBe('myphoto01.webp');
    expect(toWebpName(' tabs\tand  spaces .jpg')).toBe('tabsandspaces.webp');
  });

  it('falls back to "image" when the name is only whitespace', () => {
    expect(toWebpName('   .png')).toBe('image.webp');
  });
});

describe('uniqueNames', () => {
  it('keeps unique names untouched', () => {
    expect(uniqueNames(['a.webp', 'b.webp'])).toEqual(['a.webp', 'b.webp']);
  });

  it('numbers duplicates so no file overwrites another in the zip', () => {
    expect(uniqueNames(['a.webp', 'a.webp', 'b.webp', 'a.webp'])).toEqual([
      'a.webp',
      'a-2.webp',
      'b.webp',
      'a-3.webp',
    ]);
  });

  it('skips a numbered name that is already taken', () => {
    expect(uniqueNames(['a-2.webp', 'a.webp', 'a.webp'])).toEqual(['a-2.webp', 'a.webp', 'a-3.webp']);
  });
});

describe('formatBytes', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});

describe('savingsPercent', () => {
  it('returns the reduction as a rounded percentage', () => {
    expect(savingsPercent(1000, 250)).toBe(75);
  });

  it('is negative when the output is larger', () => {
    expect(savingsPercent(1000, 1100)).toBe(-10);
  });
});

describe('isSupportedImage', () => {
  it('accepts PNG and JPEG by mime type or extension', () => {
    expect(isSupportedImage({ type: 'image/png', name: 'a.png' })).toBe(true);
    expect(isSupportedImage({ type: 'image/jpeg', name: 'a.jpg' })).toBe(true);
    expect(isSupportedImage({ type: '', name: 'a.JPEG' })).toBe(true);
  });

  it('rejects other files', () => {
    expect(isSupportedImage({ type: 'application/pdf', name: 'a.pdf' })).toBe(false);
    expect(isSupportedImage({ type: 'image/gif', name: 'a.gif' })).toBe(false);
  });
});
