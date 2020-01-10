/// <reference path="./resource-file.ts" />

module Settlers {

    /** interpreates a .gil file -
     *  gil may stand for: "graphic index list" file
     *  it contains the offsets for all frames in a .gfx file
     * */
    export class GilFileReader extends ResourceFile {

        private log: LogHandler = new LogHandler("GilFileReader");

        private offsetTable: Int32Array;

        /** return the number of images stored in the gfx file */
        public getImageCount() {
            return this.offsetTable ? this.offsetTable.length : 0;
        }

        /** return the fileoffset of a gfx image */
        public getImageOffset(index: number): number {
            if ((index < 0) || (index >= this.offsetTable.length)) {
                this.log.log("Gfx-Index out of range: " + index);
                return -1;
            }
            return this.offsetTable[index];
        }

        constructor(resouceReader: BinaryReader) {
            super();

            const reader = super.readResource(resouceReader);

          
            let imageCount = reader.length / 4;
            this.log.debug('image count ' + imageCount);

            this.offsetTable = new Int32Array(imageCount);

            /// image offsets
            for (let i = 0; i < imageCount; i++) {
                this.offsetTable[i] = reader.readIntBE();
            }
        }

        public toString(): string {
            return "gil: " + super.toString();
        }
    }
}