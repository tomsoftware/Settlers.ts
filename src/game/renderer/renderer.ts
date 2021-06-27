import { LogHandler } from '@/utilities/log-handler';
import { IRenderer } from './i-renderer';
import { Matrix } from './landscape/matrix';

// https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript
// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
// https://webglfundamentals.org/webgl/lessons/webgl-instanced-drawing.html

export class Renderer {
		private readonly log = new LogHandler('Renderer');
		private canvas: HTMLCanvasElement;
		private gl: WebGLRenderingContext | null = null;
		private renderers: IRenderer[] = [];
		private animRequest = 0;

		constructor(canvas:HTMLCanvasElement) {
			this.canvas = canvas;
			const newGl = canvas.getContext('webgl');
			if (!newGl) {
				this.log.error('ERROR: Unable to initialize WbGL. Your browser may not support it.');
				return;
			}

			this.gl = newGl;

			Object.seal(this);
		}

		private requestDraw() {
			if (this.animRequest) {
				return;
			}

			this.animRequest = requestAnimationFrame(() => {
				this.animRequest = 0;
				this.draw();
			});
		}

		private draw() {
			const gl = this.gl;
			if (!gl) {
				return;
			}

			// define camera
			const canvas = this.canvas;
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			const aspect = canvas.clientWidth / canvas.clientHeight;
			const projection = Matrix
				.createOrthographic(-aspect, aspect, 1, -1, -1, 1)
				.translate(-9, 9.5, 0)
				.scale(0.1, 0.1, 0.1);

			// draw all renderers
			for (const r of this.renderers) {
				r.draw(gl, projection.mat);
			}

			requestAnimationFrame(() => this.draw);
		}

		/** Starts the animation */
		public async init(): Promise<void> {
			if (!this.gl) {
				return;
			}

			for (const r of this.renderers) {
				await r.init(this.gl);
			}

			this.requestDraw();
		}

		public add(newRenderer: IRenderer): void {
			this.renderers.push(newRenderer);
		}
}
