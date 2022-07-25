import { IViewPoint } from './i-view-point';

/**
 * Handles mouse events and gesture and generates
 * the view-coordinates (x,y,zoom)
 */
export class ViewPoint implements IViewPoint {
    private posX = 0;
    private posY = 0;
    private deltaX = 0;
    private deltaY = 0;
    private downX = 0;
    private downY = 0;
    public zoomValue = 1;
    private mouseIsMoving = false;
    private canvas: HTMLCanvasElement;

    /** callback on mouse move */
    public onMove: (() => void) | null = null;

    public get zoom(): number {
        return 0.1 / this.zoomValue;
    }

    public get x(): number {
        return this.posX + this.deltaX;
    }

    public get y(): number {
        return this.posY + this.deltaY;
    }

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // disable touch scroll
        canvas.style.touchAction = 'none';

        canvas.addEventListener('pointerdown', this.hanldlePointerdown);
        canvas.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
        canvas.addEventListener('contextmenu', this.handleContextmenu);
        canvas.addEventListener('wheel', this.henaleWheel);

        Object.seal(this);
    }

    public destroy(): void {
        // remove callback event
        this.onMove = null;

        // remove all event handlers
        this.doTry(() => window.removeEventListener('pointerup', this.handlePointerUp));

        if (this.canvas == null) {
            return;
        }

        this.doTry(() => this.canvas.removeEventListener('pointerdown', this.hanldlePointerdown));
        this.doTry(() => this.canvas.removeEventListener('pointermove', this.handlePointerMove));
        this.doTry(() => this.canvas.removeEventListener('contextmenu', this.handleContextmenu));
        this.doTry(() => this.canvas.removeEventListener('wheel', this.henaleWheel));
    }

    private doTry(callback: () => void) {
        try {
            callback();
        } catch (e: any) {
            console.debug(e);
        }
    }

    private invokeOnMove(): void {
        if (!this.onMove) {
            return;
        }

        this.onMove();
    }

    private hanldlePointerdown = (e: PointerEvent) => {
        e.preventDefault();

        this.downX = e.offsetX;
        this.downY = e.offsetY;
        this.mouseIsMoving = true;
    }

    private handlePointerMove = (e: PointerEvent) => {
        e.preventDefault();

        if (!this.mouseIsMoving) {
            return;
        }

        const dX = (e.offsetX - this.downX) * this.zoomValue * 0.03;
        const dY = (e.offsetY - this.downY) * this.zoomValue * 0.03;
        this.deltaX = dX + dY / 2;
        this.deltaY = dY;

        this.invokeOnMove();
    }

    private handlePointerUp = () => {
        if (!this.mouseIsMoving) {
            return;
        }

        this.mouseIsMoving = false;
        // update the pos values
        this.posX = this.x;
        this.posY = this.y;

        this.deltaX = 0;
        this.deltaY = 0;

        this.invokeOnMove();
    }

    private handleContextmenu = (e: MouseEvent) => {
        e.preventDefault();
    }

    private henaleWheel = (e: WheelEvent) => {
        this.zoomValue = Math.max(1, this.zoomValue + Math.sign(e.deltaY));
        e.preventDefault();

        this.invokeOnMove();
    }
}
