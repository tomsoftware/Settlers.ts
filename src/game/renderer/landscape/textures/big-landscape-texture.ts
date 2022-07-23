import { ILandscapeTexture, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { LandscapeTextureBase } from './landscape-texture-base';

/**
 * Defines a landscape texture with the size 256x256 that has only one LandscapeType
 */
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
        return [this.x + (x % 8) * 2 + 2, this.y + (y % 8)];
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        return [this.x + (x % 8) * 2 + 2, this.y + (y % 8)];
    }

    public getPattern(): TexturePoint[] {
        return [new TexturePoint(this.type, this.type, this.type)];
    }

    public copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        const repeatWidth = 32;
        const dest = destTextureMap.reserve(256 + repeatWidth, 256);

        if (dest == null) {
            this.x = 0;
            this.y = 0;
            return;
        }

        dest.copyFrom(srcImg, this.x * 16, this.y * 32, 256, 256);

        // we also copy the front part of the texture to the end so we are able to
        //  fake GL_REPEAT when we address texture on the right part
        dest.copyFrom(srcImg, this.x * 16, this.y * 32, repeatWidth, 256, 256);

        this.x = dest.x / 16;
        this.y = dest.y / 32;
    }
}
