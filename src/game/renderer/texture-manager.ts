import { ShaderProgram } from './shader-program';

export class TextureManager {
    private textureNames: string[] = [];

    /** create a new texture and returns its index */
    public create(uniformName: string): number {
        return this.textureNames.push(uniformName) - 1;
    }

    /** bind texture slot/unit to uniform name */
    public setShaderProgram(gl: WebGLRenderingContext, sp: ShaderProgram): void {
        for (let i = 0; i < this.textureNames.length; i++) {
            const location = sp.getUniformLocation(this.textureNames[i]);
            gl.uniform1i(location, i);
        }
    }
}
