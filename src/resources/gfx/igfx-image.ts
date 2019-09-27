module Settlers {

    export interface IGfxImage {
        getImageData(): ImageData;
        height:number;
        width:number;
        getDataSize():number;

        /** start of image data */
        dataOffset: number;
    }
}