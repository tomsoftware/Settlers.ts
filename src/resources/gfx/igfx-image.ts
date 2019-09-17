module Settlers {

    export interface IGfxImage {
        getImageData(): ImageData;
        height:number;
        width:number;
    }
}