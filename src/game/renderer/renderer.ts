import { LogHandler } from '@/utilities/log-handler';
import { ShaderProgram } from './shader-program';
import vertCode from './test-vert.glsl';
import fragCode from './test-frag.glsl';
import { m4 } from './tools';

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

      const positionLoc = sp.getAttribLocation('a_position');
      const colorLoc = sp.getAttribLocation('color');
      const matrixLoc = sp.getAttribLocation('matrix');
      const projectionLoc = sp.getUniformLocation('projection');
      const viewLoc = sp.getUniformLocation('view');

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.1, 0.4,
        -0.1, -0.4,
        0.1, -0.4,
        0.1, -0.4,
        -0.1, 0.4,
        0.1, 0.4,
        0.4, -0.1,
        -0.4, -0.1,
        -0.4, 0.1,
        -0.4, 0.1,
        0.4, -0.1,
        0.4, 0.1
      ]), gl.STATIC_DRAW);
      const numVertices = 12;

      // setup matrices, one per instance
      const numInstances = 5;
      // make a typed array with one view per matrix
      const matrixData = new Float32Array(numInstances * 16);
      const matrices = [];
      for (let i = 0; i < numInstances; ++i) {
        const byteOffsetToMatrix = i * 16 * 4;
        const numFloatsForView = 16;
        matrices.push(new Float32Array(
          matrixData.buffer,
          byteOffsetToMatrix,
          numFloatsForView));
      }

      const matrixBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      // just allocate the buffer
      gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

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

      const canvas = this.canvas;

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      sp.use();

      // set the view and projection matrices since
      // they are shared by all instances
      const aspect = canvas.clientWidth / canvas.clientHeight;
      gl.uniformMatrix4fv(projectionLoc, false,
        m4.orthographic(-aspect, aspect, -1, 1, -1, 1));
      gl.uniformMatrix4fv(viewLoc, false, m4.zRotation(1 * 0.1));

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      // update all the matrices
      matrices.forEach((mat, ndx) => {
        m4.translation(-0.5 + ndx * 0.25, 0, 0, mat);
        m4.zRotate(mat, 1 * (0.1 + 0.1 * ndx), mat);
      });

      // upload the new matrix data
      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

      // set all 4 attributes for matrix
      const bytesPerMatrix = 4 * 16;
      for (let i = 0; i < 4; ++i) {
        const loc = matrixLoc + i;
        gl.enableVertexAttribArray(loc);
        // note the stride and offset
        const offset = i * 16; // 4 floats per row, 4 bytes per float
        gl.vertexAttribPointer(
          loc, // location
          4, // size (num values to pull from buffer per iteration)
          gl.FLOAT, // type of data in buffer
          false, // normalize
          bytesPerMatrix, // stride, num bytes to advance to get to next set of values
          offset // offset in buffer
        );
        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(loc, 1);
      }

      // set attribute for color
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.enableVertexAttribArray(colorLoc);
      gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
      // this line says this attribute only changes for each 1 instance
      ext.vertexAttribDivisorANGLE(colorLoc, 1);

      ext.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0, // offset
        numVertices, // num vertices per instance
        numInstances // num instances
      );

      requestAnimationFrame(() => this.draw);
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
