import type { DraggableLocation } from '@hello-pangea/dnd';

import { Card, List } from '../common/types';

const reorder =
  <T>(startIndex: number, endIndex: number) =>
  (items: T[]): T[] => {
    const [removed] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, removed);

    return items;
  };

const reorderLists = reorder<List>;

const reorderCards = (
  lists: List[],
  source: DraggableLocation,
  destination: DraggableLocation
): List[] => {
  const getCards = getListCards(lists);

  const current: Card[] = getCards(source.droppableId);
  const next: Card[] = getCards(destination.droppableId);
  const target: Card = current[source.index];

  const isMovingInSameList = source.droppableId === destination.droppableId;

  if (isMovingInSameList) {
    const reordered: Card[] = reorder<Card>(
      source.index,
      destination.index
    )(current);
    return lists.map((list) =>
      list.id === source.droppableId ? { ...list, cards: reordered } : list
    );
  }

  const removeCardFromCurrent = removeCardFromList(source.index);
  const addCardToNext = addCardToList(destination.index, target);

  const newLists = lists.map((list) => {
    if (list.id === source.droppableId) {
      return { ...list, cards: removeCardFromCurrent(current) };
    }

    if (list.id === destination.droppableId) {
      return { ...list, cards: addCardToNext(next) };
    }

    return list;
  });

  return newLists;
};

const removeCardFromList =
  (index: number) =>
  (cards: Card[]): Card[] => {
    return [...cards.slice(0, index), ...cards.slice(index + 1)];
  };

const addCardToList =
  (index: number, card: Card) =>
  (cards: Card[]): Card[] => {
    return [...cards.slice(0, index), card, ...cards.slice(index)];
  };

const getListCards =
  (lists: List[]) =>
  (listId: string): Card[] =>
    lists.find((list) => list.id === listId)?.cards || [];

export const reorderService = {
  reorderLists,
  reorderCards,
};
