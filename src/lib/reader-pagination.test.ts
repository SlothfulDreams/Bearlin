import { paginateReaderItems, SENTENCES_PER_READER_PAGE } from './reader-pagination';

describe('reader pagination', () => {
  it('groups sentences into pages of seven', () => {
    const sentences = Array.from({ length: 15 }, (_, index) => index);

    expect(paginateReaderItems(sentences)).toEqual([
      [0, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14],
    ]);
    expect(SENTENCES_PER_READER_PAGE).toBe(7);
  });

  it('keeps short chapters on one page', () => {
    expect(paginateReaderItems(['one', 'two'])).toEqual([['one', 'two']]);
  });
});
