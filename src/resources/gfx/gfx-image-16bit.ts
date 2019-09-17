
module Settlers {
    export class GfxImage16Bit implements IGfxImage {

        /** start of image data */
        public dataOffset: number;

        /** width of the image */
        public width: number;
        /** height of the image */
        public height: number;

        public flag1: number;

        private data: BinaryReader;



        private getImageData16Bit(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
            let j = 0;
            while (j < length) {
                let value1 = buffer[pos];
                pos++;
               
                let value2 = buffer[pos];
                pos++;

                imgData[j++] = value2 & 0xF8; // r
                imgData[j++] = (value1 >> 3)  | (value2 << 5) & 0xFC; // g
                imgData[j++] = (value1 << 3) & 0xF8; // b
                imgData[j++] = 255; // alpha

            }
        }


        public getImageData(): ImageData {
            let img = new ImageData(this.width, this.height);
            let imgData = img.data;

            let buffer = this.data.getBuffer();
            let length = this.width * this.height * 4;
            let pos = this.dataOffset;

            this.getImageData16Bit(buffer, imgData, pos, length);
         
            return img;
        }

        constructor(reader: BinaryReader) {
            this.data = reader;
        }

        public toString(): string {
            return "size: (" + this.width + " x" + this.height + ") "
                + "data offset " + this.dataOffset + "; "
                + "flags: " + this.flag1;
        }
    }


}
