import { mkdirSync, appendFileSync } from "fs";
import { dirname } from "path";
import { ALL_LOGS_PATH } from "../config/log";
import { LogTypes } from "../common/enums/log.enums";

// PATTERN: observer
interface Publisher {
  subscribe(s: Subscriber): void;
  unsubscribe(s: Subscriber): void;
  notifySubscribers(): void;
}

interface Subscriber {
  getNotification(state: State): void;
}

interface State {
  type: LogTypes;
  message: string;
}

class LogPublisher implements Publisher {
  private subscribers: Subscriber[];

  private state: State;

  public constructor() {
    this.subscribers = [];
  }

  public subscribe(s: Subscriber): void {
    this.subscribers = [...this.subscribers, s];
  }

  public unsubscribe(s: Subscriber): void {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber !== s
    );
  }

  public notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      subscriber.getNotification(this.state);
    });
  }

  private writeLog(state: State): void {
    this.state = state;
    this.notifySubscribers();
  }

  public writeInfo(message: string): void {
    this.writeLog({ type: LogTypes.INFO, message });
  }

  public writeWarning(message: string): void {
    this.writeLog({ type: LogTypes.WARNING, message });
  }

  public writeError(message: string): void {
    this.writeLog({ type: LogTypes.ERROR, message });
  }
}

class LogConsoleSubscriber implements Subscriber {
  getNotification(state: State): void {
    if (state.type === LogTypes.ERROR) console.log(state.message);
  }
}

class LogFileSubscriber extends LogConsoleSubscriber {
  filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
    this.createPath(filePath);
  }

  createPath(filePath: string) {
    try {
      const folderPath = dirname(filePath);
      mkdirSync(folderPath, { recursive: true });
      console.log("Path created successfully.");
    } catch (err) {
      console.error("Error creating path:", err);
    }
  }

  getNotification(state: State): void {
    try {
      const dataToWrite = `${state.type}: ${state.message}\n`;
      appendFileSync(this.filePath, dataToWrite, "utf8");
    } catch (error) {
      console.error(`Error writing state to file: ${error.message}`);
    }
  }
}

const logger = new LogPublisher();

const logConsoleWriter = new LogConsoleSubscriber(); // errors
const logFileWriter = new LogFileSubscriber(ALL_LOGS_PATH); // all

logger.subscribe(logConsoleWriter);
logger.subscribe(logFileWriter);

export type { Publisher, Subscriber };
export { logger };
