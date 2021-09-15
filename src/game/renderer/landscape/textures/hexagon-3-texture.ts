import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class Hexagon3Texture implements ILandscapeTexture {
    private x: number;
    private y: number;
    private t1: LandscapeType;
    private t2: LandscapeType;
    private t3: LandscapeType;

    constructor(t1: LandscapeType, t2: LandscapeType, t3: LandscapeType, x: number, y: number) {
        this.x = x * TextureBlockSizeX;
        this.y = y * TextureBlockSizeY;
        this.t1 = t1;
        this.t2 = t2;
        this.t3 = t3;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [0, 0];
        if (tp.t0 === this.t1) {
            return [this.x, this.y];
        } else if (tp.t1 === this.t1) {
            return [this.x, this.y];
        } else {
            return [this.x, this.y];
        }
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [0, 0];
        if (tp.t0 === this.t1) {
            return [this.x, this.y];
        } else if (tp.t1 === this.t1) {
            return [this.x, this.y];
        } else {
            return [this.x, this.y];
        }
    }

    public getPattern(): TexturePoint[] {
        return [
            new TexturePoint(this.t1, this.t2, this.t3),
            new TexturePoint(this.t3, this.t1, this.t2),
            new TexturePoint(this.t2, this.t3, this.t1)
        ];
    }
}
