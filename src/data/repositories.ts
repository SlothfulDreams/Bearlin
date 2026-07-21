import { MockContentRepository } from '@/data/mock/mock-content-repository';
import { mockDataset } from '@/data/mock/mock-data';

export type { LearningRepository } from '@/data/learning-repository';

export const contentRepository = new MockContentRepository(mockDataset);
