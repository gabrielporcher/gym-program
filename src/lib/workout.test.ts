import { expect, it } from '@jest/globals';

import { listTemplates, suggestedDay } from './workout';

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

it('lists ABC, ABCDE, ABC 2x, PPL, and full body', () => {
  expect(listTemplates().map((template) => template.name)).toEqual([
    'ABC',
    'ABCDE',
    'ABC 2x',
    'PPL',
    'full body',
  ]);
});

it('exposes six days on ABC 2x', () => {
  const abc2x = listTemplates().find((template) => template.id === 'abc2x');

  expect(abc2x?.days).toEqual(['A1', 'B1', 'C1', 'A2', 'B2', 'C2']);
});

it('maps ABCDE Monday to A and leaves the weekend empty', () => {
  expect(suggestedDay('abcde', MONDAY)).toBe('A');
  expect(suggestedDay('abcde', TUESDAY)).toBe('B');
  expect(suggestedDay('abcde', WEDNESDAY)).toBe('C');
  expect(suggestedDay('abcde', THURSDAY)).toBe('D');
  expect(suggestedDay('abcde', FRIDAY)).toBe('E');
  expect(suggestedDay('abcde', SATURDAY)).toBeNull();
  expect(suggestedDay('abcde', SUNDAY)).toBeNull();
});

it('maps full body to Monday, Wednesday, and Friday', () => {
  expect(suggestedDay('fullbody', MONDAY)).toBe('Full');
  expect(suggestedDay('fullbody', TUESDAY)).toBeNull();
  expect(suggestedDay('fullbody', WEDNESDAY)).toBe('Full');
  expect(suggestedDay('fullbody', THURSDAY)).toBeNull();
  expect(suggestedDay('fullbody', FRIDAY)).toBe('Full');
  expect(suggestedDay('fullbody', SATURDAY)).toBeNull();
  expect(suggestedDay('fullbody', SUNDAY)).toBeNull();
});

it('maps ABC to Monday A, Wednesday B, and Friday C', () => {
  expect(suggestedDay('abc', MONDAY)).toBe('A');
  expect(suggestedDay('abc', TUESDAY)).toBeNull();
  expect(suggestedDay('abc', WEDNESDAY)).toBe('B');
  expect(suggestedDay('abc', THURSDAY)).toBeNull();
  expect(suggestedDay('abc', FRIDAY)).toBe('C');
  expect(suggestedDay('abc', SATURDAY)).toBeNull();
  expect(suggestedDay('abc', SUNDAY)).toBeNull();
});

it('suggests Saturday for ABC 2x and PPL and Sunday for no template', () => {
  expect(suggestedDay('abc2x', MONDAY)).toBe('A1');
  expect(suggestedDay('abc2x', TUESDAY)).toBe('B1');
  expect(suggestedDay('abc2x', WEDNESDAY)).toBe('C1');
  expect(suggestedDay('abc2x', THURSDAY)).toBe('A2');
  expect(suggestedDay('abc2x', FRIDAY)).toBe('B2');
  expect(suggestedDay('abc2x', SATURDAY)).toBe('C2');
  expect(suggestedDay('ppl', MONDAY)).toBe('Push');
  expect(suggestedDay('ppl', TUESDAY)).toBe('Pull');
  expect(suggestedDay('ppl', WEDNESDAY)).toBe('Legs');
  expect(suggestedDay('ppl', THURSDAY)).toBe('Push 2');
  expect(suggestedDay('ppl', FRIDAY)).toBe('Pull 2');
  expect(suggestedDay('ppl', SATURDAY)).toBe('Legs 2');

  for (const template of listTemplates()) {
    expect(suggestedDay(template.id, SUNDAY)).toBeNull();
  }
});
