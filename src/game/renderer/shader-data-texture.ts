import { ShaderTexture } from './shader-texture';

// https://stackoverflow.com/questions/60614318/how-to-use-data-textures-in-webgl
// https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
// https://webglfundamentals.org/webgl/lessons/webgl-pulling-vertices.html

export class ShaderDataTexture extends ShaderTexture {
    public imgData: Uint8Array | null = null;
    public width: number;
    public height: number;
    public numberOfElements: number;

    public constructor(width: number, height: number, numberOfElements: number, textureIndex: number) {
        super(textureIndex);

        this.width = width;
        this.height = height;
        this.numberOfElements = numberOfElements;
        this.imgData = new Uint8Array(width * height * numberOfElements);

        Object.seal(this);
    }

    public update(x: number, y: number, r: number, g = 0, b = 0, a = 0): void {
        if (!this.imgData) {
            return;
        }

        const index = (x + y * this.width) * this.numberOfElements;

        switch (this.numberOfElements) {
        case 1:
            this.imgData[index + 0] = r;
            break;
        case 2:
            this.imgData[index + 0] = r;
            this.imgData[index + 1] = g;
            break;
        default:
            this.imgData[index + 0] = r;
            this.imgData[index + 1] = g;
            this.imgData[index + 2] = b;
            this.imgData[index + 3] = a;
            break;
        }
    }

    public create(gl: WebGLRenderingContext): void {
        super.bind(gl);

        let internalFormat = gl.RGBA;

        switch (this.numberOfElements) {
        case 1:
            internalFormat = gl.ALPHA;
            break;
        case 2:
            internalFormat = gl.LUMINANCE_ALPHA;
            break;
        default:
            internalFormat = gl.RGBA;
            break;
        }

        const level = 0;
        const border = 0;
        const format = internalFormat;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this.width, this.height, border,
            format, type, this.imgData);
    }
}
