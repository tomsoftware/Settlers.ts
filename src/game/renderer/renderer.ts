import { LogHandler } from '@/utilities/log-handler';
import { ShaderProgram, ShaderType } from './shader-program';

// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/

export class Renderer {
    private readonly log = new LogHandler('Renderer');
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private shaderProgram: ShaderProgram | null = null;

    private inc = 0.01;
    private worldToClipSpace = new Float32Array(16);
    private vertices:number[] = [];
    private colors:number[] = [];
    private matrixUniform:WebGLUniformLocation | null = null;
    private animRequest = 0;
    private numTriangles = 100;

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
      this.initBuffers();
      this.initUniforms();

      Object.seal(this);
    }

    public setNumTriangles(numTriangles: number) {
      this.numTriangles = numTriangles;
      this.initBuffers();
    }

    private addVertices(verticesCoords: number[], red:number, green:number, blue:number) {
      for (let i = 0; i < verticesCoords.length / 2; i++) {
        this.vertices.push(verticesCoords[2 * i]); // x
        this.vertices.push(verticesCoords[2 * i + 1]); // y
        this.colors.push(red);
        this.colors.push(green);
        this.colors.push(blue);
      }
    }

    private initShaders() {
      if (!this.shaderProgram) {
        return;
      }

      // Vertex shader source code.
      const vertCode = [
        'uniform mat4 uMapMatrix;',
        'attribute vec2 aWorldCoords;',
        'attribute vec3 aColor;',
        'varying vec3 vColor;',
        'void main(void) {',
        '  float w = 1.0/60.0;',
        '  gl_Position = uMapMatrix * vec4(aWorldCoords * w,0, 1.0);',
        '  vColor = aColor;',
        '}'
      ].join('\n');

      // Fragment shader source code.
      const fragCode = [
        'precision mediump float;',
        'varying vec3 vColor;',
        'void main(void) {',
        '  gl_FragColor = vec4(vColor, 1.0);',
        '}'
      ].join('\n');

      this.shaderProgram.attachShader(vertCode, ShaderType.VERTEX_SHADER);
      this.shaderProgram.attachShader(fragCode, ShaderType.FRAGMENT_SHADER);

      this.shaderProgram.create();

      this.shaderProgram.use();
    }

    public addTriangle(x:number, y:number, ws:number) {
      let vertices: number[] = [];

      vertices.push(x);
      vertices.push(y);

      vertices.push(x + 1);
      vertices.push(y);

      vertices.push(x);
      vertices.push(y + 1);

      this.addVertices(vertices, Math.random(), Math.random(), Math.random());

      vertices = [];
      vertices.push(x + 1);
      vertices.push(y);

      vertices.push(x);
      vertices.push(y + 1);

      vertices.push(x + 1);
      vertices.push(y + 1);

      this.addVertices(vertices, Math.random(), Math.random(), Math.random());
    }

    private initBuffers() {
      const w = this.numTriangles;
      this.vertices = [];
      this.colors = [];

      for (let x = 0; x < this.numTriangles; x++) {
        for (let y = 0; y < this.numTriangles; y++) {
          this.addTriangle(x, y, w);
        }
      }

      const gl = this.gl;
      const sp = this.shaderProgram;
      if ((!gl) || (!sp)) {
        return;
      }

      // Create a new buffer object
      const vertexBuffer = gl.createBuffer();

      // Bind an empty array buffer to it
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      // Pass the vertices data to the buffer
      gl.bufferData(
        gl.ARRAY_BUFFER, new Uint16Array(this.vertices), gl.STATIC_DRAW);

      // Unbind the buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      // Create an empty buffer object and store color data
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

      // Bind vertex buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      // Get the attribute location
      const coords = sp.getAttribLocation('aWorldCoords');

      // point an attribute to the currently bound VBO
      gl.vertexAttribPointer(coords, 2, gl.UNSIGNED_SHORT, false, 0, 0);

      // Enable the attribute
      gl.enableVertexAttribArray(coords);

      // bind the color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

      // get the attribute location
      const color = sp.getAttribLocation('aColor');

      // point attribute to the color buffer object
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);

      // enable the color attribute
      gl.enableVertexAttribArray(color);

      /* Step5: Drawing the required object (triangle) */

      // Clear the canvas
      gl.clearColor(1, 1, 0, 0);

      this.worldToClipSpace.set([
        2, 0, 0, 0,
        0, -2, 0, 0,
        0, 0, 0, 0, -1, 1, 0, 1
      ]);
    }

    private initUniforms() {
      if (!this.shaderProgram) {
        return;
      }

      this.matrixUniform = this.shaderProgram.getUniformLocation('uMapMatrix');
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
      if (!this.gl) {
        return;
      }

      this.gl.uniformMatrix4fv(this.matrixUniform, false, this.worldToClipSpace);
      // Clear the color buffer bit
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      // Draw triangles
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 2);

      this.worldToClipSpace[12] += this.inc;
      if (Math.abs(this.worldToClipSpace[12] + 1) > 1) {
        this.inc *= -1;
      }
      requestAnimationFrame(this.draw.bind(this));
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
