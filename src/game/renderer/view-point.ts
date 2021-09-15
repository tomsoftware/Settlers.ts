
/**
 * Handles mouse events and gesture and generates
 * the view-coordinates (x,y,zoom)
 */
export class ViewPoint {
    private posX = 0;
    private posY = 0;
    private deltaX = 0;
    private deltaY = 0;
    private downX = 0;
    private downY = 0;
    public zoom = 1;
    private mouseIsMoving = false;

    public onMove?: () => void;

    public get x() {
        return (this.posX + this.deltaX);
    }

    public get y() {
        return (this.posY + this.deltaY);
    }

    private invokeOnMove() {
        if (!this.onMove) {
            return;
        }

        this.onMove();
    }

    constructor(canvas: HTMLCanvasElement) {
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

            this.invokeOnMove();
        });

        window.addEventListener('mouseup', e => {
            if (!this.mouseIsMoving) {
                return;
            }

            this.mouseIsMoving = false;
            this.posX += this.deltaX;
            this.posY += this.deltaY;

            this.deltaX = 0;
            this.deltaY = 0;

            this.invokeOnMove();
        });

        canvas.addEventListener('wheel', e => {
            this.zoom = Math.max(1, this.zoom + Math.sign(e.deltaY));
            e.preventDefault();

            this.invokeOnMove();
        });
    }
}
