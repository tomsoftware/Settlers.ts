import { LogHandler } from '@/utilities/log-handler';
import { ShaderProgram } from './shader-program';

/** Manages and maps the Textures used in by the shader */
export class TextureManager {
    private static log = new LogHandler('TextureManager');
    private textureNames: string[] = [];

    /** create a new texture and returns it's texture-index */
    public create(uniformName: string): number {
        return this.textureNames.push(uniformName) - 1;
    }

    /** bind texture slot/unit to uniform name */
    public bindToShader(gl: WebGLRenderingContext, sp: ShaderProgram): void {
        TextureManager.log.debug('textureNames: ' + this.textureNames.join(', '));

        for (let i = 0; i < this.textureNames.length; i++) {
            sp.bindTexture(this.textureNames[i], i);
        }
    }
}
