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
      const state = careTaker.redo();

      if (!state) {
        logger.writeWarning(`No redo history`);
        return;
      }

      this.db.setData(state);
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
      const state = careTaker.undo();

      if (!state) {
        logger.writeWarning(`No undo history`);
        return;
      }

      this.db.setData(state);
      this.updateLists();

      // PATTERN: observer
      logger.writeInfo(`Called undo command`);
    } catch (error) {
      logger.writeError(`Error calling undo command: ${error.message}`);
    }
  }
}
