export interface IRenderer {
    init(gl: WebGLRenderingContext): void;
    draw(gl: WebGLRenderingContext, projection: Float32Array): void;
}