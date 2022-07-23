import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { LandscapeTextureBase } from './landscape-texture-base';

/**
 * Defines a landscape texture with the size 64x64 that has only one LandscapeType
 */
export class SmallLandscapeTexture extends LandscapeTextureBase implements ILandscapeTexture {
    private x: number;
    private y: number;
    private type: LandscapeType;

    constructor(type: LandscapeType, x: number, y: number) {
        super();
        this.x = x * TextureBlockSizeX;
        this.y = y * TextureBlockSizeY;
        this.type = type;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [this.x + (x % 2) * 2 + 1, this.y + (y % 2)];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [this.x + (x % 2) * 2, this.y + (y % 2)];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }

    public copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        const newPos = this.copyImage(srcImg, destTextureMap, 64, this.x, this.y);

        this.x = newPos.newX;
        this.y = newPos.newY;
    }
}
