import { LogHandler } from '@/utilities/log-handler';
import { ShaderObject } from './shader-object';

export enum ShaderType {
        VERTEX_SHADER,
        FRAGMENT_SHADER
}

export class ShaderProgram implements ShaderObject {
    private readonly log = new LogHandler('ShaderProgram');
    private gl: WebGLRenderingContext;
    private shaders: WebGLShader[] = [];
    private shaderProgram: WebGLProgram | null = null;
    // eslint-disable-next-line camelcase
    private extInstancedArrays: ANGLE_instanced_arrays | null = null;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        Object.seal(this);
    }

    private shaderTypeToNumber(shaderType: ShaderType) {
        switch (shaderType) {
        case ShaderType.VERTEX_SHADER:
            return this.gl.VERTEX_SHADER;
        case ShaderType.FRAGMENT_SHADER:
            return this.gl.FRAGMENT_SHADER;
        default:
            return 0;
        }
    }

    public create():boolean {
        // Create a shader program object to store combined shader program
        this.shaderProgram = this.gl.createProgram();

        if (!this.shaderProgram) {
            this.log.error('Unable to create new shader Program');
            return false;
        }

        // Attach all shaders
        for (const s of this.shaders) {
            this.gl.attachShader(this.shaderProgram, s);
        }

        // Link programs
        this.gl.linkProgram(this.shaderProgram);

        return true;
    }

    public use(): void {
        if ((!this.shaderProgram) || (!this.gl)) {
            return;
        }

        // Use the shader program object
        this.gl.useProgram(this.shaderProgram);
    }

    public setMatrix(name: string, values: Float32Array): void {
        const gl = this.gl;
        if ((!this.shaderProgram) || (!gl)) {
            return;
        }

        const uniformLocation = gl.getUniformLocation(this.shaderProgram, name);

        gl.uniformMatrix4fv(uniformLocation, false, values);
    }

    public setArrayFloat(name: string, values: Float32Array, size: number, divisor = 0): void {
        this.setUniform(name, values, size, this.gl.FLOAT, divisor);
    }

    public setArrayShort(name: string, values: Int16Array, size: number, divisor = 0): void {
        this.setUniform(name, values, size, this.gl.SHORT, divisor);
    }

    public setUniform(name: string, values: BufferSource, size: number, type: number, divisor: number): void {
        const gl = this.gl;
        if ((!this.shaderProgram) || (!gl)) {
            return;
        }

        const attribLocation = gl.getAttribLocation(this.shaderProgram, name);
        gl.enableVertexAttribArray(attribLocation);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);

        gl.vertexAttribPointer(attribLocation, size, type, false, 0, 0);

        if (divisor) {
            const extInstancedArrays = this.getAngleInstancedArrayExtension();
            if (extInstancedArrays) {
                // this line says this attribute only changes for each 1 instance
                extInstancedArrays.vertexAttribDivisorANGLE(attribLocation, divisor);
            }
        }
    }

    // eslint-disable-next-line camelcase
    public getAngleInstancedArrayExtension(): ANGLE_instanced_arrays | null {
        if (this.extInstancedArrays != null) {
            return this.extInstancedArrays;
        }

        this.extInstancedArrays = this.gl.getExtension('ANGLE_instanced_arrays');
        if (!this.extInstancedArrays) {
            return null;
        }

        return this.extInstancedArrays;
    }

    public bindTexture(name: string, textureId: number): void {
        if ((!this.shaderProgram) || (!this.gl)) {
            return;
        }

        const location = this.gl.getUniformLocation(this.shaderProgram, name);

        this.gl.uniform1i(location, textureId);
    }

    public free(): void {
        if (!this.gl) {
            return;
        }

        if (this.shaderProgram) {
            this.gl.deleteProgram(this.shaderProgram);
        }

        while (this.shaders.length > 0) {
            const s = this.shaders.pop();
            if (s) {
                this.gl.deleteShader(s);
            }
        }
    }

    /**
     * setup, compiles shaders and links GLSL program
     */
    public attachShaders(srcVertex: string, srcFragment: string): boolean {
        const r1 = this.attachShader(srcVertex, ShaderType.VERTEX_SHADER);
        const r2 = this.attachShader(srcFragment, ShaderType.FRAGMENT_SHADER);

        return r1 && r2;
    }

    /**
     * setup, compiles one shader and links GLSL program
     */
    public attachShader(src: string, shaderType: ShaderType) : boolean {
        // Create a shader object.
        const newShader = this.gl.createShader(this.shaderTypeToNumber(shaderType));

        if (!newShader) {
            this.log.error('Unable to createShader: ' + shaderType);
            return false;
        }

        // Compile the shader
        this.gl.shaderSource(newShader, src);
        this.gl.compileShader(newShader);

        const compileStatus = !!this.gl.getShaderParameter(newShader, this.gl.COMPILE_STATUS);

        if (!compileStatus) {
            this.log.error('Unable to compile shader:' + this.gl.getShaderInfoLog(newShader));
            return false;
        }

        this.shaders.push(newShader);

        return true;
    }
}
