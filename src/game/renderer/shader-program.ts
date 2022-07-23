import { LogHandler } from '@/utilities/log-handler';
import { ShaderObject } from './shader-object';

export enum ShaderType {
        VERTEX_SHADER,
        FRAGMENT_SHADER
}

export class ShaderProgram implements ShaderObject {
    private static log = new LogHandler('ShaderProgram');
    private gl: WebGLRenderingContext | null = null;
    private shaders: WebGLShader[] = [];
    private shaderProgram: WebGLProgram | null = null;
    private defines: string[] = [];

    // eslint-disable-next-line camelcase
    private extInstancedArrays: ANGLE_instanced_arrays | null = null;

    constructor() {
        Object.seal(this);
    }

    public init(gl: WebGLRenderingContext): void {
        this.gl = gl;
    }

    private shaderTypeToNumber(shaderType: ShaderType) {
        if (!this.gl) {
            return 0;
        }

        switch (shaderType) {
        case ShaderType.VERTEX_SHADER:
            return this.gl.VERTEX_SHADER;
        case ShaderType.FRAGMENT_SHADER:
            return this.gl.FRAGMENT_SHADER;
        default:
            return 0;
        }
    }

    public create(): boolean {
        if (!this.gl) {
            return false;
        }

        // Create a shader program object to store combined shader program
        this.shaderProgram = this.gl.createProgram();

        if (!this.shaderProgram) {
            ShaderProgram.log.error('Unable to create new shader Program');
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

    public setDefine(defineName: string, value: number | string): void {
        this.defines.push('#define ' + defineName + ' ' + value);
    }

    public setMatrix(name: string, values: Float32Array): void {
        const gl = this.gl;
        if ((!this.shaderProgram) || (!gl)) {
            return;
        }

        const uniformLocation = gl.getUniformLocation(this.shaderProgram, name);

        gl.uniformMatrix4fv(uniformLocation, false, values);
    }

    public setVector2(name: string, a1: number, a2: number): void {
        const gl = this.gl;
        if ((!this.shaderProgram) || (!gl)) {
            return;
        }

        const uniformLocation = gl.getUniformLocation(this.shaderProgram, name);

        gl.uniform2fv(uniformLocation, [a1, a2]);
    }

    public setArrayFloat(name: string, values: Float32Array, size: number, divisor = 0): void {
        if (!this.gl) {
            return;
        }

        this.setAttribute(name, values, size, this.gl.FLOAT, divisor);
    }

    public setArrayShort(name: string, values: Int16Array, size: number, divisor = 0): void {
        if (!this.gl) {
            return;
        }

        this.setAttribute(name, values, size, this.gl.SHORT, divisor);
    }

    public setAttribute(name: string, values: BufferSource, size: number, type: number, divisor: number): void {
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
        if (!this.gl) {
            return null;
        }

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
    public attachShader(src: string, shaderType: ShaderType): boolean {
        if (!this.gl) {
            return false;
        }

        // Create a shader object.
        const newShader = this.gl.createShader(this.shaderTypeToNumber(shaderType));

        if (!newShader) {
            ShaderProgram.log.error('Unable to createShader: ' + shaderType);
            return false;
        }

        // add defines to source
        src = this.defines.join('\n') + '\n' + src;

        // Compile the shader
        this.gl.shaderSource(newShader, src);
        this.gl.compileShader(newShader);

        const compileStatus = !!this.gl.getShaderParameter(newShader, this.gl.COMPILE_STATUS);

        if (!compileStatus) {
            ShaderProgram.log.error('Unable to compile shader:' + this.gl.getShaderInfoLog(newShader));
            return false;
        }

        this.shaders.push(newShader);

        return true;
    }
}
