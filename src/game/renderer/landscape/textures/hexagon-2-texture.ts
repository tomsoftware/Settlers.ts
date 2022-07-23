import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { LandscapeTextureBase } from './landscape-texture-base';

export class Hexagon2Texture extends LandscapeTextureBase implements ILandscapeTexture {
    private x1: number;
    private y1: number;
    private x2: number;
    private y2: number;
    private outerType: LandscapeType;
    private innerType: LandscapeType;
    private useTwo: boolean;

    constructor(typeOut: LandscapeType, typeIn: LandscapeType, x1: number, y1: number, x2?: number, y2?: number) {
        super();

        this.x1 = x1 * TextureBlockSizeX;
        this.y1 = y1 * TextureBlockSizeY;

        if ((x2 != null) && (y2 != null)) {
            this.useTwo = true;
            this.x2 = x2 * TextureBlockSizeX;
            this.y2 = y2 * TextureBlockSizeY;
        } else {
            this.useTwo = false;
            this.x2 = this.x1;
            this.y2 = this.y1;
        }

        this.outerType = typeOut;
        this.innerType = typeIn;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        const use2 = ((x + y) % 2) === 0;
        const useX = use2 ? this.x2 : this.x1;
        const useY = use2 ? this.y2 : this.y1;

        if (tp.t0 === this.innerType) {
            return [useX + 2, useY + 1];
        } else if (tp.t1 === this.innerType) {
            return [useX + 3, useY];
        } else {
            return [useX + 1, useY];
        }
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        const use2 = ((x + y) % 2) === 0;
        const useX = use2 ? this.x2 : this.x1;
        const useY = use2 ? this.y2 : this.y1;

        if (tp.t0 === this.innerType) {
            return [useX + 2, useY + 1];
        } else if (tp.t1 === this.innerType) {
            return [useX + 1, useY];
        } else {
            return [useX, useY + 1];
        }
    }

    public getPattern(): TexturePoint[] {
        return [
            new TexturePoint(this.outerType, this.outerType, this.innerType),
            new TexturePoint(this.innerType, this.outerType, this.outerType),
            new TexturePoint(this.outerType, this.innerType, this.outerType)
        ];
    }

    public copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        let newPos = this.copyImage(srcImg, destTextureMap, 64, this.x1, this.y1);
        this.x1 = newPos.newX;
        this.y1 = newPos.newY;

        if (this.useTwo) {
            newPos = this.copyImage(srcImg, destTextureMap, 64, this.x2, this.y2);
            this.x2 = newPos.newX;
            this.y2 = newPos.newY;
        } else {
            this.x2 = this.x1;
            this.y2 = this.y1;
        }
    }
}
