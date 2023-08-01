import type { Socket } from "socket.io";

import { ListEvent } from "../common/enums";
import { List } from "../data/models/list";
import { SocketHandler } from "./socket.handler";
import { publisher } from "../patterns/observer";
import { LogTypes } from "../common/enums/log.enums";

export class ListHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    callback(this.db.getData());
  }

  private reorderLists(sourceIndex: number, destinationIndex: number): void {
    try {
      const lists = this.db.getData();
      const reorderedLists = this.reorderService.reorder(
        lists,
        sourceIndex,
        destinationIndex
      );
      this.db.setData(reorderedLists);
      this.updateLists();

      // PATTERN: observer
      const logMessage = `Lists reordered: sourceIndex=${sourceIndex}, destinationIndex=${destinationIndex}`;
      publisher.changeState({ type: LogTypes.INFO, message: logMessage });
    } catch (error) {
      const errorMessage = `Error reordering lists: ${error.message}`;
      publisher.changeState({ type: LogTypes.ERROR, message: errorMessage });
    }
  }

  private createList(name: string): void {
    try {
      const lists = this.db.getData();
      const newList = new List(name);
      this.db.setData(lists.concat(newList));
      this.updateLists();

      // PATTERN: observer
      const logMessage = `List created: name=${name}`;
      publisher.changeState({ type: LogTypes.INFO, message: logMessage });
    } catch (error) {
      const errorMessage = `Error creating list: ${error.message}`;
      publisher.changeState({ type: LogTypes.ERROR, message: errorMessage });
    }
  }
}
