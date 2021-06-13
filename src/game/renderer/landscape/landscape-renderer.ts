import { LogHandler } from '@/utilities/log-handler';
import { RendererBase } from '../renderer-base';
import { IRenderer } from '../i-renderer';
import vertCode from './landscape-vert.glsl';
import fragCode from './landscape-frag.glsl';

export class LandscapeRenderer extends RendererBase implements IRenderer {
    private readonly log = new LogHandler('LandscapeRenderer');
    private positionBuffer: WebGLBuffer | null = null;
    private numVertices = 0;
    // eslint-disable-next-line camelcase
    private extInstancedArrays: ANGLE_instanced_arrays | null = null;

    constructor() {
      super();

      Object.seal(this);
    }

    public init(gl: WebGLRenderingContext) {
      super.initBase(gl, vertCode, fragCode);

      this.extInstancedArrays = gl.getExtension('ANGLE_instanced_arrays');
      if (!this.extInstancedArrays) {
        this.log.error('need ANGLE_instanced_arrays');
      }

      // define Vertex
      // we always draw the same vertex
      //    1 4    6
      //    /\\----/
      //   /  \\  /
      //  /----\\/
      // 2     3 5
      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        -0.5, 1.0,
        0.5, 1.0,

        0.0, 0.0,
        0.5, 1.0,
        1.0, 0.0
      ]), gl.STATIC_DRAW);

      this.numVertices = 6;
    }

    public draw(gl: WebGLRenderingContext, projection: Float32Array) {
      super.drawBase(gl, projection);

      const sp = this.shaderProgram;
      if (!sp) {
        return;
      }

      const ext = this.extInstancedArrays;
      if (!ext) {
        return;
      }

      // setup matrices, one per instance
      const numInstances = 5;

      // ///////////
      // set vertex
      const positionLoc = sp.getAttribLocation('a_position');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

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
      // map pos
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

      // do it!
      ext.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0, // offset
        this.numVertices, // num vertices per instance
        numInstances // num instances
      );
    }
}
