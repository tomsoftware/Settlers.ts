import { ShaderProgram } from './shader-program';

export class RendererBase {
    protected shaderProgram: ShaderProgram = new ShaderProgram();

    public initShader(gl: WebGLRenderingContext, vertCode: string, fragCode: string): void {
        this.shaderProgram.init(gl);

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
        sp.setMatrix('projection', projection);
    }
}
