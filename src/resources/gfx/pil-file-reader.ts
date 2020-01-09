/// <reference path="./resource-file.ts" />

module Settlers {

    /** interpreates a .pil file -
     *  pil may stand for: "palette index file" 
     *  it is a list of file indexes used to read a .pa5 or .pa6 file
     * todo: .gil is the same!
     * */
    export class PilFileReader extends ResourceFile {

        private log: LogHandler = new LogHandler("PilFileReader");

        private offsetTable: Int32Array;
  
        public getOffset(gfxImageIndex) : number {
            return this.offsetTable[gfxImageIndex];
        }

        constructor(resourceReader: BinaryReader) {
            super();

            const reader = this.readResource(resourceReader);

            let imageCount = (reader.length) / 4;
            this.log.debug('image count ' + imageCount);

            this.offsetTable = new Int32Array(imageCount);

            
            /// palette offsets
            for (let i = 0; i < imageCount; i++) {
                this.offsetTable[i] = reader.readIntBE();
                console.log(this.offsetTable[i]);
            }
        }


        public toString(): string {
            return "pil: "+ super.toString();
        }
    }
}