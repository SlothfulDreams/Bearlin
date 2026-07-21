import { createReviewCard, scheduleReview } from './fsrs';

describe('FSRS adapter', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');

  it('maps stronger grades to later review dates', () => {
    const card = createReviewCard(now);
    const forgot = scheduleReview(card, 'forgot', now);
    const gotIt = scheduleReview(card, 'got-it', now);
    expect(forgot.card.due.getTime()).toBeLessThanOrEqual(gotIt.card.due.getTime());
  });

  it('schedules and records a successful review', () => {
    const result = scheduleReview(createReviewCard(now), 'got-it', now);
    expect(result.card.reps).toBe(1);
    expect(result.card.due.getTime()).toBeGreaterThan(now.getTime());
  });
});
