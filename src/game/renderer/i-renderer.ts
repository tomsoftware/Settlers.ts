export interface IRenderer {
        init(gl: WebGLRenderingContext): Promise<boolean>;
        draw(gl: WebGLRenderingContext, projection: Float32Array): void;
}
