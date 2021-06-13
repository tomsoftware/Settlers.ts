import { LogHandler } from '@/utilities/log-handler';
import { ShaderProgram } from './shader-program';
import vertCode from './test-vert.glsl';
import fragCode from './test-frag.glsl';

// https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript
// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
// https://webglfundamentals.org/webgl/lessons/webgl-instanced-drawing.html

export class Renderer {
    private readonly log = new LogHandler('Renderer');
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private shaderProgram: ShaderProgram | null = null;
    private animRequest = 0;

    constructor(canvas:HTMLCanvasElement) {
      this.canvas = canvas;
      const newGl = canvas.getContext('webgl');
      if (!newGl) {
        this.log.error('ERROR: Unable to initialize WbGL. Your browser may not support it.');
        return;
      }

      this.gl = newGl;
      this.shaderProgram = new ShaderProgram(newGl);

      this.initShaders();

      Object.seal(this);
    }

    private initShaders() {
      if ((!this.shaderProgram) || (!this.gl)) {
        return;
      }

      this.shaderProgram.attachShaders(vertCode, fragCode);

      this.shaderProgram.create();

      this.shaderProgram.use();
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
      if ((!this.gl) || (!this.shaderProgram)) {
        return;
      }
      const gl = this.gl;
      const sp = this.shaderProgram;

      const ext = gl.getExtension('ANGLE_instanced_arrays');
      if (!ext) {
        return alert('need ANGLE_instanced_arrays');  // eslint-disable-line
      }

      // activate shader
      sp.use();

      const numVertices = 6;
      // setup matrices, one per instance
      const numInstances = 5;

      // define vertex
      const positionLoc = sp.getAttribLocation('a_position');
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        -0.5, 1.0,
        0.5, 1.0,

        0.0, 0.0,
        0.5, 1.0,
        1.0, 0.0
      ]), gl.STATIC_DRAW);

      // ///////////
      // define color
      const colorLoc = sp.getAttribLocation('color');

      // setup colors, one per instance
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
          1, 0, 0, 1, // red
          0, 1, 0, 1, // green
          0, 0, 1, 1, // blue
          1, 0, 1, 1, // magenta
          0, 1, 1, 1 // cyan
        ]),
        gl.STATIC_DRAW);

      // set attribute for color
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
      // this line says this attribute only changes for each 1 instance
      ext.vertexAttribDivisorANGLE(colorLoc, 1);

      // ///////////
      // define color
      const mapPos = sp.getAttribLocation('map_pos');

      // setup colors, one per instance
      const mapPosBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mapPosBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Int16Array([
          0, 0,
          1, 0,
          2, 0,
          0, 1,
          1, 1
        ]),
        gl.STATIC_DRAW);

      // set attribute for color
      gl.bindBuffer(gl.ARRAY_BUFFER, mapPosBuffer);
      gl.enableVertexAttribArray(mapPos);
      gl.vertexAttribPointer(mapPos, 2, gl.SHORT, false, 0, 0);

      // this line says this attribute only changes for each 1 instance
      ext.vertexAttribDivisorANGLE(mapPos, 1);

      // /////////
      // define camera
      const projectionLoc = sp.getUniformLocation('projection');
      const canvas = this.canvas;

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // set the view and projection matrices since
      // they are shared by all instances
      const aspect = canvas.clientWidth / canvas.clientHeight;
      gl.uniformMatrix4fv(projectionLoc, false,Renderer.orthographic(-aspect, aspect, 1, -1, -1, 1));

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      ext.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0, // offset
        numVertices, // num vertices per instance
        numInstances // num instances
      );

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

      const width = this.canvas.width;
      const height = this.canvas.height;

      this.gl.viewport(0, 0, width, height);

      this.requestDraw();
    }
}
