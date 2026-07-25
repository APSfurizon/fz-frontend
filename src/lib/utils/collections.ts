export function lastItem<T>(data: Iterable<T>): T {
  const arrayData = Array.from(data);
  return arrayData[arrayData.length - 1];
}

export function firstItem<T>(data: Iterable<T>): T {
  const arrayData = Array.from(data);
  return arrayData[0];
}
