
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

        public flag1: number;
        public flag2: number;

        private data: BinaryReader;

        private palette: Palette;
        private paletteOffset: number;

        public getDataSize(): number {
            return 0;
        }


        private getImageDataWithRunLengthEncoding(buffer: Uint8Array, imgData: Uint32Array, pos: number, length: number) {
            
            const paletteOffset = this.paletteOffset;
            const palette = this.palette;

            let j = 0;
            while (j < length) {
                let value = buffer[pos];
                pos++;

                let color: number;
                let count = 1;

                if (value <= 1) {
                    count = buffer[pos];
                    pos++;

                    if (value == 0) {
                        color = 0xFF0000FF;
                    }
                    else {
                        color = 0xFF00FF00;
                    }
                }
                else {
                    color = palette.getColor(paletteOffset + value);
                }

                for (let i = 0; (i < count) && (j < length); i++) {
                    imgData[j++] = color;
                }

            }
        }


        private getImageDataWithNoEncoding(buffer: Uint8Array, imgData: Uint32Array, pos: number, length: number) {
                 
            const paletteOffset = this.paletteOffset;
            const palette = this.palette;

            let j = 0;
            while (j < length) {
                const value = buffer[pos];
                pos++;

               // imgData[j++] = value << 8 | value << 16 | value | 0xFF000000;

                imgData[j++] = palette.getColor(paletteOffset + value);
            }
        }


        public getImageData(): ImageData {
            let img = new ImageData(this.width, this.height);
            let imgData = new Uint32Array(img.data.buffer);

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


        constructor(reader: BinaryReader, palette: Palette, paletteOffset: number) {
            this.data = reader;
            this.palette = palette;
            this.paletteOffset = paletteOffset;
        }

        public toString(): string {
            return "size: (" + this.width + " x" + this.height + ") "
                + "pos (" + this.left + ", " + this.top + ") "
                + "type " + this.imgType + "; "
                + "data offset " + this.dataOffset + "; "
                + "flags: " + this.flag1 + " / " + this.flag2
                + " heade Type: " + this.headType;
        }
    }


}
