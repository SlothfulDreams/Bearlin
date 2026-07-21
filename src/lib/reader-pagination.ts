export const SENTENCES_PER_READER_PAGE = 7;

export function paginateReaderItems<T>(items: T[], pageSize = SENTENCES_PER_READER_PAGE): T[][] {
  if (pageSize < 1) throw new RangeError('Reader page size must be at least 1.');

  return Array.from(
    { length: Math.ceil(items.length / pageSize) },
    (_, pageIndex) => items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
  );
}
