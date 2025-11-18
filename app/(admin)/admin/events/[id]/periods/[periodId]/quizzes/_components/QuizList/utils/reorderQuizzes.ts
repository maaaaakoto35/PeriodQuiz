/**
 * 配列内の要素を1つ上に移動
 */
export function moveUp<T extends { order_num: number }>(
  items: T[],
  index: number
): T[] {
  if (index <= 0) return items;

  const newItems = [...items];
  [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

  // order_num も更新
  newItems[index - 1].order_num = index;
  newItems[index].order_num = index + 1;

  return newItems;
}

/**
 * 配列内の要素を1つ下に移動
 */
export function moveDown<T extends { order_num: number }>(
  items: T[],
  index: number
): T[] {
  if (index >= items.length - 1) return items;

  const newItems = [...items];
  [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

  // order_num も更新
  newItems[index].order_num = index + 1;
  newItems[index + 1].order_num = index + 2;

  return newItems;
}
