module Settlers {

    export interface IGfxImage {
        getImageData(): ImageData;
        height:number;
        width:number;
        flag2:number;
        flag3:number;
        getDataSize():number;

        /** start of image data */
        dataOffset: number;
    }
}