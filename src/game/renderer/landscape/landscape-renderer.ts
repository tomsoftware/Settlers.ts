import { LogHandler } from '@/utilities/log-handler';
import { RendererBase } from '../renderer-base';
import { IRenderer } from '../i-renderer';
import { LandscapeTextureMap } from './textures/landscape-texture-map';
import { MapSize } from '@/utilities/map-size';
import { ShaderDataTexture } from '../shader-data-texture';
import { IViewPoint } from '../i-view-point';
import { TextureManager } from '../texture-manager';
import { FileManager } from '@/utilities/file-manager';
import { TextureMap16Bit } from '../texture-map-16bit';
import { GhFileReader } from '@/resources/gfx/gh-file-reader';
import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { ImageType } from '@/resources/gfx/image-type';
import vertCode from './landscape-vert.glsl';
import fragCode from './landscape-frag.glsl';

export class LandscapeRenderer extends RendererBase implements IRenderer {
    private static log = new LogHandler('LandscapeRenderer');
    private numVertices = 0;
    private textureManager: TextureManager;
    private texture: TextureMap16Bit;
    private mapSize: MapSize;
    private landscapeTextureMap = new LandscapeTextureMap();

    private landTypeBuffer: ShaderDataTexture | null = null;
    private landHeightBuffer: ShaderDataTexture | null = null;
    private fileManager: FileManager;

    private groundTypeMap: Uint8Array;
    private groundHeightMap: Uint8Array;
    private debugGrid: boolean;

    constructor(
        fileManager: FileManager,
        textureManager: TextureManager,
        mapSize: MapSize,
        groundTypeMap: Uint8Array,
        groundHeightMap: Uint8Array,
        debugGrid: boolean
    ) {
        super();

        this.fileManager = fileManager;
        this.textureManager = textureManager;
        this.mapSize = mapSize;
        this.groundHeightMap = groundHeightMap;
        this.groundTypeMap = groundTypeMap;
        this.debugGrid = debugGrid;

        this.texture = new TextureMap16Bit(256 * 6, this.textureManager.create('u_landText'));

        Object.seal(this);
    }

    /** load the landscape texture from file and push it to a texture map buffer */
    private async createLandscapeTextureMap() {
        const imgFile = await this.fileManager.readFile('2.gh6', true);
        if (!imgFile) {
            LandscapeRenderer.log.error('Unable to load texture file "2.gh6"');
            return;
        }

        const reader = new GhFileReader(imgFile);
        const img = reader.findImageByType<GfxImage16Bit>(ImageType.Image16Bit);

        if (!img) {
            return;
        }

        this.landscapeTextureMap.copyTexture(img, this.texture);
    }

    private createLandHeightBuffer(mapSize: MapSize, textureIndex: number, groundHeightMap: Uint8Array): ShaderDataTexture {
        const result = new ShaderDataTexture(mapSize.width, mapSize.height, 1, textureIndex);

        const h = mapSize.height;
        const w = mapSize.width;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const h = groundHeightMap[mapSize.toIndex(x, y)];
                result.update(x, y, h);
            }
        }

        return result;
    }

    private createLandTypeBuffer(mapSize: MapSize, textureIndex: number, groundTypeMap: Uint8Array): ShaderDataTexture {
        const result = new ShaderDataTexture(mapSize.width, mapSize.height, 4, textureIndex);

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
        if (this.debugGrid) {
            this.shaderProgram.setDefine('DEBUG_TRIANGLE_BORDER', 1);
        }

        this.shaderProgram.setDefine('MAP_WIDTH', this.mapSize.width);
        this.shaderProgram.setDefine('MAP_HEIGHT', this.mapSize.width);
        this.shaderProgram.setDefine('LANDSCAPE_TEXTURE_WIDTH_HEIGHT', this.texture.imgWidthHeight);

        super.initShader(gl, vertCode, fragCode);

        await this.createLandscapeTextureMap();
        this.texture.load(gl);

        this.landTypeBuffer = this.createLandTypeBuffer(this.mapSize, this.textureManager.create('u_landTypeBuffer'), this.groundTypeMap);
        this.landHeightBuffer = this.createLandHeightBuffer(this.mapSize, this.textureManager.create('u_landHeightBuffer'), this.groundHeightMap);

        if (!this.shaderProgram.getAngleInstancedArrayExtension()) {
            LandscapeRenderer.log.error('need WebGL ANGLE_instanced_arrays');
        }

        this.numVertices = 6;

        return true;
    }

    // create an array with x,y for every parallelogram
    //      /-----/-----/-----/
    //     / 0/0 / 1/0 / 2/0 /
    //    /-----/-----/-----/
    //   / 0/1 / 1/1 / 2/1 /
    //  /-----/-----/-----/
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

    public draw(gl: WebGLRenderingContext, projection: Float32Array, viewPoint: IViewPoint): void {
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
        const numInstancesX = 2 / viewPoint.zoom;
        const numInstancesY = 4 / viewPoint.zoom;

        // ///////////
        // Tell the shader to use all set texture units
        this.textureManager.bindToShader(gl, sp);

        // set view Point
        sp.setVector2('viewPoint', -viewPoint.x, -viewPoint.y);

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
        // update texture data
        if (this.landHeightBuffer) {
            this.landHeightBuffer.create(gl);
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
