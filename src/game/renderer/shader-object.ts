/**
 * an object that is used with the GL context and needs
 *   to be freed at end
 **/
export interface ShaderObject {
    free(): void;
}
