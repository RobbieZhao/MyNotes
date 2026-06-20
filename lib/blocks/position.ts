export const POSITION_STEP = 1000;
export const MIN_POSITION_GAP = 1;

export function initialPosition(index: number): number {
  return (index + 1) * POSITION_STEP;
}

export function positionBetween(left: number | null, right: number | null): number {
  if (left === null && right === null) {
    return POSITION_STEP;
  }
  if (left === null) {
    return right! - POSITION_STEP;
  }
  if (right === null) {
    return left + POSITION_STEP;
  }
  return Math.floor((left + right) / 2);
}

export function needsReindex(positions: number[]): boolean {
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] < MIN_POSITION_GAP) {
      return true;
    }
  }
  return false;
}

export function reindexPositions<T extends { id: string }>(
  items: T[]
): { id: string; position: number }[] {
  return items.map((item, index) => ({
    id: item.id,
    position: initialPosition(index),
  }));
}

export function positionForMoveUp(
  currentIndex: number,
  positions: number[]
): number | "reindex" {
  if (currentIndex <= 0) return positions[0];

  const left = positions[currentIndex - 2] ?? null;
  const current = positions[currentIndex - 1];
  const target = positions[currentIndex];

  const newPos = positionBetween(left, current);
  if (Math.abs(newPos - target) < MIN_POSITION_GAP || newPos === current) {
    return "reindex";
  }
  return newPos;
}

export function positionForMoveDown(
  currentIndex: number,
  positions: number[]
): number | "reindex" {
  if (currentIndex >= positions.length - 1) {
    return positions[positions.length - 1];
  }

  const current = positions[currentIndex];
  const next = positions[currentIndex + 1];
  const right = positions[currentIndex + 2] ?? null;

  const newPos = positionBetween(next, right);
  if (Math.abs(newPos - current) < MIN_POSITION_GAP || newPos === next) {
    return "reindex";
  }
  return newPos;
}

export function positionForInsertAtEnd(lastPosition: number | null): number {
  return lastPosition === null ? POSITION_STEP : lastPosition + POSITION_STEP;
}

export function positionForInsertAt(
  index: number,
  positions: number[]
): number | "reindex" {
  const left = index > 0 ? positions[index - 1] : null;
  const right = index < positions.length ? positions[index] : null;
  const newPos = positionBetween(left, right);

  if (
    left !== null &&
    right !== null &&
    right - left < MIN_POSITION_GAP * 2
  ) {
    return "reindex";
  }

  return newPos;
}
