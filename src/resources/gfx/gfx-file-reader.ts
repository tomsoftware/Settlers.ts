/// <reference path="./resource-file.ts" />

module Settlers {

    /** reads a .gfx file
     *    .gfx files contain images
     * */
    export class GfxFileReader extends ResourceFile {

        private log: LogHandler = new LogHandler("GfxFileReader");
        private images: GfxImage[];
        private isWordHeader: boolean;


        /** return the number of images in this gfx file */
        public getImageCount(): number {
            return this.images ? this.images.length : 0;
        }

        /** return a Image by index */
        public getImage(index: number): GfxImage {
            if ((index < 0) || (index >= this.images.length)) {
                this.log.log("Image Index out of range: " + index);
                return null;
            }
            return this.images[index];
        }


        constructor(
            reader: BinaryReader,
            offsetTable: GilFileReader,
            jobIndexList: JilFileReader,
            directionIndexList: DilFileReader,
            paletteCollection: PaletCollection) {

            super();


            super.readResource(reader);

            let count = offsetTable.getImageCount();
            this.images = new Array<GfxImage>(count);

            let lastGood = 0;
            for (let i = 0; i < count; i++) {
                const gfxOffset = offsetTable.getImageOffset(i);

                let jobIndex = i;
                /// if we use a jil file or not?
                if (directionIndexList) {
                    const dirOffset = directionIndexList.reverseLookupOffset(i);
                    jobIndex = jobIndexList.reverseLookupOffset(dirOffset);
                    jobIndex = jobIndex == -1 ? lastGood : jobIndex;
                    lastGood = jobIndex;
                }


                this.images[i] = this.readImage(
                    reader,
                    gfxOffset,
                    paletteCollection.getPalette(),
                    paletteCollection.getOffset(jobIndex));
            }
        }


        private readImage(reader: BinaryReader, offset: number, plette: Palette, paletteOffset: number): GfxImage {
            reader.setOffset(offset);

            let imgHeadType = reader.readWordBE();

            reader.setOffset(offset);

            let newImg = new GfxImage(reader, plette, paletteOffset);

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
            return "gfx: " + super.toString() + ", --- "
                + this.isWordHeader;
        }
    }
}