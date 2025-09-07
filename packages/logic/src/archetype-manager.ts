import { Archetype } from "./archetype";
import { TypeNameToTypeMap } from "./component";


type ValueType<T extends Record<string, keyof TypeNameToTypeMap>> = Partial<{
  [K in keyof T]: TypeNameToTypeMap[T[K]];
}>;

export class ArchetypeManager<T extends Record<string, keyof TypeNameToTypeMap>> {
  private nextId = 1;
  private archetypes: Archetype<T>[];
  private componentDefinition: T;

  constructor(componentDefinition: T) {
    this.archetypes = [];
    this.componentDefinition = componentDefinition;
  }

  public registerComponent(set: ValueType<T>): number {
    let newId = this.nextId++;

    let archetype = this.createArchetype(set);
    archetype.addComponentSet(set);

    return newId;
  }

  private createArchetype(set: ValueType<T>): Archetype<T> {
    let key = Archetype.generateKey(set);
    let archetype = this.findArchetypeByKey(key);
    if (archetype) {
      // archetype already exists -reuse
      return archetype;
    }

    // create new archetype
    archetype = new Archetype(this.componentDefinition, set);
    this.archetypes.push(archetype);

    return archetype;
  }

  private findArchetypeByKey(key: string): Archetype<T> | undefined {
    return this.archetypes.find(a => a.key === key);
  }

  /** Returns all archetypes that uses the given component names list */
  public findArchetypes<K extends keyof T>(
      componentNames: K[]
  ): Archetype<Pick<T, K>>[] {
    let matches = this.archetypes
      .filter(archetype => archetype.matchesComponentNames(componentNames) && archetype.length > 0);
    return matches as unknown as Archetype<Pick<T, K>>[]
  }

  /**
   *  Remove all entities that have the given component with the given value
   *  Remark: entities are getting swopped to fill up the removed index
   **/
  public removeComponent(componentName: keyof T, value: number): number {
    let count = 0;
    const archetypes = this.findArchetypes([componentName]);
    for (const archetype of archetypes) {
      const component = archetype.getComponent(componentName);
      const index = component.indexOf(value as any);
      if (index >= 0) {
        archetype.removeIndex(index);
        count++;
      }
    }
    return count;
  }
}
