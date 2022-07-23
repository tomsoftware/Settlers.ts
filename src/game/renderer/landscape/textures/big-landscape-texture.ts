import { ILandscapeTexture, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { LandscapeTextureBase } from './landscape-texture-base';

export class BigLandscapeTexture extends LandscapeTextureBase implements ILandscapeTexture {
    private x = 0;
    private y: number;
    private type: LandscapeType;

    constructor(type: LandscapeType, y: number) {
        super();

        this.y = y * TextureBlockSizeY;
        this.type = type;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        return [this.x + (x % 8) * 2 + 1, this.y + (y % 8)];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [this.x + (x % 8) * 2, this.y + (y % 8)];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }

    public copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        const newPos = this.copyImage(srcImg, destTextureMap, 256, this.x, this.y);
        this.x = newPos.newX;
        this.y = newPos.newY;
    }
}
