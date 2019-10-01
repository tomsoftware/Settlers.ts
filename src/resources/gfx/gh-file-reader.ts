module Settlers {

/**
 * 101100000000010000000000000001
10110000000000

1   00000001
0   00000000
1   00000001
44  00101100 ---> chunk count



162
66
34
67


17186 - 17058 = 128
 * 
 */

    /** interpreates a .gh5 and .gh6 file -
     *  files contain background images
     * */
    export class GhFileReader {

        private log: LogHandler = new LogHandler("GhFileReader");
        private images: IGfxImage[];

        /** may this is the file version or a magic indicator for this
         * file type: 0x03 0x80 */
        private magic : number;
        private flag1 : number;
        private flag2 : number;
        private flag3 : number;
        private flag4 : number;

        public 

        /** return the number of images in this gfx file */
        public getImageCount() :number {
            return this.images ? this.images.length : 0;
        }

        /** return a Image by index */
        public getImage(index:number) : IGfxImage {
            if ((index < 0) || (index >= this.images.length)) {
                this.log.log("Image Index out of range: "+ index);
                return null;
            }
            return this.images[index];
        }



        constructor(reader: BinaryReader) {
            const HeaderSize = 5 * 4;

            if (reader.length < HeaderSize) {
                this.log.log("wrong file size");
                return;
            }

  

            /// file header
            this.magic = reader.readIntBE();
            this.flag1 = reader.readIntBE();
            this.flag2 = reader.readIntBE();
            this.flag3 = reader.readIntBE();
            this.flag4 = reader.readIntBE();
   
            let filePos = reader.getOffset();

            this.log.debug("length: "+ reader.length);

            this.images = new Array<IGfxImage>();

            let size = -1;

            /// image offsets
            while(size != 0) {
                reader.setOffset(filePos);

           
                let imageType = reader.readByte();
                let flag2 = reader.readByte();
                let flag3 = reader.readByte();
                let rowCount = reader.readByte();
                size = reader.readIntBE();

                let img:IGfxImage;

                switch(imageType) {
                    case 0:
                        img = new GfxImage16Bit(reader, 128, rowCount);
                        break;
                    case 1:
                        img = new GfxImage16Bit(reader, 256, rowCount);
                        break;
                    case 2:
                        img = new GfxImageWithPalette(reader, 128, rowCount);
                        break; 
                    case 3:
                        img = new GfxImageWithPalette(reader, 256, rowCount);
                        break;
                }

                img.flag2 = flag2;
                img.flag3 = flag3;
                img.dataOffset = filePos + 8;

                this.images.push(img);

                this.log.debug(img.toString());

                filePos += size + 8;
           }


        }

        public toString():string {
            return "gh: "+  this.magic.toString(16) +"; "
                + this.flag1 +", "
                + this.flag2 +", "
                + this.flag3 +", "
                + this.flag4.toString(16) + "  --  "+ this.flag4.toString(2) +", ";
        }
    }
}