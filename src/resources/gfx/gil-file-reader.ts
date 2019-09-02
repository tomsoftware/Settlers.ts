module Settlers {

    /** interpreates a .gil file -
     *  gil may stand for: "graphic index file" 
     *  it is a list of file indexes used tu read a .gfx file
     * */
    export class GilFileReader {

        private log: LogHandler = new LogHandler("GilFileReader");

        /** may this is the file version or a magic indicator for this
         * file type: 0x03 0x80 */
        private magic : number;
        private flag1 : number;
        private flag2 : number;
        private flag3 : number;
        private flag4 : number;

        private offsetTable:Int32Array;

        /** return the number of images stored in the gfx file */
        public getImageCount() {
            return this.offsetTable ? this.offsetTable.length : 0;
        }

        /** return the fileoffset of a gfx image */
        public getImageOffset(index: number) : number {
            if ((index < 0) || (index >= this.offsetTable.length)) {
                this.log.log("Gfx-Index out of range: "+ index);
                return -1;
            }
            return this.offsetTable[index];
        }

        constructor(reader: BinaryReader) {
            const HeaderSize = 5 * 4;

            if (reader.length < HeaderSize) {
                this.log.log("wrong file size");
                return;
            }

            let imageCount = (reader.length - HeaderSize) / 4;

            this.offsetTable = new Int32Array(imageCount);

            /// file header
            this.magic = reader.readIntBE();
            this.flag1 = reader.readIntBE();
            this.flag2 = reader.readIntBE();
            this.flag3 = reader.readIntBE();
            this.flag4 = reader.readIntBE();
   
            /// image offsets
            for(let i=0; i<imageCount; i++){
                this.offsetTable[i]  = reader.readIntBE();
            }
        }

        public toString():string {
            return "gil: "+  this.magic.toString(16) +"; "
                + this.flag1 +", "
                + this.flag2 +", "
                + this.flag3 +", "
                + this.flag4.toString(16) + "  --  "+ this.flag4.toString(2) +", ";
        }
    }
}