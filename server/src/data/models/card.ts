import { randomUUID } from "crypto";
import { Prototype, prototypeRegistry } from "../../patterns/prototype";

class Card implements Prototype {
  public id: string;

  public name: string;

  public description: string;

  public createdAt: Date;

  public constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.createdAt = new Date();
    this.id = randomUUID();
    prototypeRegistry.registerPrototype(this.id, this); // PATTERN: prototype
  }

  public rename(name: string) {
    this.name = name;
    return this;
  }

  public changeDescription(description: string) {
    this.description = description;
    return this;
  }

  // PATTERN: prototype
  public clone(): Card {
    return new Card(this.name, this.description);
  }
}

export { Card };
