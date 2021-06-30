import { ILandscapeTexture, TextureBlockSize } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class BigLandscapeTexture implements ILandscapeTexture {
    private y: number;
    private type: LandscapeType;

    constructor(type: LandscapeType, y: number) {
        this.y = y;
        this.type = type;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(x % 4) * TextureBlockSize, (this.y + (y % 4)) * TextureBlockSize];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(x % 4) * TextureBlockSize, (this.y + (y % 4)) * TextureBlockSize];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }
}
