// PATTERN: memento

class Snapshot<T> {
  private state: T;

  public constructor(state: T) {
    this.state = state;
  }

  public getState(): T {
    return this.state;
  }
}

class Originator<T> {
  private state: T;

  public save(): Snapshot<T> {
    return new Snapshot(this.state);
  }

  public restore(m: Snapshot<T>): void {
    this.state = m.getState();
  }
}

class CareTaker<T> {
  private originator: Originator<T>;
  private redoHistory: Snapshot<T>[];
  private undoHistory: Snapshot<T>[];

  public constructor(originator: Originator<T>) {
    this.originator = originator;
    this.redoHistory = [];
    this.undoHistory = [];
  }

  public makeBackup(state: T): void {
    this.originator.restore(new Snapshot(state));
    const m = this.originator.save();
    this.undoHistory.push(m);
    this.redoHistory = [];
  }

  public redo(): T | null {
    const nextState = this.redoHistory.pop();
    if (nextState) {
      const currentState = this.originator.save();
      this.undoHistory.push(currentState);
      this.originator.restore(nextState);
      return nextState.getState();
    }
    return null;
  }

  public undo(): T | null {
    const prevState = this.undoHistory.pop();
    if (prevState) {
      const currentState = this.originator.save();
      this.redoHistory.push(currentState);
      this.originator.restore(prevState);
      return prevState.getState();
    }
    return null;
  }
}

export { Originator, CareTaker };
