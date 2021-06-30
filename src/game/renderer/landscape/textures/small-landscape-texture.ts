import { ILandscapeTexture, TextureBlockSize } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class SmallLandscapeTexture implements ILandscapeTexture {
    private x: number;
    private y: number;
    private type: LandscapeType;

    constructor(type: LandscapeType, x: number, y: number) {
        this.y = y;
        this.x = x;
        this.type = type;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(this.x + (x % 2)) * TextureBlockSize, (this.y + (y % 2)) * TextureBlockSize];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [(this.x + (x % 2)) * TextureBlockSize, (this.y + (y % 2)) * TextureBlockSize];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }
}
