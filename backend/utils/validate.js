export function isNonEmptyString(value, { min = 1, max = 8000 } = {}) {
  return (
    typeof value === 'string' &&
    value.trim().length >= min &&
    value.trim().length <= max
  );
}
