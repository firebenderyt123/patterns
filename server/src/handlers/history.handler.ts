import type { Socket } from "socket.io";

import { SocketHandler, careTaker } from "./socket.handler";
import { logger } from "../patterns/observer";
import { HistoryEvent } from "../common/enums/history.enums";

export class HistoryHandler extends SocketHandler {
  public handleConnection(socket: Socket): void {
    socket.on(HistoryEvent.REDO, this.redoHistory.bind(this));
    socket.on(HistoryEvent.UNDO, this.undoHistory.bind(this));
  }

  private redoHistory(): void {
    try {
      // PATTERN: memento
      const lists = careTaker.redo();

      if (!lists) {
        logger.writeError(`Error calling redo command`);
        return;
      }

      this.db.setData(lists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Called redo command`);
    } catch (error) {
      logger.writeError(`Error calling redo command: ${error.message}`);
    }
  }

  private undoHistory(): void {
    try {
      // PATTERN: memento
      const lists = careTaker.undo();

      if (!lists) {
        logger.writeError(`Error calling undo command`);
        return;
      }

      this.db.setData(lists);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Called undo command`);
    } catch (error) {
      logger.writeError(`Error calling undo command: ${error.message}`);
    }
  }
}
