import type { Socket } from "socket.io";

import { CardEvent } from "../common/enums";
import { Card } from "../data/models/card";
import { SocketHandler } from "./socket.handler";
import { logger } from "../patterns/observer";

export class CardHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(CardEvent.CREATE, this.createCard.bind(this));
    socket.on(CardEvent.RENAME, this.renameCard.bind(this));
    socket.on(
      CardEvent.CHANGE_DESCRIPTION,
      this.changeDescriptionCard.bind(this)
    );
    socket.on(CardEvent.DELETE, this.deleteCard.bind(this));
    socket.on(CardEvent.DUBLICATE, this.dublicateCard.bind(this));
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

  public renameCard(cardId: string, cardName: string) {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.setCards(
          list.cards.map((card) =>
            card.id === cardId ? card.rename(cardName) : card
          )
        )
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card name changed ${cardId}: ${cardName}`);
    } catch (error) {
      logger.writeError(`Error changing card name ${cardId}: ${error.message}`);
    }
  }

  public changeDescriptionCard(cardId: string, description: string) {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.setCards(
          list.cards.map((card) =>
            card.id === cardId ? card.changeDescription(description) : card
          )
        )
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card description changed ${cardId}: ${description}`);
    } catch (error) {
      logger.writeError(
        `Error changing card description ${cardId}: ${error.message}`
      );
    }
  }

  public deleteCard(cardId: string) {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.setCards(list.cards.filter((card) => card.id !== cardId))
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card was deleted: ${cardId}`);
    } catch (error) {
      logger.writeError(`Error deleting card ${cardId}: ${error.message}`);
    }
  }

  public dublicateCard(cardId: string) {
    try {
      const lists = this.db.getData();

      const cardToFind = lists
        .flatMap((list) => list.cards)
        .find((card) => card.id === cardId);

      const listId = lists.find((list) =>
        list.cards.some((card) => card.id === cardId)
      ).id;

      const newCard = cardToFind.clone();

      const updatedLists = lists.map((list) =>
        list.id === listId ? list.setCards(list.cards.concat(newCard)) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Card dublicated: ${cardId}`);
    } catch (error) {
      logger.writeError(`Error dublicating card ${cardId}: ${error.message}`);
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
