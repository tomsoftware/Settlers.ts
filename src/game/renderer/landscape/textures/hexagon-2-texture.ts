import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class Hexagon2Texture implements ILandscapeTexture {
    private x: number;
    private y: number;
    private outerType: LandscapeType;
    private innerType: LandscapeType;

    constructor(typeOut: LandscapeType, typeIn: LandscapeType, x: number, y: number) {
        this.x = x * TextureBlockSizeX;
        this.y = y * TextureBlockSizeY;
        this.outerType = typeOut;
        this.innerType = typeIn;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        if (tp.t0 === this.innerType) {
            return [this.x + 2, this.y + 1];
        } else if (tp.t1 === this.innerType) {
            return [this.x + 3, this.y];
        } else {
            return [this.x + 1, this.y];
        }
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        if (tp.t0 === this.innerType) {
            return [this.x + 2, this.y + 1];
        } else if (tp.t1 === this.innerType) {
            return [this.x + 1, this.y];
        } else {
            return [this.x, this.y + 1];
        }
    }

    public getPattern(): TexturePoint[] {
        return [
            new TexturePoint(this.outerType, this.outerType, this.innerType),
            new TexturePoint(this.innerType, this.outerType, this.outerType),
            new TexturePoint(this.outerType, this.innerType, this.outerType)
        ];
    }
}
