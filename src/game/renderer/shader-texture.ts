import { ShaderObject } from './shader-object';

// https://stackoverflow.com/questions/60614318/how-to-use-data-textures-in-webgl
// https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
// https://webglfundamentals.org/webgl/lessons/webgl-pulling-vertices.html

export class ShaderTexture implements ShaderObject {
    protected texture: WebGLTexture | null = null;
    private gl: WebGLRenderingContext | null = null;
    private textureIndex: number;

    public constructor(textureIndex: number) {
        this.textureIndex = textureIndex;
    }

    protected bind(gl: WebGLRenderingContext): void {
        this.gl = gl;

        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + this.textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.texture = texture;
    }

    public free(): void {
        if (!this.gl) {
            return;
        }

        this.gl.deleteTexture(this.texture);
    }
}
