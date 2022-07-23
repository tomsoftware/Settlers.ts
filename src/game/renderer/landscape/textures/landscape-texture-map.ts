import { LogHandler } from '@/utilities/log-handler';
import { ILandscapeTexture } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { BigLandscapeTexture } from './big-landscape-texture';
import { Hexagon2Texture } from './hexagon-2-texture';
import { SmallLandscapeTexture } from './small-landscape-texture';
import { Hexagon3Texture } from './hexagon-3-texture';
import { TexturePoint } from './texture-point';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';

export class LandscapeTextureMap {
    private static log = new LogHandler('LandscapeTextureMap');
    private lookup: {[key: number]: ILandscapeTexture} = {};
    private textures: ILandscapeTexture[] = [];

    private addTexture(text: ILandscapeTexture) {
        this.textures.push(text);

        const pattern = text.getPattern();

        for (const p of pattern) {
            const key = p.getKey();
            if (this.lookup[key]) {
                LandscapeTextureMap.log.error('Texture type (' + p.toString() + ') already defined');
                return;
            }

            this.lookup[key] = text;
        }
    }

    private addTextureGradient1(type1: LandscapeType, type2: LandscapeType, type3: LandscapeType, type4: LandscapeType, row: number) {
        // Using Hexagon2Texture for SmallLandscapeTexture!
        this.addTexture(new SmallLandscapeTexture(type2, 0, row));
        this.addTexture(new SmallLandscapeTexture(type3, 1, row));

        this.addTexture(new Hexagon2Texture(type1, type2, 2, row, 2, row + 1));
        this.addTexture(new Hexagon2Texture(type2, type1, 3, row, 3, row + 1));

        // empty: @ 0, row + 1
        // empty: @ 1, row + 1
        // variation: Hexagon2Texture(type1, type2, 2, row + 1)
        // variation: Hexagon2Texture(type2, type1, 3, row + 1)

        // next row
        this.addTexture(new Hexagon2Texture(type2, type3, 0, row + 2, 0, row + 3));
        this.addTexture(new Hexagon2Texture(type3, type2, 1, row + 2, 1, row + 3));
        this.addTexture(new Hexagon2Texture(type3, type4, 2, row + 2, 2, row + 3));
        this.addTexture(new Hexagon2Texture(type4, type3, 3, row + 2, 3, row + 3));

        // next row
        // variation: Hexagon2Texture(type2, type3, 0, row + 3)
        // variation: Hexagon2Texture(type3, type2, 1, row + 3)
        // variation: Hexagon2Texture(type3, type4, 2, row + 3)
        // variation: Hexagon2Texture(type4, type3, 3, row + 3)
    }

    private addTextureGradient2(type1: LandscapeType, type2: LandscapeType, type3: LandscapeType, type4: LandscapeType, row: number) {
        // Using Hexagon2Texture for SmallLandscapeTexture!
        this.addTexture(new SmallLandscapeTexture(type2, 0, row)); /// todo: add variation
        this.addTexture(new SmallLandscapeTexture(type3, 1, row)); /// todo: add variation

        this.addTexture(new Hexagon2Texture(type4, type3, 2, row, 2, row + 1));
        this.addTexture(new Hexagon2Texture(type3, type4, 3, row, 3, row + 1));

        // empty: @ 0, row + 1
        // empty: @ 1, row + 1
        // variation: Hexagon2Texture(type4, type3, 2, row + 1)
        // variation: Hexagon2Texture(type3, type4, 3, row + 1)

        // next row
        this.addTexture(new Hexagon2Texture(type2, type3, 0, row + 2, 0, row + 3));
        this.addTexture(new Hexagon2Texture(type3, type2, 1, row + 2, 1, row + 3));
        this.addTexture(new Hexagon2Texture(type1, type2, 2, row + 2, 2, row + 3));
        this.addTexture(new Hexagon2Texture(type2, type1, 3, row + 2, 3, row + 3));

        // next row
        // variation: Hexagon2Texture(type2, type3, 0, row + 3)
        // variation: Hexagon2Texture(type3, type2, 1, row + 3)
        // variation: Hexagon2Texture(type1, type2, 2, row + 3)
        // variation: Hexagon2Texture(type2, type1, 3, row + 3)
    }

    private addTextureGradient3(type1: LandscapeType, type2: LandscapeType, type3: LandscapeType, type4: LandscapeType, row: number) {
        // Using Hexagon2Texture for SmallLandscapeTexture!
        this.addTexture(new SmallLandscapeTexture(type2, 0, row)); /// todo: add variation
        this.addTexture(new SmallLandscapeTexture(type3, 1, row)); /// todo: add variation

        this.addTexture(new Hexagon2Texture(type3, type4, 2, row, 2, row + 1));
        this.addTexture(new Hexagon2Texture(type4, type3, 3, row, 3, row + 1));

        // empty: @ 0, row + 1
        // empty: @ 1, row + 1
        // variation: Hexagon2Texture(type3, type4, 2, row + 1)
        // variation: Hexagon2Texture(type4, type3, 3, row + 1)

        // next row
        this.addTexture(new Hexagon2Texture(type2, type3, 0, row + 2, 0, row + 3));
        this.addTexture(new Hexagon2Texture(type3, type2, 1, row + 2, 1, row + 3));
        this.addTexture(new Hexagon2Texture(type1, type2, 2, row + 2, 2, row + 3));
        this.addTexture(new Hexagon2Texture(type2, type1, 3, row + 2, 3, row + 3));

        // next row
        // variation: Hexagon2Texture(type2, type3, 0, row + 3)
        // variation: Hexagon2Texture(type3, type2, 1, row + 3)
        // variation: Hexagon2Texture(type1, type2, 2, row + 3)
        // variation: Hexagon2Texture(type2, type1, 3, row + 3)
    }

    constructor() {
        this.addTexture(new BigLandscapeTexture(LandscapeType.Grass, 0));
        this.addTexture(new BigLandscapeTexture(LandscapeType.GrassDark, 4));
        this.addTexture(new BigLandscapeTexture(LandscapeType.GrassDry, 8));

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.Grass, LandscapeType.GrassToGrassDry, 0, 12, 0, 13));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassToGrassDry, LandscapeType.Grass, 1, 12, 1, 13));
        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.Grass, 2, 12, 2, 13));
        this.addTexture(new Hexagon2Texture(LandscapeType.Grass, LandscapeType.Beach, 3, 12, 3, 13));

        // variation: Hexagon2Texture(LandscapeType.Grass, LandscapeType.GrassToGrassDry, 0, 13)
        // variation: Hexagon2Texture(LandscapeType.GrassToGrassDry, LandscapeType.Grass, 1, 13)
        // variation: Hexagon2Texture(LandscapeType.Beach, LandscapeType.Grass, 2, 13)
        // variation: Hexagon2Texture(LandscapeType.Grass, LandscapeType.Beach, 3, 13)

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassToGrassDry, LandscapeType.GrassDry, 0, 14, 0, 15));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassToGrassDry, 1, 14, 1, 15));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.Grass, 0, 14, 0, 15));
        this.addTexture(new Hexagon2Texture(LandscapeType.Grass, LandscapeType.GrassDark, 1, 14, 1, 15));

        // variation: Hexagon2Texture(LandscapeType.GrassToGrassDry, LandscapeType.GrassDry, 0, 15)
        // variation: Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassToGrassDry, 1, 15)
        // variation: Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.Grass, 0, 15)
        // variation: Hexagon2Texture(LandscapeType.Grass, LandscapeType.GrassDark, 1, 15)

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Water7, 16));

        // next row
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water0, 0, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water1, 1, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water2, 2, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water3, 3, 20));

        // next row
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water4, 0, 21));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water5, 1, 21));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water6, 2, 21));
        // variation: SmallLandscapeTexture(LandscapeType.Water7, 3, 21) // not sure why this exists

        // [beach] --> [water]
        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.Water0, 0, 22, 0, 23));
        // variation: Hexagon2Texture(LandscapeType.Beach, LandscapeType.Water0, 0, 23)
        this.addTexture(new Hexagon2Texture(LandscapeType.Water0, LandscapeType.Beach, 1, 22, 1, 23));
        // variation: Hexagon2Texture(LandscapeType.Water0, LandscapeType.Beach, 1, 23)

        this.addTexture(new Hexagon3Texture(LandscapeType.Beach, LandscapeType.Grass, LandscapeType.Water0, 2, 22, 3, 22));
        // variation: Hexagon3Texture(LandscapeType.Beach, LandscapeType.Grass, LandscapeType.Water0, 3, 22)

        this.addTexture(new Hexagon3Texture(LandscapeType.Grass, LandscapeType.Beach, LandscapeType.Water0, 2, 23, 3, 23));
        // variation: Hexagon3Texture(LandscapeType.Grass, LandscapeType.Beach, LandscapeType.Water0, 3, 23)

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.Water0, LandscapeType.Water1, 0, 24));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water1, LandscapeType.Water2, 1, 24));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water2, LandscapeType.Water3, 2, 24));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water3, LandscapeType.Water4, 3, 24));

        this.addTexture(new Hexagon2Texture(LandscapeType.Water1, LandscapeType.Water0, 0, 25));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water2, LandscapeType.Water1, 1, 25));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water3, LandscapeType.Water2, 2, 25));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water4, LandscapeType.Water3, 3, 25));

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.Water4, LandscapeType.Water5, 0, 26));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water5, LandscapeType.Water6, 1, 26));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water6, LandscapeType.Water7, 2, 26));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water7, LandscapeType.Water8, 2, 26)); // bad @ 3, 26 -> fake cause this is missing?

        this.addTexture(new Hexagon2Texture(LandscapeType.Water5, LandscapeType.Water4, 0, 27));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water6, LandscapeType.Water5, 1, 27));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water7, LandscapeType.Water6, 2, 27));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water8, LandscapeType.Water7, 2, 27));// bad @ 3, 27 -> fake cause this is missing?

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Beach, 28));
        this.addTexture(new BigLandscapeTexture(LandscapeType.Rock, 32));

        // next row
        // [grass] 16 -> 17 -> 33 -> 32 [rock] @ 36..39
        this.addTextureGradient1(LandscapeType.Grass, LandscapeType.RockToGras2, LandscapeType.RockToGras1, LandscapeType.Rock, 36);

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Desert, 40));

        // https://github.com/tomsoftware/sied3/blob/master/src/clTexturesLoadHelper.cpp
        // [grass] 16 -> 20 -> 65 -> 64 [desert] @ 44..47
        this.addTextureGradient3(LandscapeType.Grass, LandscapeType.DesertToGras2, LandscapeType.DesertToGras1, LandscapeType.Desert, 44);

        // ///////
        // [mud] 80 -> 81 -> 21 -> 16 [gras] @ 48..51
        this.addTextureGradient2(LandscapeType.Grass, LandscapeType.MudToGras2, LandscapeType.MudToGras1, LandscapeType.Mud, 48);

        this.addTexture(new BigLandscapeTexture(LandscapeType.Mud, 52));

        // ///////
        // [swamp] 80 -> 81 -> 21 -> 16 [gras] @ 56..59
        this.addTextureGradient1(LandscapeType.Grass, LandscapeType.SwampToGras2, LandscapeType.SwampToGras1, LandscapeType.Swamp, 56);

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Swamp, 60));

        // ///////
        // [rock] 32 -> 35 -> 129 -> 128 [ice] @ 64..67
        this.addTextureGradient1(LandscapeType.Rock, LandscapeType.SnowToRock2, LandscapeType.SnowToRock1, LandscapeType.Snow, 64);

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Snow, 68));

        // todo: next row (river <-> gras) 72..75
        // todo: next row (?? <-> gras) 76..79

        this.addTexture(new Hexagon2Texture(LandscapeType.DustyWay, LandscapeType.Grass, 0, 76, 0, 77));
        this.addTexture(new Hexagon2Texture(LandscapeType.Grass, LandscapeType.DustyWay, 1, 76, 1, 77));
        this.addTexture(new Hexagon2Texture(LandscapeType.RockyWay, LandscapeType.Grass, 2, 76, 2, 77));
        this.addTexture(new Hexagon2Texture(LandscapeType.Grass, LandscapeType.RockyWay, 3, 76, 3, 77));

        // variation: Hexagon2Texture(LandscapeType.DustyWay, LandscapeType.Grass, 0, 77));
        // variation: Hexagon2Texture(LandscapeType.Grass, LandscapeType.DustyWay, 1, 77));
        // variation: Hexagon2Texture(LandscapeType.RockyWay, LandscapeType.Grass, 2, 77));
        // variation: Hexagon2Texture(LandscapeType.Grass, LandscapeType.RockyWay, 3, 77));
        // empty @ 78
        // empty @ 79

        this.addTexture(new BigLandscapeTexture(LandscapeType.DustyWay, 80));
        this.addTexture(new BigLandscapeTexture(LandscapeType.RockyWay, 84));

        Object.seal(this);
    }

    public getTextureA(t1: LandscapeType, t2: LandscapeType, t3: LandscapeType, x: number, y: number): [number, number] {
        const tp = new TexturePoint(t1, t2, t3);
        const text = this.lookup[tp.getKey()];
        if (!text) {
            return [0, 0];
        }

        return text.getTextureA(tp, x, y);
    }

    public getTextureB(t4: LandscapeType, t5: LandscapeType, t6: LandscapeType, x: number, y: number): [number, number] {
        const tp = new TexturePoint(t4, t5, t6);
        const text = this.lookup[tp.getKey()];
        if (!text) {
            return [0, 0];
        }

        return text.getTextureB(tp, x, y);
    }

    /** copy all textures to the TextureMap */
    public copyTexture(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        for (const t of this.textures) {
            t.copyToTextureMap(srcImg, destTextureMap);
        }
    }
}
