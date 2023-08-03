import type { Socket } from 'socket.io';

import { ListEvent } from '../common/enums';
import { List } from '../data/models/list';
import { SocketHandler, careTaker } from './socket.handler';
import { logger } from '../patterns/observer';

export class ListHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(ListEvent.CREATE, this.createList.bind(this));
    socket.on(ListEvent.RENAME, this.renameList.bind(this));
    socket.on(ListEvent.DELETE, this.deleteList.bind(this));
    socket.on(ListEvent.GET, this.getLists.bind(this));
    socket.on(ListEvent.REORDER, this.reorderLists.bind(this));
  }

  private getLists(callback: (cards: List[]) => void): void {
    const lists = this.db.getData();
    callback(lists);
    // PATTERN: memento
    careTaker.makeBackup(lists);
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

      // PATTERN: memento
      careTaker.makeBackup(reorderedLists);
      // PATTERN: observer
      logger.writeInfo(
        `Lists reordered: sourceIndex=${sourceIndex}, destinationIndex=${destinationIndex}`
      );
    } catch (error) {
      logger.writeError(`Error reordering lists: ${error.message}`);
    }
  }

  private createList(name: string): void {
    try {
      const lists = this.db.getData();
      const newList = new List(name);
      const newLists = lists.concat(newList);
      this.db.setData(newLists);
      this.updateLists();

      // PATTERN: memento
      careTaker.makeBackup(newLists);

      // PATTERN: observer
      logger.writeInfo(`List created: ${name}`);
    } catch (error) {
      logger.writeError(`Error creating list ${name}: ${error.message}`);
    }
  }

  private renameList(listId: string, name: string): void {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.map((list) =>
        list.id === listId ? list.rename(name) : list
      );

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: memento
      careTaker.makeBackup(updatedLists);
      // PATTERN: observer
      logger.writeInfo(`List renamed: ${name}`);
    } catch (error) {
      logger.writeError(`Error renaming list ${name}: ${error.message}`);
    }
  }

  private deleteList(listId: string): void {
    try {
      const lists = this.db.getData();

      const updatedLists = lists.filter((list) => list.id !== listId);

      this.db.setData(updatedLists);
      this.updateLists();

      // PATTERN: memento
      careTaker.makeBackup(updatedLists);
      // PATTERN: observer
      logger.writeInfo(`List deleted: ${listId}`);
    } catch (error) {
      logger.writeError(`Error deleting list ${listId}: ${error.message}`);
    }
  }
}
