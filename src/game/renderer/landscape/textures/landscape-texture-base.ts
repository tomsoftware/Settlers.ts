import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { TextureMap16Bit } from '../../texture-map-16bit';

export class LandscapeTextureBase {
    protected copyImage(srcImg: GfxImage16Bit, destTextureMap: TextureMap16Bit, width: number, x: number, y: number)
        : { newX : number, newY: number } {
        const dest = destTextureMap.reserve(width, width);

        if (dest == null) {
            return {
                newX: 0,
                newY: 0
            };
        }

        dest.copyFrom(srcImg, x * 16, y * 32, width, width);

        return {
            newX: dest.x / 16,
            newY: dest.y / 32
        };
    }
}
