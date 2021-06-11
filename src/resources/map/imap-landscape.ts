/** Interface for map landscape */
export interface IMapLandscape {
    getGroundType(): Uint8Array;
    getGroundHeight(): Uint8Array;
}
