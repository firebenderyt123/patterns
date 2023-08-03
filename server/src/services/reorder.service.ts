import { Card } from '../data/models/card';
import { List } from '../data/models/list';
import { logger } from '../patterns/observer';

interface Reorder {
  reorder<T>(items: T[], startIndex: number, endIndex: number): T[];

  reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[];
}

class ReorderService implements Reorder {
  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const card = items[startIndex];
    const listWithRemoved = this.remove(items, startIndex);
    const result = this.insert(listWithRemoved, endIndex, card);

    return result;
  }

  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    const target: Card = lists.find((list) => list.id === sourceListId)
      ?.cards?.[sourceIndex];

    if (!target) {
      return lists;
    }

    const newLists = lists.map((list) => {
      if (list.id === sourceListId) {
        list.setCards(this.remove(list.cards, sourceIndex));
      }

      if (list.id === destinationListId) {
        list.setCards(this.insert(list.cards, destinationIndex, target));
      }

      return list;
    });

    return newLists;
  }

  private remove<T>(items: T[], index: number): T[] {
    return [...items.slice(0, index), ...items.slice(index + 1)];
  }

  private insert<T>(items: T[], index: number, value: T): T[] {
    return [...items.slice(0, index), value, ...items.slice(index)];
  }
}

// PATTERN: proxy
class ReorderServiceProxy extends ReorderService implements Reorder {
  private reorderService: Reorder;

  constructor(s: Reorder) {
    super();
    this.reorderService = s;
  }

  public checkAccess(): void {}

  public reorder<T>(items: T[], startIndex: number, endIndex: number): T[] {
    logger.writeInfo(
      `ReorderService.reorder called with parameters: items=${JSON.stringify(
        items.toString
      )}, startIndex=${startIndex}, endIndex=${endIndex}`
    );
    const result = this.reorderService.reorder(items, startIndex, endIndex);
    logger.writeInfo(`ReorderService.reorder executed successfully.`);
    return result;
  }
  public reorderCards({
    lists,
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    lists: List[];
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): List[] {
    logger.writeInfo(
      `ReorderService.reorderCards called with parameters: lists=${JSON.stringify(
        lists
      )}, sourceIndex=${sourceIndex}, destinationIndex=${destinationIndex}, sourceListId=${sourceListId}, destinationListId=${destinationListId}`
    );
    const result = this.reorderService.reorderCards({
      lists,
      sourceIndex,
      destinationIndex,
      sourceListId,
      destinationListId,
    });
    logger.writeInfo(`ReorderService.reorderCards executed successfully.`);
    return result;
  }
}

const reorderService = new ReorderService();
const reorderServiceProxy = new ReorderServiceProxy(reorderService);

export type { Reorder };
export { ReorderServiceProxy, reorderServiceProxy };
