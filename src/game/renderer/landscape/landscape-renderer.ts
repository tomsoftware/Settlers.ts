import { LogHandler } from '@/utilities/log-handler';
import { RendererBase } from '../renderer-base';
import { IRenderer } from '../i-renderer';
import { GhTexture } from '../gh-texture';
import { LandscapeTextureMap } from './textures/landscape-texture-map';
import { MapSize } from '@/utilities/map-size';

import vertCode from './landscape-vert.glsl';
import fragCode from './landscape-frag.glsl';
import { ShaderDataTexture } from '../shader-data-texture';

export class LandscapeRenderer extends RendererBase implements IRenderer {
    private readonly log = new LogHandler('LandscapeRenderer');
    private baseVerticesPosBuffer: WebGLBuffer | null = null;
    private baseVerticesIndexBuffer: WebGLBuffer | null = null;
    private numVertices = 0;
    // eslint-disable-next-line camelcase
    private extInstancedArrays: ANGLE_instanced_arrays | null = null;
    private texture: GhTexture;
    private mapSize: MapSize;
    private groundTypeMap: Uint8Array;
    private landscapeTextureMap = new LandscapeTextureMap();

    private landTypeBuffer: ShaderDataTexture | null = null;

    constructor(mapSize: MapSize, groundTypeMap: Uint8Array) {
        super();

        this.mapSize = mapSize;
        this.groundTypeMap = groundTypeMap;

        this.texture = new GhTexture(this.textureManager.create('u_landText'));
        this.landTypeBuffer = this.createLandTypeBuffer(mapSize, this.textureManager.create('u_landTypeBuffer'), groundTypeMap);

        Object.seal(this);
    }

    private createLandTypeBuffer(mapSize: MapSize, textureIndex: number, groundTypeMap: Uint8Array): ShaderDataTexture {
        const result = new ShaderDataTexture(this.mapSize.width, this.mapSize.height, textureIndex);

        const h = mapSize.height;
        const w = mapSize.width;

        const map = this.landscapeTextureMap;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // map parallelogram
                //     t1       t4
                //     /\\------/
                //    /  \\  B /
                //   /  A \\  /
                //  /------\\/
                // t2       t3

                const t1 = groundTypeMap[mapSize.toIndex(x, y)];
                const t2 = groundTypeMap[mapSize.toIndex(x, y + 1)];
                const t3 = groundTypeMap[mapSize.toIndex(x + 1, y + 1)];
                const t4 = groundTypeMap[mapSize.toIndex(x + 1, y)];

                const a = map.getTextureA(t1, t2, t3, x, y);
                const b = map.getTextureB(t1, t3, t4, x, y);

                result.update(x, y, a[0], a[1], b[0], b[1]);
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

        this.numVertices = 6;

        return true;
    }

    private createInstancePosArray(width: number, height: number): Int16Array {
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
        const numInstancesX = 256;
        const numInstancesY = 256;

        // ///////////
        // Tell the shader to use all set texture units
        this.textureManager.setShaderProgram(gl, sp);

        // ///////////
        // set base vertex
        // define base map shape as a parallelogram
        // so we always draw the same vertices
        //        (0/0)    (1/0)
        //         1 4      6
        //         /\\------/
        //        /  \\  B /
        //       /  A \\  /
        //      /------\\/
        //     2       3 5
        // (-0.5/1)  (0.5/1)
        const baseVerticesPosLoc = sp.getAttribLocation('baseVerticesPos');
        gl.enableVertexAttribArray(baseVerticesPosLoc);

        this.baseVerticesPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.baseVerticesPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            -0.5, 1.0,
            0.5, 1.0,

            0.0, 0.0,
            0.5, 1.0,
            1.0, 0.0
        ]), gl.STATIC_DRAW);

        gl.vertexAttribPointer(baseVerticesPosLoc, 2, gl.FLOAT, false, 0, 0);

        // ///////////
        // set triangle index (A=0, B=1)
        //        (A)(B)   (B)
        //         1 4      6
        //         /\\------/
        //        /  \\  B /
        //       /  A \\  /
        //      /------\\/
        //     2       3 5
        // (A)        (A)(B)
        const baseVerticesIndexLoc = sp.getAttribLocation('baseVerticesIndex');
        gl.enableVertexAttribArray(baseVerticesIndexLoc);

        this.baseVerticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.baseVerticesIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0, 0,
            1, 1, 1
        ]), gl.STATIC_DRAW);

        gl.vertexAttribPointer(baseVerticesIndexLoc, 1, gl.FLOAT, false, 0, 0);

        // ///////////
        // update texture data
        if (this.landTypeBuffer) {
            this.landTypeBuffer.create(gl);
        }

        // ///////////
        // instance Position, one per instance
        //      /-----/-----/-----/
        //     / 0/0 / 1/0 / 2/0 /
        //    /-----/-----/-----/
        //   / 0/1 / 1/1 / 2/1 /
        //  /-----/-----/-----/
        const instancePosLoc = sp.getAttribLocation('instancePos');

        // setup pos, one per instance
        const instancePosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, instancePosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            this.createInstancePosArray(numInstancesX, numInstancesY),
            gl.STATIC_DRAW);

        // set attribute for map pos
        gl.bindBuffer(gl.ARRAY_BUFFER, instancePosBuffer);
        gl.enableVertexAttribArray(instancePosLoc);
        gl.vertexAttribPointer(instancePosLoc, 2, gl.SHORT, false, 0, 0);

        // this line says this attribute only changes for each 1 instance
        ext.vertexAttribDivisorANGLE(instancePosLoc, 1);

        // ////////
        // do it!
        ext.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0, // offset
            this.numVertices, // num vertices per instance
            numInstancesX * numInstancesY // num instances
        );

        const glError = gl.getError();
        if (glError !== 0) {
            console.error('gl error: ' + glError);
        }
    }
}
