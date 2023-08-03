// PATTERN: prototype
interface Prototype {
  clone(): Prototype
}

class PrototypeRegistry {
  private prototypes: { [key: string]: Prototype } = {}

  public registerPrototype(id: string, prototype: Prototype): void {
    this.prototypes[id] = prototype
  }

  public getPrototype(id: string): Prototype | null {
    const prototype = this.prototypes[id]
    return prototype ? prototype.clone() : null
  }
}

const prototypeRegistry = new PrototypeRegistry()

export type { Prototype }
export { prototypeRegistry }
