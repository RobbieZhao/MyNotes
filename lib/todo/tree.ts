import type { TodoItem, TodoListBlockData } from "@/types/blocks";

export function createTodoItem(text = ""): TodoItem {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
    children: [],
  };
}

export function normalizeTodoItem(item: Partial<TodoItem> & { id: string }): TodoItem {
  return {
    id: item.id,
    text: item.text ?? "",
    done: item.done ?? false,
    children: (item.children ?? []).map(normalizeTodoItem),
  };
}

export function normalizeTodoListData(data: TodoListBlockData): TodoListBlockData {
  return {
    title: data.title ?? "Things to do",
    showTitle: data.showTitle !== false,
    items: (data.items ?? []).map(normalizeTodoItem),
  };
}

export function flattenTodoItems(items: TodoItem[]): TodoItem[] {
  const result: TodoItem[] = [];
  for (const item of items) {
    result.push(item);
    result.push(...flattenTodoItems(item.children));
  }
  return result;
}

export function insertTodoItem(
  items: TodoItem[],
  item: TodoItem,
  parentId: string | null
): TodoItem[] {
  if (!parentId) return [...items, item];
  return addSubItemToTree(items, parentId, item);
}

export function updateItemInTree(
  items: TodoItem[],
  id: string,
  updater: (item: TodoItem) => TodoItem
): TodoItem[] {
  return items.map((item) => {
    if (item.id === id) return updater(item);
    if (item.children.length > 0) {
      return { ...item, children: updateItemInTree(item.children, id, updater) };
    }
    return item;
  });
}

export function deleteItemFromTree(items: TodoItem[], id: string): TodoItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: deleteItemFromTree(item.children, id),
    }));
}

export function addSubItemToTree(
  items: TodoItem[],
  parentId: string,
  newItem: TodoItem
): TodoItem[] {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, newItem] };
    }
    if (item.children.length > 0) {
      return { ...item, children: addSubItemToTree(item.children, parentId, newItem) };
    }
    return item;
  });
}
