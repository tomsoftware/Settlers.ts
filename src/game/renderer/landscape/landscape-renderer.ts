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

        if (!this.shaderProgram?.getAngleInstancedArrayExtension()) {
            this.log.error('need WebGL ANGLE_instanced_arrays');
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

        const ext = sp.getAngleInstancedArrayExtension();
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
        // set vertex index
        //         0 3      5
        //         /\\------/
        //        /  \\  B /
        //       /  A \\  /
        //      /------\\/
        //     1       2 4
        sp.setArrayFloat('baseVerticesIndex', new Float32Array([0, 1, 2, 3, 4, 5]), 1);

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
        sp.setArrayShort('instancePos', this.createInstancePosArray(numInstancesX, numInstancesY), 2, 1);

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
