
module Settlers {
    export class GfxImage implements IGfxImage {

        /** start of image data */
        public dataOffset: number;

        public headType: boolean;

        public imgType: number;
        /** width of the image */
        public width: number;
        /** height of the image */
        public height: number;
        /** left (x) offset to display the image */
        public left: number;
        /** top (y) offset to display the image */
        public top: number;

        public flag2: number;
        public flag3: number;

        private data: BinaryReader;


        public getDataSize(): number {
            return 0;
        }


        private getImageDataWithRunLengthEncoding(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
            let j = 0;
            while (j < length) {
                let value = buffer[pos];
                pos++;

                let r:number, g:number, b:number;
                let count = 1;

                if (value <= 1) {
                    count = buffer[pos];
                    pos++;

                    if (value == 0) {
                        g = b = 0;
                        r = 255;
                    }
                    else {
                        g = r = 0;
                        b = 255;
                    }
                }
                else {
                    r = g = b = value;
                    /// todo: add color pallet
                }

                for (let i = 0; (i < count) && (j < length); i++) {
                    imgData[j++] = r; // r
                    imgData[j++] = g; // g
                    imgData[j++] = b; // b
                    imgData[j++] = 255; // alpha
                }

            }
        }


        private getImageDataWithNoEncoding(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
            let j = 0;
            while (j < length) {
                let value = buffer[pos];
                pos++;

                let r:number, g:number, b:number;

                r = g = b = value;

                /// todo: add color pallet

                imgData[j++] = r; // r
                imgData[j++] = g; // g
                imgData[j++] = b; // b
                imgData[j++] = 255; // alpha
            }
        }

        public getImageData(): ImageData {
            let img = new ImageData(this.width, this.height);
            let imgData = img.data;

            let buffer = this.data.getBuffer();
            let length = this.width * this.height * 4;
            let pos = this.dataOffset;

            if (this.imgType != 32) {
                this.getImageDataWithRunLengthEncoding(buffer, imgData, pos, length);
            }
            else {
                this.getImageDataWithNoEncoding(buffer, imgData, pos, length);
            }

            return img;
        }

        constructor(reader: BinaryReader) {
            this.data = reader;
        }

        public toString(): string {
            return "size: (" + this.width + " x" + this.height + ") "
                + "pos (" + this.left + ", " + this.top + ") "
                + "type " + this.imgType + "; "
                + "data offset " + this.dataOffset + "; "
                + "flags: " + this.flag2 + " / " + this.flag3
                + " heade Type: " + this.headType;
        }
    }


}
