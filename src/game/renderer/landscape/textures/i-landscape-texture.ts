import { TexturePoint } from './texture-point';

export const TextureBlockSizeX = 4;
export const TextureBlockSizeY = 2;

export interface ILandscapeTexture {
    getTextureA(tp: TexturePoint, x: number, y: number): [number, number];
    getTextureB(tp: TexturePoint, x: number, y: number): [number, number];
    getPattern(): TexturePoint[];
    addVariant?(x: number, y: number): boolean;
}
