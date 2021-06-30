import { LogHandler } from '@/utilities/log-handler';
import { RendererBase } from '../renderer-base';
import { IRenderer } from '../i-renderer';
import { GhTexture } from '../gh-texture';
import { LandscapeTextureMap } from './textures/landscape-texture-map';

import vertCode from './landscape-vert.glsl';
import fragCode from './landscape-frag.glsl';

export class LandscapeRenderer extends RendererBase implements IRenderer {
    private readonly log = new LogHandler('LandscapeRenderer');
    private positionBuffer: WebGLBuffer | null = null;
    private landTypeBuffer: WebGLBuffer | null = null;
    private numVertices = 0;
    // eslint-disable-next-line camelcase
    private extInstancedArrays: ANGLE_instanced_arrays | null = null;
    private texture = new GhTexture();
    private width: number;
    private height: number;
    private groundTypeMap: Uint8Array;
    private textureArray: Float32Array;
    private landscapeTextureMap = new LandscapeTextureMap();

    constructor(width: number, height: number, groundTypeMap: Uint8Array) {
        super();

        this.width = width;
        this.height = height;
        this.groundTypeMap = groundTypeMap;
        this.textureArray = this.buildTextureArray(width, height, groundTypeMap);

        Object.seal(this);
    }

    private buildTextureArray(width: number, height: number, groundTypeMap: Uint8Array): Float32Array {
        const result = new Float32Array(width * height * 2 * 2);
        const map = this.landscapeTextureMap;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;

                const t1 = groundTypeMap[i];
                const t2 = groundTypeMap[i + width];
                const t3 = groundTypeMap[i + width + 1];
                const t4 = groundTypeMap[i + 1];

                const j = i * 4;
                const a = map.getTextureA(t1, t2, t3, x, y);
                const b = map.getTextureB(t1, t3, t4, x, y);

                result[j + 0] = a[0];
                result[j + 1] = a[1];
                result[j + 2] = b[0];
                result[j + 3] = b[1];
            }
        }

        return result;
    }

    public async init(gl: WebGLRenderingContext): Promise<boolean> {
        super.initBase(gl, vertCode, fragCode);

        await this.texture.load(gl);

        this.extInstancedArrays = gl.getExtension('ANGLE_instanced_arrays');
        if (!this.extInstancedArrays) {
            this.log.error('need ANGLE_instanced_arrays');
        }

        // define Vertex
        // we always draw the same vertex
        //     1 4      6
        //     /\\------/
        //    /  \\  B /
        //   /  A \\  /
        //  /------\\/
        // 2       3 5
        //
        // (-1/0)    (0/0)
        //     1      4      6
        //    /\      \------/
        //   /  \      \  B /
        //  /  A \      \  /
        // /------\      \/
        // 2       3      5
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, 0.0,
            -1.5, 1.0,
            -0.5, 1.0,

            0.0, 0.0,
            0.5, 1.0,
            1.0, 0.0
        ]), gl.STATIC_DRAW);

        this.numVertices = 6;

        return true;
    }

    private createPosArray(width: number, height: number): Int16Array {
        const r = new Int16Array(width * height * 2);
        let i = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                r[i] = x + Math.floor(y / 2);
                i++;
                r[i] = y;
                i++;
            }
        }
        return r;
    }

    public draw(gl: WebGLRenderingContext, projection: Float32Array): void {
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
        const numInstancesX = 512;
        const numInstancesY = 512;

        // ///////////
        // set vertex
        const positionLoc = sp.getAttribLocation('a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // ///////////
        // define color
        const colorLoc = sp.getAttribLocation('texture_array');

        // setup colors, one per instance
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.textureArray, gl.STATIC_DRAW);

        // set attribute for color
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(colorLoc, 1);

        // ///////////
        // map pos
        const mapPos = sp.getAttribLocation('map_pos');

        // setup pos, one per instance
        const mapPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mapPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            this.createPosArray(numInstancesX, numInstancesY),
            gl.STATIC_DRAW);

        // set attribute for map pos
        gl.bindBuffer(gl.ARRAY_BUFFER, mapPosBuffer);
        gl.enableVertexAttribArray(mapPos);
        gl.vertexAttribPointer(mapPos, 2, gl.SHORT, false, 0, 0);

        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(mapPos, 1);

        // ////////
        // do it!
        ext.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0, // offset
            this.numVertices, // num vertices per instance
            numInstancesX * numInstancesY // num instances
        );

        console.error(gl.getError());
        console.error(gl.getError());
    }
}
