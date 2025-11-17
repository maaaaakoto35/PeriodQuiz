/**
 * ピリオド配列を上に移動
 * @param periods ピリオド配列
 * @param index 現在のインデックス
 * @returns 新しいピリオド配列
 */
export function moveUp<T extends { id: number }>(periods: T[], index: number): T[] {
  if (index <= 0) return periods;

  const newPeriods = [...periods];
  [newPeriods[index - 1], newPeriods[index]] = [
    newPeriods[index],
    newPeriods[index - 1],
  ];
  return newPeriods;
}

/**
 * ピリオド配列を下に移動
 * @param periods ピリオド配列
 * @param index 現在のインデックス
 * @returns 新しいピリオド配列
 */
export function moveDown<T extends { id: number }>(
  periods: T[],
  index: number
): T[] {
  if (index >= periods.length - 1) return periods;

  const newPeriods = [...periods];
  [newPeriods[index], newPeriods[index + 1]] = [
    newPeriods[index + 1],
    newPeriods[index],
  ];
  return newPeriods;
}

/**
 * 配列を指定方向に移動
 * @param periods ピリオド配列
 * @param index 現在のインデックス
 * @param direction 移動方向 ('up' | 'down')
 * @returns 新しいピリオド配列
 */
export function reorder<T extends { id: number }>(
  periods: T[],
  index: number,
  direction: 'up' | 'down'
): T[] {
  return direction === 'up' ? moveUp(periods, index) : moveDown(periods, index);
}
