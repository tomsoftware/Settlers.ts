import { ShaderTexture } from './shader-texture';

// https://stackoverflow.com/questions/60614318/how-to-use-data-textures-in-webgl
// https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
// https://webglfundamentals.org/webgl/lessons/webgl-pulling-vertices.html

export class ShaderDataTexture extends ShaderTexture {
    public imgData: Uint8Array | null = null;
    public width: number;
    public height: number;

    public constructor(width: number, height: number, textureIndex: number) {
        super(textureIndex);

        this.width = width;
        this.height = height;
        this.imgData = new Uint8Array(width * height * 4);

        Object.seal(this);
    }

    public update(x: number, y: number, r: number, g: number, b: number, a: number): void {
        if (!this.imgData) {
            return;
        }

        const index = (x + y * this.width) * 4;

        this.imgData[index + 0] = r;
        this.imgData[index + 1] = g;
        this.imgData[index + 2] = b;
        this.imgData[index + 3] = a;
    }

    public create(gl: WebGLRenderingContext): void {
        super.bind(gl);

        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this.width, this.height, border,
            format, type, this.imgData);
    }
}
