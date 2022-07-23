import { ILandscapeTexture, TextureBlockSizeX, TextureBlockSizeY } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { LandscapeTextureBase } from './landscape-texture-base';

export class Hexagon3Texture extends LandscapeTextureBase implements ILandscapeTexture {
    private x1: number;
    private y1: number;
    private x2: number;
    private y2: number;
    private t1: LandscapeType;
    private t2: LandscapeType;
    private t3: LandscapeType;

    constructor(t1: LandscapeType, t2: LandscapeType, t3: LandscapeType, x1: number, y1: number, x2: number, y2: number) {
        super();

        this.x1 = x1 * TextureBlockSizeX;
        this.y1 = y1 * TextureBlockSizeY;
        this.x2 = x2 * TextureBlockSizeX;
        this.y2 = y2 * TextureBlockSizeY;

        this.t1 = t1;
        this.t2 = t2;
        this.t3 = t3;
    }

    public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
        const use2 = ((x + y) % 2) === 0;
        const useX = use2 ? this.x2 : this.x1;
        const useY = use2 ? this.y2 : this.y1;

        return [0, 0];

        // todo: fix this
        if (tp.t0 === this.t1) {
            return [useX, useY];
        } else if (tp.t1 === this.t1) {
            return [useX, useY];
        } else {
            return [useX, useY];
        }
    }

    public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
        const use2 = ((x + y) % 2) === 0;
        const useX = use2 ? this.x2 : this.x1;
        const useY = use2 ? this.y2 : this.y1;

        return [0, 0];

        // todo: fix this
        if (tp.t0 === this.t1) {
            return [useX, useY];
        } else if (tp.t1 === this.t1) {
            return [useX, useY];
        } else {
            return [useX, useY];
        }
    }

    public getPattern(): TexturePoint[] {
        return [
            new TexturePoint(this.t1, this.t2, this.t3),
            new TexturePoint(this.t3, this.t1, this.t2),
            new TexturePoint(this.t2, this.t3, this.t1)
        ];
    }

    public copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void {
        let newPos = this.copyImage(srcImg, destTextureMap, 64, this.x1, this.y1);
        this.x1 = newPos.newX;
        this.y1 = newPos.newY;

        newPos = this.copyImage(srcImg, destTextureMap, 64, this.x2, this.y2);
        this.x2 = newPos.newX;
        this.y2 = newPos.newY;
    }
}
