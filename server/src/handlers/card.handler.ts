import type { Socket } from "socket.io";

import { CardEvent } from "../common/enums";
import { Card } from "../data/models/card";
import { SocketHandler } from "./socket.handler";
import { logger } from "../patterns/observer";

export class CardHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.RENAME, this.rename.bind(this));
    socket.on(CardEvent.REORDER, this.reorderCards.bind(this));
  }

  public createCard(listId: string, cardName: string): void {
    try {
      const newCard = new Card(cardName, "");
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.id === listId ? list.setCards(list.cards.concat(newCard)) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card created in list ${listId}: ${cardName}`);
    } catch (error) {
      logger.writeError(
        `Error creating card in list ${listId}: ${error.message}`
      );
    }
  }

  public rename(cardId: string, cardName: string) {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.map((list) => {
        const updatedCards = list.cards.map((card) => {
          if (card.id === cardId) {
            card.rename(cardName);
          }
          return card;
        });
        list.setCards(updatedCards);
        return list;
      });

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card name changed ${cardId}: ${cardName}`);
    } catch (error) {
      logger.writeError(`Error changing card name ${cardId}: ${error.message}`);
    }
  }

  private reorderCards({
    sourceIndex,
    destinationIndex,
    sourceListId,
    destinationListId,
  }: {
    sourceIndex: number;
    destinationIndex: number;
    sourceListId: string;
    destinationListId: string;
  }): void {
    try {
      const lists = this.db.getData();
      const reordered = this.reorderService.reorderCards({
        lists,
        sourceIndex,
        destinationIndex,
        sourceListId,
        destinationListId,
      });
      this.db.setData(reordered);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(
        `Cards reordered: sourceIndex=${sourceIndex}, destinationIndex=${destinationIndex}, sourceListId=${sourceListId}, destinationListId=${destinationListId}`
      );
    } catch (error) {
      logger.writeError(`Error reordering cards: ${error.message}`);
    }
  }
}
