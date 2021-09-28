import { IViewPoint } from "./i-view-point";

export interface IRenderer {
        init(gl: WebGLRenderingContext): Promise<boolean>;
        draw(gl: WebGLRenderingContext, projection: Float32Array, viewPoint: IViewPoint): void;
}
