
module Settlers {
    /**
     * Image with the format:
     *   image1
     *   palette1
     *   image2
     *   palette2
     */
    export class GfxImageWithPalette implements IGfxImage {

        /** start of image data */
        public dataOffset: number;

        /** width of the image */
        public width: number;
        /** height of the image */
        public height: number;

        public chunkHeight : number;

        private data: BinaryReader;

        public flag1: number;
        public flag2: number;
        public flag3: number;
        public rowCount: number;

        private palette:Uint32Array = new Uint32Array(256);


        public read3BytePalette(buffer: Uint8Array, pos:number) {

            for(let i=0; i<256; i++) {

               let r = buffer[pos++];
               let g = buffer[pos++];
               let b = buffer[pos++]; 

               this.palette[i] = r | (g << 8) | (b << 16) | (255 << 24);
            }

            return pos;
        }


        private getImageDataWithPalette(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
            let j = 0;
            let p = this.palette;

            let i = new Uint32Array(imgData.buffer);
            let chunklength = this.chunkHeight * this.width;
            let c = 0;

            pos -= 256 * 3;

            while (j < length) {
                if (c <= 0) {
                    /// jump over palette data
                    pos += 256*3;
                    this.read3BytePalette(buffer, pos + chunklength);
                    c = chunklength;
                }
                c--;

                let index = buffer[pos++];

                i[j++] = p[index];
            }

            
            console.log("size : "+ (pos - this.dataOffset));
            console.log("left byte: "+ (buffer.length - pos));
        }


        public getDataSize(): number {
            return  this.width * this.height  + 
                Math.floor(this.height / this.chunkHeight) * 3 * 256;
        }


        public getImageData(): ImageData {
            let img = new ImageData(this.width, this.height);
            let imgData = img.data;

            let buffer = this.data.getBuffer();
            let length = this.width * this.height;
            let pos = this.dataOffset;

            this.getImageDataWithPalette(buffer, imgData, pos, length);
         


            return img;
        }

        constructor(reader: BinaryReader, chunkHeight:number) {
            this.data = reader;
            this.chunkHeight = chunkHeight;
        }

        public toString(): string {
            return "size: (" + this.width + " x" + this.height + ") "
                + "data offset " + this.dataOffset +" "
                + "rows: " + this.rowCount +"; "
                + "flags: " + this.flag1 + " / " + this.flag2;
        }
    }


}
