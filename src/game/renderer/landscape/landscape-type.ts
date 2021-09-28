export enum LandscapeType {
    Water0 = 0,
    Water1 = 1,
    Water2 = 2,
    Water3 = 3,
    Water4 = 4,
    Water5 = 5,
    Water6 = 6,
    Water7 = 7,
    Water8 = 8, // <- bad water?

    Grass = 16,
    GrassDark = 18,

    GrassDry = 24,
    GrassToGrassDry = 25,

    Desert = 64,
    DesertToGras1 = 65,
    DesertToGras2 = 20,

    Beach = 48,

    DustyWay = 28,
    RockyWay = 29,

    Rock = 32,
    RockToGras1 = 33,
    RockToGras2 = 17,

    Swamp = 80,
    SwampToGras1 = 81,
    SwampToGras2 = 21,

    Snow = 128,
    SnowToRock1 = 129,
    SnowToRock2 = 35,

    Mud = 144,
    MudToGras1 = 145,
    MudToGras2 = 23
}
