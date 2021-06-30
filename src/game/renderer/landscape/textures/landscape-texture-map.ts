import { LogHandler } from '@/utilities/log-handler';
import { ILandscapeTexture } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { BigLandscapeTexture } from './big-landscape-texture';
import { Hexagon2Texture } from './hexagon-2-texture';
import { SmallLandscapeTexture } from './small-landscape-texture';
import { Hexagon3Texture } from './hexagon-3-texture';
import { TexturePoint } from './texture-point';

export class LandscapeTextureMap {
    private readonly log = new LogHandler('LandscapeTextureMap');
    private lookup: {[key: number]: ILandscapeTexture} = {};

    private addTexture(text: ILandscapeTexture) {
        const pattern = text.getPattern();

        for (const p of pattern) {
            const key = p.getKey();
            if (this.lookup[key]) {
                this.log.error('Texture type (' + p.t1 + ' ' + p.t2 + ' ' + p.t3 + ') already defined');
                return;
            }

            this.lookup[key] = text;
        }
    }

    constructor() {
        this.addTexture(new BigLandscapeTexture(LandscapeType.GrassLand, 0));
        this.addTexture(new BigLandscapeTexture(LandscapeType.GrassDark, 4));
        this.addTexture(new BigLandscapeTexture(LandscapeType.GrassDry, 8));

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.GrassLand, 0, 12));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.GrassLand, 0, 13));

        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.GrassDark, 1, 12));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.GrassDark, 1, 13));

        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.GrassLand, 2, 12));
        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.GrassLand, 2, 13));

        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.Beach, 3, 12));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.Beach, 3, 13));

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.GrassDry, 0, 14));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassLand, LandscapeType.GrassDry, 0, 15));

        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassLand, 1, 14));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassLand, 1, 15));

        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.GrassDry, 0, 14));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDark, LandscapeType.GrassDry, 0, 15));

        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassDark, 1, 14));
        this.addTexture(new Hexagon2Texture(LandscapeType.GrassDry, LandscapeType.GrassDark, 1, 15));

        // next row
        this.addTexture(new BigLandscapeTexture(LandscapeType.Water7, 16));

        // next row
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water0, 0, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water1, 1, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water2, 2, 20));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water3, 3, 20));

        // next row
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water4, 4, 21));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water5, 5, 21));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water6, 6, 21));
        this.addTexture(new SmallLandscapeTexture(LandscapeType.Water7, 7, 21));

        // next row
        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.Water0, 0, 22));
        this.addTexture(new Hexagon2Texture(LandscapeType.Beach, LandscapeType.Water0, 0, 23));

        this.addTexture(new Hexagon2Texture(LandscapeType.Water0, LandscapeType.Beach, 1, 22));
        this.addTexture(new Hexagon2Texture(LandscapeType.Water0, LandscapeType.Beach, 1, 23));

        // next row
        this.addTexture(new Hexagon3Texture(LandscapeType.Beach, LandscapeType.GrassLand, LandscapeType.Water0, 2, 22));
        this.addTexture(new Hexagon3Texture(LandscapeType.GrassLand, LandscapeType.Beach, LandscapeType.Water0, 3, 23));
        // unknown @ 3, 22
        // unknown @ 3, 23

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
        this.addTexture(new BigLandscapeTexture(LandscapeType.Desert, 28));
        this.addTexture(new BigLandscapeTexture(LandscapeType.Rock, 32));

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
}
