import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';

export type ReviewGrade = 'forgot' | 'almost' | 'got-it';

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 3650,
  enable_fuzz: true,
});

const gradeToRating: Record<ReviewGrade, Grade> = {
  forgot: Rating.Again,
  almost: Rating.Hard,
  'got-it': Rating.Good,
};

export function createReviewCard(now = new Date()) {
  return createEmptyCard(now);
}

export function scheduleReview(card: Card, grade: ReviewGrade, now = new Date()) {
  return scheduler.next(card, now, gradeToRating[grade]);
}
