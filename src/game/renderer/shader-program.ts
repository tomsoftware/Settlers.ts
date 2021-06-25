import { LogHandler } from '@/utilities/log-handler';

export enum ShaderType {
		VERTEX_SHADER,
		FRAGMENT_SHADER
}

export class ShaderProgram {
		private readonly log = new LogHandler('ShaderProgram');
		private gl: WebGLRenderingContext;
		private shaders: WebGLShader[] = [];
		private shaderProgram: WebGLProgram | null = null;

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

		public getUniformLocation(name: string): WebGLUniformLocation | null {
			if ((!this.shaderProgram) || (!this.gl)) {
				return null;
			}

			return this.gl.getUniformLocation(this.shaderProgram, name);
		}

		public getAttribLocation(name: string): number {
			if ((!this.shaderProgram) || (!this.gl)) {
				return -1;
			}

			return this.gl.getAttribLocation(this.shaderProgram, name);
		}

		public free():void {
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
		public attachShaders(srcVertex: string, srcFragment: string) {
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
