import { LogHandler } from '@/utilities/log-handler';
import { IRenderer } from './i-renderer';
import { Matrix } from './landscape/matrix';

// https://stackoverflow.com/questions/48741570/how-can-i-import-glsl-as-string-in-typescript
// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
// https://webglfundamentals.org/webgl/lessons/webgl-instanced-drawing.html

export class Renderer {
    private readonly log = new LogHandler('Renderer');
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext | null = null;
    private renderers: IRenderer[] = [];
    private animRequest = 0;
    private x = -400;
    private y = 100;
    private deltaX = 0;
    private deltaY = 0;
    private downX = 0;
    private downY = 0;
    private zoom = 3;
    private mouseIsMoving = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const newGl = canvas.getContext('webgl');
        if (!newGl) {
            this.log.error('ERROR: Unable to initialize WbGL. Your browser may not support it.');
            return;
        }

        this.gl = newGl;

        canvas.addEventListener('mousedown', e => {
            this.downX = e.offsetX;
            this.downY = e.offsetY;
            this.mouseIsMoving = true;
        });

        canvas.addEventListener('mousemove', e => {
            if (!this.mouseIsMoving) {
                return;
            }

            this.deltaX = e.offsetX - this.downX;
            this.deltaY = -(e.offsetY - this.downY);

            this.requestDraw();
        });

        window.addEventListener('mouseup', e => {
            if (!this.mouseIsMoving) {
                return;
            }

            this.mouseIsMoving = false;
            this.x += this.deltaX;
            this.y += this.deltaY;

            this.deltaX = 0;
            this.deltaY = 0;

            this.requestDraw();
        });

        canvas.addEventListener('wheel', e => {
            this.zoom = Math.max(1, this.zoom + Math.sign(e.deltaY));
            e.preventDefault();
            this.requestDraw();
        });

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
        console.log('need draw');
        const gl = this.gl;
        if (!gl) {
            return;
        }

        // view
        const viewX = (this.x + this.deltaX) * 0.01;
        const viewY = (this.y + this.deltaY) * 0.01;
        const zoomV = 0.1 / this.zoom;

        // define camera
        const canvas = this.canvas;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projection = Matrix
            .createOrthographic(-aspect, aspect, 1, -1, -1, 1)
            .translate(viewX, viewY, 0)
            .scale(zoomV, zoomV, 1.0);

        console.log('draw: ' + viewX + ' x ' + viewY + ' zoom: ' + zoomV);

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
