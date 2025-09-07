import { Component, getArrayForValue, SupportedArrays, TypeNameToArrayType, TypeNameToTypeMap } from "./component";

type ValueType<T extends Record<string, keyof TypeNameToTypeMap>> = Partial<{
  [K in keyof T]: TypeNameToTypeMap[T[K]];
}>;

type ComponentType<T extends Record<string, keyof TypeNameToTypeMap>, K extends keyof T> = Component<TypeNameToArrayType[T[K]]>;


export class Archetype<T extends Record<string, keyof TypeNameToTypeMap>> {
  public key: string;
  public names: Set<string> = new Set();

  private components: Map<keyof T, Component<any>> = new Map();

  /** return the number of entities stored in this Archetype */
  public get length() {
    const first = this.components.values().next().value;
    return first!.length;
  }

  constructor(componentDefinition: T, set: ValueType<T>) {
    this.key = Archetype.generateKey(set);

    // create the components for this archetype
    for (let name of Object.keys(set)) {
      this.names.add(name as string);

      const valueTypeName = componentDefinition[name];
      const array = getArrayForValue(name as string, valueTypeName);
      this.components.set(name, array as any);
    }
  }

  /** return a component with the given name */
  public getComponent<K extends keyof T>(name: K): ComponentType<T, K> {
    return this.components.get(name) as ComponentType<T, K>;
  }

  /** Push a new entity with a set of component-values to this archetype */
  public addComponentSet(set: ValueType<T>) {
    for (const name of Object.keys(set)) {
      this.getComponent(name).push(set[name] as any);
    }
  }

  /**
   *  Remove a entity by the given index from this archetype
   *  Remark: entities are getting swopped to fill up the removed index
  */
  public removeIndex(index: number) {
    for (const component of this.components.values()) {
      // remove the value at the given index
      const lastIndex = component.length - 1;
      if (index !== lastIndex) {
        // move last value to the removed position
        (component as any).internalValue[index] = (component as any).internalValue[lastIndex];
      }
      component.length--;
    }
  }

  /** returns true if this archetype contains all given component names */
  public matchesComponentNames(names: (keyof ValueType<T>)[]): boolean {
    return names.every(name => this.components.has(name));
  }

  /** generates a key for a given set of component names */
  public static generateKey(set: object): string {
    return Object.keys(set).sort().join('|');
  }
}
