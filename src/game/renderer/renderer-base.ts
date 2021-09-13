import { ShaderProgram } from './shader-program';
import { TextureManager } from './texture-manager';

export class RendererBase {
    protected shaderProgram: ShaderProgram | null = null;
    protected textureManager: TextureManager = new TextureManager();

    public initBase(gl: WebGLRenderingContext, vertCode: string, fragCode: string): void {
        this.shaderProgram = new ShaderProgram(gl);

        this.shaderProgram.attachShaders(vertCode, fragCode);

        this.shaderProgram.create();
    }

    public drawBase(gl: WebGLRenderingContext, projection: Float32Array): void {
        const sp = this.shaderProgram;
        if (!sp) {
            return;
        }

        // activate shader
        sp.use();

        const projectionLoc = sp.getUniformLocation('projection');
        gl.uniformMatrix4fv(projectionLoc, false, projection);
    }
}
