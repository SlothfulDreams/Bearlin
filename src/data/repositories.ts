import { MockContentRepository } from '@/data/mock/mock-content-repository';
import { mockDataset } from '@/data/mock/mock-data';

export const contentRepository = new MockContentRepository(mockDataset);
