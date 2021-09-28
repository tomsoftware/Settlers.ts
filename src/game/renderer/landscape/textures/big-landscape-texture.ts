import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class BigLandscapeTexture implements ILandscapeTexture {
    private y: number;
    private type: LandscapeType;

    constructor(type: LandscapeType, y: number) {
        this.y = y * TextureBlockSizeY;
        this.type = type;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(x % 8) * 2 + 1, this.y + (y % 8)];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(x % 8) * 2, this.y + (y % 8)];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }
}
