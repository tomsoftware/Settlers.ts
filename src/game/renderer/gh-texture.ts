import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { GhFileReader } from '@/resources/gfx/gh-file-reader';
import { ImageType } from '@/resources/gfx/image-type';
import { ResourceFileProvider } from '@/resources/lib/resource-file-provider';
import { ShaderTexture } from './shader-texture';

// https://stackoverflow.com/questions/57699322/webgl2-render-uint16array-to-canvas-as-an-image
// https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html

export class GhTexture extends ShaderTexture {
    constructor(textureIndex: number) {
        super(textureIndex);

        Object.seal(this);
    }

    public async load(gl: WebGLRenderingContext): Promise<void> {
        const fp = new ResourceFileProvider();
        const imgFile = await fp.loadBinary('gfx/2.gh6');
        const reader = new GhFileReader(imgFile);
        const img = reader.findImageByType<GfxImage16Bit>(ImageType.Image16Bit);

        if (!img) {
            return;
        }

        const imgData = img.getRaw16BitImage();

        const level = 0;
        const internalFormat = gl.RGB;
        const width = img.width;
        const height = img.height;
        const border = 0;
        const format = gl.RGB;
        const type = gl.UNSIGNED_SHORT_5_6_5;

        super.bind(gl);

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
            format, type, imgData);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}
