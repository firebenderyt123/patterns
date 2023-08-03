import { randomUUID } from "crypto";

import { Card } from "./card";
import { Prototype } from "../../patterns/prototype";

class List implements Prototype {
  public id: string;

  public name: string;

  public cards: Card[] = [];

  public constructor(name: string) {
    this.name = name;
    this.id = randomUUID();
  }

  public rename(name: string): List {
    this.name = name;
    return this;
  }

  public setCards(cards: Card[]): List {
    this.cards = cards;
    return this;
  }

  // PATTERN: prototype
  public clone(): List {
    const newList = new List(this.name);
    newList.setCards([...this.cards]);
    return newList;
  }
}

export { List };
