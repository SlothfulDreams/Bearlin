export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function weekContaining(date: Date) {
  const start = new Date(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}
