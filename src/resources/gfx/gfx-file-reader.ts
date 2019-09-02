module Settlers {

    /** reads a .gfx file
     *    .gfx files contain images
     * */
    export class GfxFileReader {

        private log: LogHandler = new LogHandler("GfxFileReader");
        private images: GfxImage[];
        private isWordHeader:boolean;

        private magic:number;
        private flag1 : number;
        private flag2 : number;
        private flag3 : number;
        private flag4 : number;


        /** return the number of images in this gfx file */
        public getImageCount() :number {
            return this.images ? this.images.length : 0;
        }

        /** return a Image by index */
        public getImage(index:number) : GfxImage {
            if ((index < 0) || (index >= this.images.length)) {
                this.log.log("Image Index out of range: "+ index);
                return null;
            }
            return this.images[index];
        }


        constructor(reader: BinaryReader, offsetTable: GilFileReader) {

            this.magic = reader.readIntBE();
            this.flag1 = reader.readIntBE();
            this.flag2 = reader.readIntBE();
            this.flag3 = reader.readIntBE();
            this.flag4 = reader.readIntBE();


            let count = offsetTable.getImageCount();
            this.images = new Array<GfxImage>(count);

            for (let i = 0; i < count; i++) {
                this.images[i] = this.readImage(reader, offsetTable.getImageOffset(i));
            }
        }


        private readImage(reader: BinaryReader, offset: number): GfxImage {
            reader.setOffset(offset);

            let imgHeadType = reader.readWordBE();

            reader.setOffset(offset);

            let newImg = new GfxImage(reader);

            if (imgHeadType > 860) {
                this.isWordHeader = true;

                newImg.headType = true;
                newImg.width = reader.readByte();
                newImg.height = reader.readByte();
                newImg.left = reader.readByte();
                newImg.top = reader.readByte();

                newImg.imgType = 0

                newImg.flag1 = reader.readWordBE();
                newImg.flag2 = reader.readWordBE();

                newImg.dataOffset = offset + 8;
            }
            else {
                this.isWordHeader = false;

                newImg.headType = false;
                newImg.width = reader.readWordBE();
                newImg.height = reader.readWordBE();
                newImg.left = reader.readWordBE();
                newImg.top = reader.readWordBE();

                newImg.imgType = reader.readByte();

                newImg.flag1 = reader.readByte();
                newImg.flag2 = reader.readIntBE(2)

                newImg.dataOffset = offset + 12;

            }

            return newImg;

        }

        public toString() {
            return "gfx: "+  this.magic.toString(16) +"; "
                + this.flag1 +", "
                + this.flag2 +", "
                + this.flag3 +", "
                + this.flag4.toString(16) + "  --  "+ this.flag4.toString(2) +", --- "
                + this.isWordHeader;
        }
    }
}