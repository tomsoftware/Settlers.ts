import { LogHandler } from '@/utilities/log-handler';
import { IRenderer } from './i-renderer';
import { Matrix } from './landscape/matrix';
import { ViewPoint } from './view-point';

// https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript
// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
// https://webglfundamentals.org/webgl/lessons/webgl-instanced-drawing.html

export class Renderer {
    private readonly log = new LogHandler('Renderer');
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private renderers: IRenderer[] = [];
    private animRequest = 0;
    private viewPoint: ViewPoint;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.viewPoint = new ViewPoint(canvas);
        this.viewPoint.onMove = () => this.onMove();

        const newGl = canvas.getContext('webgl');
        if (!newGl) {
            this.log.error('ERROR: Unable to initialize WebGL. Your browser may not support it.');
            return;
        }

        this.gl = newGl;

        Object.seal(this);
    }

    private onMove() {
        this.requestDraw();
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

        // view
        const viewX = this.viewPoint.x * 0.004 - 4;
        const viewY = this.viewPoint.y * 0.004 + 0.9;
        const zoomV = 0.1 / this.viewPoint.zoom;

        // define camera
        const canvas = this.canvas;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projection = Matrix
            .createOrthographic(-aspect, aspect, 1, -1, -1, 1)
            .translate(viewX, viewY, 0)
            .scale(zoomV, zoomV, 1.0);

        console.log('draw: x: ' + viewX + ' x ' + viewY + ' zoom: ' + zoomV);

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
