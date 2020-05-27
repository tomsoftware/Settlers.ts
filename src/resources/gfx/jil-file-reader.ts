/// <reference path="./resource-file.ts" />

module Settlers {

    /** interpreates a .jil file -
     *  jil may stand for: "job index list" file
     *  it indicates the different jobs in a .dil file
     *    jil (job)  --> .dil (direction)--> gil (frames) --> gfx
     * */
    export class JilFileReader extends ResourceFile {

        private log: LogHandler = new LogHandler("JilFileReader");

        private offsetTable: Int32Array;

        /** find the index matching a given direction offset  */
        public reverseLookupOffset(dirOffset: number): number {
            const offsetTable = this.offsetTable;

            const offset = dirOffset * 4 + 20;

            for (let i = 0; i < offsetTable.length; i++) {
                if (offsetTable[i] == offset) {
                    this.log.debug(dirOffset +" --> "+ i);
                    return i;
                }
            }

            this.log.log("Unable to find offset dirOffset: " + dirOffset);
            return -1;

        }



        constructor(resourceReader: BinaryReader) {
            super();

            const reader = this.readResource(resourceReader);

            /// read the object offsets
            let imageCount = reader.length / 4;
            this.log.debug('job count ' + imageCount);

            this.offsetTable = new Int32Array(imageCount);

            for (let i = 0; i < imageCount; i++) {
                this.offsetTable[i] = reader.readIntBE();
            }
        }


        public toString(): string {
            return "jil: " + super.toString();
        }
    }
}