import { List } from "../data/models/list";

// PATTERN: memento
type State = List[];
class Memento {
  private state: State;

  public constructor(state: State) {
    this.state = state;
  }

  public getState(): State {
    return this.state;
  }
}

class Originator {
  private state: State;

  public save(): Memento {
    if (this.state) {
      return new Memento(this.state.map((list) => list.clone()));
    }
    throw new Error("Originator has no state.");
  }

  public restore(m: Memento): void {
    this.state = m.getState();
  }
}

class History {
  private history: Memento[];
  private currentIndex: number;

  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  public add(m: Memento): void {
    this.history = [...this.history.slice(0, ++this.currentIndex), m];
    console.log(this.currentIndex, this.history.length);
  }

  public next(): Memento {
    console.log(this.currentIndex + 1, this.history.length);
    if (this.currentIndex + 1 >= this.history.length)
      throw new Error("Next history error");
    return this.history[++this.currentIndex];
  }

  public prev(): Memento {
    console.log(this.currentIndex - 1, this.history.length);
    if (this.currentIndex - 1 < 0) throw new Error("Prev history error");
    return this.history[--this.currentIndex];
  }
}

class CareTaker {
  private originator: Originator;
  private history: History;

  public constructor(originator: Originator) {
    this.originator = originator;
    this.history = new History();
  }

  public makeBackup(state: State): void {
    this.originator.restore(new Memento(state));

    this.history.add(this.originator.save());
  }

  public redo(): State {
    const nextMemento = this.history.next();
    this.originator.restore(nextMemento);
    return this.originator.save().getState();
  }

  public undo(): State {
    const prevMemento = this.history.prev();
    this.originator.restore(prevMemento);
    return this.originator.save().getState();
  }
}

export { Originator, CareTaker };
