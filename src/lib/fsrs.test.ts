import { createReviewCard, getReviewPreviews, scheduleReview } from './fsrs';

describe('FSRS adapter', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');

  it('maps Bearlin grades onto increasing FSRS outcomes', () => {
    const card = createReviewCard(now);
    const previews = getReviewPreviews(card, now);
    expect(previews[1].card.due.getTime()).toBeLessThanOrEqual(previews[3].card.due.getTime());
  });

  it('schedules and records a successful review', () => {
    const result = scheduleReview(createReviewCard(now), 'got-it', now);
    expect(result.card.reps).toBe(1);
    expect(result.card.due.getTime()).toBeGreaterThan(now.getTime());
  });
});
