import { LogHandler } from '@/utilities/log-handler';
import { IRenderer } from './i-renderer';

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
      const projection = Renderer.orthographic(-aspect, aspect, 1, -1, -1, 1);

      // draw all renderers
      for (const r of this.renderers) {
        r.draw(gl, projection);
      }

      requestAnimationFrame(() => this.draw);
    }

    /** Creates a 4-by-4 orthographic projection matrix */
    public static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number):Float32Array {
      const mat = new Float32Array(16);

      mat[0] = 2 / (right - left);
      mat[1] = 0;
      mat[2] = 0;
      mat[3] = 0;
      mat[4] = 0;
      mat[5] = 2 / (top - bottom);
      mat[6] = 0;
      mat[7] = 0;
      mat[8] = 0;
      mat[9] = 0;
      mat[10] = 2 / (near - far);
      mat[11] = 0;
      mat[12] = (left + right) / (left - right);
      mat[13] = (bottom + top) / (bottom - top);
      mat[14] = (near + far) / (near - far);
      mat[15] = 1;

      return mat;
    }

    /** Starts the animation */
    public init() {
      if (!this.gl) {
        return;
      }

      for (const r of this.renderers) {
        r.init(this.gl);
      }

      this.requestDraw();
    }

    public add(newRenderer: IRenderer) {
      this.renderers.push(newRenderer);
    }
}
