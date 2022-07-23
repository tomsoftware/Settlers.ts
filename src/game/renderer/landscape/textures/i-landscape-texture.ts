import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';
import { TexturePoint } from './texture-point';

export const TextureBlockSizeX = 4;
export const TextureBlockSizeY = 2;

export interface ILandscapeTexture {
    getTextureA(tp: TexturePoint, x: number, y: number): [number, number];
    getTextureB(tp: TexturePoint, x: number, y: number): [number, number];
    getPattern(): TexturePoint[];
    addVariant?(x: number, y: number): boolean;
    copyToTextureMap(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit): void;
}
