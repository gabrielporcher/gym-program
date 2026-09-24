export type TemplateId = 'abc' | 'abcde' | 'abc2x' | 'ppl' | 'fullbody';

export interface Template {
  id: TemplateId;
  name: string;
  days: string[];
}

const TEMPLATES: Template[] = [
  { id: 'abc', name: 'ABC', days: ['A', 'B', 'C'] },
  { id: 'abcde', name: 'ABCDE', days: ['A', 'B', 'C', 'D', 'E'] },
  { id: 'abc2x', name: 'ABC 2x', days: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2'] },
  { id: 'ppl', name: 'PPL', days: ['Push', 'Pull', 'Legs', 'Push 2', 'Pull 2', 'Legs 2'] },
  { id: 'fullbody', name: 'full body', days: ['Full'] },
];

const SCHEDULE: Record<TemplateId, (string | null)[]> = {
  abc: [null, 'A', null, 'B', null, 'C', null],
  abcde: [null, 'A', 'B', 'C', 'D', 'E', null],
  abc2x: [null, 'A1', 'B1', 'C1', 'A2', 'B2', 'C2'],
  ppl: [null, 'Push', 'Pull', 'Legs', 'Push 2', 'Pull 2', 'Legs 2'],
  fullbody: [null, 'Full', null, 'Full', null, 'Full', null],
};

export function listTemplates(): Template[] {
  return TEMPLATES.map((template) => ({ ...template, days: [...template.days] }));
}

export function suggestedDay(templateId: string, weekday: number): string | null {
  const week = SCHEDULE[templateId as TemplateId];
  if (!week || weekday < 0 || weekday > 6) {
    return null;
  }
  return week[weekday] ?? null;
}
