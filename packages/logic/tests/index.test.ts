import { describe, it, expect } from 'vitest';
import { ArchetypeManager } from '../src/index';

const ComponentTypeDefinition = {
  entityId: 'Int32',
  position: 'Int16',
  owner: 'Int8',
  health: 'Float32',
  name: 'String',
} as const;


describe('ArchetypeManager', () => {
  it('findArchetypes returns registerComponent', () => {
    let manager = new ArchetypeManager(ComponentTypeDefinition);

    manager.registerComponent({ position: 1 });
    manager.registerComponent({ position: 2, owner: 3 });
    manager.registerComponent({ position: 4, owner: 5 });
    manager.registerComponent({ owner: 7, position: 6 });
    manager.registerComponent({ owner: 9, position: 11, health: 100 });

    let archetypes1 = manager.findArchetypes(['position', 'owner']);

    expect(archetypes1.length).toBe(2);
    expect(archetypes1[0].getComponent('position').value).toEqual(new Int16Array([2, 4, 6]));
    expect(archetypes1[0].getComponent('owner').value).toEqual(new Int8Array([3, 5, 7]));
    expect(archetypes1[1].getComponent('position').value).toEqual(new Int16Array([11]));
    expect(archetypes1[1].getComponent('owner').value).toEqual(new Int8Array([9]));

    let archetypes2 = manager.findArchetypes(['position']);

    expect(archetypes2.length).toBe(3);
    expect(archetypes2[0].getComponent('position').toArray()).toEqual([1]);
    expect(archetypes2[1].getComponent('position').toArray()).toEqual([2, 4, 6]);
    expect(archetypes2[2].getComponent('position').toArray()).toEqual([11]);


    let archetypes3 = manager.findArchetypes(['health']);

    expect(archetypes3.length).toBe(1);
    expect(archetypes3[0].getComponent('health')?.toArray()).toEqual([100]);


    let archetypes4 = manager.findArchetypes(['name']);

    expect(archetypes4.length).toBe(0);
  });



  it('findArchetypes not returns removed items', () => {
    let manager = new ArchetypeManager(ComponentTypeDefinition);

    manager.registerComponent({ position: 1 });
    manager.registerComponent({ position: 2, owner: 3 });
    manager.registerComponent({ position: 4, owner: 5 });
    manager.registerComponent({ owner: 7, position: 6 });
    manager.registerComponent({ owner: 9, position: 11, health: 100 });


    manager.removeComponent('position', 1);

    let archetypes2 = manager.findArchetypes(['position']);

    expect(archetypes2.length).toBe(2);
    expect(archetypes2[0].getComponent('position').value).toEqual(new Int16Array([2, 4, 6]));
    expect(archetypes2[1].getComponent('position').toArray()).toEqual([11]);
  });
});
