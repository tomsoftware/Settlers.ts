
module Settlers {
    export class GfxImage8Bit implements IGfxImage {

        /** start of image data */
        public dataOffset: number;

        /** width of the image */
        public width: number;
        /** height of the image */
        public height: number;

        public flag2: number;
        public flag3: number;
        
        private data: BinaryReader;



        private getImageData8Bit(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
            let j = 0;
            while (j < length) {
                let value1 = buffer[pos];
                pos++;
            
                imgData[j++] = value1;// r
                imgData[j++] = value1; // g
                imgData[j++] = value1; // b
                imgData[j++] = 255; // alpha

            }
        }


        public getImageData(): ImageData {
            let img = new ImageData(this.width, this.height);
            let imgData = img.data;

            let buffer = this.data.getBuffer();
            let length = this.width * this.height;
            let pos = this.dataOffset;

            this.getImageData8Bit(buffer, imgData, pos, length);
         
            return img;
        }

        public getDataSize(): number {
            return  this.width * this.height;
        }

        constructor(reader: BinaryReader) {
            this.data = reader;
        }

        public toString(): string {
            return "size: (" + this.width + " x" + this.height + ") "
                + "data offset " + this.dataOffset + "; "
                + "flags: " + this.flag2 +"  "+ this.flag3;
        }
    }


}
