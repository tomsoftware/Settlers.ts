
export interface IGfxImage {
    getImageData(): ImageData;
    height:number;
    width:number;
    flag1:number;
    flag2:number;
    getDataSize():number;

    /** start of image data */
    dataOffset: number;
}
