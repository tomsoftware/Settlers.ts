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

    public onMove?: () => void;

    public get zoom(): number {
        return 0.1 / this.zoomValue;
    }

    public get x(): number {
        return this.posX + this.deltaX;
    }

    public get y(): number {
        return this.posY + this.deltaY;
    }

    private invokeOnMove(): void {
        if (!this.onMove) {
            return;
        }

        this.onMove();
    }

    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', e => {
            e.preventDefault();

            this.downX = e.offsetX;
            this.downY = e.offsetY;
            this.mouseIsMoving = true;
        });

        canvas.addEventListener('mousemove', e => {
            e.preventDefault();

            if (!this.mouseIsMoving) {
                return;
            }

            this.deltaX = (e.offsetX - this.downX) * this.zoomValue * 0.03;
            this.deltaY = (e.offsetY - this.downY) * this.zoomValue * 0.03;

            this.invokeOnMove();
        });

        window.addEventListener('mouseup', e => {
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
        });

        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
        });

        canvas.addEventListener('wheel', e => {
            this.zoomValue = Math.max(1, this.zoomValue + Math.sign(e.deltaY));
            e.preventDefault();

            this.invokeOnMove();
        });
    }
}
